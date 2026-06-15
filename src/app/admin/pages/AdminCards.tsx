import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  getCardRequests,
  approveCard,
  rejectCard,
  updateCard,
  deleteCard,
  syncCards,
} from "@/api/admin";
import type { CardResponse, CardStatus, CardCategory, CardGrade } from "@/types/card.types";
import type { UpdateCardRequest } from "@/types/admin.types";
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

const CATEGORY_OPTIONS: CardCategory[] = ["POKEMON", "TRAINERS", "ENERGY", "UNKNOWN"];
const GRADE_OPTIONS: CardGrade[] = ["PSA_10", "PSA_9", "BGS_10"];

/** 수정 모달 폼 (핵심 필드만) */
type EditForm = {
  name: string;
  series: string;
  setName: string;
  cardNumber: string;
  rarity: string;
  imageUrl: string;
  category: CardCategory;
  grade: CardGrade;
};

function toForm(c: CardResponse): EditForm {
  return {
    name: c.name,
    series: c.series,
    setName: c.setName,
    cardNumber: c.cardNumber,
    rarity: c.rarity,
    imageUrl: c.imageUrl ?? "",
    category: c.category,
    grade: c.grade,
  };
}

/** 원본 대비 변경된 필드만 PATCH 페이로드로 추출 */
function diffPayload(original: CardResponse, form: EditForm): UpdateCardRequest {
  const payload: UpdateCardRequest = {};
  if (form.name.trim() !== original.name) payload.name = form.name.trim();
  if (form.series.trim() !== original.series) payload.series = form.series.trim();
  if (form.setName.trim() !== original.setName) payload.setName = form.setName.trim();
  if (form.cardNumber.trim() !== original.cardNumber) payload.cardNumber = form.cardNumber.trim();
  if (form.rarity.trim() !== original.rarity) payload.rarity = form.rarity.trim();
  if (form.imageUrl.trim() !== (original.imageUrl ?? "")) payload.imageUrl = form.imageUrl.trim();
  if (form.category !== original.category) payload.category = form.category;
  if (form.grade !== original.grade) payload.grade = form.grade;
  return payload;
}

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

  // 수정 모달
  const [editTarget, setEditTarget] = useState<CardResponse | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);

  // TCGdex 동기화
  const [syncing, setSyncing] = useState(false);

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

  async function handleSync() {
    if (!window.confirm("TCGdex 전체 카드를 동기화합니다.\n시간이 걸릴 수 있으며 백그라운드에서 실행됩니다. 진행할까요?")) {
      return;
    }
    setSyncing(true);
    try {
      await syncCards();
      toast.success("동기화 요청이 접수되었습니다. 백그라운드에서 처리됩니다.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "동기화 요청에 실패했습니다.");
    } finally {
      setSyncing(false);
    }
  }

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

  function openEdit(card: CardResponse) {
    setEditTarget(card);
    setEditForm(toForm(card));
  }

  async function submitEdit() {
    if (!editTarget || !editForm) return;
    if (!editForm.name.trim()) { toast.error("카드 이름을 입력해주세요."); return; }
    const payload = diffPayload(editTarget, editForm);
    if (Object.keys(payload).length === 0) {
      toast.info("변경된 내용이 없습니다.");
      return;
    }
    setBusyId(editTarget.id);
    try {
      await updateCard(editTarget.id, payload);
      toast.success("카드 정보를 수정했습니다.");
      setEditTarget(null);
      setEditForm(null);
      setReloadKey((k) => k + 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "수정에 실패했습니다.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(card: CardResponse) {
    if (!window.confirm(`"${card.name}" 카드를 삭제할까요? 되돌릴 수 없습니다.`)) return;
    setBusyId(card.id);
    try {
      await deleteCard(card.id);
      toast.success("카드를 삭제했습니다.");
      setReloadKey((k) => k + 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "삭제에 실패했습니다.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <AdminPageHeader title="카드 등록 요청" count={total}>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[#FFCB05] text-[#1a1a2e] hover:brightness-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {syncing
            ? <><Loader2 className="w-4 h-4 animate-spin" /> 요청 중...</>
            : <><RefreshCw className="w-4 h-4" /> TCGdex 동기화</>}
        </button>
      </AdminPageHeader>

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
                  <div className="flex items-center justify-end gap-1.5">
                    {c.status === "PENDING" && (
                      <>
                        <RowActionButton tone="green" disabled={busyId === c.id} onClick={() => handleApprove(c)}>
                          승인
                        </RowActionButton>
                        <RowActionButton tone="red" disabled={busyId === c.id} onClick={() => { setRejectTarget(c); setRejectReason(""); }}>
                          거절
                        </RowActionButton>
                      </>
                    )}
                    <RowActionButton disabled={busyId === c.id} onClick={() => openEdit(c)}>
                      수정
                    </RowActionButton>
                    <RowActionButton tone="red" disabled={busyId === c.id} onClick={() => handleDelete(c)}>
                      삭제
                    </RowActionButton>
                  </div>
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

      {/* 카드 수정 모달 */}
      {editTarget && editForm && (
        <AdminModal title={`카드 수정 — ${editTarget.name}`} onClose={() => { setEditTarget(null); setEditForm(null); }}>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5">이름 *</label>
              <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className={adminInputClass} autoFocus />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5">시리즈</label>
              <input value={editForm.series} onChange={(e) => setEditForm({ ...editForm, series: e.target.value })} className={adminInputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5">세트명</label>
              <input value={editForm.setName} onChange={(e) => setEditForm({ ...editForm, setName: e.target.value })} className={adminInputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5">카드 번호</label>
                <input value={editForm.cardNumber} onChange={(e) => setEditForm({ ...editForm, cardNumber: e.target.value })} className={adminInputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5">레어도</label>
                <input value={editForm.rarity} onChange={(e) => setEditForm({ ...editForm, rarity: e.target.value })} className={adminInputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5">카테고리</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value as CardCategory })}
                  className={adminInputClass}
                >
                  {CATEGORY_OPTIONS.map((opt) => <option key={opt} value={opt} className="bg-[#1a1a2e]">{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5">등급</label>
                <select
                  value={editForm.grade}
                  onChange={(e) => setEditForm({ ...editForm, grade: e.target.value as CardGrade })}
                  className={adminInputClass}
                >
                  {GRADE_OPTIONS.map((opt) => <option key={opt} value={opt} className="bg-[#1a1a2e]">{opt.replace("_", " ")}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5">이미지 URL</label>
              <input value={editForm.imageUrl} onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })} placeholder="https://..." className={adminInputClass} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={() => { setEditTarget(null); setEditForm(null); }} className="px-4 py-2 rounded-xl text-sm text-white/60 hover:bg-white/10 transition">취소</button>
            <AdminPrimaryButton disabled={busyId === editTarget.id} onClick={submitEdit}>
              {busyId === editTarget.id ? "저장 중..." : "저장"}
            </AdminPrimaryButton>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
