import { useState } from "react";
import * as PortOne from "@portone/browser-sdk/v2";
import { registerBillingKey, updateBillingKey } from "@/api/user/userApi";

const STORE_ID = import.meta.env.VITE_PORTONE_STORE_ID as string;
const BILLING_CHANNEL_KEY = import.meta.env.VITE_PORTONE_BILLING_CHANNEL_KEY as string;

interface Customer {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
}

interface IssueOptions {
  /** 이미 빌링키가 등록돼 있어 교체(PUT)해야 하는 경우 true */
  isUpdate?: boolean;
}

export function useIssueBillingKey() {
  const [isIssuing, setIsIssuing] = useState(false);

  async function issueBillingKey(customer?: Customer, { isUpdate = false }: IssueOptions = {}) {
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

      const billingKey = response?.billingKey;
      if (!billingKey) {
        throw new Error("빌링키 발급에 실패했습니다. 다시 시도해주세요.");
      }

      // 기존 카드가 있으면 교체(PUT), 없으면 최초 등록(POST)
      if (isUpdate) {
        await updateBillingKey(billingKey);
      } else {
        await registerBillingKey(billingKey);
      }
    } finally {
      setIsIssuing(false);
    }
  }

  return { issueBillingKey, isIssuing };
}
