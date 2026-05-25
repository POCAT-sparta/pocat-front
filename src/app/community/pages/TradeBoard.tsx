import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, PenLine, Search, SlidersHorizontal } from "lucide-react";
import { getTradePosts } from "@/api/community/tradeCommunityApi";
import { useAuth } from "@/app/auth/context/AuthContext";
import type { TradePostListItem } from "@/types/community.types";

const SORT_OPTIONS = [
  { label: "최신순",    value: "createdAt,desc" },
  { label: "낮은 가격", value: "price,asc"      },
  { label: "높은 가격", value: "price,desc"     },
  { label: "조회순",    value: "viewCount,desc" },
];

const PAGE_SIZE = 12;

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString())
    return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });
}

export function TradeBoard() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts]                 = useState<TradePostListItem[]>([]);
  const [total, setTotal]                 = useState(0);
  const [page, setPage]                   = useState(0);
  const [hasMore, setHasMore]             = useState(false);
  const [isLoading, setIsLoading]         = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showFilter, setShowFilter]       = useState(false);

  const [sort,        setSort]        = useState("createdAt,desc");
  const [searchInput, setSearchInput] = useState("");
  const [keyword,     setKeyword]     = useState("");
  const [minInput,    setMinInput]    = useState("");
  const [maxInput,    setMaxInput]    = useState("");
  const [minPrice,    setMinPrice]    = useState<number | undefined>();
  const [maxPrice,    setMaxPrice]    = useState<number | undefined>();

  const fetchPosts = useCallback(async (reset: boolean) => {
    const targetPage = reset ? 0 : page + 1;
    if (reset) setIsLoading(true); else setIsLoadingMore(true);
    try {
      const res = await getTradePosts({ keyword: keyword || undefined, minPrice, maxPrice, sort, page: targetPage, size: PAGE_SIZE });
      if (reset) { setPosts(res.content); setPage(0); }
      else        { setPosts(prev => [...prev, ...res.content]); setPage(targetPage); }
      setTotal(res.totalElements);
      setHasMore(targetPage < res.totalPages - 1);
    } catch { /* ignore */ }
    finally { setIsLoading(false); setIsLoadingMore(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, keyword, minPrice, maxPrice, page]);

  useEffect(() => { fetchPosts(true); }, [sort, keyword, minPrice, maxPrice]); // eslint-disable-line

  function applyFilter() {
    setMinPrice(minInput ? Number(minInput) : undefined);
    setMaxPrice(maxInput ? Number(maxInput) : undefined);
    setShowFilter(false);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white py-10 border-b border-white/10">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[#FFCB05] mb-1">🎴 거래게시판</h1>
            <p className="text-sm text-white/50">트레이너들의 카드 거래 공간</p>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => navigate("/trade/new")}
              className="flex items-center gap-2 bg-[#CC0000] hover:bg-[#aa0000] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              <PenLine className="w-4 h-4" /> 판매글 쓰기
            </button>
          )}
        </div>
      </section>

      {/* Filter bar */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-2.5 flex items-center gap-3 flex-wrap">
          <form
            onSubmit={e => { e.preventDefault(); setKeyword(searchInput.trim()); }}
            className="flex items-center bg-muted rounded-lg px-3 py-1.5 gap-2 flex-1 max-w-sm"
          >
            <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="제목, 내용 검색..."
              className="bg-transparent border-none outline-none w-full text-xs"
            />
          </form>

          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
              showFilter || minPrice !== undefined || maxPrice !== undefined
                ? "bg-[#CC0000] text-white"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> 가격 필터
          </button>

          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="bg-muted border-0 rounded-lg px-2 py-1.5 text-xs cursor-pointer"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <span className="text-xs text-muted-foreground ml-auto">총 {total.toLocaleString()}개</span>
        </div>

        {showFilter && (
          <div className="container mx-auto px-4 pb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="number"
                value={minInput}
                onChange={e => setMinInput(e.target.value)}
                placeholder="최소 가격"
                className="w-32 border rounded-lg px-3 py-1.5 text-xs bg-background focus:outline-none focus:border-[#CC0000]"
              />
              <span className="text-xs text-muted-foreground">~</span>
              <input
                type="number"
                value={maxInput}
                onChange={e => setMaxInput(e.target.value)}
                placeholder="최대 가격"
                className="w-32 border rounded-lg px-3 py-1.5 text-xs bg-background focus:outline-none focus:border-[#CC0000]"
              />
              <button
                onClick={applyFilter}
                className="px-3 py-1.5 bg-[#CC0000] text-white rounded-lg text-xs font-semibold hover:bg-[#aa0000] transition-colors"
              >
                적용
              </button>
              {(minPrice !== undefined || maxPrice !== undefined) && (
                <button
                  onClick={() => { setMinInput(""); setMaxInput(""); setMinPrice(undefined); setMaxPrice(undefined); }}
                  className="px-3 py-1.5 border rounded-lg text-xs hover:bg-muted transition-colors"
                >
                  초기화
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-muted rounded-xl mb-3" />
                <div className="h-3 bg-muted rounded w-3/4 mb-1.5" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🎴</p>
            <p className="text-muted-foreground text-sm">
              {keyword ? `"${keyword}"에 대한 게시글이 없습니다.` : "첫 번째 판매글을 올려보세요!"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {posts.map(post => (
                <Link key={post.id} to={`/trade/${post.id}`} className="group flex flex-col">
                  <div className="aspect-[3/4] bg-muted rounded-xl overflow-hidden relative">
                    {post.thumbnail ? (
                      <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
                        🎴
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="text-white font-bold text-sm">{post.price.toLocaleString()}원</p>
                    </div>
                  </div>
                  <div className="mt-2.5 space-y-0.5">
                    <p className="text-sm font-semibold line-clamp-1 group-hover:text-[#CC0000] transition-colors">{post.title}</p>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{post.authorNickname}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.viewCount}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{formatDate(post.createdAt)}</p>
                  </div>
                </Link>
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => fetchPosts(false)}
                  disabled={isLoadingMore}
                  className="px-6 py-2 border rounded-xl hover:bg-muted transition-colors text-sm disabled:opacity-50"
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
