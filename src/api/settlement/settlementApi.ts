import { apiClient } from "@/shared/lib/apiClient.ts";
import type { ApiResponse, PageResponseDto } from "@/shared/types/api.ts";
import type { MySettlementItem, MySettlementParams } from "@/types/settlement.types";

/** 내 정산 목록 (정렬: 서버가 createdAt DESC 고정, status 필터 미지원) */
export async function getMySettlements(
  params: MySettlementParams = {}
): Promise<PageResponseDto<MySettlementItem>> {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.size !== undefined) query.set("size", String(params.size));

  const qs = query.toString();
  const res = await apiClient.get<ApiResponse<PageResponseDto<MySettlementItem>>>(
    `/api/v1/settlements/me${qs ? `?${qs}` : ""}`
  );
  return res.data;
}
