export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
  phone: string;
}

export interface SignupResponse {
  id: number;
  email: string;
  nickname: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ReissueRequest {
  refreshToken: string;
}

export interface ReissueResponse {
  accessToken: string;
  refreshToken: string;
}
