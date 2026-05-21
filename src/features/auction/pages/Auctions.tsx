import { AuctionCard } from "../components/AuctionCard";
import { Gavel, Clock, TrendingUp } from "lucide-react";
import { useState } from "react";

export function Auctions() {
  const [filter, setFilter] = useState("all");

  const filters = [
    { id: "all", label: "전체 경매" },
    { id: "ending-soon", label: "마감 임박" },
    { id: "new", label: "신규 경매" },
    { id: "hot", label: "인기 경매" },
  ];

  const auctions = [
    {
      id: "5",
      name: "리자몽 1st Edition PSA 10",
      image: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400&h=560&fit=crop",
      currentBid: 3200000,
      bidCount: 47,
      endsAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      rarity: "PSA 10",
      set: "베이스 세트"
    },
    {
      id: "6",
      name: "피카츄 프로모 골드 스타",
      image: "https://images.unsplash.com/photo-1542779283-429940ce8336?w=400&h=560&fit=crop",
      currentBid: 850000,
      bidCount: 23,
      endsAt: new Date(Date.now() + 5 * 60 * 60 * 1000),
      rarity: "PROMO",
      set: "월드챔피언십"
    },
    {
      id: "7",
      name: "에이스번 VMAX HR",
      image: "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=400&h=560&fit=crop",
      currentBid: 125000,
      bidCount: 12,
      endsAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
      rarity: "HR",
      set: "창공스트림"
    },
    {
      id: "8",
      name: "뮤 UR 풀아트",
      image: "https://images.unsplash.com/photo-1611954267147-1da7fdb8fe0c?w=400&h=560&fit=crop",
      currentBid: 290000,
      bidCount: 31,
      endsAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
      rarity: "UR",
      set: "퓨전아츠"
    },
    {
      id: "15",
      name: "뮤츠 GX SSR 레인보우",
      image: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400&h=560&fit=crop",
      currentBid: 520000,
      bidCount: 38,
      endsAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
      rarity: "SSR",
      set: "포비든라이트"
    },
    {
      id: "16",
      name: "가디안 V SA 풀아트",
      image: "https://images.unsplash.com/photo-1542779283-429940ce8336?w=400&h=560&fit=crop",
      currentBid: 380000,
      bidCount: 19,
      endsAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
      rarity: "SA",
      set: "실버템페스트"
    },
    {
      id: "17",
      name: "레쿠쟈 VMAX UR",
      image: "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=400&h=560&fit=crop",
      currentBid: 780000,
      bidCount: 55,
      endsAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
      rarity: "UR",
      set: "이블루션"
    },
    {
      id: "18",
      name: "루기아 EX SR 1st",
      image: "https://images.unsplash.com/photo-1611954267147-1da7fdb8fe0c?w=400&h=560&fit=crop",
      currentBid: 1100000,
      bidCount: 64,
      endsAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
      rarity: "SR",
      set: "언씬포스"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Gavel className="w-10 h-10" />
            <h1 className="text-4xl">실시간 경매</h1>
          </div>
          <p className="text-lg opacity-90">
            레어 카드를 경쟁 입찰로 획득하세요
          </p>
        </div>
      </section>

      <div className="border-b bg-card sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  filter === f.id
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
            <p className="text-3xl font-bold">{auctions.length}</p>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h3>오늘 낙찰</h3>
            </div>
            <p className="text-3xl font-bold">142</p>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Gavel className="w-5 h-5 text-orange-500" />
              <h3>총 입찰 수</h3>
            </div>
            <p className="text-3xl font-bold">1,847</p>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-8">
          <h3 className="text-yellow-800 dark:text-yellow-200 mb-2">
            경매 참여 전 필독사항
          </h3>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>• 입찰 후 취소가 불가능하니 신중하게 입찰해주세요</li>
            <li>• 낙찰 시 24시간 내 결제하지 않으면 패널티가 부여됩니다</li>
            <li>• 모든 경매 상품은 전문가 검수를 거친 정품입니다</li>
          </ul>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2>진행 중인 경매</h2>
            <select className="bg-muted border rounded-lg px-3 py-2 text-sm">
              <option>마감 임박순</option>
              <option>높은 입찰가순</option>
              <option>낮은 입찰가순</option>
              <option>입찰 많은 순</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {auctions.map((auction) => (
            <AuctionCard key={auction.id} {...auction} />
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button className="px-6 py-2 border rounded-lg hover:bg-muted transition-colors">
            더 보기
          </button>
        </div>
      </div>
    </div>
  );
}
