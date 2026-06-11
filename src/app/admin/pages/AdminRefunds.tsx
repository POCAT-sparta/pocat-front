import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getAdminRefunds, approveRefund, rejectRefund } from "@/api/admin";
import type { AdminRefundResponse, RefundStatus } from "@/types/admin.types";
import {
  AdminPageHeader,
  AdminPanel,
  AdminState,
  AdminPagination,
  StatusBadge,
  RowActionButton,
} from "../components/AdminUI";
import { AdminModal, adminInputClass, AdminPrimaryButton } from "../components/AdminModal";

const PAGE_SIZE = 20;

const STATUS_FILTERS: { label: string; value?: RefundStatus }[] = [
  { label: "전체" },
  { label: "요청",   value: "REQUESTED" },
  { label: "처리중", value: "PROCESSING" },
  { label: "완료",   value: "COMPLETED" },
  { label: "거절",   value: "REJECTED" },
];

const STATUS_LABEL: Record<RefundStatus, string> = {
  REQUESTED:        "요청",
  PROCESSING:       "처리중",
  COMPLETED:        "완료",
  REJECTED:         "거절",
  FAILED_RETRYABLE: "실패(재시도)",
  FAILED_FINAL:     "실패(최종)",
};

const STATUS_TONE: Record<RefundStatus, "default" | "green" | "red" | "yellow" | "blue"> = {
  REQUESTED:        "yellow",
  PROCESSING:       "blue",
  COMPLETED:        "green",
  REJECTED:         "red",
  FAILED_RETRYABLE: "red",
  FAILED_FINAL:     "red",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function AdminRefunds() {
  const [refunds, setRefunds] = useState<AdminRefundResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<RefundStatus | undefined>(undefined);
  const [reloadKey, setReloadKey] = useState(0);

  // mutation 상태
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rejectTarget, setRejectTarget] = useState<AdminRefundResponse | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getAdminRefunds({ status, page, size: PAGE_SIZE })
      .then((res) => {
        if (!alive) return;
        setRefunds(res.content);
        setTotalPages(res.totalPages);
        setTotal(res.totalElements);
      })
      .catch(() => alive && toast.error("환불 목록을 불러오지 못했습니다."))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [status, page, reloadKey]);

  async function handleApprove(r: AdminRefundResponse) {
    if (!window.confirm(`환불 #${r.refundId} (${r.amount.toLocaleString()}원)을 승인할까요?`)) return;
    setBusyId(r.refundId);
    try {
      await approveRefund(r.refundId);
      toast.success("환불을 승인했습니다.");
      setReloadKey((k) => k + 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "환불 승인에 실패했습니다.");
    } finally {
      setBusyId(null);
    }
  }

  async function submitReject() {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) { toast.error("거절 사유를 입력해주세요."); return; }
    setBusyId(rejectTarget.refundId);
    try {
      await rejectRefund(rejectTarget.refundId, { rejectReason: rejectReason.trim() });
      toast.success("환불을 거절했습니다.");
      setRejectTarget(null);
      setRejectReason("");
      setReloadKey((k) => k + 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "환불 거절에 실패했습니다.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <AdminPageHeader title="환불 관리" count={total} />

      {/* 상태 필터 */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {STATUS_FILTERS.map((f) => {
          const active = status === f.value;
          return (
            <button
              key={f.label}
              onClick={() => { setPage(0); setStatus(f.value); }}
              className={`px-3 py-2 rounded-xl text-sm transition ${
                active ? "bg-[#FFCB05] text-[#1a1a2e] font-semibold" : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <AdminPanel>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/40 border-b border-white/10">
              <th className="px-4 py-3 font-medium">환불 ID</th>
              <th className="px-4 py-3 font-medium">주문 ID</th>
              <th className="px-4 py-3 font-medium">구매자</th>
              <th className="px-4 py-3 font-medium text-right">금액</th>
              <th className="px-4 py-3 font-medium">사유</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">요청일</th>
              <th className="px-4 py-3 font-medium text-right">작업</th>
            </tr>
          </thead>
          <tbody>
            {refunds.map((r) => (
              <tr key={r.refundId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-white/40">{r.refundId}</td>
                <td className="px-4 py-3 text-white/40">{r.orderId}</td>
                <td className="px-4 py-3 text-white/70">{r.buyerNickname}</td>
                <td className="px-4 py-3 text-right text-white font-medium">{r.amount.toLocaleString()}원</td>
                <td className="px-4 py-3 text-white/60">
                  <span className="block truncate max-w-[220px]" title={r.reason}>{r.reason}</span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</StatusBadge>
                </td>
                <td className="px-4 py-3 text-white/50">{formatDate(r.createdAt)}</td>
                <td className="px-4 py-3">
                  {r.status === "REQUESTED" ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <RowActionButton tone="green" disabled={busyId === r.refundId} onClick={() => handleApprove(r)}>
                        승인
                      </RowActionButton>
                      <RowActionButton tone="red" disabled={busyId === r.refundId} onClick={() => { setRejectTarget(r); setRejectReason(""); }}>
                        거절
                      </RowActionButton>
                    </div>
                  ) : (
                    <div className="text-right text-white/20 text-xs">—</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <AdminState loading={loading} empty={refunds.length === 0} emptyText="환불 내역이 없습니다." />
      </AdminPanel>

      <AdminPagination page={page} totalPages={totalPages} onChange={setPage} />

      {/* 환불 거절 사유 모달 */}
      {rejectTarget && (
        <AdminModal title={`환불 거절 — #${rejectTarget.refundId}`} onClose={() => setRejectTarget(null)}>
          <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide mb-2">거절 사유</label>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            placeholder="거절 사유를 입력하세요"
            className={adminInputClass}
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-5">
            <button onClick={() => setRejectTarget(null)} className="px-4 py-2 rounded-xl text-sm text-white/60 hover:bg-white/10 transition">
              취소
            </button>
            <AdminPrimaryButton disabled={busyId === rejectTarget.refundId} onClick={submitReject}>
              {busyId === rejectTarget.refundId ? "처리 중..." : "거절하기"}
            </AdminPrimaryButton>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
