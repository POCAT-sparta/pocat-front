export type CardCategory = "POKEMON" | "TRAINERS" | "ENERGY" | "UNKNOWN";

export type CardGrade = "PSA_10" | "PSA_9" | "BGS_10";

export type CardSource = "TCGDEX" | "MANUAL";

export type CardStatus = "ACTIVE" | "PENDING" | "REJECTED";

/** 카드에 연결된 진행 중 경매 요약 (GET /cards/{id} 단건, /cards/{id}/auctions 목록) */
export interface ActiveAuctionSummary {
  auctionId: number;
  title: string;
  startingPrice: number;
  buyoutPrice: number | null;
  highestPrice: number | null;
  startedAt: string;
  endedAt: string;
}

export interface CardResponse {
  id: number;
  userId: number;
  tcgdexId: string | null;
  name: string;
  series: string;
  setId: string;
  setName: string;
  cardNumber: string;
  rarity: string;
  category: CardCategory;
  grade: CardGrade;
  imageUrl: string | null;
  source: CardSource;
  status: CardStatus;
  createdAt: string;
  updatedAt: string;
  /** 단건 조회 시 채워짐 (목록 조회 시 null) */
  activeAuction: ActiveAuctionSummary | null;
  /** 목록 조회 시 채워짐 (진행 중 경매 수) */
  activeAuctionCount: number;
}

export interface CreateCardRequest {
  tcgdexId?: string;
  name: string;
  series: string;
  setId: string;
  setName: string;
  cardNumber: string;
  rarity: string;
  category: CardCategory;
  grade: CardGrade;
  imageUrl?: string;
  source: CardSource;
}

export interface CardAveragePriceResponse {
  cardId: number;
  averagePrice: number;
  transactionCount: number;
  periodStart: string;
  periodEnd: string;
}

export interface CardSearchParams {
  keyword?: string;
  setName?: string;
  series?: string;
  grade?: CardGrade;
  category?: CardCategory;
  page?: number;
  size?: number;
  sort?: string;
}

export interface MyCardRequestsParams {
  status?: CardStatus;
  page?: number;
  size?: number;
  sort?: string;
}
