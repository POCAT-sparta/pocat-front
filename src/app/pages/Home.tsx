import { useEffect, useState } from "react";
import { AuctionCard } from "../../features/auction/components/AuctionCard";
import { TradePostCard } from "../../features/community/components/TradePostCard";
import { Flame, TrendingUp, Clock, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { getAuctions } from "../../features/auction/api/auctionApi";
import { getTradePosts } from "../../features/community/api/postApi";
import type { AuctionListItem } from "../../features/auction/types/auction.types";
import type { TradePostListItem } from "../../features/community/types/post.types";

export function Home() {
  const [liveAuctions, setLiveAuctions] = useState<AuctionListItem[]>([]);
  const [isAuctionLoading, setIsAuctionLoading] = useState(true);
  const [featuredPosts, setFeaturedPosts] = useState<TradePostListItem[]>([]);
  const [isPostLoading, setIsPostLoading] = useState(true);

  useEffect(() => {
    getAuctions({ size: 4, sort: "endedAt,asc" })
      .then((res) => setLiveAuctions(res.content))
      .catch(() => {})
      .finally(() => setIsAuctionLoading(false));

    getTradePosts({ size: 4, sort: "createdAt,desc" })
      .then((res) => setFeaturedPosts(res.content))
      .catch(() => {})
      .finally(() => setIsPostLoading(false));
  }, []);

  const flashSaleProducts = [
    {
      id: "9",
      name: "스타터덱 3종 세트",
      image: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400&h=560&fit=crop",
      price: 100,
      originalPrice: 45000,
      rarity: "SET",
      set: "스타터 컬렉션"
    },
    {
      id: "10",
      name: "랜덤 부스터팩 10팩",
      image: "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=400&h=560&fit=crop",
      price: 100,
      originalPrice: 50000,
      rarity: "PACK",
      set: "믹스 부스터"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-r from-primary via-purple-600 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl mb-4">
              프리미엄 TCG 거래 플랫폼
            </h1>
            <p className="text-lg mb-8 opacity-90">
              안전한 검수 시스템으로 믿고 거래하는 포켓몬 카드 마켓
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/marketplace"
                className="bg-white text-primary px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                마켓 둘러보기
              </Link>
              <Link
                to="/auctions"
                className="bg-transparent border-2 border-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors"
              >
                경매 참여하기
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-red-500" />
            <h2>특별 이벤트 - 100원 판매</h2>
          </div>
          <Link to="/flash-sale" className="text-sm text-primary hover:underline">
            전체보기
          </Link>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold">지금 진행중!</span>
          </div>
          <p className="text-sm opacity-90 mb-4">
            선착순 100명에게 프리미엄 상품을 100원에 판매합니다
          </p>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            <span>종료까지 2시간 37분 남음</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {flashSaleProducts.map((product) => (
            <Link key={product.id} to={`/product/${product.id}`} className="group">
              <div className="bg-card rounded-lg overflow-hidden border hover:shadow-lg transition-all">
                <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                      100원
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-xs text-muted-foreground mb-1">{product.set}</div>
                  <h3 className="font-medium mb-2 line-clamp-2 text-sm">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-500">{product.price}원</span>
                    <span className="text-xs text-muted-foreground line-through">
                      {product.originalPrice.toLocaleString()}원
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h2>인기 상품</h2>
          </div>
          <Link to="/marketplace" className="text-sm text-primary hover:underline">
            전체보기
          </Link>
        </div>

        {isPostLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card border rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-[3/4] bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : featuredPosts.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">등록된 상품이 없습니다.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredPosts.map((post) => (
              <TradePostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-red-500" />
            <h2>실시간 경매</h2>
          </div>
          <Link to="/auctions" className="text-sm text-primary hover:underline">
            전체보기
          </Link>
        </div>

        {isAuctionLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card border rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-[3/4] bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : liveAuctions.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">진행 중인 경매가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {liveAuctions.map((auction) => (
              <AuctionCard key={auction.auctionId} auction={auction} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-center mb-8">왜 TCG MARKET을 선택해야 할까요?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                ✓
              </div>
              <h3 className="mb-2">100% 정품 보장</h3>
              <p className="text-sm text-muted-foreground">
                전문 검수팀의 철저한 진위 확인
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                ⚡
              </div>
              <h3 className="mb-2">빠른 거래</h3>
              <p className="text-sm text-muted-foreground">
                즉시 구매/판매 시스템으로 신속한 거래
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                🔒
              </div>
              <h3 className="mb-2">안전한 결제</h3>
              <p className="text-sm text-muted-foreground">
                에스크로 시스템으로 안전하게 보호
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
