import type { CardCategory, CardGrade, CardSource, CardStatus } from "./card.types";
import type { OrderStatus } from "./order.types";
import type { AuctionStatus } from "./auction.types";

/* ===================== 공통 enum ===================== */

export type UserRole = "USER" | "ADMIN";

export type SettlementStatus = "PENDING" | "COMPLETED" | "REFUNDED";

export type RefundStatus =
  | "REQUESTED"
  | "PROCESSING"
  | "COMPLETED"
  | "REJECTED"
  | "FAILED_RETRYABLE"
  | "FAILED_FINAL";

export type AuctionInspectionResult = "PASSED" | "FAILED";

/* ===================== 사용자 (GET /admin/users) ===================== */

export interface AdminUserResponse {
  id: number;
  email: string;
  nickname: string;
  /** 마스킹된 전화번호 (***-****-1234) */
  phone: string;
  role: UserRole;
  address: string | null;
  unpaidStrike: number;
  isBidBlocked: boolean;
  hasBillingKey: boolean;
  createdAt: string;
}

export interface AdminUserParams {
  keyword?: string;
  isBidBlocked?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

/* ===================== 경매 (admin/auctions) ===================== */

export interface AdminAuctionResponse {
  auctionId: number;
  sellerId: number;
  sellerNickname: string;
  title: string;
  cardId: number;
  cardName: string;
  grade: CardGrade;
  cardImageUrl: string | null;
  startingPrice: number;
  highestPrice: number | null;
  buyoutPrice: number | null;
  status: AuctionStatus;
  startedAt: string;
  endedAt: string;
}

export interface AdminAuctionParams {
  keyword?: string;
  series?: string;
  setName?: string;
  grade?: CardGrade;
  category?: CardCategory;
  status?: AuctionStatus;
  page?: number;
  size?: number;
  sort?: string;
}

export interface InspectAuctionRequest {
  result: AuctionInspectionResult;
  reason?: string;
}

export interface InspectAuctionResponse {
  auctionId: number;
  status: AuctionStatus;
  reason: string | null;
  inspectedAt: string;
  inspectedBy: number;
}

export interface AdminCancelAuctionRequest {
  reason: string;
}

export interface AdminCancelAuctionResponse {
  auctionId: number;
  status: AuctionStatus;
  reason: string;
}

/* ===================== 카드 (admin/cards) ===================== */

export interface AdminCardRequestsParams {
  status?: CardStatus;
  page?: number;
  size?: number;
  sort?: string;
}

export interface RejectCardRequest {
  rejectReason: string;
}

export interface UpdateCardRequest {
  tcgdexId?: string;
  name?: string;
  series?: string;
  setId?: string;
  setName?: string;
  cardNumber?: string;
  rarity?: string;
  category?: CardCategory;
  grade?: CardGrade;
  imageUrl?: string;
  source?: CardSource;
}

/** POST /api/v1/admin/es-migrate 응답 (동기 실행, 마이그레이션 건수) */
export interface EsMigrationResponse {
  cardsMigrated: number;
  auctionsMigrated: number;
}

/* ===================== 주문 (GET /admin/orders) ===================== */

export interface AdminOrderResponse {
  orderId: number;
  orderUid: string;
  buyerNickname: string;
  sellerNickname: string;
  cardName: string;
  cardGrade: string;
  finalPrice: number;
  status: OrderStatus;
  createdAt: string;
}

export interface AdminOrderParams {
  orderStatus?: OrderStatus;
  cardGrade?: CardGrade;
  /** ISO LocalDateTime (예: 2026-01-01T00:00:00) */
  startDate?: string;
  endDate?: string;
  buyerNickname?: string;
  sellerNickname?: string;
  page?: number;
  size?: number;
  sort?: string;
}

/* ===================== 정산 (admin/settlements) ===================== */

export interface AdminSettlementResponse {
  settlementUid: string;
  orderUid: string;
  sellerNickname: string;
  cardName: string;
  cardGrade: string;
  totalPrice: number;
  platformFee: number;
  sellerAmount: number;
  status: SettlementStatus;
  settledAt: string | null;
  createdAt: string;
}

export interface AdminSettlementParams {
  status?: SettlementStatus;
  sellerNickname?: string;
  /** ISO LocalDate (예: 2026-01-01) */
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface SettlementCompleteResponse {
  settlementUid: string;
  status: SettlementStatus;
  settledAt: string;
}

/* ===================== 환불 (admin/refunds) ===================== */

export interface AdminRefundResponse {
  refundId: number;
  orderId: number;
  buyerNickname: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminRefundParams {
  status?: RefundStatus;
  page?: number;
  size?: number;
  sort?: string;
}

export interface RefundResponse {
  refundId: number;
  orderId: number;
  paymentId: number;
  amount: number;
  reason: string;
  /** 거절 시에만 채워짐 */
  rejectReason: string | null;
  status: RefundStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RejectRefundRequest {
  rejectReason: string;
}

/* ===================== 카탈로그: 시리즈 / 포켓몬 / 세트 ===================== */

export interface SeriesResponse {
  id: number;
  name: string;
  nameKo: string | null;
}

export interface UpsertSeriesRequest {
  name: string;
  nameKo?: string;
}

export interface PokemonResponse {
  id: number;
  name: string;
  nameKo: string | null;
}

export interface UpsertPokemonRequest {
  name: string;
  nameKo?: string;
}

export interface PokemonSetResponse {
  id: number;
  setId: string;
  name: string;
  nameKo: string | null;
  seriesId: number | null;
}

export interface UpsertPokemonSetRequest {
  setId: string;
  name: string;
  nameKo?: string;
  seriesId?: number;
}
