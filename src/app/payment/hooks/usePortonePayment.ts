import { useState } from "react";
import * as PortOne from "@portone/browser-sdk/v2";
import { confirmPayment, createPayment } from "@/api/payment/paymentApi";
import { USE_MOCK } from "@/shared/lib/apiClient";

const STORE_ID = import.meta.env.VITE_PORTONE_STORE_ID as string;
const CHANNEL_KEY = import.meta.env.VITE_PORTONE_CHANNEL_KEY as string;

interface Buyer {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
}

interface PayArgs {
  paymentUid: string;
  amount: number;
  orderName: string;
  buyer?: Buyer;
}

async function executePortonePayment({ paymentUid, amount, orderName, buyer }: PayArgs) {
  const response = await PortOne.requestPayment({
    storeId: STORE_ID,
    channelKey: CHANNEL_KEY,
    paymentId: paymentUid,
    orderName,
    totalAmount: amount,
    currency: "KRW",
    payMethod: "CARD",
    customer: buyer,
  });

  // 결제 실패 또는 사용자 취소
  if (response?.code !== undefined) {
    throw new Error(response.message ?? "결제에 실패했습니다.");
  }

  // 백엔드 결제 확정
  await confirmPayment(paymentUid);
}

export function usePortonePayment() {
  const [isPaying, setIsPaying] = useState(false);

  /**
   * 직접 결제(PG 결제창): 낙찰 후 자동결제 실패분 또는 결제 대기 주문을 직접 결제할 때 사용.
   * 백엔드에서 orderId 로 paymentUid 를 생성하고 PortOne 결제창을 연 뒤 확정한다.
   */
  async function payForOrder(orderId: number, orderName: string, buyer?: Buyer) {
    setIsPaying(true);
    try {
      const { paymentUid, amount } = await createPayment({ orderId });
      // MOCK 모드: 실제 PG 결제창을 열지 않고 곧바로 결제를 확정한다.
      if (USE_MOCK) {
        await confirmPayment(paymentUid);
      } else {
        await executePortonePayment({ paymentUid, amount, orderName, buyer });
      }
    } finally {
      setIsPaying(false);
    }
  }

  return { payForOrder, isPaying };
}
