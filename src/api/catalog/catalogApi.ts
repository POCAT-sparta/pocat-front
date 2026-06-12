import { apiClient } from "@/shared/lib/apiClient.ts";
import type { ApiResponse } from "@/shared/types/api.ts";
import type { SeriesResponse, PokemonSetResponse } from "@/types/catalog.types";

export async function getSeries(): Promise<SeriesResponse[]> {
  const res = await apiClient.get<ApiResponse<SeriesResponse[]>>(
    "/api/v1/series",
    { skipAuth: true }
  );
  return res.data;
}

export async function getSets(): Promise<PokemonSetResponse[]> {
  const res = await apiClient.get<ApiResponse<PokemonSetResponse[]>>(
    "/api/v1/sets",
    { skipAuth: true }
  );
  return res.data;
}
