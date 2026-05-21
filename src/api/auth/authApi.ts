import { apiClient } from "@/shared/lib/apiClient.ts";
import type { ApiResponse } from "@/shared/types/api.ts";
import {
  SignupRequest,
  SignupResponse,
  LoginRequest,
  LoginResponse, ReissueRequest, ReissueResponse,
} from "@/app/auth/types/auth.types.ts";

export async function signup(data: SignupRequest): Promise<SignupResponse> {
  const res = await apiClient.post<ApiResponse<SignupResponse>>(
    "/api/v1/auth/signup",
    data,
    { skipAuth: true }
  );
  return res.data;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await apiClient.post<ApiResponse<LoginResponse>>(
    "/api/v1/auth/login",
    data,
    { skipAuth: true }
  );
  return res.data;
}

export async function reissue(data: ReissueRequest): Promise<ReissueResponse> {
  const res = await apiClient.post<ApiResponse<ReissueResponse>>(
      "/api/v1/auth/reissue",
      data,
      { skipAuth: true }
  );
  return res.data;
}

export async function logout(): Promise<void> {
  await apiClient.post<ApiResponse<null>>("/api/v1/auth/logout");
}
