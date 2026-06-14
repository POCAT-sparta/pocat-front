import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { getOrder } from "@/api/order/orderApi";
import { useAuth } from "@/app/auth/context/AuthContext";
import { usePortonePayment } from "@/app/payment/hooks/usePortonePayment";
import { isPayable, isPaymentExpired, statusMeta } from "@/app/order/lib/orderStatus";
import type { OrderDetail as OrderDetailType } from "@/types/order.types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export function OrderDetail() {
  const { orderUid } = useParams<{ orderUid: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { payForAuction, isPaying } = usePortonePayment();

  const [order, setOrder] = useState<OrderDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    if (!orderUid) return;
    setIsLoading(true);
    try {
      setOrder(await getOrder(orderUid));
    } catch {
      toast.error("주문을 불러오지 못했습니다.");
      navigate("/orders");
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
  }, [authLoading, isAuthenticated, orderUid]);

  async function handleDirectPay() {
    if (!order) return;
    try {
      await payForAuction(order.auctionId, order.card.name, {
        fullName: user?.nickname,
        email: user?.email,
      });
      toast.success("결제 완료!");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "결제에 실패했습니다.");
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-2xl animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/2" />
          <div className="h-64 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!order) return null;

  const meta = statusMeta(order.orderStatus);
  const payable = isPayable(order.orderStatus) && !isPaymentExpired(order.paymentDeadline);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white py-10 border-b border-white/10">
        <div className="container mx-auto px-4 max-w-2xl">
          <Link
            to="/orders"
            className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-3 transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" /> 내 주문
          </Link>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.className}`}>
              {meta.label}
            </span>
            <span className="text-xs text-white/40">주문번호 {order.orderUid}</span>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        {/* Card + price */}
        <div className="bg-card border rounded-2xl p-5 flex gap-4">
          <div className="w-24 h-32 rounded-xl overflow-hidden bg-muted shrink-0">
            {order.card.imageUrl ? (
              <img src={order.card.imageUrl} alt={order.card.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#16213e]" />
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <p className="text-xs text-muted-foreground">{order.card.grade}</p>
            <p className="font-bold text-lg truncate">{order.card.name}</p>
            <p className="text-2xl font-extrabold text-[#CC0000] mt-1">
              {order.finalPrice.toLocaleString()}원
            </p>
            <Link
              to={`/auctions/${order.auctionId}`}
              className="text-xs text-[#FFCB05] hover:underline mt-1 w-fit"
            >
              경매 보기 →
            </Link>
          </div>
        </div>

        {/* 결제 안내 — 실패/대기 시 */}
        {payable && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-sm text-blue-300">
            ⚡ 결제가 완료되지 않은 주문입니다. <strong>1시간 내</strong>에 직접 결제를 완료해주세요.
            기한이 지나면 다음 순위 입찰자에게 기회가 넘어갈 수 있습니다.
          </div>
        )}

        {/* Details */}
        <div className="bg-card border rounded-2xl p-5">
          <InfoRow label="판매자" value={`${order.seller.nickname} 트레이너`} />
          <InfoRow label="구매자" value={`${order.buyer.nickname} 트레이너`} />
          <InfoRow label="주문 상태" value={meta.label} />
          <InfoRow label="배송 상태" value={order.deliveryStatus ?? "—"} />
          {order.cancelReason && <InfoRow label="취소 사유" value={order.cancelReason} />}
          <InfoRow label="주문 일시" value={formatDate(order.createdAt)} />
          <InfoRow label="최근 변경" value={formatDate(order.updatedAt)} />
        </div>

        {/* Actions */}
        {payable && (
          <div className="flex gap-2">
            <button
              onClick={handleDirectPay}
              disabled={isPaying}
              className="flex-1 flex items-center justify-center gap-2 bg-[#CC0000] hover:bg-[#aa0000] text-white py-3.5 rounded-2xl font-bold transition-colors disabled:opacity-50"
            >
              <CreditCard className="w-5 h-5" />
              {isPaying ? "결제 처리 중…" : `${order.finalPrice.toLocaleString()}원 직접 결제`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
