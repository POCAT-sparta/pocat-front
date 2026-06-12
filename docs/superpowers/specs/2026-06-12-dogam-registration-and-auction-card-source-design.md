# 도감 카드 등록 & 경매 카드 소스 정정 — 설계

작성일: 2026-06-12

## 배경 / 문제

경매 등록 화면에서 **계정마다 선택 가능한 카드가 다르게 보이는** 문제가 보고됨.
백엔드를 추적한 결과, 의도한 도메인 모델과 프론트 구현이 어긋나 있었음.

### 의도한 모델 (= 백엔드 설계와 일치)

| 개념 | 백엔드 근거 | 의미 |
|---|---|---|
| **경매 등록 = 도감 카드로 등록** | `AuctionCommandService.createAuction(sellerId, …)` → `validateRegistrableForAuction(cardId)`는 **ACTIVE 여부만 검사, 소유자 검사 없음** (`CardQueryService.java:248-254`) | 누구나 도감의 ACTIVE 카드면 경매를 열 수 있음 |
| **유저 카드 등록 = 도감에 카드 추가** | `createCard` → `status=PENDING` → 관리자 `approveCard` → `ACTIVE` → 도감(`GET /v1/cards`는 ACTIVE만 노출)에 등장 | 개인 인벤토리가 아니라 공용 도감 기여 |

### 현재 프론트의 어긋남

1. **경매 폼** `AuctionForm.tsx:46`이 `getMyRequests({status:"ACTIVE"})`(= "내가 등록해 승인된 카드")를 조회 → 계정마다 다르게 보이는 원인. **도감 전체(`getCards`)를 봐야 함.**
2. **도감 추가(카드 등록) UI 부재** — `createCard` API는 존재하나 호출하는 화면이 없음.

### 관련 백엔드 제약 / 사실

- `cards` 테이블에 **`tcgdex_id` UNIQUE 제약** (`Card.java`). → 유저 수동 등록 시 `tcgdexId = null` 로 보내야 함(NULL은 중복 허용).
- `getCards`의 `series` / `setName` 필터는 **이름(name) 문자열**을 `equalsIgnoreCase`로 매칭 (`CardRepositoryImpl.java:60-64`). → 드롭다운에서 고른 name을 그대로 전달.
- 도감은 TCGdex 전체가 동기화돼 있어 카드 수가 많음 → 클라이언트 필터가 아닌 **서버 검색 + 페이징** 필요.

## 범위

두 가지 작업을 모두 진행한다.

1. 경매 폼 카드 소스 정정 + 시리즈/세트 필터 추가
2. 도감 카드 등록 전용 페이지 신설

---

## 작업 1 — 경매 폼 카드 소스 정정 (`AuctionForm.tsx`)

### 변경

- 1단계 카드 선택의 데이터 소스를 `getMyRequests` → **`getCards`(GET /v1/cards, ACTIVE 도감 전체)** 로 교체.
- **서버 검색 + "더 보기" 페이징** 도입 (도감 페이지 `CardCatalog.tsx`와 동일 패턴): `getCards({ keyword, series, setName, page, size })`.
- 빈 상태 문구를 "등록된 카드가 없습니다 / 먼저 카드를 등록·승인…" → **"검색 결과가 없습니다"** 류로 수정.
- 이후 흐름(카드 선택 → 2단계 가격 입력 → `createAuction({ cardId: selectedCard.id, … })`)은 유지.

### 시리즈 / 세트 드롭다운 필터

- **시리즈 드롭다운** + **세트 드롭다운**(시리즈 선택에 따라 cascading)을 카드 검색 영역에 추가.
- 각 드롭다운 **맨 앞(index 0)에 "전체"** 옵션, **기본 선택값 = "전체"**(필터 미적용 → 도감 전체 노출).
- 시리즈 변경 시 세트 선택은 "전체"로 리셋.
- 표기는 `nameKo`가 있으면 우선, 없으면 `name`. **getCards에 전달하는 값은 `name`**(백엔드가 name으로 매칭).
- 선택값을 `getCards({ series: 선택한 series.name | undefined, setName: 선택한 set.name | undefined, keyword, page, size })`로 전달.

### 신규 프론트 API + 캐싱

신규 모듈 `src/api/catalog/catalogApi.ts` (또는 기존 구조에 맞춰 배치):

- `getSeries(): Promise<SeriesResponse[]>` → `GET /api/v1/series` (`skipAuth`)
- `getSets(): Promise<PokemonSetResponse[]>` → `GET /api/v1/sets` 전체 1회 (`skipAuth`).
  세트 드롭다운은 응답의 `seriesId`로 **클라이언트 필터** (seriesId 쿼리 재호출 불필요).

타입 (`src/types/catalog.types.ts`):

```ts
export interface SeriesResponse { id: number; name: string; nameKo: string | null; }
export interface PokemonSetResponse {
  id: number; setId: string; name: string; nameKo: string | null; seriesId: number | null;
}
```

**캐싱** — 변화가 거의 없는 데이터:

