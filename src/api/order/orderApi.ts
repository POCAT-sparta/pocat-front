import { apiClient } from "@/shared/lib/apiClient.ts";
import type { ApiResponse } from "@/shared/types/api.ts";
import type {
  MyOrderParams,
  OrderDetail,
  OrderListItem,
  OrderPage,
} from "@/types/order.types";

/** 내 주문 목록 */
export async function getMyOrders(params: MyOrderParams = {}): Promise<OrderPage> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.size !== undefined) query.set("size", String(params.size));

  const qs = query.toString();
  const res = await apiClient.get<ApiResponse<OrderPage>>(
    `/api/v1/orders/me${qs ? `?${qs}` : ""}`
  );
  return res.data;
}

/** 주문 상세 */
export async function getOrder(orderUid: string): Promise<OrderDetail> {
  const res = await apiClient.get<ApiResponse<OrderDetail>>(
    `/api/v1/orders/${orderUid}`
  );
  return res.data;
}

/** 주문 취소 (사유 필수) */
export async function cancelOrder(orderUid: string, reason: string): Promise<OrderListItem> {
  const res = await apiClient.patch<ApiResponse<OrderListItem>>(
    `/api/v1/orders/${orderUid}/cancel`,
    { reason }
  );
  return res.data;
}
