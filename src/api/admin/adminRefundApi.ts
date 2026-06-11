import { apiClient } from "@/shared/lib/apiClient.ts";
import type { ApiResponse, PageResponseDto } from "@/shared/types/api.ts";
import type {
  AdminRefundParams,
  AdminRefundResponse,
  RefundResponse,
  RejectRefundRequest,
} from "@/types/admin.types.ts";

/** GET /api/v1/admin/refunds — 전체 환불 목록 (ADMIN) */
export async function getAdminRefunds(
  params: AdminRefundParams = {}
): Promise<PageResponseDto<AdminRefundResponse>> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.size !== undefined) query.set("size", String(params.size));
  if (params.sort) query.set("sort", params.sort);

  const qs = query.toString();
  const res = await apiClient.get<ApiResponse<PageResponseDto<AdminRefundResponse>>>(
    `/api/v1/admin/refunds${qs ? `?${qs}` : ""}`
  );
  return res.data;
}

/** PATCH /api/v1/admin/refunds/{refundId}/approve — 환불 승인 (ADMIN) */
export async function approveRefund(refundId: number): Promise<RefundResponse> {
  const res = await apiClient.patch<ApiResponse<RefundResponse>>(
    `/api/v1/admin/refunds/${refundId}/approve`
  );
  return res.data;
}

/** PATCH /api/v1/admin/refunds/{refundId}/reject — 환불 거절 (ADMIN) */
export async function rejectRefund(
  refundId: number,
  data: RejectRefundRequest
): Promise<RefundResponse> {
  const res = await apiClient.patch<ApiResponse<RefundResponse>>(
    `/api/v1/admin/refunds/${refundId}/reject`,
    data
  );
  return res.data;
}
