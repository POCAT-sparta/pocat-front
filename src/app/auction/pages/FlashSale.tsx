import { useState } from "react";
import { Link } from "react-router";
import { Clock, Flame, Sparkles } from "lucide-react";

interface FlashSaleProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  rarity: string;
  set: string;
  stock: number;
}

const FLASH_SALE_PRODUCTS: FlashSaleProduct[] = [
  {
    id: "1",
    name: "리자몽 ex SAR",
    image: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400&h=560&fit=crop",
    price: 100,
    originalPrice: 280000,
    rarity: "SAR",
    set: "포켓몬 151",
    stock: 5,
  },
  {
    id: "2",
    name: "피카츄 ex SAR",
    image: "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=400&h=560&fit=crop",
    price: 100,
    originalPrice: 150000,
    rarity: "SAR",
    set: "포켓몬 151",
    stock: 3,
  },
  {
    id: "3",
    name: "뮤 ex SAR",
    image: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400&h=560&fit=crop",
    price: 100,
    originalPrice: 200000,
    rarity: "SAR",
    set: "포켓몬 151",
    stock: 2,
  },
  {
    id: "4",
    name: "에어비스타 ex SAR",
    image: "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=400&h=560&fit=crop",
    price: 100,
    originalPrice: 120000,
    rarity: "SAR",
    set: "스칼렛 & 바이올렛",
    stock: 8,
  },
  {
    id: "5",
    name: "루기아 V 얼터너티브",
    image: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400&h=560&fit=crop",
    price: 100,
    originalPrice: 350000,
    rarity: "ALT ART",
    set: "실버 템페스트",
    stock: 1,
  },
  {
    id: "6",
    name: "아르세우스 V STAR",
    image: "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=400&h=560&fit=crop",
    price: 100,
    originalPrice: 80000,
    rarity: "SR",
    set: "포켓몬 GO",
    stock: 10,
  },
  {
    id: "7",
    name: "갸라도스 ex SAR",
    image: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400&h=560&fit=crop",
    price: 100,
    originalPrice: 160000,
    rarity: "SAR",
    set: "포켓몬 151",
    stock: 4,
  },
  {
    id: "8",
    name: "뮤츠 ex SAR",
    image: "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=400&h=560&fit=crop",
    price: 100,
    originalPrice: 220000,
    rarity: "SAR",
    set: "포켓몬 151",
    stock: 3,
  },
  {
    id: "9",
    name: "스타터덱 3종 세트",
    image: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400&h=560&fit=crop",
    price: 100,
    originalPrice: 45000,
    rarity: "SET",
    set: "스타터 컬렉션",
    stock: 20,
  },
  {
    id: "10",
    name: "랜덤 부스터팩 10팩",
    image: "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=400&h=560&fit=crop",
    price: 100,
    originalPrice: 50000,
    rarity: "PACK",
    set: "믹스 부스터",
    stock: 15,
  },
];

export function FlashSale() {
  const [timeLeft] = useState("2시간 37분");

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 배너 */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Flame className="w-8 h-8" />
            <h1 className="text-4xl font-bold">100원 특별 이벤트</h1>
            <Flame className="w-8 h-8" />
          </div>
          <p className="text-white/90 mb-4 text-lg">
            선착순 한정! 프리미엄 TCG 카드를 단돈 100원에!
          </p>
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-lg px-6 py-3">
            <Clock className="w-5 h-5" />
            <span className="font-bold text-xl">종료까지 {timeLeft} 남음</span>
          </div>
        </div>
      </div>

      {/* 안내 배너 */}
      <div className="bg-yellow-50 dark:bg-yellow-950/20 border-b border-yellow-200 dark:border-yellow-800 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
            <Sparkles className="w-4 h-4 shrink-0" />
            <p>
              <strong>이벤트 안내:</strong> 1인 1회 구매 가능 · 전문가 검수 완료 · 정품 보장 ·
              당일 발송
            </p>
          </div>
        </div>
      </div>

      {/* 상품 목록 */}
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            이벤트 상품 <span className="text-muted-foreground text-base font-normal">({FLASH_SALE_PRODUCTS.length}개)</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {FLASH_SALE_PRODUCTS.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="group block"
            >
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
                  <div className="absolute top-2 right-2">
                    <span className="bg-black/60 text-white px-2 py-0.5 rounded text-xs">
                      {product.rarity}
                    </span>
                  </div>
                  {product.stock <= 3 && (
                    <div className="absolute bottom-2 left-2 right-2">
                      <span className="block text-center bg-red-500/90 text-white text-xs py-1 rounded">
                        잔여 {product.stock}개
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-xs text-muted-foreground mb-1 truncate">{product.set}</div>
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
      </div>
    </div>
  );
}