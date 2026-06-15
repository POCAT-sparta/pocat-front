import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { ArrowLeft, Wallet, Package } from "lucide-react";
import { toast } from "sonner";
import { getMySettlements } from "@/api/settlement/settlementApi";
import { useAuth } from "@/app/auth/context/AuthContext";
import type { MySettlementItem } from "@/types/settlement.types";
import type { SettlementStatus } from "@/types/admin.types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusMeta(status: SettlementStatus): { label: string; cls: string } {
  switch (status) {
    case "PENDING":   return { label: "정산 대기", cls: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
    case "COMPLETED": return { label: "정산 완료", cls: "bg-green-500/10 text-green-500 border-green-500/20" };
    case "REFUNDED":
    default:          return { label: "환불됨",    cls: "bg-red-500/10 text-red-500 border-red-500/20" };
  }
}

function gradeLabel(grade: string) {
  return grade.replace("_", " ");
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0 gap-4">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-right break-all">{value}</span>
    </div>
  );
}

export function SettlementDetail() {
  const { settlementUid } = useParams<{ settlementUid: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const stateSettlement = (location.state as { settlement?: MySettlementItem } | null)?.settlement;

  const [settlement, setSettlement] = useState<MySettlementItem | null>(stateSettlement ?? null);
  const [isLoading, setIsLoading] = useState(!stateSettlement);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { navigate("/login"); return; }
    if (stateSettlement || !settlementUid) { setIsLoading(false); return; }

    // 단건 API가 없어 내 정산 목록에서 uid로 조회
    setIsLoading(true);
    getMySettlements({ size: 100 })
      .then((page) => {
        const found = page.content.find((s) => s.settlementUid === settlementUid);
        if (found) setSettlement(found);
        else {
          toast.error("정산 내역을 찾을 수 없습니다.");
          navigate("/profile");
        }
      })
      .catch(() => {
        toast.error("정산 내역을 불러오지 못했습니다.");
        navigate("/profile");
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, settlementUid]);

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

  if (!settlement) return null;

  const meta = statusMeta(settlement.status);
  const settledDate = settlement.settledAt ?? settlement.createdAt;

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
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#FFCB05]">정산 상세</h1>
              <p className="text-xs text-white/50 mt-0.5">{settlement.cardName}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        {/* Card + status */}
        <div className="bg-card border rounded-2xl p-6 flex items-center gap-4">
          {settlement.cardImageUrl ? (
            <img
              src={settlement.cardImageUrl}
              alt={settlement.cardName}
              className="w-16 h-22 rounded-lg object-cover bg-muted shrink-0"
            />
          ) : (
            <div className="w-16 h-22 rounded-lg bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex items-center justify-center text-2xl shrink-0">
              🃏
            </div>
          )}
          <div className="min-w-0 flex-1">
            <span className={`inline-block text-xs px-2.5 py-1 rounded-full border font-medium ${meta.cls}`}>
              {meta.label}
            </span>
            <p className="font-bold mt-1.5 truncate">{settlement.cardName}</p>
            <p className="text-xs text-muted-foreground">{gradeLabel(settlement.cardGrade)}</p>
          </div>
        </div>

        {/* Amount breakdown */}
        <div className="bg-card border rounded-2xl p-5">
          <h2 className="text-sm font-bold mb-2">정산 금액</h2>
          <InfoRow label="거래 금액" value={`${settlement.totalPrice.toLocaleString()}원`} />
          <InfoRow label="플랫폼 수수료" value={<span className="text-muted-foreground">- {settlement.platformFee.toLocaleString()}원</span>} />
          <div className="flex items-center justify-between pt-3">
            <span className="text-sm font-bold">정산 금액</span>
            <span className="text-xl font-extrabold text-[#CC0000]">{settlement.sellerAmount.toLocaleString()}원</span>
          </div>
        </div>

        {/* Detail rows */}
        <div className="bg-card border rounded-2xl p-5">
          <h2 className="text-sm font-bold mb-2">정산 정보</h2>
          <InfoRow label="정산 번호" value={settlement.settlementUid} />
          <InfoRow
            label="주문"
            value={
              <Link
                to={`/orders/${settlement.orderUid}`}
                className="text-[#CC0000] hover:underline inline-flex items-center gap-1"
              >
                <Package className="w-3.5 h-3.5" /> 주문 보기
              </Link>
            }
          />
          <InfoRow label="등록일" value={formatDate(settlement.createdAt)} />
          <InfoRow label={settlement.settledAt ? "정산 완료일" : "정산 예정"} value={formatDate(settledDate)} />
        </div>
      </div>
    </div>
  );
}
