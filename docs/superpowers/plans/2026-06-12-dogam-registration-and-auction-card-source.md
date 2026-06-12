# 도감 카드 등록 & 경매 카드 소스 정정 — 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 경매 폼이 도감 전체(GET /v1/cards)에서 카드를 고르게 정정하고(시리즈/세트 드롭다운+검색+페이징), 도감에 카드를 추가하는 전용 등록 페이지를 신설한다.

**Architecture:** 프론트(React+Vite+TS) 변경만. 시리즈/세트는 신규 API로 가져와 30일 localStorage 캐싱하고 공유 드롭다운 컴포넌트로 노출한다. 경매 폼은 카드 소스를 `getMyRequests`→`getCards`로 교체하고 서버 검색/페이징을 도입한다. 등록 페이지는 `createCard`/`createCardWithImage`(multipart)를 호출해 `tcgdexId=null, source=MANUAL`로 PENDING 카드를 생성한다.

**Tech Stack:** React 18, react-router, TypeScript, Vite, lucide-react, sonner(toast), Tailwind. 테스트 러너 없음 → 검증은 `npm run build` + 수동(browse).

**Spec:** `docs/superpowers/specs/2026-06-12-dogam-registration-and-auction-card-source-design.md`

---

## File Structure

| 파일 | 역할 | 생성/수정 |
|---|---|---|
| `src/types/catalog.types.ts` | Series/Set 타입 | Create |
| `src/api/catalog/catalogApi.ts` | `getSeries`, `getSets` | Create |
| `src/app/card/lib/catalogCache.ts` | 30일 캐시 헬퍼 | Create |
| `src/app/card/components/SeriesSetFilter.tsx` | 공유 시리즈/세트 드롭다운 | Create |
| `src/api/card/cardApi.ts` | `createCardWithImage` 추가 | Modify |
| `src/app/card/pages/CardRegister.tsx` | 도감 등록 페이지 | Create |
| `src/app/auction/pages/AuctionForm.tsx` | 카드 소스/검색/필터 정정 | Modify |
| `src/app/routes.tsx` | `cards/register` 라우트 | Modify |
| `src/shared/components/Header.tsx` | "도감 등록" 링크 | Modify |

---

## Task 1: 카탈로그 타입 · API · 캐시

**Files:**
- Create: `src/types/catalog.types.ts`
- Create: `src/api/catalog/catalogApi.ts`
- Create: `src/app/card/lib/catalogCache.ts`

- [ ] **Step 1: 타입 정의**

Create `src/types/catalog.types.ts`:

```ts
export interface SeriesResponse {
  id: number;
  name: string;
  nameKo: string | null;
}

export interface PokemonSetResponse {
  id: number;
  setId: string;
  name: string;
  nameKo: string | null;
  seriesId: number | null;
}
```

- [ ] **Step 2: API 함수**

Create `src/api/catalog/catalogApi.ts`:

```ts
import { apiClient } from "@/shared/lib/apiClient.ts";
import type { ApiResponse } from "@/shared/types/api.ts";
import type { SeriesResponse, PokemonSetResponse } from "@/types/catalog.types";

export async function getSeries(): Promise<SeriesResponse[]> {
  const res = await apiClient.get<ApiResponse<SeriesResponse[]>>(
    "/api/v1/series",
    { skipAuth: true }
  );
  return res.data;
}

export async function getSets(): Promise<PokemonSetResponse[]> {
  const res = await apiClient.get<ApiResponse<PokemonSetResponse[]>>(
    "/api/v1/sets",
    { skipAuth: true }
  );
  return res.data;
}
```

- [ ] **Step 3: 캐시 헬퍼**

Create `src/app/card/lib/catalogCache.ts`:

```ts
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
```

- [ ] **Step 4: 빌드로 검증**

Run: `npm run build`
Expected: 성공 (타입 에러 없음). `✓ built in ...`

- [ ] **Step 5: Commit**

```bash
git add src/types/catalog.types.ts src/api/catalog/catalogApi.ts src/app/card/lib/catalogCache.ts
git commit -m "feat: 시리즈/세트 카탈로그 API + 30일 캐시 헬퍼"
```

---

## Task 2: 공유 시리즈/세트 드롭다운 컴포넌트

**Files:**
- Create: `src/app/card/components/SeriesSetFilter.tsx`

인터페이스: 캐시에서 시리즈/세트를 로드하고, 시리즈→세트 cascading을 관리한다. 선택된 `SeriesResponse | null`과 `PokemonSetResponse | null`을 상위로 emit한다. `includeAll`이 true면 각 드롭다운 맨 앞에 "전체"(=null) 옵션을 두고 기본값을 "전체"로, false면 첫 실제 항목을 기본 선택한다.

