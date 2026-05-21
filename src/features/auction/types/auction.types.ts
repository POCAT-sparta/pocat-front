export interface AuctionListItem {
  auctionId: number;
  title: string;
  cardId: number;
  cardName: string;
  grade: string;
  cardImageUrl: string | null;
  startingPrice: number;
  buyoutPrice: number;
  highestPrice: number;
  status: "ACTIVE" | "PENDING" | "ENDED" | "CANCELLED" | "PAYMENT_PENDING";
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
  sort?: string;
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
