import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FlaskConical, CreditCard, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getMyOrders } from "@/api/order/orderApi";
import { useAuth } from "@/app/auth/context/AuthContext";
import { usePortonePayment } from "@/app/payment/hooks/usePortonePayment";
import { isPayable, isPaid, isPaymentExpired, statusMeta } from "@/app/order/lib/orderStatus";
import type { OrderListItem } from "@/types/order.types";

/**
 * 직접 결제(빌링 자동결제 X) 테스트 전용 페이지. 경로: /orders/test
 *
 * 실제 내 주문 페이지(MyOrders)는 BUYOUT/만료/특정 상태를 걸러서 보여주지만,
 * 이 페이지는 해당 유저의 **모든 주문을 필터 없이** 그대로 노출하고,
 * 아직 결제되지 않은(직접결제 가능한) 건은 마감 시각과 무관하게 직접 결제를 호출할 수 있다.
 */

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** 모든 페이지를 끝까지 긁어서 유저의 전체 주문을 반환 */
async function fetchAllMyOrders(): Promise<OrderListItem[]> {
  const all: OrderListItem[] = [];
  let page = 0;
  const size = 50;
  // 안전장치: 최대 40페이지(2000건)까지만
  for (let i = 0; i < 40; i++) {
    const res = await getMyOrders({ page, size });
    all.push(...res.content);
    if (page >= res.totalPages - 1 || res.content.length === 0) break;
    page += 1;
  }
  return all;
}

export function OrdersTest() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const { payForAuction, isPaying } = usePortonePayment();

  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [payingUid, setPayingUid] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    try {
      const list = await fetchAllMyOrders();
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated]);

  async function handleDirectPay(order: OrderListItem) {
    setPayingUid(order.orderUid);
    try {
      await payForAuction(order.auctionId, order.cardName, {
        fullName: user?.nickname,
        email: user?.email,
      });
      toast.success("직접 결제 완료!");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "결제에 실패했습니다.");
    } finally {
      setPayingUid(null);
    }
  }

  const unpaidCount = orders.filter((o) => !isPaid(o.orderStatus)).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white py-10 border-b border-white/10">
        <div className="container mx-auto px-4 max-w-4xl flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FlaskConical className="w-6 h-6 text-[#FFCB05]" /> 직접 결제 테스트
            </h1>
            <p className="text-sm text-white/50 mt-1">
              내 모든 주문을 필터 없이 노출합니다. 미결제 건은 마감 시각과 무관하게 직접 결제를 호출할 수 있어요.
            </p>
          </div>
          <button
            onClick={load}
            disabled={isLoading}
            className="shrink-0 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-sm font-medium px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} /> 새로고침
          </button>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-5 text-xs text-muted-foreground">
          전체 <span className="font-bold text-foreground">{orders.length}</span>건 · 미결제{" "}
          <span className="font-bold text-[#CC0000]">{unpaidCount}</span>건
        </div>

        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-muted rounded-2xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <FlaskConical className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">주문 내역이 없습니다.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {orders.map((order) => {
              const meta = statusMeta(order.orderStatus);
              const paid = isPaid(order.orderStatus);
              // 테스트 페이지: 마감(deadline) 경과 여부와 무관하게 결제 가능한 상태면 버튼 노출
              const canPay = isPayable(order.orderStatus);
              const expired = isPaymentExpired(order.paymentDeadline);
              const busy = isPaying && payingUid === order.orderUid;
              return (
                <li
                  key={order.orderUid}
                  className="bg-card border rounded-2xl p-4 flex items-center gap-4"
                >
                  <div className="w-14 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                    {order.cardImageUrl ? (
                      <img src={order.cardImageUrl} alt={order.cardName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#16213e]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${meta.className}`}>
                        {meta.label}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-white/10 text-white/60">
                        {order.orderType}
                      </span>
                      {expired && !paid && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-orange-500/15 text-orange-400">
                          마감경과
                        </span>
                      )}
                    </div>
                    <p className="font-semibold truncate mt-1">{order.cardName}</p>
                    <p className="text-xs text-muted-foreground">{order.cardGrade}</p>
                    <p className="text-sm font-extrabold text-[#CC0000] mt-1">
                      {order.finalPrice.toLocaleString()}원
                    </p>
                    <div className="mt-1.5 text-[11px] text-muted-foreground space-y-0.5">
                      <p>orderUid: <span className="font-mono text-foreground/70">{order.orderUid}</span></p>
                      <p>auctionId: <span className="font-mono text-foreground/70">{order.auctionId}</span></p>
                      <p>생성: {formatDateTime(order.createdAt)}</p>
                      <p>결제마감: {formatDateTime(order.paymentDeadline)}</p>
                    </div>
                  </div>

                  {canPay && (
                    <button
                      onClick={() => handleDirectPay(order)}
                      disabled={busy}
                      className="shrink-0 self-start flex items-center gap-1.5 bg-[#CC0000] hover:bg-[#aa0000] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                    >
                      <CreditCard className="w-4 h-4" />
                      {busy ? "결제 중…" : "직접 결제"}
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
