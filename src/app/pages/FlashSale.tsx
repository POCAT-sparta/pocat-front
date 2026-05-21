import { Flame, Clock, Zap, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router";

export function FlashSale() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 37,
    seconds: 45,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const flashSaleItems = [
    {
      id: "9",
      name: "스타터덱 3종 세트",
      image: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400&h=560&fit=crop",
      price: 100,
      originalPrice: 45000,
      stock: 12,
      totalStock: 100,
      rarity: "SET",
      set: "스타터 컬렉션"
    },
    {
      id: "10",
      name: "랜덤 부스터팩 10팩",
      image: "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=400&h=560&fit=crop",
      price: 100,
      originalPrice: 50000,
      stock: 5,
      totalStock: 100,
      rarity: "PACK",
      set: "믹스 부스터"
    },
    {
      id: "19",
      name: "프로모팩 스페셜 에디션",
      image: "https://images.unsplash.com/photo-1542779283-429940ce8336?w=400&h=560&fit=crop",
      price: 100,
      originalPrice: 38000,
      stock: 23,
      totalStock: 100,
      rarity: "PROMO",
      set: "프로모션"
    },
    {
      id: "20",
      name: "덱 빌더 세트",
      image: "https://images.unsplash.com/photo-1611954267147-1da7fdb8fe0c?w=400&h=560&fit=crop",
      price: 100,
      originalPrice: 62000,
      stock: 34,
      totalStock: 100,
      rarity: "SET",
      set: "덱 빌더"
    },
  ];

  const upcomingEvents = [
    {
      id: "21",
      name: "피카츄 프로모 100원 세일",
      startDate: "2026-05-13 14:00",
      stock: 200,
      image: "https://images.unsplash.com/photo-1542779283-429940ce8336?w=400&h=560&fit=crop"
    },
    {
      id: "22",
      name: "이브이 히어로즈 박스 100원",
      startDate: "2026-05-15 20:00",
      stock: 50,
      image: "https://images.unsplash.com/photo-1611954267147-1da7fdb8fe0c?w=400&h=560&fit=crop"
    },
    {
      id: "23",
      name: "레전드 컬렉션 100원",
      startDate: "2026-05-18 12:00",
      stock: 150,
      image: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400&h=560&fit=crop"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Flame className="w-10 h-10 animate-pulse" />
            <h1 className="text-4xl">특별 이벤트</h1>
          </div>
          <p className="text-lg opacity-90 mb-6">
            선착순 한정! 프리미엄 상품을 100원에 만나보세요
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 inline-block">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5" />
              <span className="text-sm">현재 이벤트 종료까지</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="bg-white text-red-500 rounded-lg px-4 py-2 text-3xl font-bold min-w-[4rem]">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <div className="text-xs mt-1">시간</div>
              </div>
              <span className="text-3xl">:</span>
              <div className="text-center">
                <div className="bg-white text-red-500 rounded-lg px-4 py-2 text-3xl font-bold min-w-[4rem]">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <div className="text-xs mt-1">분</div>
              </div>
              <span className="text-3xl">:</span>
              <div className="text-center">
                <div className="bg-white text-red-500 rounded-lg px-4 py-2 text-3xl font-bold min-w-[4rem]">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <div className="text-xs mt-1">초</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <h3 className="text-red-800 dark:text-red-200 mb-2">
                100원 이벤트 안내
              </h3>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                <li>• 1인당 1개 상품만 구매 가능합니다</li>
                <li>• 결제 후 취소/환불이 불가능합니다</li>
                <li>• 재고 소진 시 이벤트가 조기 종료될 수 있습니다</li>
                <li>• 구매 후 7일 이내 배송됩니다</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-6 h-6 text-orange-500" />
            <h2>진행 중인 100원 이벤트</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {flashSaleItems.map((item) => {
              const soldPercentage = ((item.totalStock - item.stock) / item.totalStock) * 100;

              return (
                <div key={item.id} className="group">
                  <div className="bg-card rounded-lg overflow-hidden border hover:shadow-lg transition-all">
                    <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute top-2 left-2">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                          100원
                        </span>
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                          {item.rarity}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="text-xs text-muted-foreground mb-1">{item.set}</div>
                      <h3 className="font-medium mb-3 line-clamp-2 min-h-[2.5rem]">{item.name}</h3>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-red-500">100원</span>
                          <span className="text-sm text-muted-foreground line-through">
                            {item.originalPrice.toLocaleString()}원
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">재고</span>
                            <span className={item.stock < 20 ? "text-red-500 font-bold" : ""}>
                              {item.stock}/{item.totalStock}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-red-500 h-full transition-all"
                              style={{ width: `${soldPercentage}%` }}
                            />
                          </div>
                        </div>

                        <Link
                          to={`/product/${item.id}`}
                          className="block w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-center hover:bg-primary/90 transition-colors"
                        >
                          {item.stock > 0 ? "지금 구매하기" : "품절"}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-6 h-6 text-primary" />
            <h2>예정된 이벤트</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="bg-card border rounded-lg overflow-hidden">
                <div className="aspect-[3/4] bg-muted relative">
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="font-bold mb-2">{event.name}</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{event.startDate}</span>
                    </div>
                    <div className="text-sm mt-1">수량: {event.stock}개</div>
                  </div>
                </div>
                <div className="p-4">
                  <button className="w-full bg-muted text-muted-foreground py-2 rounded-lg cursor-not-allowed">
                    알림 설정
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl p-8 text-center">
          <h2 className="mb-4">놓치지 마세요!</h2>
          <p className="text-lg mb-6 opacity-90">
            100원 이벤트 알림을 받고 싶으신가요?
          </p>
          <button className="bg-white text-purple-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors">
            알림 신청하기
          </button>
        </div>
      </div>
    </div>
  );
}
