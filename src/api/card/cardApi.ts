import { apiClient, getAccessToken } from "@/shared/lib/apiClient.ts";
import type { ApiResponse, PageResponse } from "@/shared/types/api.ts";
import type {
  CardResponse,
  CreateCardRequest,
  CardAveragePriceResponse,
  CardSearchParams,
  MyCardRequestsParams,
  ActiveAuctionSummary,
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
    `/api/v1/cards${qs ? `?${qs}` : ""}`
  );
  return res.data;
}

export async function getCard(cardId: number): Promise<CardResponse> {
  const res = await apiClient.get<ApiResponse<CardResponse>>(
    `/api/v1/cards/${cardId}`
  );
  return res.data;
}

/** 카드에 연결된 진행 중 경매 목록 (최신순) */
export async function getCardAuctions(
  cardId: number,
  page = 0,
  size = 10
): Promise<ActiveAuctionSummary[]> {
  const res = await apiClient.get<ApiResponse<{ content: ActiveAuctionSummary[] }>>(
    `/api/v1/cards/${cardId}/auctions?page=${page}&size=${size}`
  );
  return res.data.content;
}

export async function createCard(data: CreateCardRequest): Promise<CardResponse> {
  const res = await apiClient.post<ApiResponse<CardResponse>>("/api/v1/cards", data);
  return res.data;
}

export async function createCardWithImage(
  data: CreateCardRequest,
  image: File
): Promise<CardResponse> {
  const form = new FormData();
  form.append("image", image);
  form.append(
    "request",
    new Blob([JSON.stringify(data)], { type: "application/json" })
  );

  const token = getAccessToken();
  const baseUrl = import.meta.env.VITE_API_URL ?? "";
  const res = await fetch(`${baseUrl}/api/v1/cards/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "요청 실패" }));
    throw new Error(err.message ?? "요청 실패");
  }
  const json = (await res.json()) as ApiResponse<CardResponse>;
  return json.data;
}

export async function getAveragePrice(cardId: number): Promise<CardAveragePriceResponse> {
  const res = await apiClient.get<ApiResponse<CardAveragePriceResponse>>(
    `/api/v1/cards/${cardId}/average-price`
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
