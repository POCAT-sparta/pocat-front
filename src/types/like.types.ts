export interface ToggleLikeRequest {
  auctionId: number;
}

export interface ToggleLikeResponse {
  auctionId: number;
  isLiked: boolean;
}

export interface LikeResponse {
  likeId: number;
  auctionId: number;
  auctionTitle: string;
  cardName: string;
  grade: string;
  cardImageUrl: string | null;
  highestPrice: number;
  endedAt: string;
  status: string;
  createdAt: string;
}
