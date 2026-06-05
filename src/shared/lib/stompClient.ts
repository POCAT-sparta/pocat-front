import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getAccessToken } from "@/shared/lib/apiClient.ts";

const WS_URL = `${import.meta.env.VITE_API_URL ?? ""}/ws`;

type MessageHandler = (body: unknown, frame: IMessage) => void;
type ConnectionHandler = (connected: boolean) => void;

interface DestEntry {
  handlers: Set<MessageHandler>;
  stomp?: StompSubscription;
}

/**
 * 앱 전역에서 단일 SockJS/STOMP 연결을 공유한다.
 * 채팅(/sub/chat/{id})과 알림(/sub/notifications/{userId})이 같은 연결을 사용한다.
 * - 목적지별로 핸들러를 fan-out
 * - 재연결 시 살아있는 목적지 자동 재구독
 * - 구독이 모두 사라지면 연결 종료(참조 카운트)
 */
const destinations = new Map<string, DestEntry>();
const connectionHandlers = new Set<ConnectionHandler>();

let client: Client | null = null;
let connected = false;

function notifyConnection(value: boolean) {
  connected = value;
  connectionHandlers.forEach((handler) => handler(value));
}

function attach(destination: string, entry: DestEntry) {
  if (!client?.connected || entry.stomp) return;
  entry.stomp = client.subscribe(destination, (frame: IMessage) => {
    let body: unknown = frame.body;
    if (frame.body) {
      try {
        body = JSON.parse(frame.body);
      } catch {
        /* JSON 이 아니면 원본 문자열 그대로 전달 */
      }
    }
    entry.handlers.forEach((handler) => handler(body, frame));
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
      destinations.forEach((entry, destination) => attach(destination, entry));
    },
    onWebSocketClose: () => {
      destinations.forEach((entry) => (entry.stomp = undefined));
      notifyConnection(false);
    },
    onStompError: (frame) => {
      console.error("[stomp] 오류", frame.headers["message"], frame.body);
    },
  });

  client.activate();
  return client;
}

/** 목적지 구독. 반환 함수 호출 시 해당 핸들러 해제. */
export function subscribe(destination: string, handler: MessageHandler): () => void {
  let entry = destinations.get(destination);
  if (!entry) {
    entry = { handlers: new Set() };
    destinations.set(destination, entry);
  }
  entry.handlers.add(handler);

  attach(destination, getClient());

  return () => {
    const current = destinations.get(destination);
    if (!current) return;
    current.handlers.delete(handler);
    if (current.handlers.size === 0) {
      current.stomp?.unsubscribe();
      destinations.delete(destination);
      if (destinations.size === 0) {
        client?.deactivate();
        client = null;
        notifyConnection(false);
      }
    }
  };
}

/** 메시지 발행. 연결돼 있으면 true. */
export function publish(destination: string, body = ""): boolean {
  if (!client?.connected) return false;
  client.publish({ destination, body });
  return true;
}

/** 연결 상태 구독. */
export function onConnectionChange(handler: ConnectionHandler): () => void {
  connectionHandlers.add(handler);
  handler(connected);
  return () => connectionHandlers.delete(handler);
}
