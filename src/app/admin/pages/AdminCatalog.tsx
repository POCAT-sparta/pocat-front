import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  getAdminSeries, createSeries, updateSeriesNameKo, deleteSeries,
  getAdminPokemon, createPokemon, updatePokemonNameKo, deletePokemon,
  getAdminSets, createSet, updateSetNameKo, deleteSet,
} from "@/api/admin";
import type { SeriesResponse, PokemonResponse, PokemonSetResponse } from "@/types/admin.types";
import { AdminPageHeader, AdminPanel, AdminState, RowActionButton } from "../components/AdminUI";
import { AdminModal, adminInputClass, AdminPrimaryButton } from "../components/AdminModal";

type Tab = "series" | "pokemon" | "sets";

const TABS: { key: Tab; label: string }[] = [
  { key: "series",  label: "시리즈" },
  { key: "pokemon", label: "포켓몬" },
  { key: "sets",    label: "세트"   },
];

/** 이름 한글 수정 대상 (세 엔티티 공통 형태) */
type NameKoTarget = { id: number; label: string; nameKo: string | null };

export function AdminCatalog() {
  const [tab, setTab] = useState<Tab>("series");
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [busy, setBusy] = useState(false);

  const [series, setSeries] = useState<SeriesResponse[]>([]);
  const [pokemon, setPokemon] = useState<PokemonResponse[]>([]);
  const [sets, setSets] = useState<PokemonSetResponse[]>([]);

  // 생성 모달
  const [creating, setCreating] = useState(false);
  const [fName, setFName] = useState("");
  const [fNameKo, setFNameKo] = useState("");
  const [fSetId, setFSetId] = useState("");
  const [fSeriesId, setFSeriesId] = useState("");

  // 한글명 수정 모달
  const [editTarget, setEditTarget] = useState<NameKoTarget | null>(null);
  const [editNameKo, setEditNameKo] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);

    const load =
      tab === "series"  ? getAdminSeries().then((d) => alive && setSeries(d)) :
      tab === "pokemon" ? getAdminPokemon().then((d) => alive && setPokemon(d)) :
                          getAdminSets().then((d) => alive && setSets(d));

    load
      .catch(() => alive && toast.error("카탈로그를 불러오지 못했습니다."))
      .finally(() => alive && setLoading(false));

    return () => { alive = false; };
  }, [tab, reloadKey]);

  const count = tab === "series" ? series.length : tab === "pokemon" ? pokemon.length : sets.length;
  const empty = count === 0;

  function openCreate() {
    setFName(""); setFNameKo(""); setFSetId(""); setFSeriesId("");
    setCreating(true);
  }

  async function handleCreate() {
    if (tab === "sets" && !fSetId.trim()) { toast.error("Set ID를 입력해주세요."); return; }
    if (!fName.trim()) { toast.error("이름(영문)을 입력해주세요."); return; }
    setBusy(true);
    try {
      if (tab === "series") {
        await createSeries({ name: fName.trim(), nameKo: fNameKo.trim() || undefined });
      } else if (tab === "pokemon") {
        await createPokemon({ name: fName.trim(), nameKo: fNameKo.trim() || undefined });
      } else {
        await createSet({
          setId: fSetId.trim(),
          name: fName.trim(),
          nameKo: fNameKo.trim() || undefined,
          seriesId: fSeriesId.trim() ? Number(fSeriesId) : undefined,
        });
      }
      toast.success("생성했습니다.");
      setCreating(false);
      setReloadKey((k) => k + 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "생성에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  function openEdit(t: NameKoTarget) {
    setEditTarget(t);
    setEditNameKo(t.nameKo ?? "");
  }

  async function submitEdit() {
    if (!editTarget) return;
    if (!editNameKo.trim()) { toast.error("한글명을 입력해주세요."); return; }
    setBusy(true);
    try {
      if (tab === "series")       await updateSeriesNameKo(editTarget.id, editNameKo.trim());
      else if (tab === "pokemon") await updatePokemonNameKo(editTarget.id, editNameKo.trim());
      else                        await updateSetNameKo(editTarget.id, editNameKo.trim());
      toast.success("한글명을 수정했습니다.");
      setEditTarget(null);
      setReloadKey((k) => k + 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "수정에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number, label: string) {
    if (!window.confirm(`"${label}" 을(를) 삭제할까요? 되돌릴 수 없습니다.`)) return;
    setBusy(true);
    try {
      if (tab === "series")       await deleteSeries(id);
      else if (tab === "pokemon") await deletePokemon(id);
      else                        await deleteSet(id);
      toast.success("삭제했습니다.");
      setReloadKey((k) => k + 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "삭제에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  const createTitle = tab === "series" ? "시리즈 추가" : tab === "pokemon" ? "포켓몬 추가" : "세트 추가";

  return (
    <div>
      <AdminPageHeader title="카탈로그" count={count}>
        <AdminPrimaryButton onClick={openCreate}>
          <span className="inline-flex items-center gap-1"><Plus className="w-4 h-4" /> 추가</span>
        </AdminPrimaryButton>
      </AdminPageHeader>

      {/* 탭 */}
      <div className="flex gap-1 mb-4">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm transition ${
                active ? "bg-[#FFCB05] text-[#1a1a2e] font-semibold" : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <AdminPanel>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/40 border-b border-white/10">
              <th className="px-4 py-3 font-medium">ID</th>
              {tab === "sets" && <th className="px-4 py-3 font-medium">Set ID</th>}
              <th className="px-4 py-3 font-medium">이름 (영문)</th>
              <th className="px-4 py-3 font-medium">한글명</th>
              {tab === "sets" && <th className="px-4 py-3 font-medium">시리즈 ID</th>}
              <th className="px-4 py-3 font-medium text-right">작업</th>
            </tr>
          </thead>
          <tbody>
            {tab === "series" && series.map((s) => (
              <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-white/40">{s.id}</td>
                <td className="px-4 py-3 text-white">{s.name}</td>
                <td className="px-4 py-3 text-white/60">{s.nameKo ?? <span className="text-white/30">—</span>}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <RowActionButton disabled={busy} onClick={() => openEdit({ id: s.id, label: s.name, nameKo: s.nameKo })}>한글명</RowActionButton>
                    <RowActionButton tone="red" disabled={busy} onClick={() => handleDelete(s.id, s.name)}>삭제</RowActionButton>
                  </div>
                </td>
              </tr>
            ))}
            {tab === "pokemon" && pokemon.map((p) => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-white/40">{p.id}</td>
                <td className="px-4 py-3 text-white">{p.name}</td>
                <td className="px-4 py-3 text-white/60">{p.nameKo ?? <span className="text-white/30">—</span>}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <RowActionButton disabled={busy} onClick={() => openEdit({ id: p.id, label: p.name, nameKo: p.nameKo })}>한글명</RowActionButton>
                    <RowActionButton tone="red" disabled={busy} onClick={() => handleDelete(p.id, p.name)}>삭제</RowActionButton>
                  </div>
                </td>
              </tr>
            ))}
            {tab === "sets" && sets.map((s) => (
              <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-white/40">{s.id}</td>
                <td className="px-4 py-3 text-white/60">{s.setId}</td>
                <td className="px-4 py-3 text-white">{s.name}</td>
                <td className="px-4 py-3 text-white/60">{s.nameKo ?? <span className="text-white/30">—</span>}</td>
                <td className="px-4 py-3 text-white/50">{s.seriesId ?? <span className="text-white/30">—</span>}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <RowActionButton disabled={busy} onClick={() => openEdit({ id: s.id, label: s.name, nameKo: s.nameKo })}>한글명</RowActionButton>
                    <RowActionButton tone="red" disabled={busy} onClick={() => handleDelete(s.id, s.name)}>삭제</RowActionButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <AdminState loading={loading} empty={empty} emptyText="데이터가 없습니다." />
      </AdminPanel>

      {/* 생성 모달 */}
      {creating && (
        <AdminModal title={createTitle} onClose={() => setCreating(false)}>
          <div className="space-y-4">
            {tab === "sets" && (
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5">Set ID *</label>
                <input value={fSetId} onChange={(e) => setFSetId(e.target.value)} placeholder="예: sv01" className={adminInputClass} autoFocus />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5">이름 (영문) *</label>
              <input value={fName} onChange={(e) => setFName(e.target.value)} placeholder="영문 이름" className={adminInputClass} autoFocus={tab !== "sets"} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5">한글명</label>
              <input value={fNameKo} onChange={(e) => setFNameKo(e.target.value)} placeholder="한글명 (선택)" className={adminInputClass} />
            </div>
            {tab === "sets" && (
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5">시리즈 ID</label>
                <input value={fSeriesId} onChange={(e) => setFSeriesId(e.target.value)} placeholder="숫자 (선택)" inputMode="numeric" className={adminInputClass} />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={() => setCreating(false)} className="px-4 py-2 rounded-xl text-sm text-white/60 hover:bg-white/10 transition">취소</button>
            <AdminPrimaryButton disabled={busy} onClick={handleCreate}>{busy ? "생성 중..." : "생성"}</AdminPrimaryButton>
          </div>
        </AdminModal>
      )}

      {/* 한글명 수정 모달 */}
      {editTarget && (
        <AdminModal title={`한글명 수정 — ${editTarget.label}`} onClose={() => setEditTarget(null)}>
          <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide mb-2">한글명</label>
          <input value={editNameKo} onChange={(e) => setEditNameKo(e.target.value)} placeholder="한글명을 입력하세요" className={adminInputClass} autoFocus />
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={() => setEditTarget(null)} className="px-4 py-2 rounded-xl text-sm text-white/60 hover:bg-white/10 transition">취소</button>
            <AdminPrimaryButton disabled={busy} onClick={submitEdit}>{busy ? "저장 중..." : "저장"}</AdminPrimaryButton>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
