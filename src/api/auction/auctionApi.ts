import {
  AuctionListItem,
  AuctionDetail,
  AuctionListParams,
  MyAuctionParams, CreateAuctionRequest, CreateAuctionResponse,
  UpdateAuctionRequest, UpdateAuctionResponse, CancelAuctionResponse,
} from "@/types/auction.types";
import { apiClient } from "@/shared/lib/apiClient.ts";
import type { ApiResponse, PageResponse } from "@/shared/types/api.ts";


export async function getAuctions(params: AuctionListParams = {}): Promise<PageResponse<AuctionListItem>> {
  const query = new URLSearchParams();
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.series) query.set("series", params.series);
  if (params.setName) query.set("setName", params.setName);
  if (params.grade) query.set("grade", params.grade);
  if (params.cardCategory) query.set("cardCategory", params.cardCategory);
  if (params.status) query.set("status", params.status);
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

export async function getMyAuctions(params: MyAuctionParams = {}): Promise<PageResponse<AuctionListItem>> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.size !== undefined) query.set("size", String(params.size));
  if (params.sort) query.set("sort", params.sort);

  const qs = query.toString();
  const res = await apiClient.get<ApiResponse<PageResponse<AuctionListItem>>>(
    `/api/v1/auctions/me${qs ? `?${qs}` : ""}`
  );
  return res.data;
}


export async function createAuction(data: CreateAuctionRequest): Promise<CreateAuctionResponse> {
  const res = await apiClient.post<ApiResponse<CreateAuctionResponse>>(
    "/api/v1/auctions",
    data
  );
  return res.data;
}

export async function updateAuction(auctionId: number, data: UpdateAuctionRequest): Promise<UpdateAuctionResponse> {
  const res = await apiClient.patch<ApiResponse<UpdateAuctionResponse>>(
    `/api/v1/auctions/${auctionId}`,
    data
  );
  return res.data;
}

export async function cancelAuction(auctionId: number): Promise<CancelAuctionResponse> {
  const res = await apiClient.patch<ApiResponse<CancelAuctionResponse>>(
    `/api/v1/auctions/${auctionId}/cancel`
  );
  return res.data;
}

export async function getAuctionDetail(auctionId: number): Promise<AuctionDetail> {
  const res = await apiClient.get<ApiResponse<AuctionDetail>>(
    `/api/v1/auctions/${auctionId}`);
  return res.data;
}

