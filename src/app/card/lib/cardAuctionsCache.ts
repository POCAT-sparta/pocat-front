import { getCardAuctions } from "@/api/card/cardApi";
import type { ActiveAuctionSummary } from "@/types/card.types";

/**
 * 카드별 진행 중 경매 미리보기 캐시.
 * hover 툴팁이 마우스를 올릴 때마다 호출하지 않도록 카드당 1회만 가져오고,
 * 동시에 여러 번 요청돼도 in-flight 프로미스를 공유한다.
 */
const cache = new Map<number, ActiveAuctionSummary[]>();
const inflight = new Map<number, Promise<ActiveAuctionSummary[]>>();

export function getCachedCardAuctions(cardId: number): ActiveAuctionSummary[] | undefined {
  return cache.get(cardId);
}

export function loadCardAuctions(cardId: number): Promise<ActiveAuctionSummary[]> {
  const cached = cache.get(cardId);
  if (cached) return Promise.resolve(cached);

  const existing = inflight.get(cardId);
  if (existing) return existing;

  const promise = getCardAuctions(cardId, 0, 5)
    .then((list) => {
      cache.set(cardId, list);
      inflight.delete(cardId);
      return list;
    })
    .catch((err) => {
      inflight.delete(cardId);
      throw err;
    });

  inflight.set(cardId, promise);
  return promise;
}
