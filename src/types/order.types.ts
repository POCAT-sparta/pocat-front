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
  deliveryStatus: string | null;
  createdAt: string;
}

/** GET /api/v1/orders/{orderUid} */
export interface OrderDetail {
  orderUid: string;
  auctionId: number;
  buyer: { nickname: string };
  seller: { nickname: string };
  card: { name: string; grade: string; imageUrl: string | null };
  finalPrice: number;
  orderStatus: OrderStatus;
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
