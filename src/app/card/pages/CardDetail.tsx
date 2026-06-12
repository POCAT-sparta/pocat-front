import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Gavel, Sparkles, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getCard, getCardAuctions, getAveragePrice } from "@/api/card/cardApi";
import { getCardAnalysis, reanalyzeCard } from "@/api/ai/cardAnalysisApi";
import type {
  ActiveAuctionSummary,
  CardAveragePriceResponse,
  CardResponse,
} from "@/types/card.types";
import type { CardAnalysisResponse } from "@/types/aiAnalysis.types";

function gradeLabel(grade: string) {
  return grade.replace("_", " ");
}

function formatEnds(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Spec({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export function CardDetail() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();

  const [card, setCard] = useState<CardResponse | null>(null);
  const [auctions, setAuctions] = useState<ActiveAuctionSummary[]>([]);
  const [avg, setAvg] = useState<CardAveragePriceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [auctionsLoading, setAuctionsLoading] = useState(true);

  const [analysis, setAnalysis] = useState<CardAnalysisResponse | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);

  useEffect(() => {
    if (!cardId) return;
    const id = Number(cardId);

    setIsLoading(true);
    getCard(id)
      .then(setCard)
      .catch(() => {
        toast.error("카드를 불러오지 못했습니다.");
        navigate("/cards");
      })
      .finally(() => setIsLoading(false));

    // 진입 시 카드별 경매 목록 호출
    setAuctionsLoading(true);
    getCardAuctions(id, 0, 10)
      .then(setAuctions)
      .catch(() => {})
      .finally(() => setAuctionsLoading(false));

    // 평균 시세 (없을 수 있음)
    getAveragePrice(id)
      .then(setAvg)
      .catch(() => setAvg(null));
  }, [cardId, navigate]);

  async function handleAnalyze() {
    if (!cardId) return;
    setAnalysisLoading(true);
    try {
      const result = await getCardAnalysis(Number(cardId));
      setAnalysis(result);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI 분석에 실패했습니다.");
    } finally {
      setAnalysisLoading(false);
    }
  }

  async function handleReanalyze() {
    if (!cardId) return;
    setReanalyzing(true);
    try {
      const result = await reanalyzeCard(Number(cardId));
      setAnalysis(result);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI 재분석에 실패했습니다.");
    } finally {
      setReanalyzing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="aspect-[3/4] bg-muted rounded-2xl w-64" />
        </div>
      </div>
    );
  }

  if (!card) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white py-8 border-b border-white/10">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link
            to="/cards"
            className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-3 transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" /> 카드 도감
          </Link>
          <h1 className="text-xl font-bold">{card.name}</h1>
          <p className="text-sm text-white/50">{card.setName} · {card.series}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="aspect-[3/4] bg-muted rounded-2xl overflow-hidden max-w-xs">
            {card.imageUrl ? (
              <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
                <span className="text-white/20 text-5xl">🃏</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div className="bg-card border rounded-2xl p-5">
              <Spec label="등급" value={<span className="text-[#FFCB05] font-bold">{gradeLabel(card.grade)}</span>} />
              <Spec label="레어도" value={card.rarity} />
              <Spec label="카테고리" value={card.category} />
              <Spec label="세트" value={card.setName} />
              <Spec label="카드 번호" value={card.cardNumber} />
            </div>

            {avg && avg.transactionCount > 0 && (
              <div className="bg-card border rounded-2xl p-5">
                <p className="text-xs text-muted-foreground mb-1">평균 시세 (거래 {avg.transactionCount}건)</p>
                <p className="text-2xl font-extrabold text-[#CC0000]">
                  {avg.averagePrice.toLocaleString()}원
                </p>
              </div>
            )}
          </div>
        </div>

        {/* AI 분석 */}
        <div className="mt-10">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-[#CC0000]" /> AI 분석
          </h2>

          {!analysis && !analysisLoading && (
            <div className="bg-card border rounded-2xl p-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                AI가 이 카드의 시세와 시장 동향을 분석해드립니다.
              </p>
              <button
                type="button"
                onClick={handleAnalyze}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#CC0000] text-white text-sm font-semibold hover:bg-[#CC0000]/90 transition-colors"
              >
                🤖 AI 분석 보기
              </button>
            </div>
          )}

          {analysisLoading && (
            <div className="bg-card border rounded-2xl p-8 animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-20 bg-muted rounded" />
            </div>
          )}

          {analysis && !analysisLoading && (
            <div className="bg-card border rounded-2xl p-5 space-y-5">
              {/* 요약 */}
              <p className="text-sm leading-relaxed">{analysis.summary}</p>

              {/* 핵심 지표 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-muted/40 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">가격 동향</p>
                  <p className="text-sm font-semibold">{analysis.priceTrend}</p>
                </div>
                <div className="bg-muted/40 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">수요 수준</p>
                  <p className="text-sm font-semibold">{analysis.demandLevel}</p>
                </div>
                <div className="bg-muted/40 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">적정 가격 추정</p>
                  <p className="text-sm font-extrabold text-[#CC0000]">
                    {analysis.fairValueEstimate.toLocaleString()}원
                  </p>
                </div>
              </div>

              {/* 긍정 포인트 */}
              {analysis.highlights.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">긍정 포인트</p>
                  <ul className="space-y-1.5">
                    {analysis.highlights.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 위험 요소 */}
              {analysis.riskFactors.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">위험 요소</p>
                  <ul className="space-y-1.5">
                    {analysis.riskFactors.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 키워드 */}
              {analysis.keywords.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">키워드</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-full bg-[#FFCB05]/15 text-[#a86d00] text-xs font-medium"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 다시 분석 */}
              <div className="pt-2 border-t">
                <button
                  type="button"
                  onClick={handleReanalyze}
                  disabled={reanalyzing}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${reanalyzing ? "animate-spin" : ""}`} />
                  {reanalyzing ? "분석 중..." : "다시 분석"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 진행 중 경매 */}
        <div className="mt-10">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Gavel className="w-5 h-5 text-[#CC0000]" /> 진행 중인 경매
            {auctions.length > 0 && (
              <span className="text-sm text-muted-foreground">({auctions.length})</span>
            )}
          </h2>

          {auctionsLoading ? (
            <div className="space-y-3 animate-pulse">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded-2xl" />
              ))}
            </div>
          ) : auctions.length === 0 ? (
            <div className="bg-card border rounded-2xl p-8 text-center text-sm text-muted-foreground">
              이 카드로 진행 중인 경매가 없습니다.
            </div>
          ) : (
            <ul className="space-y-3">
              {auctions.map((a) => (
                <li key={a.auctionId}>
                  <Link
                    to={`/auctions/${a.auctionId}`}
                    className="flex items-center justify-between gap-4 bg-card border rounded-2xl p-4 hover:border-[#FFCB05]/40 hover:shadow-md transition-all"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{a.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ~ {formatEnds(a.endedAt)} 종료
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] text-muted-foreground">현재가</p>
                      <p className="text-lg font-extrabold text-[#CC0000]">
                        {(a.highestPrice ?? a.startingPrice).toLocaleString()}원
                      </p>
                      {a.buyoutPrice != null && (
                        <p className="text-[11px] text-[#FFCB05]">
                          즉시구매 {a.buyoutPrice.toLocaleString()}원
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
