/** AI 카드 분석 결과 (GET/POST /api/ai/cards/{cardId}/analysis) */
export interface CardAnalysisResponse {
  priceTrend: string;
  fairValueEstimate: number;
  demandLevel: string;
  summary: string;
  highlights: string[];
  riskFactors: string[];
  keywords: string[];
}
