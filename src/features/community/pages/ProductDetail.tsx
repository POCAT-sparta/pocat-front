import { useParams, Link } from "react-router";
import { useState } from "react";
import { ShoppingCart, Gavel, TrendingUp, Package, Shield, Clock } from "lucide-react";

export function ProductDetail() {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState("raw");
  const [bidAmount, setBidAmount] = useState("");

  const product = {
    id,
    name: "리자몽 VMAX SSR 샤이닝펄스",
    image: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=800&h=1000&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1542779283-429940ce8336?w=800&h=1000&fit=crop",
    ],
    rarity: "SSR",
    set: "샤이닝펄스",
    cardNumber: "123/456",
    condition: "민트",
    language: "한국어",
    instantBuyPrice: 580000,
    instantSellPrice: 550000,
    recentSales: [
      { price: 565000, date: "2026-05-10", size: "raw" },
      { price: 572000, date: "2026-05-09", size: "raw" },
      { price: 560000, date: "2026-05-08", size: "psa9" },
    ],
    priceHistory: [
      { date: "05/01", price: 520000 },
      { date: "05/03", price: 545000 },
      { date: "05/05", price: 558000 },
      { date: "05/07", price: 565000 },
      { date: "05/09", price: 572000 },
      { date: "05/11", price: 580000 },
    ],
    description: "샤이닝펄스 세트의 초레어 리자몽 VMAX 카드입니다. 풀아트 일러스트가 아름다운 인기 카드로, 컬렉션 가치가 높습니다.",
    isAuction: false,
  };

  const sizes = [
    { id: "raw", label: "로우 카드", price: 580000 },
    { id: "psa9", label: "PSA 9", price: 780000 },
    { id: "psa10", label: "PSA 10", price: 1250000 },
  ];

  const [currentImage, setCurrentImage] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">홈</Link>
            <span>/</span>
            <Link to="/marketplace" className="hover:text-foreground">마켓</Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div>
            <div className="bg-card border rounded-lg overflow-hidden mb-4">
              <div className="aspect-[3/4] bg-muted">
                <img
                  src={product.images[currentImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImage(idx)}
                  className={`aspect-[3/4] bg-muted rounded-lg overflow-hidden border-2 transition-all ${
                    currentImage === idx ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-4">
              <span className="inline-block bg-primary text-primary-foreground px-3 py-1 rounded text-sm mb-2">
                {product.rarity}
              </span>
              <h1 className="text-3xl mb-2">{product.name}</h1>
              <p className="text-muted-foreground">{product.set} · {product.cardNumber}</p>
            </div>

            <div className="bg-card border rounded-lg p-6 mb-6">
              <div className="mb-6">
                <label className="block text-sm mb-3">상태 선택</label>
                <div className="grid grid-cols-3 gap-3">
                  {sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size.id)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedSize === size.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-medium text-sm">{size.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {size.price.toLocaleString()}원
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between pb-4 border-b">
                  <span className="text-muted-foreground">즉시 구매가</span>
                  <span className="text-2xl font-bold">
                    {sizes.find(s => s.id === selectedSize)?.price.toLocaleString()}원
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">즉시 판매가</span>
                  <span className="text-lg">
                    {product.instantSellPrice.toLocaleString()}원
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="bg-primary text-primary-foreground py-4 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  즉시 구매
                </button>
                <button className="bg-secondary text-secondary-foreground py-4 rounded-lg hover:bg-secondary/80 transition-colors">
                  즉시 판매
                </button>
              </div>

              {product.isAuction && (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center gap-2 mb-3">
                    <Gavel className="w-5 h-5 text-red-500" />
                    <span className="font-bold">경매 입찰</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="입찰 금액 입력"
                      className="flex-1 bg-muted border rounded-lg px-4 py-3"
                    />
                    <button className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors">
                      입찰하기
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-card border rounded-lg p-4 text-center">
                <Package className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-xs text-muted-foreground">빠른 배송</div>
                <div className="text-sm font-medium">2-3일 내</div>
              </div>
              <div className="bg-card border rounded-lg p-4 text-center">
                <Shield className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-xs text-muted-foreground">정품 보장</div>
                <div className="text-sm font-medium">100% 검수</div>
              </div>
              <div className="bg-card border rounded-lg p-4 text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-xs text-muted-foreground">가격 상승</div>
                <div className="text-sm font-medium text-green-500">+11.5%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-card border rounded-lg p-6 mb-6">
              <h2 className="mb-4">상품 정보</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">상태</span>
                  <span className="font-medium">{product.condition}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">언어</span>
                  <span className="font-medium">{product.language}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">등급</span>
                  <span className="font-medium">{product.rarity}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">카드 번호</span>
                  <span className="font-medium">{product.cardNumber}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">{product.description}</p>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <h2 className="mb-4">최근 거래 내역</h2>
              <div className="space-y-3">
                {product.recentSales.map((sale, idx) => (
                  <div key={idx} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <div className="font-medium">{sale.price.toLocaleString()}원</div>
                      <div className="text-xs text-muted-foreground">{sale.date}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {sizes.find(s => s.id === sale.size)?.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-card border rounded-lg p-6 sticky top-24">
              <h3 className="mb-4">시세 추이</h3>
              <div className="space-y-2 mb-4">
                {product.priceHistory.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.date}</span>
                    <span className="font-medium">{item.price.toLocaleString()}원</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">최근 30일</span>
                  <span className="text-green-500 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-medium">+11.5%</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
