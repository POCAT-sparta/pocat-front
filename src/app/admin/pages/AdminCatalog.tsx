import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getAdminSeries, getAdminPokemon, getAdminSets } from "@/api/admin";
import type { SeriesResponse, PokemonResponse, PokemonSetResponse } from "@/types/admin.types";
import { AdminPageHeader, AdminPanel, AdminState } from "../components/AdminUI";

type Tab = "series" | "pokemon" | "sets";

const TABS: { key: Tab; label: string }[] = [
  { key: "series",  label: "시리즈" },
  { key: "pokemon", label: "포켓몬" },
  { key: "sets",    label: "세트"   },
];

export function AdminCatalog() {
  const [tab, setTab] = useState<Tab>("series");
  const [loading, setLoading] = useState(true);
  const [series, setSeries] = useState<SeriesResponse[]>([]);
  const [pokemon, setPokemon] = useState<PokemonResponse[]>([]);
  const [sets, setSets] = useState<PokemonSetResponse[]>([]);

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
  }, [tab]);

  const count =
    tab === "series" ? series.length :
    tab === "pokemon" ? pokemon.length :
    sets.length;

  const empty =
    tab === "series" ? series.length === 0 :
    tab === "pokemon" ? pokemon.length === 0 :
    sets.length === 0;

  return (
    <div>
      <AdminPageHeader title="카탈로그" count={count} />

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
            </tr>
          </thead>
          <tbody>
            {tab === "series" && series.map((s) => (
              <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-white/40">{s.id}</td>
                <td className="px-4 py-3 text-white">{s.name}</td>
                <td className="px-4 py-3 text-white/60">{s.nameKo ?? <span className="text-white/30">—</span>}</td>
              </tr>
            ))}
            {tab === "pokemon" && pokemon.map((p) => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-white/40">{p.id}</td>
                <td className="px-4 py-3 text-white">{p.name}</td>
                <td className="px-4 py-3 text-white/60">{p.nameKo ?? <span className="text-white/30">—</span>}</td>
              </tr>
            ))}
            {tab === "sets" && sets.map((s) => (
              <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-white/40">{s.id}</td>
                <td className="px-4 py-3 text-white/60">{s.setId}</td>
                <td className="px-4 py-3 text-white">{s.name}</td>
                <td className="px-4 py-3 text-white/60">{s.nameKo ?? <span className="text-white/30">—</span>}</td>
                <td className="px-4 py-3 text-white/50">{s.seriesId ?? <span className="text-white/30">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <AdminState loading={loading} empty={empty} emptyText="데이터가 없습니다." />
      </AdminPanel>
    </div>
  );
}
