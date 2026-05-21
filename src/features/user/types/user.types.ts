export interface User {
  id: number;
  email: string;
  nickname: string;
  phone: string;
  role: "USER" | "ADMIN";
  bankName: string | null;
  bankAccount: string | null;
  address: string | null;
  unpaidStrike: number;
  isBidBlocked: boolean;
  hasBillingKey: boolean;
  createdAt: string;
}

export interface UpdateUserRequest {
  nickname?: string;
  phone?: string;
  address?: string;
}

export interface UpdateUserResponse {
  id: number;
  nickname: string;
  phone: string;
  address: string | null;
}
