import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Receipt, CreditCard, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { getMyOrders } from "@/api/order/orderApi";
import { useAuth } from "@/app/auth/context/AuthContext";
import { usePortonePayment } from "@/app/payment/hooks/usePortonePayment";
import { isPayable, isPaid, isPaymentExpired, statusMeta } from "@/app/order/lib/orderStatus";
import type { OrderListItem } from "@/types/order.types";

type TabKey = "ALL" | "PENDING" | "UNPAID" | "COMPLETED";

const TABS: { key: TabKey; label: string }[] = [
  { key: "ALL", label: "전체" },
  { key: "PENDING", label: "결제 대기" },
  { key: "UNPAID", label: "낙찰 후 미결제" },
  { key: "COMPLETED", label: "결제 완료" },
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
  const [tab, setTab] = useState<TabKey>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [payingUid, setPayingUid] = useState<string | null>(null);

  async function load(activeTab: TabKey) {
    setIsLoading(true);
    try {
      let list: OrderListItem[];
      if (activeTab === "PENDING") {
        // 결제 대기 — 경매(AUCTION) 낙찰 주문만 노출 (즉시구매 제외)
        const page = await getMyOrders({ status: "PAYMENT_PENDING", size: 30 });
        list = page.content.filter((o) => o.orderType === "AUCTION");
      } else if (activeTab === "UNPAID") {
        // 낙찰 후 미결제 — 결제 창이 완전히 지나 더는 결제할 수 없는 경매 실패 주문만
        const [auto, direct] = await Promise.all([
          getMyOrders({ status: "AUTO_PAYMENT_FAILED", size: 30 }),
          getMyOrders({ status: "DIRECT_PAYMENT_FAILED", size: 30 }),
        ]);
        list = [...auto.content, ...direct.content]
          .filter((o) => o.orderType === "AUCTION" && isPaymentExpired(o.paymentDeadline))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      } else if (activeTab === "COMPLETED") {
        // 결제 완료 — AUCTION / BUYOUT 모두 노출
        const page = await getMyOrders({ status: "PAYMENT_COMPLETED", size: 30 });
        list = page.content;
      } else {
        // 전체 — 결제 완료되지 않은 즉시구매(BUYOUT)는 제외
        const page = await getMyOrders({ size: 30 });
        list = page.content.filter((o) => o.orderType !== "BUYOUT" || isPaid(o.orderStatus));
      }
      setOrders(list);
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
    load(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, tab]);

  async function handleDirectPay(order: OrderListItem) {
    setPayingUid(order.orderUid);
    try {
      await payForAuction(order.auctionId, order.cardName, {
        fullName: user?.nickname,
        email: user?.email,
      });
      toast.success("결제 완료!");
      await load(tab);
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
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  active
                    ? "bg-[#FFCB05] text-[#1a1a2e]"
                    : "bg-card border text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* 낙찰 후 미결제 안내 */}
        {tab === "UNPAID" && (
          <div className="mb-5 flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-3 text-xs text-amber-500">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>지속적으로 낙찰 후 결제를 진행하지 않을 경우 서비스 이용에 제약이 생길 수 있습니다.</span>
          </div>
        )}

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
              const payable = isPayable(order.orderStatus) && !isPaymentExpired(order.paymentDeadline);
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
