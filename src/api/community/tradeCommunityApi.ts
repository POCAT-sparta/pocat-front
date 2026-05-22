import { apiClient } from "@/shared/lib/apiClient.ts";
import type { ApiResponse, PageResponse } from "@/shared/types/api.ts";
import type {
    TradePostListItem,
    TradePostDetail,
    TradePostListParams,
    CreateTradePostRequest,
} from "@/types/community.types";

export async function getTradePosts(params: TradePostListParams = {}): Promise<PageResponse<TradePostListItem>> {
    const query = new URLSearchParams();
    if (params.keyword) query.set("keyword", params.keyword);
    if (params.minPrice !== undefined) query.set("minPrice", String(params.minPrice));
    if (params.maxPrice !== undefined) query.set("maxPrice", String(params.maxPrice));
    if (params.page !== undefined) query.set("page", String(params.page));
    if (params.size !== undefined) query.set("size", String(params.size));
    if (params.sort) query.set("sort", params.sort);

    const qs = query.toString();
    const res = await apiClient.get<ApiResponse<PageResponse<TradePostListItem>>>(
        `/api/v1/posts/trade${qs ? `?${qs}` : ""}`,
        { skipAuth: true }
    );
    return res.data;
}

export async function getTradePost(tradePostId: number): Promise<TradePostDetail> {
    const res = await apiClient.get<ApiResponse<TradePostDetail>>(
        `/api/v1/posts/trade/${tradePostId}`,
        { skipAuth: true }
    );
    return res.data;
}

export async function createTradePost(data: CreateTradePostRequest): Promise<{ id: number; title: string }> {
    const res = await apiClient.post<ApiResponse<{ id: number; title: string }>>(
        "/api/v1/posts/trade",
        data
    );
    return res.data;
}

export async function deleteTradePost(tradePostId: number): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/api/v1/posts/trade/${tradePostId}`);
}
