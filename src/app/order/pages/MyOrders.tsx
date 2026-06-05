import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Receipt, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { getMyOrders } from "@/api/order/orderApi";
import { useAuth } from "@/app/auth/context/AuthContext";
import { usePortonePayment } from "@/app/payment/hooks/usePortonePayment";
import { isPayable, statusMeta } from "@/app/order/lib/orderStatus";
import type { OrderListItem, OrderStatus } from "@/types/order.types";

const FILTERS: { label: string; value?: OrderStatus }[] = [
  { label: "전체" },
  { label: "결제 대기", value: "PAYMENT_PENDING" },
  { label: "결제 실패", value: "AUTO_PAYMENT_FAILED" },
  { label: "결제 완료", value: "PAYMENT_COMPLETED" },
  { label: "배송", value: "SHIPPING" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function MyOrders() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const { payForAuction, isPaying } = usePortonePayment();

  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [filter, setFilter] = useState<OrderStatus | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [payingUid, setPayingUid] = useState<string | null>(null);

  async function load(status?: OrderStatus) {
    setIsLoading(true);
    try {
      const page = await getMyOrders({ status, size: 30 });
      setOrders(page.content);
    } catch {
      toast.error("주문 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    load(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, filter]);

  async function handleDirectPay(order: OrderListItem) {
    setPayingUid(order.orderUid);
    try {
      await payForAuction(order.auctionId, order.cardName, {
        fullName: user?.nickname,
        email: user?.email,
      });
      toast.success("결제 완료!");
      await load(filter);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "결제에 실패했습니다.");
    } finally {
      setPayingUid(null);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white py-10 border-b border-white/10">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Receipt className="w-6 h-6 text-[#FFCB05]" /> 내 주문
          </h1>
          <p className="text-sm text-white/50 mt-1">
            낙찰·즉시구매 내역과 결제 상태를 확인하고, 실패한 결제를 직접 진행할 수 있어요.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <button
                key={f.label}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  active
                    ? "bg-[#FFCB05] text-[#1a1a2e]"
                    : "bg-card border text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-2xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Receipt className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">주문 내역이 없습니다.</p>
            <Link
              to="/"
              className="mt-2 px-5 py-2.5 rounded-xl bg-[#CC0000] hover:bg-[#aa0000] text-white text-sm font-semibold transition-colors"
            >
              경매장 둘러보기
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {orders.map((order) => {
              const meta = statusMeta(order.orderStatus);
              const payable = isPayable(order.orderStatus);
              return (
                <li
                  key={order.orderUid}
                  className="bg-card border rounded-2xl p-4 flex items-center gap-4 hover:border-[#FFCB05]/40 transition-colors"
                >
                  <Link to={`/orders/${order.orderUid}`} state={{ auctionId: order.auctionId }} className="shrink-0">
                    <div className="w-14 h-20 rounded-lg overflow-hidden bg-muted">
                      {order.cardImageUrl ? (
                        <img src={order.cardImageUrl} alt={order.cardName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#16213e]" />
                      )}
                    </div>
                  </Link>

                  <Link
                    to={`/orders/${order.orderUid}`}
                    state={{ auctionId: order.auctionId }}
                    className="flex-1 min-w-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${meta.className}`}>
                        {meta.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{formatDate(order.createdAt)}</span>
                    </div>
                    <p className="font-semibold truncate mt-1">{order.cardName}</p>
                    <p className="text-xs text-muted-foreground">{order.cardGrade}</p>
                    <p className="text-sm font-extrabold text-[#CC0000] mt-1">
                      {order.finalPrice.toLocaleString()}원
                    </p>
                  </Link>

                  {payable && (
                    <button
                      onClick={() => handleDirectPay(order)}
                      disabled={isPaying && payingUid === order.orderUid}
                      className="shrink-0 flex items-center gap-1.5 bg-[#CC0000] hover:bg-[#aa0000] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                    >
                      <CreditCard className="w-4 h-4" />
                      {isPaying && payingUid === order.orderUid ? "결제 중…" : "직접 결제"}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
