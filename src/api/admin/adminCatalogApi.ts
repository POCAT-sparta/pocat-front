import { apiClient } from "@/shared/lib/apiClient.ts";
import type { ApiResponse } from "@/shared/types/api.ts";
import type {
  PokemonResponse,
  PokemonSetResponse,
  SeriesResponse,
  UpsertPokemonRequest,
  UpsertPokemonSetRequest,
  UpsertSeriesRequest,
} from "@/types/admin.types.ts";

/* ===================== 시리즈 (/api/v1/admin/series) ===================== */

/** GET /api/v1/admin/series — 시리즈 전체 조회 (ADMIN) */
export async function getAdminSeries(): Promise<SeriesResponse[]> {
  const res = await apiClient.get<ApiResponse<SeriesResponse[]>>(`/api/v1/admin/series`);
  return res.data;
}

/** POST /api/v1/admin/series — 시리즈 생성 (ADMIN) */
export async function createSeries(data: UpsertSeriesRequest): Promise<SeriesResponse> {
  const res = await apiClient.post<ApiResponse<SeriesResponse>>(`/api/v1/admin/series`, data);
  return res.data;
}

/** PATCH /api/v1/admin/series/{id}/name-ko — 시리즈 한글명 수정 (ADMIN) */
export async function updateSeriesNameKo(id: number, nameKo: string): Promise<SeriesResponse> {
  const res = await apiClient.patch<ApiResponse<SeriesResponse>>(
    `/api/v1/admin/series/${id}/name-ko?nameKo=${encodeURIComponent(nameKo)}`
  );
  return res.data;
}

/** DELETE /api/v1/admin/series/{id} — 시리즈 삭제 (ADMIN) */
export async function deleteSeries(id: number): Promise<void> {
  await apiClient.delete<ApiResponse<void>>(`/api/v1/admin/series/${id}`);
}

/* ===================== 포켓몬 (/api/v1/admin/pokemon) ===================== */

/** GET /api/v1/admin/pokemon — 포켓몬 전체 조회 (ADMIN) */
export async function getAdminPokemon(): Promise<PokemonResponse[]> {
  const res = await apiClient.get<ApiResponse<PokemonResponse[]>>(`/api/v1/admin/pokemon`);
  return res.data;
}

/** POST /api/v1/admin/pokemon — 포켓몬 생성 (ADMIN) */
export async function createPokemon(data: UpsertPokemonRequest): Promise<PokemonResponse> {
  const res = await apiClient.post<ApiResponse<PokemonResponse>>(`/api/v1/admin/pokemon`, data);
  return res.data;
}

/** PATCH /api/v1/admin/pokemon/{id}/name-ko — 포켓몬 한글명 수정 (ADMIN) */
export async function updatePokemonNameKo(id: number, nameKo: string): Promise<PokemonResponse> {
  const res = await apiClient.patch<ApiResponse<PokemonResponse>>(
    `/api/v1/admin/pokemon/${id}/name-ko?nameKo=${encodeURIComponent(nameKo)}`
  );
  return res.data;
}

/** DELETE /api/v1/admin/pokemon/{id} — 포켓몬 삭제 (ADMIN) */
export async function deletePokemon(id: number): Promise<void> {
  await apiClient.delete<ApiResponse<void>>(`/api/v1/admin/pokemon/${id}`);
}

/* ===================== 세트 (/api/v1/admin/sets) ===================== */

/** GET /api/v1/admin/sets — 세트 전체 조회 (ADMIN) */
export async function getAdminSets(): Promise<PokemonSetResponse[]> {
  const res = await apiClient.get<ApiResponse<PokemonSetResponse[]>>(`/api/v1/admin/sets`);
  return res.data;
}

/** POST /api/v1/admin/sets — 세트 생성 (ADMIN) */
export async function createSet(data: UpsertPokemonSetRequest): Promise<PokemonSetResponse> {
  const res = await apiClient.post<ApiResponse<PokemonSetResponse>>(`/api/v1/admin/sets`, data);
  return res.data;
}

/** PATCH /api/v1/admin/sets/{id}/name-ko — 세트 한글명 수정 (ADMIN) */
export async function updateSetNameKo(id: number, nameKo: string): Promise<PokemonSetResponse> {
  const res = await apiClient.patch<ApiResponse<PokemonSetResponse>>(
    `/api/v1/admin/sets/${id}/name-ko?nameKo=${encodeURIComponent(nameKo)}`
  );
  return res.data;
}

/** DELETE /api/v1/admin/sets/{id} — 세트 삭제 (ADMIN) */
export async function deleteSet(id: number): Promise<void> {
  await apiClient.delete<ApiResponse<void>>(`/api/v1/admin/sets/${id}`);
}
