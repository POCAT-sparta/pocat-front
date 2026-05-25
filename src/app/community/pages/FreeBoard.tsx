import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { MessageSquare, Eye, PenLine, Search, ChevronRight } from "lucide-react";
import { getPosts } from "@/api/community/freeCommunityApi";
import { useAuth } from "@/app/auth/context/AuthContext";
import type { FreePostResponse } from "@/types/community.types";

const SORT_OPTIONS = [
  { label: "최신순",  value: "createdAt,desc" },
  { label: "인기순",  value: "viewCount,desc"  },
  { label: "댓글많은순", value: "commentCount,desc" },
];

const PAGE_SIZE = 20;

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });
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

  const [sort, setSort]             = useState("createdAt,desc");
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword]       = useState("");

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
      {/* Header banner */}
      <section className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white py-10 border-b border-white/10">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[#FFCB05] mb-1">💬 자유게시판</h1>
            <p className="text-sm text-white/50">트레이너들의 자유로운 이야기</p>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => navigate("/free/new")}
              className="flex items-center gap-2 bg-[#CC0000] hover:bg-[#aa0000] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              <PenLine className="w-4 h-4" /> 글쓰기
            </button>
          )}
        </div>
      </section>

      {/* Filter bar */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-2.5 flex items-center gap-3">
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
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="bg-muted border-0 rounded-lg px-2 py-1.5 text-xs cursor-pointer"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <span className="text-xs text-muted-foreground ml-auto">총 {total.toLocaleString()}개</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-muted rounded-xl h-16" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">😴</p>
            <p className="text-muted-foreground text-sm">
              {keyword ? `"${keyword}"에 대한 게시글이 없습니다.` : "첫 번째 글을 작성해보세요!"}
            </p>
          </div>
        ) : (
          <>
            {/* Post list */}
            <div className="divide-y divide-border rounded-xl border overflow-hidden">
              {posts.map(post => (
                <Link
                  key={post.id}
                  to={`/free/${post.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-[#FFCB05]/5 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1 group-hover:text-[#CC0000] transition-colors">
                      {post.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{post.authorNickname}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />{post.commentCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />{post.viewCount}
                    </span>
                    <span className="hidden sm:block">{formatDate(post.createdAt)}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>

            {hasMore && (
              <div className="mt-6 flex justify-center">
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
