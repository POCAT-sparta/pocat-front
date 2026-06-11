export interface AuctionListItem {
  auctionId: number;
  title: string;
  cardId: number;
  cardName: string;
  grade: string;
  cardImageUrl: string | null;
  startingPrice: number;
  buyoutPrice: number;
  /** 입찰이 하나도 없으면 null (서버는 첫 입찰 전까지 null 반환) */
  highestPrice: number | null;
  status: AuctionStatus;
  startedAt: string;
  endedAt: string;
}

export interface AuctionDetail extends AuctionListItem {
  id: number;
  sellerId: number;
  sellerNickname: string;
  description: string;
  highestBidderId: number | null;
  highestBidderNickname: string | null;
  likeCount: number;
  isLiked: boolean;
}

export interface AuctionListParams {
  keyword?: string;
  series?: string;
  setName?: string;
  grade?: string;
  page?: number;
  size?: number;
  cardCategory?: "POKEMON" | "TRAINERS" | "ENERGY" | "UNKNOWN";
  sort?: string;
}

export type AuctionStatus = "PENDING" | "INSPECTING" | "REJECTED" | "ACTIVE" | "ENDED" | "NO_BIDDER" | "CANCELLED" | "PAYMENT_PENDING";

export interface MyAuctionParams {
  status?: AuctionStatus;
  page?: number;
  size?: number;
  sort?: string;
}

export interface UpdateAuctionRequest {
  title?: string;
  description?: string;
  startingPrice?: number;
  buyoutPrice?: number;
}

export interface UpdateAuctionResponse {
  auctionId: number;
  title: string;
  description: string | null;
  startingPrice: number;
  buyoutPrice: number | null;
  status: AuctionListItem["status"];
  startedAt: string;
  endedAt: string;
}

export interface CancelAuctionResponse {
  auctionId: number;
  status: AuctionListItem["status"];
}

export interface CreateAuctionRequest {
  cardId: number;
  title: string;
  description?: string;
  startingPrice: number;
  buyoutPrice?: number;
}

export interface CreateAuctionResponse {
  auctionId: number;
  cardId: number;
  title: string;
  description: string | null;
  startingPrice: number;
  buyoutPrice: number | null;
  status: AuctionListItem["status"];
  startedAt: string;
  endedAt: string;
}

export interface BidItem {
  bidId: number;
  bidderId: number;
  bidderNickname: string;
  bidPrice: number;
  createdAt: string;
}

export interface PlaceBidRequest {
  bidPrice: number;
}

export interface PlaceBidResponse {
  bidId: number;
  auctionId: number;
  bidPrice: number;
  status: string;
}

export interface BuyoutResponse {
  auctionId: number;
  bidId: number;
  orderUid: string;
  orderStatus: string;
  paymentUid: string;
  paymentStatus: string;
  paidAmount: number;
  auctionStatus: string;
  purchasedAt: string;
}
