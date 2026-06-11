import { apiClient } from "@/shared/lib/apiClient.ts";
import type { ApiResponse, PageResponseDto } from "@/shared/types/api.ts";
import type { CardResponse } from "@/types/card.types.ts";
import type {
  AdminCardRequestsParams,
  RejectCardRequest,
  UpdateCardRequest,
} from "@/types/admin.types.ts";

/** GET /api/v1/admin/cards/requests — 카드 등록 요청 목록 (ADMIN) */
export async function getCardRequests(
  params: AdminCardRequestsParams = {}
): Promise<PageResponseDto<CardResponse>> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.size !== undefined) query.set("size", String(params.size));
  if (params.sort) query.set("sort", params.sort);

  const qs = query.toString();
  const res = await apiClient.get<ApiResponse<PageResponseDto<CardResponse>>>(
    `/api/v1/admin/cards/requests${qs ? `?${qs}` : ""}`
  );
  return res.data;
}

/** PATCH /api/v1/admin/cards/{cardId}/approve — 카드 승인 (ADMIN) */
export async function approveCard(cardId: number): Promise<CardResponse> {
  const res = await apiClient.patch<ApiResponse<CardResponse>>(
    `/api/v1/admin/cards/${cardId}/approve`
  );
  return res.data;
}

/** PATCH /api/v1/admin/cards/{cardId}/reject — 카드 거절 (ADMIN) */
export async function rejectCard(
  cardId: number,
  data: RejectCardRequest
): Promise<CardResponse> {
  const res = await apiClient.patch<ApiResponse<CardResponse>>(
    `/api/v1/admin/cards/${cardId}/reject`,
    data
  );
  return res.data;
}

/** PATCH /api/v1/admin/cards/{cardId} — 카드 정보 수정 (ADMIN) */
export async function updateCard(
  cardId: number,
  data: UpdateCardRequest
): Promise<CardResponse> {
  const res = await apiClient.patch<ApiResponse<CardResponse>>(
    `/api/v1/admin/cards/${cardId}`,
    data
  );
  return res.data;
}

/** DELETE /api/v1/admin/cards/{cardId} — 카드 삭제 (ADMIN) */
export async function deleteCard(cardId: number): Promise<void> {
  await apiClient.delete<ApiResponse<void>>(`/api/v1/admin/cards/${cardId}`);
}

/** POST /api/v1/admin/cards/sync — TCGdex 전체 카드 수동 동기화 (비동기, ADMIN) */
export async function syncCards(): Promise<void> {
  await apiClient.post<ApiResponse<void>>(`/api/v1/admin/cards/sync`);
}

/** POST /api/v1/admin/cards/migrate-images — 카드 이미지 S3 마이그레이션 (비동기, ADMIN) */
export async function migrateCardImages(): Promise<void> {
  await apiClient.post<ApiResponse<void>>(`/api/v1/admin/cards/migrate-images`);
}
