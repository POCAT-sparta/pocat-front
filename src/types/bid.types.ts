export type BidStatus = "LEADING" | "OUTBID" | "WON" | "LOST" | "CANCELLED";

export interface MyBidItem {
  bidId: number;
  auctionId: number;
  auctionTitle: string;
  bidPrice: number;
  status: BidStatus;
  createdAt: string;
}

export interface MyBidParams {
  status?: BidStatus;
  page?: number;
  size?: number;
}
