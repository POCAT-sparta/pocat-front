import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { ArrowLeft, Undo2, Package } from "lucide-react";
import { toast } from "sonner";
import { getMyRefunds } from "@/api/refund/refundApi";
import { useAuth } from "@/app/auth/context/AuthContext";
import type { RefundResponse, RefundStatus } from "@/types/admin.types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusMeta(status: RefundStatus): { label: string; cls: string } {
  switch (status) {
    case "REQUESTED":        return { label: "요청됨",      cls: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
    case "PROCESSING":       return { label: "처리 중",     cls: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
    case "COMPLETED":        return { label: "환불 완료",   cls: "bg-green-500/10 text-green-500 border-green-500/20" };
    case "REJECTED":         return { label: "거절됨",      cls: "bg-red-500/10 text-red-500 border-red-500/20" };
    case "FAILED_RETRYABLE": return { label: "재시도 예정", cls: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
    case "FAILED_FINAL":
    default:                 return { label: "처리 실패",   cls: "bg-red-500/10 text-red-500 border-red-500/20" };
  }
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0 gap-4">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-right break-all">{value}</span>
    </div>
  );
}

export function RefundDetail() {
  const { refundId } = useParams<{ refundId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const stateRefund = (location.state as { refund?: RefundResponse } | null)?.refund;

  const [refund, setRefund] = useState<RefundResponse | null>(stateRefund ?? null);
  const [isLoading, setIsLoading] = useState(!stateRefund);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { navigate("/login"); return; }
    if (stateRefund || !refundId) { setIsLoading(false); return; }

    // 단건 API가 없어 내 환불 목록에서 id로 조회
    setIsLoading(true);
    getMyRefunds({ size: 100 })
      .then((page) => {
        const found = page.content.find((r) => r.refundId === Number(refundId));
        if (found) setRefund(found);
        else {
          toast.error("환불 내역을 찾을 수 없습니다.");
          navigate("/profile");
        }
      })
      .catch(() => {
        toast.error("환불 내역을 불러오지 못했습니다.");
        navigate("/profile");
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, refundId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-2xl animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-48 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!refund) return null;

  const meta = statusMeta(refund.status);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white py-8 border-b border-white/10">
        <div className="container mx-auto px-4 max-w-2xl">
          <Link
            to="/profile"
            className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-3 transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" /> 내 정보
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#CC0000] flex items-center justify-center shrink-0">
              <Undo2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#FFCB05]">환불 상세</h1>
              <p className="text-xs text-white/50 mt-0.5">환불 #{refund.refundId}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        {/* Amount + status */}
        <div className="bg-card border rounded-2xl p-6 text-center space-y-3">
          <span className={`inline-block text-xs px-2.5 py-1 rounded-full border font-medium ${meta.cls}`}>
            {meta.label}
          </span>
          <p className="text-3xl font-extrabold text-[#CC0000]">{refund.amount.toLocaleString()}원</p>
          {refund.status === "REJECTED" && refund.rejectReason && (
            <p className="text-sm text-red-500 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-2.5">
              거절 사유: {refund.rejectReason}
            </p>
          )}
        </div>

        {/* Detail rows */}
        <div className="bg-card border rounded-2xl p-5">
          <h2 className="text-sm font-bold mb-2">환불 정보</h2>
          <InfoRow label="환불 번호" value={`#${refund.refundId}`} />
          <InfoRow
            label="주문"
            value={
              <Link
                to={`/orders`}
                className="text-[#CC0000] hover:underline inline-flex items-center gap-1"
              >
                <Package className="w-3.5 h-3.5" /> 주문 #{refund.orderId}
              </Link>
            }
          />
          <InfoRow label="결제 번호" value={`#${refund.paymentId}`} />
          <InfoRow label="환불 사유" value={refund.reason} />
          <InfoRow label="요청일" value={formatDate(refund.createdAt)} />
          <InfoRow label="최종 변경일" value={formatDate(refund.updatedAt)} />
        </div>
      </div>
    </div>
  );
}
