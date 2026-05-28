import { useState } from "react";
import * as PortOne from "@portone/browser-sdk/v2";
import { registerBillingKey } from "@/api/user/userApi";

const STORE_ID = import.meta.env.VITE_PORTONE_STORE_ID as string;
const BILLING_CHANNEL_KEY = import.meta.env.VITE_PORTONE_BILLING_CHANNEL_KEY as string;

interface Customer {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
}

export function useIssueBillingKey() {
  const [isIssuing, setIsIssuing] = useState(false);

  async function issueBillingKey(customer?: Customer) {
    setIsIssuing(true);
    try {
      const response = await PortOne.requestIssueBillingKey({
        storeId: STORE_ID,
        channelKey: BILLING_CHANNEL_KEY,
        billingKeyMethod: "CARD",
        customer,
      });

      if (response?.code !== undefined) {
        throw new Error(response.message ?? "카드 등록에 실패했습니다.");
      }

      await registerBillingKey(response!.billingKey);
    } finally {
      setIsIssuing(false);
    }
  }

  return { issueBillingKey, isIssuing };
}
