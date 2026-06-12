import { useEffect, useState } from "react";
import { getCachedSeries, getCachedSets } from "@/app/card/lib/catalogCache";
import type { SeriesResponse, PokemonSetResponse } from "@/types/catalog.types";

export interface SeriesSetSelection {
  series: SeriesResponse | null;
  set: PokemonSetResponse | null;
}

interface Props {
  /** true면 "전체"(null) 옵션을 노출하고 기본값으로 둔다. 기본 true */
  includeAll?: boolean;
  onChange: (sel: SeriesSetSelection) => void;
}

function label(item: { name: string; nameKo: string | null }): string {
  return item.nameKo && item.nameKo.trim() ? item.nameKo : item.name;
}

export function SeriesSetFilter({ includeAll = true, onChange }: Props) {
  const [seriesList, setSeriesList] = useState<SeriesResponse[]>([]);
  const [setsList, setSetsList] = useState<PokemonSetResponse[]>([]);
  const [seriesId, setSeriesId] = useState<number | null>(null);
  const [setId, setSetId] = useState<number | null>(null);

  // 캐시 로드 + 기본 선택 세팅
  useEffect(() => {
    let cancelled = false;
    Promise.all([getCachedSeries(), getCachedSets()])
      .then(([series, sets]) => {
        if (cancelled) return;
        setSeriesList(series);
        setSetsList(sets);
        if (!includeAll && series.length > 0) {
          const firstSeries = series[0];
          const firstSet =
            sets.find((s) => s.seriesId === firstSeries.id) ?? null;
          setSeriesId(firstSeries.id);
          setSetId(firstSet?.id ?? null);
          onChange({ series: firstSeries, set: firstSet });
        }
      })
      .catch(() => {
        // 실패 시 "전체"만 노출(필터 없이 진행 가능)
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeAll]);

  const filteredSets =
    seriesId == null
      ? setsList
      : setsList.filter((s) => s.seriesId === seriesId);

  function handleSeriesChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value === "" ? null : Number(e.target.value);
    const series = seriesList.find((s) => s.id === value) ?? null;

    if (includeAll) {
      setSeriesId(value);
      setSetId(null);
      onChange({ series, set: null });
    } else {
      const firstSet = setsList.find((s) => s.seriesId === value) ?? null;
      setSeriesId(value);
      setSetId(firstSet?.id ?? null);
      onChange({ series, set: firstSet });
    }
  }

  function handleSetChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value === "" ? null : Number(e.target.value);
    const set = setsList.find((s) => s.id === value) ?? null;
    const series = seriesList.find((s) => s.id === seriesId) ?? null;
    setSetId(value);
    onChange({ series, set });
  }

  const selectClass =
    "border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:border-[#CC0000] transition-colors";

  return (
    <div className="flex flex-wrap gap-2">
      <select value={seriesId ?? ""} onChange={handleSeriesChange} className={selectClass}>
        {includeAll && <option value="">전체 시리즈</option>}
        {seriesList.map((s) => (
          <option key={s.id} value={s.id}>
            {label(s)}
          </option>
        ))}
      </select>

      <select value={setId ?? ""} onChange={handleSetChange} className={selectClass}>
        {includeAll && <option value="">전체 세트</option>}
        {filteredSets.map((s) => (
          <option key={s.id} value={s.id}>
            {label(s)}
          </option>
        ))}
      </select>
    </div>
  );
}
