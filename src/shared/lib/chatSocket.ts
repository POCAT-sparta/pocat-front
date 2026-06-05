import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getAccessToken } from "@/shared/lib/apiClient.ts";
import type { ChatSocketEvent } from "@/types/chat.types";

const WS_URL = `${import.meta.env.VITE_API_URL ?? ""}/ws`;

type EventHandler = (event: ChatSocketEvent) => void;
type ConnectionHandler = (connected: boolean) => void;

interface Subscription {
  handlers: Set<EventHandler>;
  stomp?: StompSubscription;
}

const subscriptions = new Map<number, Subscription>();
const connectionHandlers = new Set<ConnectionHandler>();

let client: Client | null = null;
let connected = false;

function notifyConnection(value: boolean) {
  connected = value;
  connectionHandlers.forEach((handler) => handler(value));
}

function attach(chatId: number, sub: Subscription) {
  if (!client?.connected || sub.stomp) return;
  sub.stomp = client.subscribe(`/sub/chat/${chatId}`, (frame: IMessage) => {
    try {
      const event = JSON.parse(frame.body) as ChatSocketEvent;
      sub.handlers.forEach((handler) => handler(event));
    } catch (err) {
      console.error("[chatSocket] 메시지 파싱 실패", err);
    }
  });
}

function getClient(): Client {
  if (client) return client;

  client = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    reconnectDelay: 3000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    // 재연결 시점마다 최신 토큰으로 CONNECT 헤더 갱신
    beforeConnect: () => {
      client!.connectHeaders = {
        Authorization: `Bearer ${getAccessToken() ?? ""}`,
      };
    },
    onConnect: () => {
      notifyConnection(true);
      // (재)연결 시 살아있는 모든 방 다시 구독
      subscriptions.forEach((sub, chatId) => attach(chatId, sub));
    },
    onWebSocketClose: () => {
      subscriptions.forEach((sub) => (sub.stomp = undefined));
      notifyConnection(false);
    },
    onStompError: (frame) => {
      console.error("[chatSocket] STOMP 오류", frame.headers["message"], frame.body);
    },
  });

  client.activate();
  return client;
}

/** 채팅방 구독. 반환된 함수를 호출하면 해당 핸들러를 해제한다. */
export function subscribeChat(chatId: number, handler: EventHandler): () => void {
  let sub = subscriptions.get(chatId);
  if (!sub) {
    sub = { handlers: new Set() };
    subscriptions.set(chatId, sub);
  }
  sub.handlers.add(handler);

  attach(chatId, getClient());

  return () => {
    const current = subscriptions.get(chatId);
    if (!current) return;
    current.handlers.delete(handler);
    if (current.handlers.size === 0) {
      current.stomp?.unsubscribe();
      subscriptions.delete(chatId);
      // 구독 중인 방이 하나도 없으면 연결 종료
      if (subscriptions.size === 0) {
        client?.deactivate();
        client = null;
        notifyConnection(false);
      }
    }
  };
}

/** 메시지 전송: /pub/chat/{chatId} */
export function publishChatMessage(chatId: number, message: string): boolean {
  if (!client?.connected) return false;
  client.publish({
    destination: `/pub/chat/${chatId}`,
    body: JSON.stringify({ message }),
  });
  return true;
}

/** 읽음 알림 전송: /pub/chat/{chatId}/read */
export function publishChatRead(chatId: number): void {
  if (!client?.connected) return;
  client.publish({ destination: `/pub/chat/${chatId}/read`, body: "" });
}

/** 연결 상태 구독 (온라인 표시용) */
export function onConnectionChange(handler: ConnectionHandler): () => void {
  connectionHandlers.add(handler);
  handler(connected);
  return () => connectionHandlers.delete(handler);
}
