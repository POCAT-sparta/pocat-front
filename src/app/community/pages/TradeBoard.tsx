import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Eye, PenLine, Search, SlidersHorizontal, ShoppingBag } from "lucide-react";
import { getTradePosts } from "@/api/community/tradeCommunityApi";
import { useAuth } from "@/app/auth/context/AuthContext";
import type { TradePostListItem } from "@/types/community.types";
import { formatKST, KST_TIME_ZONE } from "@/shared/lib/datetime";

const SORT_OPTIONS = [
  { label: "최신순",    value: "createdAt,desc" },
  { label: "낮은 가격", value: "price,asc"      },
  { label: "높은 가격", value: "price,desc"     },
  { label: "조회순",    value: "viewCount,desc" },
];

const PAGE_SIZE = 12;

function formatDate(iso: string) {
  const dayOpts: Intl.DateTimeFormatOptions = { year: "numeric", month: "2-digit", day: "2-digit" };
  const today = new Date().toLocaleDateString("ko-KR", { timeZone: KST_TIME_ZONE, ...dayOpts });
  if (formatKST(iso, dayOpts) === today)
    return formatKST(iso, { hour: "2-digit", minute: "2-digit" });
  return formatKST(iso, { month: "2-digit", day: "2-digit" });
}

const CARD_PLACEHOLDER = (
  <svg viewBox="0 0 80 112" className="w-12 h-16 opacity-20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="76" height="108" rx="6" stroke="white" strokeWidth="3" />
    <circle cx="40" cy="50" r="20" stroke="white" strokeWidth="2.5" />
    <path d="M20 50 H60" stroke="white" strokeWidth="2.5" />
    <circle cx="40" cy="50" r="6" fill="white" />
  </svg>
);

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

  const hasActiveFilter = minPrice !== undefined || maxPrice !== undefined;

  return (
    <div className="min-h-screen bg-background">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white py-10 border-b border-white/10">
        <div className="container mx-auto px-4 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="w-5 h-5 text-[#FFCB05]" />
              <h1 className="text-2xl font-extrabold text-[#FFCB05]">거래게시판</h1>
            </div>
            <p className="text-sm text-white/50">트레이너들의 카드 거래 공간</p>
            {!isLoading && (
              <p className="text-xs text-white/30 mt-1">총 {total.toLocaleString()}개 판매글</p>
            )}
          </div>
          {isAuthenticated && (
            <button
              onClick={() => navigate("/trade/new")}
              className="flex items-center gap-2 bg-[#CC0000] hover:bg-[#aa0000] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shrink-0"
            >
              <PenLine className="w-4 h-4" /> 판매글 쓰기
            </button>
          )}
        </div>
      </section>

      {/* ── Filter bar ──────────────────────────────────────────────────── */}
      <div className="sticky top-16 z-30 bg-[#16213e] border-b border-white/10 shadow-sm">
        <div className="container mx-auto px-4 py-2.5 flex items-center gap-3 flex-wrap">
          <form
            onSubmit={e => { e.preventDefault(); setKeyword(searchInput.trim()); }}
            className="flex items-center bg-white/10 rounded-xl px-3 py-1.5 gap-2 flex-1 max-w-sm"
          >
            <Search className="w-3.5 h-3.5 text-white/40 shrink-0" />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="제목, 내용 검색..."
              className="bg-transparent border-none outline-none w-full text-xs text-white placeholder:text-white/30"
            />
          </form>

          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              showFilter || hasActiveFilter
                ? "bg-[#CC0000] text-white"
                : "bg-white/10 hover:bg-white/20 text-white/70"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            가격 필터
            {hasActiveFilter && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
          </button>

          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="bg-white/10 border-0 rounded-xl px-3 py-1.5 text-xs text-white cursor-pointer"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} className="text-black">{o.label}</option>)}
          </select>
        </div>

        {showFilter && (
          <div className="container mx-auto px-4 pb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="number"
                value={minInput}
                onChange={e => setMinInput(e.target.value)}
                placeholder="최소 가격"
                className="w-28 bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#FFCB05]/50"
              />
              <span className="text-xs text-white/40">~</span>
              <input
                type="number"
                value={maxInput}
                onChange={e => setMaxInput(e.target.value)}
                placeholder="최대 가격"
                className="w-28 bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#FFCB05]/50"
              />
              <button
                onClick={applyFilter}
                className="px-3 py-1.5 bg-[#FFCB05] text-[#1a1a2e] rounded-xl text-xs font-bold hover:bg-yellow-400 transition-colors"
              >
                적용
              </button>
              {hasActiveFilter && (
                <button
                  onClick={() => { setMinInput(""); setMaxInput(""); setMinPrice(undefined); setMaxPrice(undefined); }}
                  className="px-3 py-1.5 bg-white/10 rounded-xl text-xs text-white/60 hover:bg-white/20 transition-colors"
                >
                  초기화
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Grid ────────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-muted rounded-2xl mb-3" />
                <div className="h-3 bg-muted rounded w-3/4 mb-1.5" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="text-5xl">😴</div>
            <p className="font-semibold">판매글이 없습니다</p>
            <p className="text-muted-foreground text-sm">
              {keyword ? `"${keyword}"에 대한 판매글이 없습니다.` : "첫 번째 판매글을 올려보세요!"}
            </p>
            {isAuthenticated && (
              <button
                onClick={() => navigate("/trade/new")}
                className="inline-flex items-center gap-2 bg-[#CC0000] hover:bg-[#aa0000] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors mt-2"
              >
                <PenLine className="w-4 h-4" /> 판매글 쓰기
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {posts.map(post => (
                <div
                  key={post.id}
                  onClick={() => navigate(`/trade/${post.id}`)}
                  className="group flex flex-col cursor-pointer"
                >
                  <div className="aspect-[3/4] bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl overflow-hidden relative border border-white/10 group-hover:border-[#CC0000]/40 transition-colors">
                    {post.thumbnail ? (
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {CARD_PLACEHOLDER}
                      </div>
                    )}
                    {/* Price badge */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pt-8 pb-3">
                      <p className="text-white font-extrabold text-sm">{post.price.toLocaleString()}원</p>
                    </div>
                  </div>
                  <div className="mt-2.5 space-y-1">
                    <p className="text-sm font-semibold line-clamp-1 group-hover:text-[#CC0000] transition-colors">
                      {post.title}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-3.5 h-3.5 rounded-full bg-[#FFCB05] flex items-center justify-center text-[#1a1a2e] font-bold text-[8px] shrink-0">
                          {post.authorNickname[0]?.toUpperCase()}
                        </div>
                        <span className="truncate">{post.authorNickname}</span>
                      </div>
                      <span className="flex items-center gap-0.5 shrink-0">
                        <Eye className="w-3 h-3" />{post.viewCount}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{formatDate(post.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => fetchPosts(false)}
                  disabled={isLoadingMore}
                  className="px-6 py-2.5 bg-[#CC0000] hover:bg-[#aa0000] text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {isLoadingMore ? "불러오는 중..." : "더 보기 ↓"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
