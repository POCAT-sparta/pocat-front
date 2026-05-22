import { apiClient } from "@/shared/lib/apiClient.ts";
import type { ApiResponse, PageResponse } from "@/shared/types/api.ts";
import type {
  CommentTreeResponse,
  CommentResponse,
  CreateCommentRequest,
  UpdateCommentRequest,
} from "@/types/community.types";

export async function getCommentsByPost(freePostId: number, page = 0, size = 20): Promise<PageResponse<CommentTreeResponse>> {
  const query = new URLSearchParams({ freePostId: String(freePostId), page: String(page), size: String(size) });
  const res = await apiClient.get<ApiResponse<PageResponse<CommentTreeResponse>>>(
    `/api/v1/comments?${query}`,
    { skipAuth: true }
  );
  return res.data;
}

export async function createComment(data: CreateCommentRequest): Promise<CommentResponse> {
  const res = await apiClient.post<ApiResponse<CommentResponse>>("/api/v1/comments", data);
  return res.data;
}

export async function updateComment(commentId: number, data: UpdateCommentRequest): Promise<CommentResponse> {
  const res = await apiClient.patch<ApiResponse<CommentResponse>>(
    `/api/v1/comments/${commentId}`,
    data
  );
  return res.data;
}

export async function deleteComment(commentId: number): Promise<void> {
  await apiClient.delete<ApiResponse<void>>(`/api/v1/comments/${commentId}`);
}
