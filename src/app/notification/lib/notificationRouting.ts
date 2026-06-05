/** relatedData(문자열 JSON 또는 객체)를 안전하게 객체로 변환 */
export function parseRelatedData(relatedData: unknown): Record<string, unknown> {
  if (!relatedData) return {};
  if (typeof relatedData === "string") {
    try {
      return (JSON.parse(relatedData) as Record<string, unknown>) ?? {};
    } catch {
      return {};
    }
  }
  if (typeof relatedData === "object") return relatedData as Record<string, unknown>;
  return {};
}

/** 알림 클릭 시 이동할 경로. 없으면 null */
export function notificationLink(type: string, relatedData: unknown): string | null {
  const data = parseRelatedData(relatedData);
  const orderUid = typeof data.orderUid === "string" ? data.orderUid : null;
  const rawAuctionId = data.auctionId;
  const auctionId =
    typeof rawAuctionId === "number"
      ? rawAuctionId
      : typeof rawAuctionId === "string" && rawAuctionId
        ? Number(rawAuctionId)
        : null;

  if (orderUid) return `/orders/${orderUid}`;
  if (auctionId) return `/auctions/${auctionId}`;
  return null;
}

/** 알림 타입별 아이콘/강조색 (벨 목록 표시용) */
export function notificationMeta(type: string): { icon: string; accent: string } {
  switch (type) {
    case "AUTO_PAYMENT_FAILED":
    case "DIRECT_PAYMENT_FAILED":
    case "PAYMENT_FINAL_FAILED":
      return { icon: "⚠️", accent: "text-red-400" };
    case "ESCALATED_PAYMENT_OPPORTUNITY":
      return { icon: "⚡", accent: "text-[#FFCB05]" };
    case "PAYMENT_COMPLETED":
    case "AUCTION_SOLD":
      return { icon: "✅", accent: "text-green-400" };
    case "AUCTION_WON":
      return { icon: "🏆", accent: "text-[#FFCB05]" };
    case "AUCTION_LOST":
    case "BID_OUTBID":
      return { icon: "😢", accent: "text-white/60" };
    case "BID_CREATED":
    case "AUCTION_ACTIVATED":
      return { icon: "🔨", accent: "text-blue-400" };
    case "SHIPPING":
    case "SHIPPING_COMPLETED":
      return { icon: "📦", accent: "text-blue-400" };
    case "SETTLEMENT_CREATED":
    case "SETTLEMENT_COMPLETED":
      return { icon: "💰", accent: "text-green-400" };
    case "REFUND_REQUESTED":
    case "REFUND_APPROVED":
    case "REFUND_REJECTED":
    case "ORDER_CANCELLED":
    case "AUCTION_CANCELLED":
      return { icon: "↩️", accent: "text-orange-400" };
    case "INSPECTION_PASSED":
      return { icon: "🛡️", accent: "text-green-400" };
    case "INSPECTION_FAILED":
      return { icon: "🚫", accent: "text-red-400" };
    default:
      return { icon: "🔔", accent: "text-white/70" };
  }
}
