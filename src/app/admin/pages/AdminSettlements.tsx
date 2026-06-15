import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { getAdminSettlements, completeSettlement } from "@/api/admin";
import type { AdminSettlementResponse, SettlementStatus } from "@/types/admin.types";
import { formatKST } from "@/shared/lib/datetime";
import {
  AdminPageHeader,
  AdminPanel,
  AdminState,
  AdminPagination,
  StatusBadge,
  RowActionButton,
} from "../components/AdminUI";

const PAGE_SIZE = 20;

const STATUS_FILTERS: { label: string; value?: SettlementStatus }[] = [
  { label: "전체" },
  { label: "대기", value: "PENDING" },
  { label: "완료", value: "COMPLETED" },
  { label: "환불", value: "REFUNDED" },
];

function statusBadge(status: SettlementStatus) {
  switch (status) {
    case "PENDING":   return <StatusBadge tone="yellow">대기</StatusBadge>;
    case "COMPLETED": return <StatusBadge tone="green">완료</StatusBadge>;
    case "REFUNDED":  return <StatusBadge tone="default">환불</StatusBadge>;
  }
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return formatKST(iso, { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function AdminSettlements() {
  const [settlements, setSettlements] = useState<AdminSettlementResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const [status, setStatus] = useState<SettlementStatus | undefined>(undefined);
  const [input, setInput] = useState("");
  const [seller, setSeller] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [busyUid, setBusyUid] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getAdminSettlements({ status, sellerNickname: seller || undefined, page, size: PAGE_SIZE })
      .then((res) => {
        if (!alive) return;
        setSettlements(res.content);
        setTotalPages(res.totalPages);
        setTotal(res.totalElements);
      })
      .catch(() => alive && toast.error("정산 목록을 불러오지 못했습니다."))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [status, seller, page, reloadKey]);

  function applySearch() {
    setPage(0);
    setSeller(input.trim());
  }

  async function handleComplete(s: AdminSettlementResponse) {
    if (!window.confirm(`${s.sellerNickname} 님의 정산(${s.sellerAmount.toLocaleString()}원)을 완료 처리할까요?`)) return;
    setBusyUid(s.settlementUid);
    try {
      await completeSettlement(s.settlementUid);
      toast.success("정산을 완료 처리했습니다.");
      setReloadKey((k) => k + 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "정산 완료 처리에 실패했습니다.");
    } finally {
      setBusyUid(null);
    }
  }

  return (
    <div>
      <AdminPageHeader title="정산 관리" count={total} />

      {/* 검색 */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="relative min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
            placeholder="판매자 닉네임"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#1a1a2e] border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FFCB05]/50"
          />
        </div>
        <button
          onClick={applySearch}
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#FFCB05] text-[#1a1a2e] hover:brightness-95 transition"
        >
          검색
        </button>
      </div>

      {/* 상태 필터 */}
      <div className="flex gap-1 mb-4">
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
              <th className="px-4 py-3 font-medium">정산번호</th>
              <th className="px-4 py-3 font-medium">판매자</th>
              <th className="px-4 py-3 font-medium">카드</th>
              <th className="px-4 py-3 font-medium text-right">판매액</th>
              <th className="px-4 py-3 font-medium text-right">수수료</th>
              <th className="px-4 py-3 font-medium text-right">정산액</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">정산일</th>
              <th className="px-4 py-3 font-medium text-right">작업</th>
            </tr>
          </thead>
          <tbody>
            {settlements.map((s) => (
              <tr key={s.settlementUid} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-white/40 font-mono text-xs">{s.settlementUid}</td>
                <td className="px-4 py-3 text-white/70">{s.sellerNickname}</td>
                <td className="px-4 py-3">
                  <p className="text-white font-medium truncate max-w-[160px]">{s.cardName}</p>
                  <p className="text-white/30 text-xs">{s.cardGrade.replace("_", " ")}</p>
                </td>
                <td className="px-4 py-3 text-right text-white/60">{s.totalPrice.toLocaleString()}원</td>
                <td className="px-4 py-3 text-right text-red-400/70">-{s.platformFee.toLocaleString()}원</td>
                <td className="px-4 py-3 text-right text-white font-medium">{s.sellerAmount.toLocaleString()}원</td>
                <td className="px-4 py-3">{statusBadge(s.status)}</td>
                <td className="px-4 py-3 text-white/50">{formatDate(s.settledAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end">
                    {s.status === "PENDING" ? (
                      <RowActionButton tone="green" disabled={busyUid === s.settlementUid} onClick={() => handleComplete(s)}>
                        완료 처리
                      </RowActionButton>
                    ) : (
                      <span className="text-white/20 text-xs">—</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <AdminState loading={loading} empty={settlements.length === 0} emptyText="정산 내역이 없습니다." />
      </AdminPanel>

      <AdminPagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
