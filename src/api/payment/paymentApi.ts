import { apiClient } from "@/shared/lib/apiClient";
import type { ApiResponse } from "@/shared/types/api";
import type {
  ConfirmPaymentResponse,
  CreatePaymentRequest,
  CreatePaymentResponse,
} from "@/types/payment.types";

export async function createPayment(data: CreatePaymentRequest): Promise<CreatePaymentResponse> {
  const res = await apiClient.post<ApiResponse<CreatePaymentResponse>>("/api/v1/payments", data);
  return res.data;
}

export async function confirmPayment(paymentUid: string): Promise<ConfirmPaymentResponse> {
  const res = await apiClient.patch<ApiResponse<ConfirmPaymentResponse>>(
    `/api/v1/payments/${paymentUid}`
  );
  return res.data;
}
