import { apiClient } from "@/shared/lib/apiClient.ts";
import type { ApiResponse, PageResponseDto } from "@/shared/types/api.ts";
import type { AdminUserParams, AdminUserResponse } from "@/types/admin.types.ts";

/** GET /api/v1/admin/users — 전체 회원 목록 (ADMIN) */
export async function getAdminUsers(
  params: AdminUserParams = {}
): Promise<PageResponseDto<AdminUserResponse>> {
  const query = new URLSearchParams();
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.isBidBlocked !== undefined) query.set("isBidBlocked", String(params.isBidBlocked));
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.size !== undefined) query.set("size", String(params.size));
  if (params.sort) query.set("sort", params.sort);

  const qs = query.toString();
  const res = await apiClient.get<ApiResponse<PageResponseDto<AdminUserResponse>>>(
    `/api/v1/admin/users${qs ? `?${qs}` : ""}`
  );
  return res.data;
}
