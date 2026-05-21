import { apiClient } from "../../../shared/lib/apiClient";
import type { ApiResponse } from "../../../shared/types/api";
import type { User, UpdateUserRequest, UpdateUserResponse } from "../types/user.types";

export async function getMe(): Promise<User> {
  const res = await apiClient.get<ApiResponse<User>>("/api/v1/users/me");
  return res.data;
}

export async function updateMe(data: UpdateUserRequest): Promise<UpdateUserResponse> {
  const res = await apiClient.patch<ApiResponse<UpdateUserResponse>>("/api/v1/users/me", data);
  return res.data;
}
