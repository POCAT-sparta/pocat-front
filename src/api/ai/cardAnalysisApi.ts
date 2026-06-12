import { apiClient } from "@/shared/lib/apiClient.ts";
import type { ApiResponse } from "@/shared/types/api.ts";
import type { CardAnalysisResponse } from "@/types/aiAnalysis.types";

/**
 * GET /api/ai/cards/{cardId}/analysis — 캐시된 AI 분석 결과 조회 (없으면 새로 생성)
 */
export async function getCardAnalysis(cardId: number): Promise<CardAnalysisResponse> {
  const res = await apiClient.get<ApiResponse<CardAnalysisResponse>>(
    `/api/ai/cards/${cardId}/analysis`
  );
  return res.data;
}

/**
 * POST /api/ai/cards/{cardId}/analysis — 강제 재분석 (캐시 무효화 후 재생성)
 * Rate limit: 10회/60초. "다시 분석" 버튼 클릭 시에만 호출할 것.
 */
export async function reanalyzeCard(cardId: number): Promise<CardAnalysisResponse> {
  const res = await apiClient.post<ApiResponse<CardAnalysisResponse>>(
    `/api/ai/cards/${cardId}/analysis`
  );
  return res.data;
}