- `localStorage`에 `{ data, cachedAt }` 저장, **TTL 30일**.
- 신선하면 네트워크 없이 캐시 사용, 만료/없음이면 1회 fetch 후 저장.
- 키: `pocat:series:v1`, `pocat:sets:v1`.
- 작은 헬퍼(`getCachedSeries`, `getCachedSets`)로 캡슐화. 파싱 실패/만료 시 fetch fallback.

---

## 작업 2 — 도감 카드 등록 페이지 (신규)

### 라우트 / 진입점

- 라우트 `cards/register` → `Component: CardRegister` (Root 하위, 기존 `{ path, Component }` 패턴).
- 인증: 컴포넌트 진입 시 미로그인이면 `/login`으로 (기존 `AuctionForm`과 동일 방식).
- 진입점 링크: 네비게이션 + 도감(`CardCatalog`) 상단. 경매 폼 빈/검색 화면에도 "도감에 카드 추가" 링크.

### 입력 폼 (`CreateCardRequest` 충족)

`CreateCardRequest`: `tcgdexId?, name, series, setId, setName, cardNumber, rarity, category, grade, imageUrl?, source` (name/series/setId/setName/cardNumber/rarity/category/grade/source 필수).

폼 구성:

- **시리즈 / 세트**: 작업 1에서 만든 캐시된 드롭다운 재사용(여기서는 "전체" 없이 실제 항목 선택). 세트 선택 시 `setId`, `setName`, 그리고 시리즈 `name`(`series`)을 자동 채움. → 사용자가 setId 코드를 몰라도 됨. 백엔드 `findOrCreate`와도 정합.
- **카드명(name)**: 텍스트 입력.
- **카드번호(cardNumber)**: 텍스트 입력.
- **레어도(rarity)**: 텍스트 입력.
- **카테고리(category)**: 드롭다운 (POKEMON / TRAINERS / ENERGY).
- **등급(grade)**: 드롭다운 (PSA_10 / PSA_9 / BGS_10).
- **이미지**: 선택적 업로드.

> 결정 메모: 직전 논의에서 등록 = "수동 입력"으로 정했으나, `setId`는 일반 사용자가 알기 어려운 코드라 시리즈/세트만은 캐시 드롭다운으로 선택해 자동 채운다(외부 TCGdex 호출 아님, 우리 데이터 재사용). 카드명·번호·레어도·등급·이미지는 수동 입력. 완전 자유 입력(신규 시리즈/세트 직접 타이핑)이 필요하면 검토 시 알려줄 것.

### 제출

- 이미지 **없음** → `POST /v1/cards` (`createCard`, JSON), `imageUrl` 생략.
- 이미지 **있음** → `POST /v1/cards/upload` (`createCardWithImage`, multipart: `image` 파트 + `request` 파트).
- 공통 고정값: `tcgdexId = null`, `source = "MANUAL"`.
- `cardApi.ts`에 `createCardWithImage(request, imageFile)` 함수 추가 (`createCard`는 기존).

### 결과 처리

- 성공 시 토스트 "관리자 승인 후 도감에 추가됩니다" + 폼 리셋 또는 도감으로 이동.
- 레이트리밋(`RATE_LIMIT_EXCEEDED`) 등 에러 메시지 토스트 노출.

---

## 컴포넌트 / 책임 경계

- `src/api/catalog/catalogApi.ts` — series/sets fetch.
- `src/app/card/lib/catalogCache.ts` — 30일 localStorage 캐시 헬퍼.
- `src/types/catalog.types.ts` — Series/Set 타입.
- `src/app/card/components/SeriesSetFilter.tsx`(가칭) — 시리즈/세트 드롭다운(전체 옵션 토글 가능). 경매 폼·등록 폼에서 공유.
- `src/app/card/pages/CardRegister.tsx` — 등록 페이지.
- `AuctionForm.tsx` — 카드 소스/검색/필터 수정.
- `cardApi.ts` — `createCardWithImage` 추가.
- `routes.tsx` — `cards/register` 라우트 추가.

## 에러 / 엣지

- series/sets fetch 실패 → 드롭다운은 "전체"만 노출(필터 없이 진행 가능), 캐시 미저장.
- 도감이 비어 검색 결과 0건 → "검색 결과가 없습니다" 안내.
- 등록 폼 필수값 미입력 → 제출 차단 + 안내.
- 이미지 용량/형식은 백엔드 정책에 위임(별도 클라 제한 없음, 필요 시 추가).

## 테스트 관점

- 경매 폼: 두 계정으로 동일 도감 카드 목록이 보이는지(소스 정정 검증).
- 시리즈→세트 cascading, "전체" 기본값, 시리즈 변경 시 세트 리셋.
- 캐시: 최초 fetch 후 30일 내 재방문 시 네트워크 미발생, 만료 시 재요청.
- 등록: 이미지 유/무 각각 올바른 엔드포인트 호출, `tcgdexId=null`·`source=MANUAL` 전송, 성공 후 PENDING.

## 비범위 (YAGNI)

- 내 등록 현황(my-requests) 조회 화면 — 이번 범위 제외.
- 신규 시리즈/세트 자유 입력 — 이번 범위 제외(드롭다운 선택만).
- 마스터 카드 grade가 더미 라운드로빈인 점은 기존 데이터 이슈로, 본 작업에서 다루지 않음.
