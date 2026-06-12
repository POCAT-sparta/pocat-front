import { apiClient } from "@/shared/lib/apiClient.ts";
import type { ApiResponse, PageResponseDto } from "@/shared/types/api.ts";
import type { MyBidItem, MyBidParams } from "@/types/bid.types";

/** 내 입찰 목록 */
export async function getMyBids(params: MyBidParams = {}): Promise<PageResponseDto<MyBidItem>> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.size !== undefined) query.set("size", String(params.size));

  const qs = query.toString();
  const res = await apiClient.get<ApiResponse<PageResponseDto<MyBidItem>>>(
    `/api/v1/bids/me${qs ? `?${qs}` : ""}`
  );
  return res.data;
}
