import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Gavel } from "lucide-react";
import { toast } from "sonner";
import { getCard, getCardAuctions, getAveragePrice } from "@/api/card/cardApi";
import type {
  ActiveAuctionSummary,
  CardAveragePriceResponse,
  CardResponse,
} from "@/types/card.types";

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
