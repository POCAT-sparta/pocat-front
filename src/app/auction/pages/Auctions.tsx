import { useEffect, useState, useCallback } from "react";
import { Gavel, Clock, TrendingUp, Search } from "lucide-react";
import { AuctionCard } from "../components/AuctionCard.tsx";
import { getAuctions } from "@/api/auction/auctionApi.ts";
import type { AuctionListItem } from "@/types/auction.types";

const SORT_OPTIONS = [
  { label: "마감 임박순", value: "endedAt,asc" },
  { label: "최신순", value: "startedAt,desc" },
  { label: "높은 입찰가순", value: "highestPrice,desc" },
  { label: "낮은 시작가순", value: "startingPrice,asc" },
];

const FILTER_TABS = [
  { id: "all", label: "전체 경매", sort: "startedAt,desc" },
  { id: "ending-soon", label: "마감 임박", sort: "endedAt,asc" },
  { id: "new", label: "신규 경매", sort: "startedAt,desc" },
  { id: "hot", label: "인기 경매", sort: "highestPrice,desc" },
];

const PAGE_SIZE = 12;

export function Auctions() {
  const [auctions, setAuctions] = useState<AuctionListItem[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState("all");
  const [sort, setSort] = useState("startedAt,desc");
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchAuctions = useCallback(async (reset: boolean) => {
    const targetPage = reset ? 0 : page + 1;
    if (reset) {
      setIsLoading(true);
      setError(null);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const res = await getAuctions({
        keyword: keyword || undefined,
        sort,
        page: targetPage,
        size: PAGE_SIZE,
      });

      if (reset) {
        setAuctions(res.content);
        setPage(0);
      } else {
        setAuctions((prev) => [...prev, ...res.content]);
        setPage(targetPage);
      }

      setTotalElements(res.totalElements);
      setHasMore(targetPage < res.totalPages - 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "경매 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [sort, keyword, page]);

  useEffect(() => {
    fetchAuctions(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, keyword]);

  function handleFilterTab(tab: typeof FILTER_TABS[number]) {
    setActiveFilter(tab.id);
    setSort(tab.sort);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setKeyword(searchInput.trim());
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Gavel className="w-10 h-10" />
            <h1 className="text-4xl">실시간 경매</h1>
          </div>
          <p className="text-lg opacity-90">레어 카드를 경쟁 입찰로 획득하세요</p>
        </div>
      </section>

      <div className="border-b bg-card sticky top-16 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4 overflow-x-auto pb-1">
            {FILTER_TABS.map((f) => (
              <button
                key={f.id}
                onClick={() => handleFilterTab(f)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors text-sm ${
                  activeFilter === f.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-primary" />
              <h3>진행 중인 경매</h3>
            </div>
            <p className="text-3xl font-bold">
              {isLoading ? "—" : totalElements.toLocaleString()}
            </p>
          </div>
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h3>현재 페이지</h3>
            </div>
            <p className="text-3xl font-bold">{auctions.length}</p>
          </div>
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Gavel className="w-5 h-5 text-orange-500" />
              <h3>총 경매 수</h3>
            </div>
            <p className="text-3xl font-bold">
              {isLoading ? "—" : totalElements.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-8">
          <h3 className="text-yellow-800 dark:text-yellow-200 mb-2">경매 참여 전 필독사항</h3>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>• 입찰 후 취소가 불가능하니 신중하게 입찰해주세요</li>
            <li>• 낙찰 시 24시간 내 결제하지 않으면 패널티가 부여됩니다</li>
            <li>• 모든 경매 상품은 전문가 검수를 거친 정품입니다</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2>진행 중인 경매</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <form onSubmit={handleSearch} className="flex items-center bg-muted rounded-lg px-3 py-2 gap-2 flex-1 sm:w-64">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="카드명, 경매 제목 검색"
                className="bg-transparent border-none outline-none w-full text-sm"
              />
            </form>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-muted border rounded-lg px-3 py-2 text-sm"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card border rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-[3/4] bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => fetchAuctions(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : auctions.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            {keyword ? `"${keyword}"에 대한 경매가 없습니다.` : "진행 중인 경매가 없습니다."}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {auctions.map((auction) => (
                <AuctionCard key={auction.auctionId} auction={auction} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => fetchAuctions(false)}
                  disabled={isLoadingMore}
                  className="px-6 py-2 border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {isLoadingMore ? "불러오는 중..." : "더 보기"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
