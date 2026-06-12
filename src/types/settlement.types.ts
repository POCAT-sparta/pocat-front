import type { CardGrade } from "./card.types";
import type { SettlementStatus } from "./admin.types";

export interface MySettlementItem {
  settlementUid: string;
  orderUid: string;
  cardName: string;
  cardGrade: CardGrade;
  cardImageUrl: string | null;
  totalPrice: number;
  platformFee: number;
  sellerAmount: number;
  status: SettlementStatus;
  settledAt: string | null;
  createdAt: string;
}

export interface MySettlementParams {
  page?: number;
  size?: number;
}
