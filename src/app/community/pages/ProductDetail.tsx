import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { Eye, User, ChevronLeft, Calendar } from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext.tsx";
import type { TradePostDetail as TradePostDetailType } from "@/types/community.types";
import {getTradePost} from "@/api/community/tradeCommunityApi.ts";

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [post, setPost] = useState<TradePostDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    getTradePost(Number(id))
      .then(setPost)
      .catch((e) => setError(e instanceof Error ? e.message : "게시글을 불러오지 못했습니다."))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 animate-pulse">
          <div className="h-4 bg-muted rounded w-48 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-[3/4] bg-muted rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-24 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error ?? "게시글을 찾을 수 없습니다."}</p>
          <Link to="/marketplace" className="text-primary hover:underline">마켓으로 돌아가기</Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === post.authorId;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">홈</Link>
          <span>/</span>
          <Link to="/marketplace" className="hover:text-foreground">마켓</Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-[200px]">{post.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* 이미지 */}
          <div className="bg-card border rounded-lg overflow-hidden">
            <div className="aspect-[3/4] bg-muted">
              {post.thumbnail ? (
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  이미지 없음
                </div>
              )}
            </div>
          </div>

          {/* 상세 정보 */}
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>{post.authorNickname}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  <span>{post.viewCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(post.createdAt).toLocaleDateString("ko-KR")}</span>
                </div>
              </div>
            </div>

            {/* 가격 */}
            <div className="bg-card border rounded-lg p-5">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">판매가</span>
                <span className="text-2xl font-bold">{post.price.toLocaleString()}원</span>
              </div>
            </div>

            {/* 채팅 / 문의 버튼 */}
            {!isOwner && (
              <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium">
                채팅으로 문의하기
              </button>
            )}

            {isOwner && (
              <div className="flex gap-2">
                <button className="flex-1 border py-2.5 rounded-lg hover:bg-muted transition-colors text-sm">
                  수정하기
                </button>
                <button className="flex-1 border border-red-300 text-red-500 py-2.5 rounded-lg hover:bg-red-50 transition-colors text-sm">
                  삭제하기
                </button>
              </div>
            )}

            <div className="mt-2">
              <Link
                to="/marketplace"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                목록으로
              </Link>
            </div>
          </div>
        </div>

        {/* 본문 */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="mb-4">상품 설명</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
            {post.content || "설명이 없습니다."}
          </p>
        </div>
      </div>
    </div>
  );
}
