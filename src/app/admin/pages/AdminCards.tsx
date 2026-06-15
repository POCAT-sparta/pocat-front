import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getCardRequests, approveCard, rejectCard } from "@/api/admin";
import type { CardResponse, CardStatus } from "@/types/card.types";
import {
  AdminPageHeader,
  AdminPanel,
  AdminState,
  AdminPagination,
  StatusBadge,
  RowActionButton,
} from "../components/AdminUI";
import { AdminModal, adminInputClass, AdminPrimaryButton } from "../components/AdminModal";
import { formatKST } from "@/shared/lib/datetime";

const PAGE_SIZE = 20;

const STATUS_FILTERS: { label: string; value?: CardStatus }[] = [
  { label: "전체" },
  { label: "대기", value: "PENDING" },
  { label: "승인", value: "ACTIVE" },
  { label: "거절", value: "REJECTED" },
];

function statusBadge(status: CardStatus) {
  switch (status) {
    case "PENDING":  return <StatusBadge tone="yellow">대기</StatusBadge>;
    case "ACTIVE":   return <StatusBadge tone="green">승인</StatusBadge>;
    case "REJECTED": return <StatusBadge tone="red">거절</StatusBadge>;
  }
}

function formatDate(iso: string) {
  return formatKST(iso, { year: "numeric", month: "2-digit", day: "2-digit" });
}

export function AdminCards() {
  const [cards, setCards] = useState<CardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<CardStatus | undefined>("PENDING");
  const [reloadKey, setReloadKey] = useState(0);

  // mutation 상태
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rejectTarget, setRejectTarget] = useState<CardResponse | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getCardRequests({ status, page, size: PAGE_SIZE })
      .then((res) => {
        if (!alive) return;
        setCards(res.content);
        setTotalPages(res.totalPages);
        setTotal(res.totalElements);
      })
      .catch(() => alive && toast.error("카드 요청 목록을 불러오지 못했습니다."))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [status, page, reloadKey]);

  async function handleApprove(card: CardResponse) {
    if (!window.confirm(`"${card.name}" 카드를 승인할까요?`)) return;
    setBusyId(card.id);
    try {
      await approveCard(card.id);
      toast.success("카드를 승인했습니다.");
      setReloadKey((k) => k + 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "승인에 실패했습니다.");
    } finally {
      setBusyId(null);
    }
  }

  async function submitReject() {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) { toast.error("거절 사유를 입력해주세요."); return; }
    setBusyId(rejectTarget.id);
    try {
      await rejectCard(rejectTarget.id, { rejectReason: rejectReason.trim() });
      toast.success("카드를 거절했습니다.");
      setRejectTarget(null);
      setRejectReason("");
      setReloadKey((k) => k + 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "거절에 실패했습니다.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <AdminPageHeader title="카드 등록 요청" count={total} />

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
              <th className="px-4 py-3 font-medium">카드</th>
              <th className="px-4 py-3 font-medium">시리즈 / 세트</th>
              <th className="px-4 py-3 font-medium">번호</th>
              <th className="px-4 py-3 font-medium">등급</th>
              <th className="px-4 py-3 font-medium">카테고리</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">요청일</th>
              <th className="px-4 py-3 font-medium text-right">작업</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((c) => (
              <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {c.imageUrl
                      ? <img src={c.imageUrl} alt={c.name} className="w-9 h-12 object-cover rounded-md bg-white/5 shrink-0" />
                      : <div className="w-9 h-12 rounded-md bg-white/5 shrink-0" />}
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate max-w-[180px]">{c.name}</p>
                      <p className="text-white/30 text-xs">{c.grade.replace("_", " ")} · {c.rarity}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-white/60">
                  <p className="truncate max-w-[160px]">{c.series}</p>
                  <p className="text-white/30 text-xs truncate max-w-[160px]">{c.setName}</p>
                </td>
                <td className="px-4 py-3 text-white/50">{c.cardNumber}</td>
                <td className="px-4 py-3 text-white/70">{c.grade.replace("_", " ")}</td>
                <td className="px-4 py-3 text-white/50">{c.category}</td>
                <td className="px-4 py-3">{statusBadge(c.status)}</td>
                <td className="px-4 py-3 text-white/50">{formatDate(c.createdAt)}</td>
                <td className="px-4 py-3">
                  {c.status === "PENDING" ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <RowActionButton tone="green" disabled={busyId === c.id} onClick={() => handleApprove(c)}>
                        승인
                      </RowActionButton>
                      <RowActionButton tone="red" disabled={busyId === c.id} onClick={() => { setRejectTarget(c); setRejectReason(""); }}>
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
        <AdminState loading={loading} empty={cards.length === 0} emptyText="카드 요청이 없습니다." />
      </AdminPanel>

      <AdminPagination page={page} totalPages={totalPages} onChange={setPage} />

      {/* 거절 사유 모달 */}
      {rejectTarget && (
        <AdminModal title={`카드 거절 — ${rejectTarget.name}`} onClose={() => setRejectTarget(null)}>
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
            <button
              onClick={() => setRejectTarget(null)}
              className="px-4 py-2 rounded-xl text-sm text-white/60 hover:bg-white/10 transition"
            >
              취소
            </button>
            <AdminPrimaryButton disabled={busyId === rejectTarget.id} onClick={submitReject}>
              {busyId === rejectTarget.id ? "처리 중..." : "거절하기"}
            </AdminPrimaryButton>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
