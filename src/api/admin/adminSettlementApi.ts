import { apiClient } from "@/shared/lib/apiClient.ts";
import type { ApiResponse, PageResponseDto } from "@/shared/types/api.ts";
import type {
  AdminSettlementParams,
  AdminSettlementResponse,
  SettlementCompleteResponse,
} from "@/types/admin.types.ts";

/** GET /api/v1/admin/settlements — 전체 정산 목록 (ADMIN) */
export async function getAdminSettlements(
  params: AdminSettlementParams = {}
): Promise<PageResponseDto<AdminSettlementResponse>> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.sellerNickname) query.set("sellerNickname", params.sellerNickname);
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.size !== undefined) query.set("size", String(params.size));
  if (params.sort) query.set("sort", params.sort);

  const qs = query.toString();
  const res = await apiClient.get<ApiResponse<PageResponseDto<AdminSettlementResponse>>>(
    `/api/v1/admin/settlements${qs ? `?${qs}` : ""}`
  );
  return res.data;
}

/** PATCH /api/v1/admin/settlements/{settlementUid}/complete — 정산 완료 처리 (ADMIN) */
export async function completeSettlement(
  settlementUid: string
): Promise<SettlementCompleteResponse> {
  const res = await apiClient.patch<ApiResponse<SettlementCompleteResponse>>(
    `/api/v1/admin/settlements/${settlementUid}/complete`
  );
  return res.data;
}
