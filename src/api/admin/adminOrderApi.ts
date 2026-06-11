import { apiClient } from "@/shared/lib/apiClient.ts";
import type { ApiResponse, PageResponseDto } from "@/shared/types/api.ts";
import type { AdminOrderParams, AdminOrderResponse } from "@/types/admin.types.ts";

/** GET /api/v1/admin/orders — 전체 주문 목록 (ADMIN) */
export async function getAdminOrders(
  params: AdminOrderParams = {}
): Promise<PageResponseDto<AdminOrderResponse>> {
  const query = new URLSearchParams();
  if (params.orderStatus) query.set("orderStatus", params.orderStatus);
  if (params.cardGrade) query.set("cardGrade", params.cardGrade);
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);
  if (params.buyerNickname) query.set("buyerNickname", params.buyerNickname);
  if (params.sellerNickname) query.set("sellerNickname", params.sellerNickname);
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.size !== undefined) query.set("size", String(params.size));
  if (params.sort) query.set("sort", params.sort);

  const qs = query.toString();
  const res = await apiClient.get<ApiResponse<PageResponseDto<AdminOrderResponse>>>(
    `/api/v1/admin/orders${qs ? `?${qs}` : ""}`
  );
  return res.data;
}
