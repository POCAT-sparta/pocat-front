export type ChatStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export type ChatEventType = "MESSAGE" | "READ";

/** POST /api/v1/chats 응답 */
export interface ChatResponse {
  chatId: number;
  postId: number;
  ownerId: number;
  guestId: number;
  status: ChatStatus;
}

/** GET /api/v1/chats/me 항목 */
export interface ChatRoomListItem {
  chatId: number;
  postTitle: string;
  opponentNickname: string;
  lastMessage: string | null;
  status: ChatStatus;
  updatedAt: string;
}

/** GET /api/v1/chats/{chatId}/messages 항목 (과거 이력) */
export interface ChatMessage {
  id: number;
  senderId: number;
  senderNickname: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

/** 백엔드 PageResponseDto 형태 (number 대신 pageNumber 사용) */
export interface ChatMessagePage {
  content: ChatMessage[];
  pageNumber: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/** WebSocket /sub/chat/{chatId} 로 수신되는 메시지 이벤트 */
export interface ChatMessagePublish {
  type: "MESSAGE";
  chatId: number;
  senderId: number;
  senderNickname: string;
  message: string;
  createdAt: string;
}

/** WebSocket /sub/chat/{chatId} 로 수신되는 읽음 이벤트 */
export interface ChatReadPublish {
  type: "READ";
  chatId: number;
  readerId: number;
}

export type ChatSocketEvent = ChatMessagePublish | ChatReadPublish;
