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

export interface UpdateTradePostRequest {
  title?: string;
  content?: string;
  price?: number;
  thumbnail?: string;
}

export interface FreePostResponse {
  id: number;
  authorId: number;
  authorNickname: string;
  title: string;
  content: string;
  viewCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFreePostRequest {
  title: string;
  content: string;
}

export interface UpdateFreePostRequest {
  title?: string;
  content?: string;
}

export interface FreePostListParams {
  keyword?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface CommentResponse {
  id: number;
  userId: number;
  freePostId: number;
  parentId: number | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentTreeResponse {
  id: number;
  freePostId: number;
  parentId: number | null;
  authorId: number;
  authorNickname: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  children: CommentTreeResponse[];
}

export interface CreateCommentRequest {
  freePostId: number;
  parentId?: number;
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}
