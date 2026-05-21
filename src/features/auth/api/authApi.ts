import { apiClient } from "../../../shared/lib/apiClient";
import type { ApiResponse } from "../../../shared/types/api";
import type {
  SignupRequest,
  SignupResponse,
  LoginRequest,
  LoginResponse,
} from "../types/auth.types";

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

export async function logout(): Promise<void> {
  await apiClient.post<ApiResponse<null>>("/api/v1/auth/logout");
}
