import { ProductCard } from "../../../shared/components/ProductCard";
import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

export function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRarity, setSelectedRarity] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  const categories = [
    { id: "all", label: "전체" },
    { id: "pokemon", label: "포켓몬 카드" },
    { id: "yugioh", label: "유희왕" },
    { id: "mtg", label: "매직 더 개더링" },
    { id: "digimon", label: "디지몬" },
    { id: "onepiece", label: "원피스" },
  ];

  const rarities = [
    { id: "all", label: "모든 등급" },
    { id: "ur", label: "UR" },
    { id: "ssr", label: "SSR" },
    { id: "sr", label: "SR" },
    { id: "hr", label: "HR" },
    { id: "ar", label: "AR" },
  ];

  const products = [
    {
      id: "1",
      name: "리자몽 VMAX SSR",
      image: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400&h=560&fit=crop",
      price: 580000,
      instantBuyPrice: 550000,
      lastSalePrice: 565000,
      priceChange: 2.7,
      rarity: "SSR",
      set: "샤이닝펄스"
    },
    {
      id: "2",
      name: "뮤츠 V SR",
      image: "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=400&h=560&fit=crop",
      price: 180000,
      instantBuyPrice: 170000,
      lastSalePrice: 175000,
      priceChange: -1.4,
      rarity: "SR",
      set: "진화의함성"
    },
    {
      id: "3",
      name: "피카츄 AR",
      image: "https://images.unsplash.com/photo-1542779283-429940ce8336?w=400&h=560&fit=crop",
      price: 95000,
      instantBuyPrice: 90000,
      lastSalePrice: 92000,
      priceChange: 3.3,
      rarity: "AR",
      set: "트리플렛비트"
    },
    {
      id: "4",
      name: "이브이 히어로즈 세트",
      image: "https://images.unsplash.com/photo-1611954267147-1da7fdb8fe0c?w=400&h=560&fit=crop",
      price: 450000,
      instantBuyPrice: 430000,
      lastSalePrice: 440000,
      priceChange: 1.1,
      rarity: "SET",
      set: "이브이 히어로즈"
    },
    {
      id: "11",
      name: "망나뇽 VSTAR UR",
      image: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400&h=560&fit=crop",
      price: 320000,
      instantBuyPrice: 305000,
      lastSalePrice: 310000,
      priceChange: 3.2,
      rarity: "UR",
      set: "로스트어비스"
    },
    {
      id: "12",
      name: "레쿠쟈 V SR",
      image: "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=400&h=560&fit=crop",
      price: 240000,
      instantBuyPrice: 230000,
      lastSalePrice: 235000,
      priceChange: 2.1,
      rarity: "SR",
      set: "창공스트림"
    },
    {
      id: "13",
      name: "루기아 V SA",
      image: "https://images.unsplash.com/photo-1542779283-429940ce8336?w=400&h=560&fit=crop",
      price: 680000,
      instantBuyPrice: 650000,
      lastSalePrice: 670000,
      priceChange: 1.5,
      rarity: "SA",
      set: "실버템페스트"
    },
    {
      id: "14",
      name: "지라치 AR",
      image: "https://images.unsplash.com/photo-1611954267147-1da7fdb8fe0c?w=400&h=560&fit=crop",
      price: 150000,
      instantBuyPrice: 145000,
      lastSalePrice: 148000,
      priceChange: -0.7,
      rarity: "AR",
      set: "패러다임트리거"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-64 shrink-0">
            <div className="bg-card border rounded-lg p-4 sticky top-32">
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal className="w-4 h-4" />
                <h3>필터</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm mb-2">등급</label>
                  <select
                    value={selectedRarity}
                    onChange={(e) => setSelectedRarity(e.target.value)}
                    className="w-full bg-muted border rounded-lg px-3 py-2 text-sm"
                  >
                    {rarities.map((rarity) => (
                      <option key={rarity.id} value={rarity.id}>
                        {rarity.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2">가격대</label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="최소 가격"
                      className="w-full bg-muted border rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="최대 가격"
                      className="w-full bg-muted border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2">거래 유형</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">즉시 구매</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">즉시 판매</span>
                    </label>
                  </div>
                </div>

                <button className="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 transition-colors">
                  필터 적용
                </button>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                총 {products.length}개의 상품
              </p>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">정렬:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-muted border rounded-lg px-3 py-2 text-sm appearance-none pr-8"
                >
                  <option value="popular">인기순</option>
                  <option value="price-low">낮은 가격순</option>
                  <option value="price-high">높은 가격순</option>
                  <option value="recent">최신순</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <button className="px-6 py-2 border rounded-lg hover:bg-muted transition-colors">
                더 보기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
