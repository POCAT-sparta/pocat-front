import {apiClient} from "@/shared/lib/apiClient.ts";
import {ApiResponse} from "@/shared/types/api.ts";
import type { UpdateUserRequest, UpdateUserResponse, User } from "@/types/user.types";

export async function getMe(): Promise<User> {
    const res = await apiClient.get<ApiResponse<User>>("/api/v1/users/me");
    return res.data;
}

export async function updateMe(data: UpdateUserRequest): Promise<UpdateUserResponse> {
    const res = await apiClient.patch<ApiResponse<UpdateUserResponse>>("/api/v1/users/me", data);
    return res.data;
}

export async function registerBillingKey(billingKey: string): Promise<void> {
    await apiClient.post<ApiResponse<void>>("/api/v1/users/me/billing-key", { billingKey });
}
