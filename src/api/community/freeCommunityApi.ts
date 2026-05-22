import { apiClient } from "@/shared/lib/apiClient.ts";
import type { ApiResponse, PageResponse } from "@/shared/types/api.ts";
import type {
  FreePostResponse,
  CreateFreePostRequest,
  UpdateFreePostRequest,
  FreePostListParams,
} from "@/types/community.types";

export async function getPosts(params: FreePostListParams = {}): Promise<PageResponse<FreePostResponse>> {
  const query = new URLSearchParams();
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.size !== undefined) query.set("size", String(params.size));
  if (params.sort) query.set("sort", params.sort);

  const qs = query.toString();
  const res = await apiClient.get<ApiResponse<PageResponse<FreePostResponse>>>(
    `/api/v1/posts/free${qs ? `?${qs}` : ""}`,
    { skipAuth: true }
  );
  return res.data;
}

export async function getMyPosts(params: Omit<FreePostListParams, "keyword"> = {}): Promise<PageResponse<FreePostResponse>> {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.size !== undefined) query.set("size", String(params.size));
  if (params.sort) query.set("sort", params.sort);

  const qs = query.toString();
  const res = await apiClient.get<ApiResponse<PageResponse<FreePostResponse>>>(
    `/api/v1/posts/free/me${qs ? `?${qs}` : ""}`
  );
  return res.data;
}

export async function getPost(freePostId: number): Promise<FreePostResponse> {
  const res = await apiClient.get<ApiResponse<FreePostResponse>>(
    `/api/v1/posts/free/${freePostId}`,
    { skipAuth: true }
  );
  return res.data;
}

export async function getPopularPosts(size = 20): Promise<FreePostResponse[]> {
  const res = await apiClient.get<ApiResponse<FreePostResponse[]>>(
    `/api/v1/posts/free/popular?size=${size}`,
    { skipAuth: true }
  );
  return res.data;
}

export async function createPost(data: CreateFreePostRequest): Promise<FreePostResponse> {
  const res = await apiClient.post<ApiResponse<FreePostResponse>>("/api/v1/posts/free", data);
  return res.data;
}

export async function updatePost(freePostId: number, data: UpdateFreePostRequest): Promise<FreePostResponse> {
  const res = await apiClient.patch<ApiResponse<FreePostResponse>>(
    `/api/v1/posts/free/${freePostId}`,
    data
  );
  return res.data;
}

export async function deletePost(freePostId: number): Promise<void> {
  await apiClient.delete<ApiResponse<void>>(`/api/v1/posts/free/${freePostId}`);
}
