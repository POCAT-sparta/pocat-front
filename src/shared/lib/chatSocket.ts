import { onConnectionChange, publish, subscribe } from "@/shared/lib/stompClient.ts";
import type { ChatSocketEvent } from "@/types/chat.types";

type EventHandler = (event: ChatSocketEvent) => void;

/** 채팅방 구독: /sub/chat/{chatId} */
export function subscribeChat(chatId: number, handler: EventHandler): () => void {
  return subscribe(`/sub/chat/${chatId}`, (body) => handler(body as ChatSocketEvent));
}

/** 메시지 전송: /pub/chat/{chatId} */
export function publishChatMessage(chatId: number, message: string): boolean {
  return publish(`/pub/chat/${chatId}`, JSON.stringify({ message }));
}

/** 읽음 알림 전송: /pub/chat/{chatId}/read */
export function publishChatRead(chatId: number): void {
  publish(`/pub/chat/${chatId}/read`, "");
}

/** 연결 상태 구독 (온라인 표시용) */
export { onConnectionChange };
