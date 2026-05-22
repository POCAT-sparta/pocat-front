import { apiClient } from "@/shared/lib/apiClient.ts";
import type { ApiResponse, PageResponse } from "@/shared/types/api.ts";
import type { ToggleLikeRequest, ToggleLikeResponse, LikeResponse } from "@/types/like.types";

export async function toggleLike(auctionId: number): Promise<ToggleLikeResponse> {
  const body: ToggleLikeRequest = { auctionId };
  const res = await apiClient.post<ApiResponse<ToggleLikeResponse>>("/api/v1/likes", body);
  return res.data;
}

export async function getMyLikes(page = 0, size = 10): Promise<PageResponse<LikeResponse>> {
  const query = new URLSearchParams({ page: String(page), size: String(size) });
  const res = await apiClient.get<ApiResponse<PageResponse<LikeResponse>>>(
    `/api/v1/likes/me?${query}`
  );
  return res.data;
}
