import { apiClient } from "@/shared/lib/apiClient.ts";
import type { ApiResponse, PageResponseDto } from "@/shared/types/api.ts";
import type {
  AdminAuctionParams,
  AdminAuctionResponse,
  AdminCancelAuctionRequest,
  AdminCancelAuctionResponse,
  InspectAuctionRequest,
  InspectAuctionResponse,
} from "@/types/admin.types.ts";

/** GET /api/v1/admin/auctions — 경매 목록 조회 (ADMIN) */
export async function getAdminAuctions(
  params: AdminAuctionParams = {}
): Promise<PageResponseDto<AdminAuctionResponse>> {
  const query = new URLSearchParams();
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.series) query.set("series", params.series);
  if (params.setName) query.set("setName", params.setName);
  if (params.grade) query.set("grade", params.grade);
  if (params.category) query.set("category", params.category);
  if (params.status) query.set("status", params.status);
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.size !== undefined) query.set("size", String(params.size));
  if (params.sort) query.set("sort", params.sort);

  const qs = query.toString();
  const res = await apiClient.get<ApiResponse<PageResponseDto<AdminAuctionResponse>>>(
    `/api/v1/admin/auctions${qs ? `?${qs}` : ""}`
  );
  return res.data;
}

/** PATCH /api/v1/admin/auctions/{auctionId}/inspection — 경매 검수 (ADMIN) */
export async function inspectAuction(
  auctionId: number,
  data: InspectAuctionRequest
): Promise<InspectAuctionResponse> {
  const res = await apiClient.patch<ApiResponse<InspectAuctionResponse>>(
    `/api/v1/admin/auctions/${auctionId}/inspection`,
    data
  );
  return res.data;
}

/** PATCH /api/v1/admin/auctions/{auctionId}/cancel — 관리자 경매 취소 (ADMIN) */
export async function adminCancelAuction(
  auctionId: number,
  data: AdminCancelAuctionRequest
): Promise<AdminCancelAuctionResponse> {
  const res = await apiClient.patch<ApiResponse<AdminCancelAuctionResponse>>(
    `/api/v1/admin/auctions/${auctionId}/cancel`,
    data
  );
  return res.data;
}
