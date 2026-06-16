import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Search, Gavel, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getCards } from "@/api/card/cardApi";
import { getCachedCardAuctions, loadCardAuctions } from "@/app/card/lib/cardAuctionsCache";
import { CardItem } from "@/app/card/components/CardItem";
import { SeriesSetFilter, type SeriesSetSelection } from "@/app/card/components/SeriesSetFilter";
import type { ActiveAuctionSummary, CardCategory, CardGrade, CardResponse } from "@/types/card.types";

const GRADES: { label: string; value?: CardGrade }[] = [
  { label: "전체 등급" },
  { label: "PSA 10", value: "PSA_10" },
  { label: "PSA 9", value: "PSA_9" },
  { label: "BGS 10", value: "BGS_10" },
];

const CATEGORIES: { label: string; value?: CardCategory }[] = [
  { label: "전체" },
  { label: "포켓몬", value: "POKEMON" },
  { label: "트레이너", value: "TRAINERS" },
  { label: "에너지", value: "ENERGY" },
];

function gradeLabel(grade: CardGrade) {
  return grade.replace("_", " ");
}

const PAGE_SIZE = 20;

// ── Hover 미리보기 툴팁 카드 ───────────────────────────────────────────────
function CardTile({ card }: { card: CardResponse }) {
  const [hovering, setHovering] = useState(false);
  const [preview, setPreview] = useState<ActiveAuctionSummary[] | null>(
    () => getCachedCardAuctions(card.id) ?? null
  );
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleEnter() {
    setHovering(true);
    if (card.activeAuctionCount === 0 || preview) return;
    // hover-intent: 250ms 머무르면 1회만 로드
    timerRef.current = setTimeout(() => {
      setLoading(true);
      loadCardAuctions(card.id)
        .then(setPreview)
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 250);
  }

  function handleLeave() {
    setHovering(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  useEffect(() => () => timerRef.current && clearTimeout(timerRef.current), []);

  const showTooltip = hovering && card.activeAuctionCount > 0;

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <Link to={`/cards/${card.id}`} className="block group">
        <div className="relative">
          {card.imageUrl ? (
            <CardItem
              imageUrl={card.imageUrl}
              name={card.name}
              grade={card.grade}
              className="w-full"
            />
          ) : (
            <div className="aspect-[2/3] rounded-xl border bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex items-center justify-center shadow-xl">
              <span className="text-white/20 text-3xl">🃏</span>
            </div>
          )}
          {/* 진행 중 경매 뱃지 */}
          {card.activeAuctionCount > 0 && (
            <span className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-[#CC0000] text-white text-[10px] font-bold px-2 py-1 rounded-full shadow">
              <Gavel className="w-3 h-3" /> 경매 {card.activeAuctionCount}개 진행중
            </span>
          )}
          <span className="absolute top-2 right-2 z-10 bg-black/60 text-[#FFCB05] text-[10px] font-bold px-1.5 py-0.5 rounded">
            {gradeLabel(card.grade)}
          </span>
        </div>
        <div className="mt-2.5 px-1">
          <p className="font-semibold text-sm truncate">{card.name}</p>
          <p className="text-xs text-muted-foreground truncate">{card.setName}</p>
        </div>
      </Link>

      {/* Hover 툴팁 — 진행 중 경매 미리보기 */}
      {showTooltip && (
        <div className="absolute z-30 left-1/2 -translate-x-1/2 top-[calc(100%-6px)] w-64 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl p-3 pointer-events-none">
          <p className="text-[11px] font-bold text-[#FFCB05] mb-2 flex items-center gap-1">
            <Gavel className="w-3 h-3" /> 진행 중 경매 {card.activeAuctionCount}건
          </p>
          {loading && !preview ? (
            <div className="flex items-center gap-2 text-white/40 text-xs py-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> 불러오는 중…
            </div>
          ) : preview && preview.length > 0 ? (
            <ul className="space-y-1.5">
              {preview.slice(0, 3).map((a) => (
                <li key={a.auctionId} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-white/80 truncate">{a.title}</span>
                  <span className="text-xs font-bold text-[#FFCB05] shrink-0">
                    {(a.highestPrice ?? a.startingPrice).toLocaleString()}원
                  </span>
                </li>
              ))}
              {preview.length > 3 && (
                <li className="text-[10px] text-white/40">외 {preview.length - 3}건 더…</li>
              )}
            </ul>
          ) : (
            <p className="text-xs text-white/40 py-1">미리보기를 불러오지 못했습니다.</p>
          )}
          <p className="text-[10px] text-white/30 mt-2">클릭하면 카드 상세로 이동</p>
        </div>
      )}
    </div>
  );
}

export function CardCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();

  const keyword = searchParams.get("keyword") ?? "";
  const grade = (searchParams.get("grade") as CardGrade) || undefined;
  const category = (searchParams.get("category") as CardCategory) || undefined;
  const seriesName = searchParams.get("series") || undefined;
  const setName = searchParams.get("setName") || undefined;

  const [searchInput, setSearchInput] = useState(keyword);
  const [cards, setCards] = useState<CardResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  function updateParam(key: string, value: string | undefined) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    }, { replace: true });
  }

  async function load(reset: boolean) {
    const nextPage = reset ? 0 : page + 1;
    if (reset) setIsLoading(true);
    else setIsLoadingMore(true);
    try {
      const res = await getCards({ keyword, grade, category, series: seriesName, setName, page: nextPage, size: PAGE_SIZE });
      setCards((prev) => (reset ? res.content : [...prev, ...res.content]));
      setPage(nextPage);
      setTotalPages(res.totalPages);
    } catch {
      toast.error("카드를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }

  useEffect(() => {
    setSearchInput(keyword);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, grade, category, seriesName, setName]);

  function handleFilterChange(sel: SeriesSetSelection) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (sel.series?.name) next.set("series", sel.series.name);
      else next.delete("series");
      if (sel.set?.name) next.set("setName", sel.set.name);
      else next.delete("setName");
      return next;
    }, { replace: true });
  }

  const hasMore = page + 1 < totalPages;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white py-10 border-b border-white/10">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">🃏 카드 도감</h1>
          <p className="text-sm text-white/50 mt-1">
            전체 카드를 둘러보고, 진행 중인 경매를 한눈에 확인하세요.
          </p>

          {/* Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateParam("keyword", searchInput.trim() || undefined);
            }}
            className="mt-5 flex gap-2 max-w-md"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="카드 이름 검색..."
                className="w-full bg-white/10 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#FFCB05]/50 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#CC0000] hover:bg-[#aa0000] text-white text-sm font-semibold transition-colors"
            >
              검색
            </button>
          </form>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {GRADES.map((g) => (
            <button
              key={g.label}
              onClick={() => updateParam("grade", g.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                grade === g.value
                  ? "bg-[#FFCB05] text-[#1a1a2e]"
                  : "bg-card border text-muted-foreground hover:text-foreground"
              }`}
            >
              {g.label}
            </button>
          ))}
          <span className="w-px bg-border mx-1" />
          {CATEGORIES.map((c) => (
            <button
              key={c.label}
              onClick={() => updateParam("category", c.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                category === c.value
                  ? "bg-[#FFCB05] text-[#1a1a2e]"
                  : "bg-card border text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Series / Set 드롭다운 필터 */}
        <div className="mb-6">
          <SeriesSetFilter
            includeAll
            onChange={handleFilterChange}
            initialSeriesName={seriesName}
            initialSetName={setName}
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-pulse">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted rounded-2xl" />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-2">
            <span className="text-4xl">🔍</span>
            <p className="text-muted-foreground text-sm">조건에 맞는 카드가 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {cards.map((card) => (
                <CardTile key={card.id} card={card} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => load(false)}
                  disabled={isLoadingMore}
                  className="px-6 py-2.5 rounded-xl border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {isLoadingMore ? "불러오는 중…" : "더 보기"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
