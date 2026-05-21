import { User, Package, ShoppingBag, Gavel, Heart, Settings } from "lucide-react";
import { useState } from "react";
import { ProductCard } from "../components/ProductCard";

export function Profile() {
  const [activeTab, setActiveTab] = useState("buying");

  const tabs = [
    { id: "buying", label: "구매 내역", icon: ShoppingBag },
    { id: "selling", label: "판매 내역", icon: Package },
    { id: "bids", label: "입찰 내역", icon: Gavel },
    { id: "wishlist", label: "관심 상품", icon: Heart },
  ];

  const userStats = {
    totalBuys: 47,
    totalSells: 23,
    activeBids: 5,
    wishlistCount: 18,
    rating: 4.9,
    reviewCount: 34,
  };

  const wishlistItems = [
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
  ];

  const recentOrders = [
    {
      id: "ORD-2024-001",
      productName: "피카츄 AR 트리플렛비트",
      price: 95000,
      status: "배송중",
      date: "2026-05-09",
      image: "https://images.unsplash.com/photo-1542779283-429940ce8336?w=100&h=140&fit=crop"
    },
    {
      id: "ORD-2024-002",
      productName: "이브이 히어로즈 세트",
      price: 450000,
      status: "검수중",
      date: "2026-05-08",
      image: "https://images.unsplash.com/photo-1611954267147-1da7fdb8fe0c?w=100&h=140&fit=crop"
    },
    {
      id: "ORD-2024-003",
      productName: "뮤츠 V SR",
      price: 180000,
      status: "완료",
      date: "2026-05-05",
      image: "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=100&h=140&fit=crop"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl mb-2">포켓몬마스터</h1>
              <p className="opacity-90">회원 등급: VIP</p>
              <div className="flex items-center gap-4 mt-2">
                <span>⭐ {userStats.rating} ({userStats.reviewCount})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border rounded-lg p-6">
            <div className="text-muted-foreground text-sm mb-1">총 구매</div>
            <div className="text-2xl font-bold">{userStats.totalBuys}</div>
          </div>
          <div className="bg-card border rounded-lg p-6">
            <div className="text-muted-foreground text-sm mb-1">총 판매</div>
            <div className="text-2xl font-bold">{userStats.totalSells}</div>
          </div>
          <div className="bg-card border rounded-lg p-6">
            <div className="text-muted-foreground text-sm mb-1">활성 입찰</div>
            <div className="text-2xl font-bold">{userStats.activeBids}</div>
          </div>
          <div className="bg-card border rounded-lg p-6">
            <div className="text-muted-foreground text-sm mb-1">관심 상품</div>
            <div className="text-2xl font-bold">{userStats.wishlistCount}</div>
          </div>
        </div>

        <div className="bg-card border rounded-lg">
          <div className="border-b">
            <div className="flex items-center overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
              <button className="ml-auto px-6 py-4 text-muted-foreground hover:text-foreground">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "buying" && (
              <div>
                <h2 className="mb-6">구매 내역</h2>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <img
                        src={order.image}
                        alt={order.productName}
                        className="w-16 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium mb-1">{order.productName}</div>
                        <div className="text-sm text-muted-foreground mb-2">
                          주문번호: {order.id}
                        </div>
                        <div className="text-sm text-muted-foreground">{order.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold mb-2">
                          {order.price.toLocaleString()}원
                        </div>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs ${
                            order.status === "완료"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : order.status === "배송중"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "selling" && (
              <div>
                <h2 className="mb-6">판매 내역</h2>
                <div className="text-center py-12 text-muted-foreground">
                  판매 내역이 없습니다
                </div>
              </div>
            )}

            {activeTab === "bids" && (
              <div>
                <h2 className="mb-6">입찰 내역</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">리자몽 1st Edition PSA 10</span>
                      <span className="text-sm text-muted-foreground">2시간 남음</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">내 입찰가</span>
                      <span className="font-bold text-red-500">3,200,000원</span>
                    </div>
                    <div className="mt-2 text-xs text-green-500">최고 입찰자입니다</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "wishlist" && (
              <div>
                <h2 className="mb-6">관심 상품</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {wishlistItems.map((item) => (
                    <ProductCard key={item.id} {...item} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
