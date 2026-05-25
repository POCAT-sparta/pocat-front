import { useState, useEffect, useCallback } from "react";
import { SlidersHorizontal, Search } from "lucide-react";
import { TradePostCard } from "../components/TradePostCard.tsx";
import type { TradePostListItem } from "@/types/community.types";
import {getTradePosts} from "@/api/community/tradeCommunityApi.ts";

const SORT_OPTIONS = [
  { label: "최신순", value: "createdAt,desc" },
  { label: "낮은 가격순", value: "price,asc" },
  { label: "높은 가격순", value: "price,desc" },
  { label: "조회순", value: "viewCount,desc" },
];

const PAGE_SIZE = 12;

export function Marketplace() {
  const [posts, setPosts] = useState<TradePostListItem[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sort, setSort] = useState("createdAt,desc");
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [appliedMin, setAppliedMin] = useState<number | undefined>();
  const [appliedMax, setAppliedMax] = useState<number | undefined>();

  const fetchPosts = useCallback(async (reset: boolean) => {
    const targetPage = reset ? 0 : page + 1;
    if (reset) {
      setIsLoading(true);
      setError(null);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const res = await getTradePosts({
        keyword: keyword || undefined,
        minPrice: appliedMin,
        maxPrice: appliedMax,
        sort,
        page: targetPage,
        size: PAGE_SIZE,
      });

      if (reset) {
        setPosts(res.content);
        setPage(0);
      } else {
        setPosts((prev) => [...prev, ...res.content]);
        setPage(targetPage);
      }

      setTotalElements(res.totalElements);
      setHasMore(targetPage < res.totalPages - 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "게시글을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [sort, keyword, appliedMin, appliedMax, page]);

  useEffect(() => {
    fetchPosts(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, keyword, appliedMin, appliedMax]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setKeyword(searchInput.trim());
  }

  function handleFilter() {
    setAppliedMin(minPrice ? Number(minPrice) : undefined);
    setAppliedMax(maxPrice ? Number(maxPrice) : undefined);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card sticky top-16 z-40">
        <div className="container mx-auto px-4 py-3">
          <form onSubmit={handleSearch} className="flex items-center bg-muted rounded-lg px-4 py-2 gap-2 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="제목, 내용 검색"
              className="bg-transparent border-none outline-none w-full text-sm"
            />
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* 필터 사이드바 */}
          <aside className="md:w-56 shrink-0">
            <div className="bg-card border rounded-lg p-4 sticky top-32">
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal className="w-4 h-4" />
                <h3>필터</h3>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm mb-2">가격대</label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="최소 가격"
                      className="w-full bg-muted border rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="최대 가격"
                      className="w-full bg-muted border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <button
                  onClick={handleFilter}
                  className="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
                >
                  필터 적용
                </button>
              </div>
            </div>
          </aside>

          {/* 목록 */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {isLoading ? "불러오는 중..." : `총 ${totalElements.toLocaleString()}개`}
              </p>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-muted border rounded-lg px-3 py-2 text-sm"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-card border rounded-lg overflow-hidden animate-pulse">
                    <div className="aspect-[3/4] bg-muted" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-muted rounded w-1/2" />
                      <div className="h-4 bg-muted rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">{error}</p>
                <button
                  onClick={() => fetchPosts(true)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors"
                >
                  다시 시도
                </button>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                {keyword ? `"${keyword}"에 대한 게시글이 없습니다.` : "등록된 게시글이 없습니다."}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {posts.map((post) => (
                    <TradePostCard key={post.id} post={post} />
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={() => fetchPosts(false)}
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
      </div>
    </div>
  );
}
