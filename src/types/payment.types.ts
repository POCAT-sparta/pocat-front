export interface CreatePaymentRequest {
  orderId: number;
}

export interface CreatePaymentResponse {
  paymentUid: string;
  amount: number;
  orderName: string;
}

export interface ConfirmPaymentResponse {
  paymentUid: string;
  paymentStatus: string;
  paidAmount: number;
}
