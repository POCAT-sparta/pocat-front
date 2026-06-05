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

/** 빌링키 최초 등록 (이미 등록돼 있으면 서버가 BILLING_KEY_ALREADY_EXISTS 반환) */
export async function registerBillingKey(billingKey: string): Promise<void> {
    await apiClient.post<ApiResponse<void>>("/api/v1/users/me/billing-key", { billingKey });
}

/** 빌링키 교체 (기존 등록된 카드 변경) */
export async function updateBillingKey(billingKey: string): Promise<void> {
    await apiClient.put<ApiResponse<void>>("/api/v1/users/me/billing-key", { billingKey });
}
