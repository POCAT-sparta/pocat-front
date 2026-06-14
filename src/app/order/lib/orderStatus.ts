import type { OrderStatus } from "@/types/order.types";

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; className: string }> = {
  PAYMENT_PENDING:       { label: "결제 대기",   className: "bg-blue-500/15 text-blue-400" },
  AUTO_PAYMENT_FAILED:   { label: "자동결제 실패", className: "bg-red-500/15 text-red-400" },
  DIRECT_PAYMENT_FAILED: { label: "직접결제 실패", className: "bg-red-500/15 text-red-400" },
  CANCELLED:             { label: "취소됨",      className: "bg-white/10 text-white/50" },
  PAYMENT_COMPLETED:     { label: "결제 완료",   className: "bg-green-500/15 text-green-400" },
  SHIPPING:              { label: "배송중",      className: "bg-blue-500/15 text-blue-400" },
  SHIPPING_COMPLETED:    { label: "배송 완료",   className: "bg-green-500/15 text-green-400" },
  ORDER_COMPLETED:       { label: "거래 완료",   className: "bg-green-500/15 text-green-400" },
  REFUNDED:              { label: "환불됨",      className: "bg-orange-500/15 text-orange-400" },
};

/** 직접 결제(재결제) 가능한 상태 — 낙찰 후 자동결제 실패분 / 결제 대기 */
const PAYABLE: OrderStatus[] = ["PAYMENT_PENDING", "AUTO_PAYMENT_FAILED", "DIRECT_PAYMENT_FAILED"];

/** 낙찰 후 자동/직접결제 실패 상태 (직접결제 창이 부여되는 상태) */
const PAYMENT_FAILED: OrderStatus[] = ["AUTO_PAYMENT_FAILED", "DIRECT_PAYMENT_FAILED"];

/** 결제가 완료된 이후의 상태 (결제 완료 ~ 환불) */
const PAID: OrderStatus[] = [
  "PAYMENT_COMPLETED",
  "SHIPPING",
  "SHIPPING_COMPLETED",
  "ORDER_COMPLETED",
  "REFUNDED",
];

export function isPayable(status: OrderStatus): boolean {
  return PAYABLE.includes(status);
}

/** 결제가 완료된 주문인지 (결제 완료 이후 단계) */
export function isPaid(status: OrderStatus): boolean {
  return PAID.includes(status);
}

export function isPaymentFailed(status: OrderStatus): boolean {
  return PAYMENT_FAILED.includes(status);
}

/** 직접결제 창(paymentDeadline)이 지나 더 이상 결제할 수 없는지 */
export function isPaymentExpired(paymentDeadline: string | null): boolean {
  if (!paymentDeadline) return false;
  return new Date(paymentDeadline).getTime() <= Date.now();
}

export function statusMeta(status: OrderStatus) {
  return ORDER_STATUS_META[status] ?? { label: status, className: "bg-white/10 text-white/50" };
}
