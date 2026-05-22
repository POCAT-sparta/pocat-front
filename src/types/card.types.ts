export type CardCategory = "POKEMON" | "TRAINERS" | "ENERGY" | "UNKNOWN";

export type CardGrade = "PSA_10" | "PSA_9" | "BGS_10";

export type CardSource = "TCGDEX" | "MANUAL";

export type CardStatus = "ACTIVE" | "PENDING" | "REJECTED";

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