- [ ] **Step 1: 컴포넌트 작성**

Create `src/app/card/components/SeriesSetFilter.tsx`:

```tsx
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
```

- [ ] **Step 2: 빌드로 검증**

Run: `npm run build`
Expected: 성공 (타입 에러 없음).

- [ ] **Step 3: Commit**

```bash
git add src/app/card/components/SeriesSetFilter.tsx
git commit -m "feat: 시리즈/세트 cascading 드롭다운 공유 컴포넌트"
```

---

## Task 3: cardApi에 이미지 업로드 함수 추가

**Files:**
- Modify: `src/api/card/cardApi.ts`

`apiClient`는 항상 `Content-Type: application/json`을 강제하므로 multipart에 쓸 수 없다. 따라서 `createCardWithImage`는 raw `fetch` + `FormData`로 구현한다. `request` 파트는 `application/json` Blob으로 보내야 백엔드 `@RequestPart("request")` JSON 바인딩과 맞는다.

- [ ] **Step 1: import에 getAccessToken 추가**

Modify `src/api/card/cardApi.ts` 상단 import:

```ts
import { apiClient, getAccessToken } from "@/shared/lib/apiClient.ts";
```

(기존 `import { apiClient } from "@/shared/lib/apiClient.ts";` 줄을 위 줄로 교체)

- [ ] **Step 2: createCardWithImage 함수 추가**

Modify `src/api/card/cardApi.ts` — `createCard` 함수 바로 아래에 추가:

```ts
export async function createCardWithImage(
  data: CreateCardRequest,
  image: File
): Promise<CardResponse> {
  const form = new FormData();
  form.append("image", image);
  form.append(
    "request",
    new Blob([JSON.stringify(data)], { type: "application/json" })
  );

  const token = getAccessToken();
  const baseUrl = import.meta.env.VITE_API_URL ?? "";
  const res = await fetch(`${baseUrl}/api/v1/cards/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "요청 실패" }));
    throw new Error(err.message ?? "요청 실패");
  }
  const json = (await res.json()) as ApiResponse<CardResponse>;
  return json.data;
}
```

- [ ] **Step 3: 빌드로 검증**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 4: Commit**

```bash
git add src/api/card/cardApi.ts
git commit -m "feat: createCardWithImage(multipart 업로드) API 추가"
```

---

## Task 4: 도감 카드 등록 페이지 + 라우트 + 네비 링크

**Files:**
- Create: `src/app/card/pages/CardRegister.tsx`
- Modify: `src/app/routes.tsx`
- Modify: `src/shared/components/Header.tsx`

- [ ] **Step 1: 등록 페이지 작성**

Create `src/app/card/pages/CardRegister.tsx`:

```tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ImagePlus, Library } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/auth/context/AuthContext";
import { createCard, createCardWithImage } from "@/api/card/cardApi";
import { SeriesSetFilter, type SeriesSetSelection } from "@/app/card/components/SeriesSetFilter";
import type { CardCategory, CardGrade, CreateCardRequest } from "@/types/card.types";

const CATEGORIES: { label: string; value: CardCategory }[] = [
  { label: "포켓몬", value: "POKEMON" },
  { label: "트레이너", value: "TRAINERS" },
  { label: "에너지", value: "ENERGY" },
];

const GRADES: { label: string; value: CardGrade }[] = [
  { label: "PSA 10", value: "PSA_10" },
  { label: "PSA 9", value: "PSA_9" },
  { label: "BGS 10", value: "BGS_10" },
];

