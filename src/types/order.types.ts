export type OrderStatus =
  | "PAYMENT_PENDING"
  | "AUTO_PAYMENT_FAILED"
  | "DIRECT_PAYMENT_FAILED"
  | "CANCELLED"
  | "PAYMENT_COMPLETED"
  | "SHIPPING"
  | "SHIPPING_COMPLETED"
  | "ORDER_COMPLETED"
  | "REFUNDED";

/** 주문 유형 — AUCTION: 경매 낙찰, BUYOUT: 즉시구매 */
export type OrderType = "AUCTION" | "BUYOUT";

/** GET /api/v1/orders/me 항목 */
export interface OrderListItem {
  orderId: number;
  orderUid: string;
  auctionId: number;
  cardName: string;
  cardGrade: string;
  cardImageUrl: string | null;
  finalPrice: number;
  orderStatus: OrderStatus;
  orderType: OrderType;
  /** 직접결제 마감 시각(ISO). 자동결제 실패 후 부여된 결제 창. 경과 시 결제 불가. */
  paymentDeadline: string | null;
  deliveryStatus: string | null;
  createdAt: string;
}

/** GET /api/v1/orders/{orderUid} */
export interface OrderDetail {
  orderId: number;
  orderUid: string;
  auctionId: number;
  buyer: { nickname: string };
  seller: { nickname: string };
  card: { name: string; grade: string; imageUrl: string | null };
  finalPrice: number;
  orderStatus: OrderStatus;
  paymentDeadline: string | null;
  deliveryStatus: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
}

/** 백엔드 PageResponseDto 형태 (number 대신 pageNumber) */
export interface OrderPage {
  content: OrderListItem[];
  pageNumber: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface MyOrderParams {
  status?: OrderStatus;
  page?: number;
  size?: number;
}
