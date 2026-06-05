import { apiClient } from "@/shared/lib/apiClient.ts";
import type { ApiResponse } from "@/shared/types/api.ts";
import type {
  ChatResponse,
  ChatRoomListItem,
  ChatMessagePage,
} from "@/types/chat.types";

/** 거래글 기준으로 채팅방 생성(이미 있으면 기존 방 반환) */
export async function createChat(postId: number): Promise<ChatResponse> {
  const res = await apiClient.post<ApiResponse<ChatResponse>>(
    "/api/v1/chats",
    { postId }
  );
  return res.data;
}

/** 내 채팅방 목록 */
export async function getMyChats(): Promise<ChatRoomListItem[]> {
  const res = await apiClient.get<ApiResponse<ChatRoomListItem[]>>(
    "/api/v1/chats/me"
  );
  return res.data;
}

/** 채팅방 메시지 이력 (최신 30개 단위 페이징) */
export async function getChatMessages(
  chatId: number,
  page = 0,
  size = 30
): Promise<ChatMessagePage> {
  const res = await apiClient.get<ApiResponse<ChatMessagePage>>(
    `/api/v1/chats/${chatId}/messages?page=${page}&size=${size}`
  );
  return res.data;
}

/** 읽음 처리 */
export async function markChatAsRead(chatId: number): Promise<void> {
  await apiClient.patch<ApiResponse<void>>(`/api/v1/chats/${chatId}/read`);
}

/** 채팅방 나가기 */
export async function leaveChat(chatId: number): Promise<void> {
  await apiClient.delete<ApiResponse<void>>(`/api/v1/chats/${chatId}`);
}
