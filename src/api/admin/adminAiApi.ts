import { apiClient } from "@/shared/lib/apiClient.ts";
import type { ApiResponse } from "@/shared/types/api.ts";
import type { EsMigrationResponse } from "@/types/admin.types.ts";

/**
 * POST /api/v1/admin/ai/reindex — 활성 카드 전체 벡터 스토어 재색인 (ADMIN)
 * 비동기로 실행되며 즉시 202 Accepted 를 반환한다.
 */
export async function reindexAi(): Promise<void> {
  await apiClient.post<ApiResponse<void>>(`/api/v1/admin/ai/reindex`);
}

/**
 * POST /api/v1/admin/es-migrate — DB 의 카드/경매를 Elasticsearch 로 일괄 인덱싱 (ADMIN)
 * 동기로 실행되며 마이그레이션 건수를 반환한다.
 */
export async function esMigrate(): Promise<EsMigrationResponse> {
  const res = await apiClient.post<ApiResponse<EsMigrationResponse>>(`/api/v1/admin/es-migrate`);
  return res.data;
}

/** POST /api/v1/admin/es-migrate/cards — DB 카드만 ES 로 일괄 인덱싱 (동기, ADMIN) */
export async function esMigrateCards(): Promise<EsMigrationResponse> {
  const res = await apiClient.post<ApiResponse<EsMigrationResponse>>(`/api/v1/admin/es-migrate/cards`);
  return res.data;
}

/** POST /api/v1/admin/es-migrate/auctions — DB 경매만 ES 로 일괄 인덱싱 (동기, ADMIN) */
export async function esMigrateAuctions(): Promise<EsMigrationResponse> {
  const res = await apiClient.post<ApiResponse<EsMigrationResponse>>(`/api/v1/admin/es-migrate/auctions`);
  return res.data;
}
