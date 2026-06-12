import { getSeries, getSets } from "@/api/catalog/catalogApi";
import type { SeriesResponse, PokemonSetResponse } from "@/types/catalog.types";

const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30일
const SERIES_KEY = "pocat:series:v1";
const SETS_KEY = "pocat:sets:v1";

interface Cached<T> {
  data: T;
  cachedAt: number;
}

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Cached<T>;
    if (Date.now() - parsed.cachedAt > TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function write<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ data, cachedAt: Date.now() }));
  } catch {
    // localStorage 사용 불가 시 캐시 생략
  }
}

export async function getCachedSeries(): Promise<SeriesResponse[]> {
  const cached = read<SeriesResponse[]>(SERIES_KEY);
  if (cached) return cached;
  const data = await getSeries();
  write(SERIES_KEY, data);
  return data;
}

export async function getCachedSets(): Promise<PokemonSetResponse[]> {
  const cached = read<PokemonSetResponse[]>(SETS_KEY);
  if (cached) return cached;
  const data = await getSets();
  write(SETS_KEY, data);
  return data;
}
