export interface TradePostListItem {
  id: number;
  title: string;
  authorNickname: string;
  price: number;
  thumbnail: string | null;
  viewCount: number;
  createdAt: string;
}

export interface TradePostDetail {
  id: number;
  title: string;
  content: string;
  authorId: number;
  authorNickname: string;
  price: number;
  thumbnail: string | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TradePostListParams {
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export interface CreateTradePostRequest {
  title: string;
  content: string;
  price: number;
  thumbnail?: string;
}
