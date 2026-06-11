import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getAdminRefunds } from "@/api/admin";
import type { AdminRefundResponse, RefundStatus } from "@/types/admin.types";
import {
  AdminPageHeader,
  AdminPanel,
  AdminState,
  AdminPagination,
  StatusBadge,
} from "../components/AdminUI";

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
  }, [status, page]);

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
              </tr>
            ))}
          </tbody>
        </table>
        <AdminState loading={loading} empty={refunds.length === 0} emptyText="환불 내역이 없습니다." />
      </AdminPanel>

      <AdminPagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
