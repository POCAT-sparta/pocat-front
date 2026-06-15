import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { MessageSquare, Eye, PenLine, Search, ChevronRight, TrendingUp } from "lucide-react";
import { getPosts } from "@/api/community/freeCommunityApi";
import { useAuth } from "@/app/auth/context/AuthContext";
import type { FreePostResponse } from "@/types/community.types";
import { formatKST, KST_TIME_ZONE } from "@/shared/lib/datetime";

const SORT_OPTIONS = [
  { label: "최신순",     value: "createdAt,desc"    },
  { label: "인기순",     value: "viewCount,desc"    },
  { label: "댓글많은순", value: "commentCount,desc" },
];

const PAGE_SIZE = 20;

function formatDate(iso: string) {
  const dayOpts: Intl.DateTimeFormatOptions = { year: "numeric", month: "2-digit", day: "2-digit" };
  const today = new Date().toLocaleDateString("ko-KR", { timeZone: KST_TIME_ZONE, ...dayOpts });
  if (formatKST(iso, dayOpts) === today)
    return formatKST(iso, { hour: "2-digit", minute: "2-digit" });
  return formatKST(iso, { month: "2-digit", day: "2-digit" });
}

export function FreeBoard() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts]               = useState<FreePostResponse[]>([]);
  const [total, setTotal]               = useState(0);
  const [page, setPage]                 = useState(0);
  const [hasMore, setHasMore]           = useState(false);
  const [isLoading, setIsLoading]       = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [sort, setSort]                 = useState("createdAt,desc");
  const [searchInput, setSearchInput]   = useState("");
  const [keyword, setKeyword]           = useState("");

  const fetchPosts = useCallback(async (reset: boolean) => {
    const targetPage = reset ? 0 : page + 1;
    if (reset) setIsLoading(true); else setIsLoadingMore(true);
    try {
      const res = await getPosts({ keyword: keyword || undefined, sort, page: targetPage, size: PAGE_SIZE });
      if (reset) { setPosts(res.content); setPage(0); }
      else        { setPosts(prev => [...prev, ...res.content]); setPage(targetPage); }
      setTotal(res.totalElements);
      setHasMore(targetPage < res.totalPages - 1);
    } catch { /* ignore */ }
    finally { setIsLoading(false); setIsLoadingMore(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, keyword, page]);

  useEffect(() => { fetchPosts(true); }, [sort, keyword]); // eslint-disable-line

  return (
    <div className="min-h-screen bg-background">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white py-10 border-b border-white/10">
        <div className="container mx-auto px-4 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-5 h-5 text-[#FFCB05]" />
              <h1 className="text-2xl font-extrabold text-[#FFCB05]">자유게시판</h1>
            </div>
            <p className="text-sm text-white/50">트레이너들의 자유로운 이야기</p>
            {!isLoading && (
              <p className="text-xs text-white/30 mt-1">총 {total.toLocaleString()}개 게시글</p>
            )}
          </div>
          {isAuthenticated && (
            <button
              onClick={() => navigate("/free/new")}
              className="flex items-center gap-2 bg-[#CC0000] hover:bg-[#aa0000] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shrink-0"
            >
              <PenLine className="w-4 h-4" /> 글쓰기
            </button>
          )}
        </div>
      </section>

      {/* ── Filter bar ──────────────────────────────────────────────────── */}
      <div className="sticky top-16 z-30 bg-[#16213e] border-b border-white/10 shadow-sm">
        <div className="container mx-auto px-4 py-2.5 flex items-center gap-3">
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
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="bg-white/10 border-0 rounded-xl px-3 py-1.5 text-xs text-white cursor-pointer"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} className="text-black">{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* ── Post list ────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-muted rounded-2xl h-16" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="text-5xl">💬</div>
            <p className="font-semibold">아직 게시글이 없습니다</p>
            <p className="text-muted-foreground text-sm">
              {keyword ? `"${keyword}"에 대한 게시글이 없습니다.` : "첫 번째 글을 작성해보세요!"}
            </p>
            {isAuthenticated && (
              <button
                onClick={() => navigate("/free/new")}
                className="inline-flex items-center gap-2 bg-[#CC0000] hover:bg-[#aa0000] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors mt-2"
              >
                <PenLine className="w-4 h-4" /> 글쓰기
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-border overflow-hidden divide-y divide-border">
              {posts.map((post, idx) => (
                <Link
                  key={post.id}
                  to={`/free/${post.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-[#FFCB05]/5 transition-colors group"
                >
                  {/* Row number */}
                  <span className="text-xs text-muted-foreground w-6 text-center shrink-0 tabular-nums">
                    {idx + 1}
                  </span>

                  {/* Title + author */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1 group-hover:text-[#CC0000] transition-colors">
                      {post.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="w-3.5 h-3.5 rounded-full bg-[#FFCB05] flex items-center justify-center text-[#1a1a2e] font-bold text-[8px] shrink-0">
                        {post.authorNickname[0]?.toUpperCase()}
                      </div>
                      <span className="text-[11px] text-muted-foreground truncate">{post.authorNickname}</span>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 shrink-0 text-[11px] text-muted-foreground">
                    {post.commentCount > 0 && (
                      <span className="flex items-center gap-1 text-[#CC0000] font-medium">
                        <MessageSquare className="w-3 h-3" />{post.commentCount}
                      </span>
                    )}
                    <span className="hidden sm:flex items-center gap-1">
                      <Eye className="w-3 h-3" />{post.viewCount}
                    </span>
                    <span className="hidden sm:block w-12 text-right">{formatDate(post.createdAt)}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>

            {hasMore && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => fetchPosts(false)}
                  disabled={isLoadingMore}
                  className="flex items-center gap-2 px-6 py-2.5 border rounded-xl hover:bg-muted transition-colors text-sm disabled:opacity-50"
                >
                  <TrendingUp className="w-4 h-4" />
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
