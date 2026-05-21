import { apiClient } from "../../../shared/lib/apiClient";
import type { ApiResponse, PageResponse } from "../../../shared/types/api";
import type {
  AuctionListItem,
  AuctionDetail,
  AuctionListParams,
  BidItem,
  PlaceBidRequest,
  PlaceBidResponse,
  BuyoutResponse,
} from "../types/auction.types";

export async function getAuctions(params: AuctionListParams = {}): Promise<PageResponse<AuctionListItem>> {
  const query = new URLSearchParams();
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.series) query.set("series", params.series);
  if (params.setName) query.set("setName", params.setName);
  if (params.grade) query.set("grade", params.grade);
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.size !== undefined) query.set("size", String(params.size));
  if (params.sort) query.set("sort", params.sort);

  const qs = query.toString();
  const res = await apiClient.get<ApiResponse<PageResponse<AuctionListItem>>>(
    `/api/v1/auctions${qs ? `?${qs}` : ""}`,
    { skipAuth: true }
  );
  return res.data;
}

export async function getAuctionDetail(auctionId: number): Promise<AuctionDetail> {
  const res = await apiClient.get<ApiResponse<AuctionDetail>>(
    `/api/v1/auctions/${auctionId}`,
    { skipAuth: true }
  );
  return res.data;
}

export async function getAuctionBids(
  auctionId: number,
  page = 0,
  size = 20
): Promise<PageResponse<BidItem>> {
  const res = await apiClient.get<ApiResponse<PageResponse<BidItem>>>(
    `/api/v1/auctions/${auctionId}/bids?page=${page}&size=${size}`,
    { skipAuth: true }
  );
  return res.data;
}

export async function placeBid(auctionId: number, data: PlaceBidRequest): Promise<PlaceBidResponse> {
  const res = await apiClient.post<ApiResponse<PlaceBidResponse>>(
    `/api/v1/auctions/${auctionId}/bids`,
    data
  );
  return res.data;
}

export async function buyout(auctionId: number, bidPrice: number): Promise<BuyoutResponse> {
  const res = await apiClient.post<ApiResponse<BuyoutResponse>>(
    `/api/v1/auctions/${auctionId}/buyout`,
    { bidPrice }
  );
  return res.data;
}

export async function toggleLike(auctionId: number): Promise<{ auctionId: number; isLiked: boolean }> {
  const res = await apiClient.post<ApiResponse<{ auctionId: number; isLiked: boolean }>>(
    "/api/v1/likes",
    { auctionId }
  );
  return res.data;
}
