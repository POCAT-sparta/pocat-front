/**
 * 백엔드가 내려간 상태에서 카드/경매 관련 GET 요청을 더미 데이터로 응답한다.
 *
 * apiClient.request 에서 USE_MOCK 이 켜져 있을 때 이 resolver 를 먼저 호출한다.
 * 매칭되는 경로가 있으면 ApiResponse 형태로 감싸 반환하고, 없으면 null 을 돌려
 * 실제 fetch 로 넘어가게 한다.
 */
import type { ApiResponse, PageResponse } from "@/shared/types/api.ts";
import type { CardResponse } from "@/types/card.types";
import type { AuctionListItem, BidItem } from "@/types/auction.types";
import {
  mockCards,
  mockAuctionListItems,
  mockAuctionDetails,
  mockBidsByAuction,
  mockCardAuctionSummaries,
  mockUser,
  mockSeries,
  mockSets,
  createMockAuction,
  type CreateAuctionBody,
  mockOrderList,
  mockOrderDetail,
  createMockPayment,
  confirmMockPayment,
} from "./mockData";

function ok<T>(data: T): ApiResponse<T> {
  return { status: "SUCCESS", data, message: "OK" };
}

function paginate<T>(items: T[], page: number, size: number): PageResponse<T> {
  const totalElements = items.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const start = page * size;
  return {
    content: items.slice(start, start + size),
    totalElements,
    totalPages,
    size,
    number: page,
  };
}

type SortDir = "asc" | "desc";
function applySort<T>(items: T[], sort: string | null, get: (t: T, field: string) => number | string) {
  if (!sort) return items;
  const [field, dirRaw] = sort.split(",");
  const dir: SortDir = dirRaw === "asc" ? "asc" : "desc";
  return [...items].sort((a, b) => {
    const av = get(a, field);
    const bv = get(b, field);
    let cmp: number;
    if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
    else cmp = String(av).localeCompare(String(bv));
    return dir === "asc" ? cmp : -cmp;
  });
}

function num(v: string | null): number | undefined {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}

function parseBody(body: unknown): Record<string, unknown> {
  if (typeof body !== "string") return {};
  try {
    return JSON.parse(body) as Record<string, unknown>;
  } catch {
    return {};
  }
}

