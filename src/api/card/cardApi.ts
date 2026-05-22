import { apiClient } from "@/shared/lib/apiClient.ts";
import type { ApiResponse, PageResponse } from "@/shared/types/api.ts";
import type {
  CardResponse,
  CreateCardRequest,
  CardAveragePriceResponse,
  CardSearchParams,
  MyCardRequestsParams,
} from "@/types/card.types";

export async function getCards(params: CardSearchParams = {}): Promise<PageResponse<CardResponse>> {
  const query = new URLSearchParams();
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.setName) query.set("setName", params.setName);
  if (params.series) query.set("series", params.series);
  if (params.grade) query.set("grade", params.grade);
  if (params.category) query.set("category", params.category);
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.size !== undefined) query.set("size", String(params.size));
  if (params.sort) query.set("sort", params.sort);

  const qs = query.toString();
  const res = await apiClient.get<ApiResponse<PageResponse<CardResponse>>>(
    `/api/v1/cards${qs ? `?${qs}` : ""}`,
    { skipAuth: true }
  );
  return res.data;
}

export async function getCard(cardId: number): Promise<CardResponse> {
  const res = await apiClient.get<ApiResponse<CardResponse>>(
    `/api/v1/cards/${cardId}`,
    { skipAuth: true }
  );
  return res.data;
}

export async function createCard(data: CreateCardRequest): Promise<CardResponse> {
  const res = await apiClient.post<ApiResponse<CardResponse>>("/api/v1/cards", data);
  return res.data;
}

export async function getAveragePrice(cardId: number): Promise<CardAveragePriceResponse> {
  const res = await apiClient.get<ApiResponse<CardAveragePriceResponse>>(
    `/api/v1/cards/${cardId}/average-price`,
    { skipAuth: true }
  );
  return res.data;
}

export async function getMyRequests(params: MyCardRequestsParams = {}): Promise<PageResponse<CardResponse>> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.size !== undefined) query.set("size", String(params.size));
  if (params.sort) query.set("sort", params.sort);

  const qs = query.toString();
  const res = await apiClient.get<ApiResponse<PageResponse<CardResponse>>>(
    `/api/v1/cards/my-requests${qs ? `?${qs}` : ""}`
  );
  return res.data;
}
