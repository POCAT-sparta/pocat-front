import { apiClient } from "@/shared/lib/apiClient.ts";
import type { ApiResponse, PageResponseDto } from "@/shared/types/api.ts";
import type { RefundResponse, RefundStatus } from "@/types/admin.types";

export interface MyRefundParams {
  status?: RefundStatus;
  page?: number;
  size?: number;
}

export interface CreateRefundRequest {
  orderId: number;
  reason: string;
}

/** 환불 요청 (결제 완료/거래 완료 주문만 가능, 금액은 서버에서 전액 자동 산정) */
export async function createRefund(
  data: CreateRefundRequest
): Promise<RefundResponse> {
  const res = await apiClient.post<ApiResponse<RefundResponse>>(
    "/api/v1/refunds",
    data
  );
  return res.data;
}

/** 내 환불 목록 */
export async function getMyRefunds(
  params: MyRefundParams = {}
): Promise<PageResponseDto<RefundResponse>> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.size !== undefined) query.set("size", String(params.size));

  const qs = query.toString();
  const res = await apiClient.get<ApiResponse<PageResponseDto<RefundResponse>>>(
    `/api/v1/refunds/me${qs ? `?${qs}` : ""}`
  );
  return res.data;
}
