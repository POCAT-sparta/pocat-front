import type {ApiResponse, PageResponse} from "@/shared/types/api.ts";
import type { BidItem, BuyoutResponse, PlaceBidRequest, PlaceBidResponse } from "@/types/auction.types";
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

/**
 * 즉시구매: 백엔드가 빌링키 자동결제까지 완료한 뒤 결과를 반환한다.
 * 별도의 PG 결제창을 띄울 필요가 없다(orderStatus/paymentStatus 로 성공 여부 확인).
 */
export async function buyout(auctionId: number): Promise<BuyoutResponse> {
    const res = await apiClient.post<ApiResponse<BuyoutResponse>>(
        `/api/v1/auctions/${auctionId}/buyout`,
        {}
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