/** 매칭되면 ApiResponse 를 반환, 아니면 null (실제 fetch 로 폴백) */
export function resolveMock(
  method: string,
  rawPath: string,
  body?: unknown
): ApiResponse<unknown> | null {
  const pathOnly = rawPath.split("?")[0].replace(/\/+$/, "");

  // ── 쓰기(POST) — 로그인 / 로그아웃 / 경매 등록 ─────────────────────
  if (method === "POST") {
    if (pathOnly === "/api/v1/auth/login") {
      return ok({ accessToken: "mock-access-token", refreshToken: "mock-refresh-token" });
    }
    if (pathOnly === "/api/v1/auth/logout") {
      return ok(null);
    }
    if (pathOnly === "/api/v1/auctions") {
      const b = parseBody(body);
      const created = createMockAuction({
        cardId: Number(b.cardId),
        title: String(b.title ?? ""),
        description: b.description != null ? String(b.description) : undefined,
        startingPrice: Number(b.startingPrice),
        buyoutPrice: b.buyoutPrice != null ? Number(b.buyoutPrice) : undefined,
      } as CreateAuctionBody);
      return ok(created);
    }
    if (pathOnly === "/api/v1/payments") {
      const b = parseBody(body);
      return ok(createMockPayment(Number(b.orderId)));
    }
    return null;
  }

  // ── 쓰기(PATCH) — 결제 확정 ────────────────────────────────────────
  if (method === "PATCH") {
    const pay = pathOnly.match(/^\/api\/v1\/payments\/(.+)$/);
    if (pay) return ok(confirmMockPayment(decodeURIComponent(pay[1])));
    return null;
  }

  if (method !== "GET") return null;

  const [pathPart, queryPart] = rawPath.split("?");
  const path = pathPart.replace(/\/+$/, "");
  const q = new URLSearchParams(queryPart ?? "");
  const page = num(q.get("page")) ?? 0;
  const size = num(q.get("size")) ?? 20;
  const sort = q.get("sort");

  // ── 인증 / 카탈로그 ────────────────────────────────────────────────
  if (path === "/api/v1/users/me") return ok(mockUser);
  if (path === "/api/v1/series") return ok(mockSeries);
  if (path === "/api/v1/sets") return ok(mockSets);

  // ── 주문 ───────────────────────────────────────────────────────────
  const orderSingle = path.match(/^\/api\/v1\/orders\/(.+)$/);
  if (orderSingle && orderSingle[1] !== "me") {
    const detail = mockOrderDetail(decodeURIComponent(orderSingle[1]));
    if (!detail) return null;
    return ok(detail);
  }
  if (path === "/api/v1/orders/me") {
    const items = mockOrderList(q.get("status") ?? undefined);
    const start = page * size;
    const content = items.slice(start, start + size);
    // 주문은 백엔드 PageResponseDto 형태(pageNumber)를 사용한다.
    return ok({
      content,
      pageNumber: page,
      size,
      totalElements: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / size)),
    });
  }

  // ── /api/v1/cards ...──────────────────────────────────────────────
  const cardAuctions = path.match(/^\/api\/v1\/cards\/(\d+)\/auctions$/);
  if (cardAuctions) {
    const cardId = Number(cardAuctions[1]);
    const content = mockCardAuctionSummaries(cardId);
    return ok(paginate(content, page, size));
  }

  const cardAvg = path.match(/^\/api\/v1\/cards\/(\d+)\/average-price$/);
  if (cardAvg) {
    const cardId = Number(cardAvg[1]);
    const auctionsForCard = mockAuctionDetails.filter((a) => a.cardId === cardId);
    const prices = auctionsForCard
      .map((a) => a.highestPrice)
      .filter((p): p is number => p != null);
    const avg = prices.length
      ? Math.round(prices.reduce((s, p) => s + p, 0) / prices.length)
      : 0;
    const end = new Date();
    const start = new Date(end.getTime() - 30 * 24 * 3_600_000);
    return ok({
      cardId,
      averagePrice: avg,
      transactionCount: prices.length,
      periodStart: start.toISOString().slice(0, 19),
      periodEnd: end.toISOString().slice(0, 19),
    });
  }

  const cardSingle = path.match(/^\/api\/v1\/cards\/(\d+)$/);
  if (cardSingle) {
    const card = mockCards.find((c) => c.id === Number(cardSingle[1]));
    if (!card) return null;
    return ok(card);
  }

  if (path === "/api/v1/cards") {
    let items = mockCards.slice();
    const keyword = q.get("keyword");
    const setName = q.get("setName");
    const series = q.get("series");
    const grade = q.get("grade");
    const category = q.get("category");
    if (keyword) items = items.filter((c) => c.name.toLowerCase().includes(keyword.toLowerCase()));
    if (setName) items = items.filter((c) => c.setName === setName);
    if (series) items = items.filter((c) => c.series === series);
    if (grade) items = items.filter((c) => c.grade === grade);
    if (category) items = items.filter((c) => c.category === category);
    items = applySort(items, sort, (c, f) => {
      if (f === "createdAt") return c.createdAt;
      if (f === "name") return c.name;
      return c.id;
    }) as CardResponse[];
    // 목록 조회는 계약상 activeAuction 을 채우지 않는다 (activeAuctionCount 만).
    const listItems = items.map((c) => ({ ...c, activeAuction: null }));
    return ok(paginate(listItems, page, size));
  }

  // ── /api/v1/auctions ...───────────────────────────────────────────
  if (path === "/api/v1/auctions/popular") {
    // 인기 경매: 진행 중 경매를 최고 입찰가 높은 순으로
    const popular = mockAuctionListItems
      .filter((a) => a.status === "ACTIVE")
      .sort((a, b) => (b.highestPrice ?? 0) - (a.highestPrice ?? 0))
      .slice(0, size);
    return ok(popular);
  }

  const auctionBids = path.match(/^\/api\/v1\/auctions\/(\d+)\/bids$/);
  if (auctionBids) {
    const auctionId = Number(auctionBids[1]);
    const bids: BidItem[] = mockBidsByAuction[auctionId] ?? [];
    return ok(paginate(bids, page, size));
  }

  const auctionSingle = path.match(/^\/api\/v1\/auctions\/(\d+)$/);
  if (auctionSingle) {
    const detail = mockAuctionDetails.find((a) => a.auctionId === Number(auctionSingle[1]));
    if (!detail) return null;
    return ok(detail);
  }

  if (path === "/api/v1/auctions") {
    let items = mockAuctionListItems.slice();
    const keyword = q.get("keyword");
    const series = q.get("series");
    const setName = q.get("setName");
    const grade = q.get("grade");
    const category = q.get("category");
    const status = q.get("status");
    if (keyword) items = items.filter((a) => a.cardName.toLowerCase().includes(keyword.toLowerCase()) || a.title.toLowerCase().includes(keyword.toLowerCase()));
    if (grade) items = items.filter((a) => a.grade === grade);
    if (status) items = items.filter((a) => a.status === status);
    // series/setName/category 는 카드 기준 필터
    if (series || setName || category) {
      items = items.filter((a) => {
        const card = mockCards.find((c) => c.id === a.cardId);
        if (!card) return false;
        if (series && card.series !== series) return false;
        if (setName && card.setName !== setName) return false;
        if (category && card.category !== category) return false;
        return true;
      });
    }
    items = applySort(items, sort, (a, f) => {
      if (f === "endedAt") return a.endedAt;
      if (f === "startedAt") return a.startedAt;
      if (f === "highestPrice") return a.highestPrice ?? 0;
      if (f === "startingPrice") return a.startingPrice;
      if (f === "buyoutPrice") return a.buyoutPrice;
      return a.auctionId;
    }) as AuctionListItem[];
    return ok(paginate(items, page, size));
  }

  return null;
}
