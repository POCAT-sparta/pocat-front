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
  /** 입찰이 없으면 null (서버 Long, 첫 입찰 전까지 null) */
  highestPrice: number | null;
  endedAt: string;
  status: string;
  createdAt: string;
}
