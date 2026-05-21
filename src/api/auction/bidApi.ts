import type {ApiResponse, PageResponse} from "@/shared/types/api.ts";
import {BidItem, BuyoutResponse, PlaceBidRequest, PlaceBidResponse} from "@/app/auction/types/auction.types.ts";
import {apiClient} from "@/shared/lib/apiClient.ts";

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