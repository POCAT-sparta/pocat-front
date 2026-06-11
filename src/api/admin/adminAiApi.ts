import { apiClient } from "@/shared/lib/apiClient.ts";
import type { ApiResponse } from "@/shared/types/api.ts";

/**
 * POST /api/v1/admin/ai/reindex — 활성 카드 전체 벡터 스토어 재색인 (ADMIN)
 * 비동기로 실행되며 즉시 202 Accepted 를 반환한다.
 */
export async function reindexAi(): Promise<void> {
  await apiClient.post<ApiResponse<void>>(`/api/v1/admin/ai/reindex`);
}
