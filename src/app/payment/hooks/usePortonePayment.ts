import { useState } from "react";
import * as PortOne from "@portone/browser-sdk/v2";
import { confirmPayment, createPayment } from "@/api/payment/paymentApi";
import type { BuyoutResponse } from "@/types/auction.types";

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
   * 낙찰 결제: 백엔드에서 paymentUid를 생성하고 바로 결제창 오픈
   */
  async function payForAuction(auctionId: number, orderName: string, buyer?: Buyer) {
    setIsPaying(true);
    try {
      const { paymentUid, amount } = await createPayment({ auctionId });
      await executePortonePayment({ paymentUid, amount, orderName, buyer });
    } finally {
      setIsPaying(false);
    }
  }

  /**
   * 즉시 구매 결제: buyout API 응답의 paymentUid를 바로 사용
   */
  async function payForBuyout(buyoutRes: BuyoutResponse, orderName: string, buyer?: Buyer) {
    setIsPaying(true);
    try {
      await executePortonePayment({
        paymentUid: buyoutRes.paymentUid,
        amount: buyoutRes.paidAmount,
        orderName,
        buyer,
      });
    } finally {
      setIsPaying(false);
    }
  }

  return { payForAuction, payForBuyout, isPaying };
}