export function CardRegister() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [sel, setSel] = useState<SeriesSetSelection>({ series: null, set: null });
  const [name, setName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [rarity, setRarity] = useState("");
  const [category, setCategory] = useState<CardCategory>("POKEMON");
  const [grade, setGrade] = useState<CardGrade>("PSA_10");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sel.series || !sel.set) {
      toast.error("시리즈와 세트를 선택해주세요.");
      return;
    }
    if (!name.trim() || !cardNumber.trim() || !rarity.trim()) {
      toast.error("카드명, 카드번호, 레어도를 입력해주세요.");
      return;
    }

    const req: CreateCardRequest = {
      name: name.trim(),
      series: sel.series.name,
      setId: sel.set.setId,
      setName: sel.set.name,
      cardNumber: cardNumber.trim(),
      rarity: rarity.trim(),
      category,
      grade,
      source: "MANUAL",
    };

    setIsSubmitting(true);
    try {
      if (imageFile) await createCardWithImage(req, imageFile);
      else await createCard(req);
      toast.success("🎉 등록 완료! 관리자 승인 후 도감에 추가됩니다.");
      navigate("/cards");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "w-full border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-[#CC0000] transition-colors";

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white py-10 border-b border-white/10">
        <div className="container mx-auto px-4 max-w-2xl">
          <button
            onClick={() => navigate("/cards")}
            className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> 카드도감으로
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#CC0000] flex items-center justify-center shrink-0">
              <Library className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#FFCB05]">도감에 카드 추가</h1>
              <p className="text-sm text-white/50 mt-0.5">관리자 승인 후 도감에 등록됩니다.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1.5">시리즈 / 세트 <span className="text-[#CC0000]">*</span></label>
            <SeriesSetFilter includeAll={false} onChange={setSel} />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">카드명 <span className="text-[#CC0000]">*</span></label>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} placeholder="예) 리자몽 ex" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">카드번호 <span className="text-[#CC0000]">*</span></label>
              <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} maxLength={20} placeholder="예) 006/165" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">레어도 <span className="text-[#CC0000]">*</span></label>
              <input value={rarity} onChange={(e) => setRarity(e.target.value)} maxLength={50} placeholder="예) Rare Holo" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">카테고리 <span className="text-[#CC0000]">*</span></label>
              <select value={category} onChange={(e) => setCategory(e.target.value as CardCategory)} className={inputClass}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">등급 <span className="text-[#CC0000]">*</span></label>
              <select value={grade} onChange={(e) => setGrade(e.target.value as CardGrade)} className={inputClass}>
                {GRADES.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">
              <ImagePlus className="w-4 h-4 inline mr-1" />
              카드 이미지 <span className="font-normal text-muted-foreground">(선택)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#CC0000] file:text-white file:text-xs file:font-semibold hover:file:bg-[#aa0000] file:cursor-pointer"
            />
            {imageFile && <p className="text-xs text-muted-foreground mt-1.5">{imageFile.name}</p>}
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-xs text-amber-700 dark:text-amber-300">
            ⚡ 등록 후 관리자 검수를 거쳐 도감에 추가됩니다. 승인 전에는 경매에 사용할 수 없습니다.
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-[#CC0000] hover:bg-[#aa0000] text-white py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
          >
            <Library className="w-4 h-4" />
            {isSubmitting ? "등록 중..." : "도감에 등록하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 라우트 등록**

Modify `src/app/routes.tsx`:

1) import 추가 (line 21 `CardDetail` import 아래):

```tsx
import { CardRegister } from "@/app/card/pages/CardRegister";
```

2) 라우트 추가 (line 46-47 `cards` 라우트들 사이/아래). `cards/register`를 `cards/:cardId`보다 **먼저** 둔다(동적 세그먼트 우선순위 회피):

```tsx
      { path: "cards",           Component: CardCatalog },
      { path: "cards/register",  Component: CardRegister },
      { path: "cards/:cardId",   Component: CardDetail  },
```

- [ ] **Step 3: 네비 링크 추가 (데스크톱 + 모바일)**

Modify `src/shared/components/Header.tsx` — 로그인 사용자에게 "경매 등록" 옆에 "도감 등록" 링크 추가. `Library` 아이콘을 lucide import에 추가.

1) import (line 2):

```tsx
import { Gavel, Library, Menu, User, X } from "lucide-react";
```

2) 데스크톱: line 95-100 `경매 등록` Link 바로 아래(같은 `<Link to="/auctions/new">` 다음)에 추가:

```tsx
                <Link
                  to="/cards/register"
                  className="hidden lg:flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-[#CC0000]/40 text-[#CC0000] hover:bg-[#CC0000]/10 transition-colors"
                >
                  <Library className="w-3.5 h-3.5" /> 도감 등록
                </Link>
```

3) 모바일: line 173-179 모바일 `경매 등록` Link 바로 아래에 추가:

```tsx
                    <Link
                      to="/cards/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#CC0000] hover:bg-[#CC0000]/10 transition-colors"
                    >
                      <Library className="w-4 h-4" /> 도감 등록
                    </Link>
```

- [ ] **Step 4: 빌드로 검증**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 5: 수동 검증 (browse 스킬)**

`npm run dev`로 띄운 뒤 로그인 상태에서 `/cards/register` 접속 → 시리즈/세트 드롭다운이 채워지는지, 필수값 미입력 시 토스트가 뜨는지, 이미지 없이/있이 제출이 각각 동작하는지 확인.

- [ ] **Step 6: Commit**

```bash
git add src/app/card/pages/CardRegister.tsx src/app/routes.tsx src/shared/components/Header.tsx
git commit -m "feat: 도감 카드 등록 페이지 + 라우트 + 네비 링크"
```

---

## Task 5: 경매 폼 카드 소스 정정 (도감 + 검색 + 시리즈/세트 필터 + 페이징)

**Files:**
- Modify: `src/app/auction/pages/AuctionForm.tsx`

핵심: 카드 소스를 `getMyRequests`→`getCards`(도감 전체 ACTIVE)로 교체하고, 클라이언트 필터(`filteredCards`)를 제거한 뒤 서버 검색(`keyword`/`series`/`setName`) + "더 보기" 페이징으로 바꾼다. 시리즈/세트 드롭다운(전체 옵션)을 추가한다.

- [ ] **Step 1: import 교체**

Modify `src/app/auction/pages/AuctionForm.tsx` line 6-9 영역:

```tsx
import { getCards } from "@/api/card/cardApi";
import { createAuction } from "@/api/auction/auctionApi";
import { CardItem } from "@/app/card/components/CardItem";
import { SeriesSetFilter, type SeriesSetSelection } from "@/app/card/components/SeriesSetFilter";
import type { CardResponse, CardGrade } from "@/types/card.types";
```

(`getMyRequests` import 제거, `SeriesSetFilter` import 추가)

- [ ] **Step 2: Step 1 상태 + 로딩 로직 교체**

Modify `AuctionForm.tsx` — 기존 Step1 상태 블록(현재 line 30-34: `cards`/`cardQuery`/`isLoadingCards`/`selectedCard`)과 데이터 로드 effect(현재 line 43-50) 및 클라이언트 필터(현재 line 52-55 `filteredCards`)를 아래로 통째 교체:

```tsx
  // Step 1: card selection — 도감 전체(GET /v1/cards, ACTIVE)에서 검색
  const CARD_PAGE_SIZE = 20;
  const [cards, setCards] = useState<CardResponse[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [seriesName, setSeriesName] = useState<string | undefined>(undefined);
  const [setName, setSetName] = useState<string | undefined>(undefined);
  const [cardPage, setCardPage] = useState(0);
  const [cardTotalPages, setCardTotalPages] = useState(0);
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [isLoadingMoreCards, setIsLoadingMoreCards] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardResponse | null>(null);

  async function loadCards(reset: boolean) {
    const nextPage = reset ? 0 : cardPage + 1;
    if (reset) setIsLoadingCards(true);
    else setIsLoadingMoreCards(true);
    try {
      const res = await getCards({
        keyword: keyword || undefined,
        series: seriesName,
        setName: setName,
        page: nextPage,
        size: CARD_PAGE_SIZE,
      });
      setCards((prev) => (reset ? res.content : [...prev, ...res.content]));
      setCardPage(nextPage);
      setCardTotalPages(res.totalPages);
    } catch {
      toast.error("카드를 불러오지 못했습니다.");
    } finally {
      setIsLoadingCards(false);
      setIsLoadingMoreCards(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    loadCards(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, keyword, seriesName, setName]);

  const hasMoreCards = cardPage + 1 < cardTotalPages;

  function handleFilterChange(sel: SeriesSetSelection) {
    setSeriesName(sel.series?.name);
    setSetName(sel.set?.name);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setKeyword(searchInput.trim());
  }
```

(주의: 기존 `Step 2` 상태들 — title/description/startingPrice/buyoutPrice/isSubmitting — 은 그대로 유지)

- [ ] **Step 3: Step 1 JSX 교체 (검색 + 필터 + 그리드 + 더보기 + 빈 상태)**

Modify `AuctionForm.tsx` — 기존 Step 1 블록(현재 line 148-246, `{step === 1 && ( ... )}`)을 아래로 교체:

```tsx
        {step === 1 && (
          <div className="space-y-6">
            {/* Search + 필터 */}
            <div className="space-y-3">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="카드 이름으로 검색 후 Enter..."
                  className="w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm bg-background focus:outline-none focus:border-[#CC0000] transition-colors"
                />
              </form>
              <SeriesSetFilter includeAll onChange={handleFilterChange} />
            </div>

            {isLoadingCards ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-[2/3] bg-muted rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : cards.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="text-5xl">🔍</div>
                <p className="text-muted-foreground font-medium">검색 결과가 없습니다.</p>
                <p className="text-sm text-muted-foreground">
                  찾는 카드가 도감에 없다면{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/cards/register")}
                    className="text-[#CC0000] font-semibold underline underline-offset-2"
                  >
                    도감에 카드 추가
                  </button>
                  를 해보세요.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                  {cards.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => handleSelectCard(card)}
                      className={`group relative text-left rounded-2xl transition-all ${
                        selectedCard?.id === card.id
                          ? "ring-2 ring-[#CC0000] ring-offset-2 ring-offset-background"
                          : "hover:ring-2 hover:ring-white/20 hover:ring-offset-2 hover:ring-offset-background"
                      }`}
                    >
                      {card.imageUrl ? (
                        <CardItem
                          imageUrl={card.imageUrl}
                          name={card.name}
                          grade={card.grade as CardGrade}
                          className="w-full"
                        />
                      ) : (
                        <div className="aspect-[2/3] rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex items-center justify-center text-4xl border border-white/10">
                          💰
                        </div>
                      )}
                      <div className="mt-2 px-1">
                        <p className="text-xs font-semibold truncate">{card.name}</p>
                        <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded border mt-1 ${gradeBadgeClass(card.grade)}`}>
                          {gradeLabel(card.grade)}
                        </span>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{card.setName}</p>
                      </div>
                      {selectedCard?.id === card.id && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#CC0000] flex items-center justify-center shadow-lg">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {hasMoreCards && (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => loadCards(false)}
                      disabled={isLoadingMoreCards}
                      className="px-6 py-2.5 rounded-xl border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      {isLoadingMoreCards ? "불러오는 중…" : "더 보기"}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Selected preview + next */}
            {selectedCard && (
              <div className="sticky bottom-4">
                <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 shadow-2xl">
                  <div className="flex items-center gap-3 min-w-0">
                    {selectedCard.imageUrl && (
                      <img
                        src={selectedCard.imageUrl}
                        alt={selectedCard.name}
                        className="w-10 h-14 rounded-lg object-cover shrink-0 border border-white/10"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs text-white/50">선택된 카드</p>
                      <p className="text-sm font-bold text-white truncate">{selectedCard.name}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${gradeBadgeClass(selectedCard.grade)}`}>
                        {gradeLabel(selectedCard.grade)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-[#CC0000] hover:bg-[#aa0000] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shrink-0"
                  >
                    다음 <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
```

- [ ] **Step 4: 빌드로 검증**

Run: `npm run build`
Expected: 성공. (사용하지 않게 된 변수/임포트가 없는지 확인 — `getMyRequests`, `cardQuery`, `filteredCards` 잔존 시 제거)

- [ ] **Step 5: 수동 검증 (browse 스킬)**

서로 다른 두 계정으로 `/auctions/new` 접속 → **동일한 카드 목록**이 보이는지 확인(소스 정정 검증). 시리즈 선택 시 세트가 cascading 되는지, "전체" 기본값, 키워드 검색, "더 보기" 페이징, 카드 선택→2단계 진행이 정상인지 확인.

- [ ] **Step 6: Commit**

```bash
git add src/app/auction/pages/AuctionForm.tsx
git commit -m "fix: 경매 폼 카드 소스를 도감(getCards)으로 정정 + 시리즈/세트 필터·검색·페이징"
```

---

## Self-Review 결과

**Spec coverage:**
- 경매 폼 소스 정정(getMyRequests→getCards) → Task 5 ✅
- 서버 검색 + 더보기 페이징 → Task 5 ✅
- 시리즈/세트 드롭다운 + "전체" 기본값 + cascading + 시리즈 변경 시 세트 리셋 → Task 2(컴포넌트) + Task 5(연결) ✅
- 신규 getSeries/getSets + 30일 캐시 → Task 1 ✅
- 도감 등록 페이지(/cards/register), 시리즈·세트 드롭다운으로 setId/setName/series 자동 채움, 수동 입력 필드, 선택 이미지 업로드 → Task 4 ✅
- tcgdexId=null, source=MANUAL → Task 4(req 구성에서 tcgdexId 생략, source "MANUAL") ✅
- createCard / createCardWithImage 분기 → Task 3 + Task 4 ✅
- 진입점 링크(네비 + 경매폼 빈 상태) → Task 4(Header) + Task 5(빈 상태 링크) ✅
- 빈 상태 문구 수정 → Task 5 ✅

**Placeholder scan:** 모든 step에 실제 코드/명령 포함. TODO/TBD 없음.

**Type consistency:** `SeriesSetSelection { series, set }`는 Task 2 정의를 Task 4/5에서 동일하게 사용. `getCards`는 `CardSearchParams`(keyword/series/setName/page/size) — 기존 시그니처와 일치. `CreateCardRequest`는 기존 타입(tcgdexId 옵셔널) 그대로 사용. `getCachedSeries/getCachedSets` 이름 Task 1↔2 일치.
