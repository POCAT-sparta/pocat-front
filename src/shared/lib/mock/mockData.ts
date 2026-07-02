/**
 * 백엔드 서버가 내려간 상태에서 카드/경매 화면을 시연하기 위한 더미 데이터.
 *
 * 카드 정보는 tcgDex(https://tcgdex.dev) 에서 가져온 실제 카드 20종을 seed 로 사용한다.
 * 경매/입찰 정보는 이 카드들을 기반으로 생성한다.
 *
 * 시간 필드는 백엔드 규칙(무표기 = UTC 벽시계, @/shared/lib/datetime 참고)에 맞춰
 * 타임존 표기 없이 UTC 벽시계 문자열로 만든다. 카운트다운이 실시간으로 보이도록
 * 모듈 로드 시점의 현재 시각을 기준으로 계산한다.
 */
import type {
  CardResponse,
  CardGrade,
  ActiveAuctionSummary,
} from "@/types/card.types";
import type {
  AuctionDetail,
  AuctionListItem,
  AuctionStatus,
  BidItem,
} from "@/types/auction.types";

interface CardSeed {
  tcgdexId: string;
  name: string;
  series: string;
  setId: string;
  setName: string;
  cardNumber: string;
  rarity: string;
  category: CardResponse["category"];
  image: string;
}

// tcgDex 에서 가져온 실제 카드 20종 (Silver Tempest / Lost Origin / Obsidian Flames)
const CARD_SEED: CardSeed[] = [
  {"tcgdexId":"swsh12-007","name":"Serperior V","series":"Silver Tempest","setId":"swsh12","setName":"Silver Tempest","cardNumber":"007","rarity":"Holo Rare V","category":"POKEMON","image":"https://assets.tcgdex.net/en/swsh/swsh12/007/high.png"},
  {"tcgdexId":"swsh12-008","name":"Serperior VSTAR","series":"Silver Tempest","setId":"swsh12","setName":"Silver Tempest","cardNumber":"008","rarity":"Holo Rare VSTAR","category":"POKEMON","image":"https://assets.tcgdex.net/en/swsh/swsh12/008/high.png"},
  {"tcgdexId":"swsh12-015","name":"Chesnaught V","series":"Silver Tempest","setId":"swsh12","setName":"Silver Tempest","cardNumber":"015","rarity":"Holo Rare V","category":"POKEMON","image":"https://assets.tcgdex.net/en/swsh/swsh12/015/high.png"},
  {"tcgdexId":"swsh12-024","name":"Reshiram V","series":"Silver Tempest","setId":"swsh12","setName":"Silver Tempest","cardNumber":"024","rarity":"Holo Rare V","category":"POKEMON","image":"https://assets.tcgdex.net/en/swsh/swsh12/024/high.png"},
  {"tcgdexId":"swsh12-033","name":"Alolan Vulpix V","series":"Silver Tempest","setId":"swsh12","setName":"Silver Tempest","cardNumber":"033","rarity":"Holo Rare V","category":"POKEMON","image":"https://assets.tcgdex.net/en/swsh/swsh12/033/high.png"},
  {"tcgdexId":"swsh12-034","name":"Alolan Vulpix VSTAR","series":"Silver Tempest","setId":"swsh12","setName":"Silver Tempest","cardNumber":"034","rarity":"Holo Rare VSTAR","category":"POKEMON","image":"https://assets.tcgdex.net/en/swsh/swsh12/034/high.png"},
  {"tcgdexId":"swsh12-035","name":"Omastar V","series":"Silver Tempest","setId":"swsh12","setName":"Silver Tempest","cardNumber":"035","rarity":"Holo Rare V","category":"POKEMON","image":"https://assets.tcgdex.net/en/swsh/swsh12/035/high.png"},
  {"tcgdexId":"swsh12-057","name":"Regieleki V","series":"Silver Tempest","setId":"swsh12","setName":"Silver Tempest","cardNumber":"057","rarity":"Holo Rare V","category":"POKEMON","image":"https://assets.tcgdex.net/en/swsh/swsh12/057/high.png"},
  {"tcgdexId":"swsh11-027","name":"Delphox V","series":"Lost Origin","setId":"swsh11","setName":"Lost Origin","cardNumber":"027","rarity":"Holo Rare V","category":"POKEMON","image":"https://assets.tcgdex.net/en/swsh/swsh11/027/high.png"},
  {"tcgdexId":"swsh11-048","name":"Kyurem V","series":"Lost Origin","setId":"swsh11","setName":"Lost Origin","cardNumber":"048","rarity":"Holo Rare V","category":"POKEMON","image":"https://assets.tcgdex.net/en/swsh/swsh11/048/high.png"},
  {"tcgdexId":"swsh11-049","name":"Kyurem VMAX","series":"Lost Origin","setId":"swsh11","setName":"Lost Origin","cardNumber":"049","rarity":"Holo Rare VMAX","category":"POKEMON","image":"https://assets.tcgdex.net/en/swsh/swsh11/049/high.png"},
  {"tcgdexId":"swsh11-056","name":"Magnezone V","series":"Lost Origin","setId":"swsh11","setName":"Lost Origin","cardNumber":"056","rarity":"Holo Rare V","category":"POKEMON","image":"https://assets.tcgdex.net/en/swsh/swsh11/056/high.png"},
  {"tcgdexId":"swsh11-057","name":"Magnezone VSTAR","series":"Lost Origin","setId":"swsh11","setName":"Lost Origin","cardNumber":"057","rarity":"Holo Rare VSTAR","category":"POKEMON","image":"https://assets.tcgdex.net/en/swsh/swsh11/057/high.png"},
  {"tcgdexId":"swsh11-058","name":"Rotom V","series":"Lost Origin","setId":"swsh11","setName":"Lost Origin","cardNumber":"058","rarity":"Holo Rare V","category":"POKEMON","image":"https://assets.tcgdex.net/en/swsh/swsh11/058/high.png"},
  {"tcgdexId":"swsh11-082","name":"Enamorus V","series":"Lost Origin","setId":"swsh11","setName":"Lost Origin","cardNumber":"082","rarity":"Holo Rare V","category":"POKEMON","image":"https://assets.tcgdex.net/en/swsh/swsh11/082/high.png"},
  {"tcgdexId":"swsh11-092","name":"Aerodactyl V","series":"Lost Origin","setId":"swsh11","setName":"Lost Origin","cardNumber":"092","rarity":"Holo Rare V","category":"POKEMON","image":"https://assets.tcgdex.net/en/swsh/swsh11/092/high.png"},
  {"tcgdexId":"sv03-015","name":"Decidueye ex","series":"Obsidian Flames","setId":"sv03","setName":"Obsidian Flames","cardNumber":"015","rarity":"Double rare","category":"POKEMON","image":"https://assets.tcgdex.net/en/sv/sv03/015/high.png"},
  {"tcgdexId":"sv03-022","name":"Toedscruel ex","series":"Obsidian Flames","setId":"sv03","setName":"Obsidian Flames","cardNumber":"022","rarity":"Double rare","category":"POKEMON","image":"https://assets.tcgdex.net/en/sv/sv03/022/high.png"},
  {"tcgdexId":"sv03-033","name":"Victini ex","series":"Obsidian Flames","setId":"sv03","setName":"Obsidian Flames","cardNumber":"033","rarity":"Double rare","category":"POKEMON","image":"https://assets.tcgdex.net/en/sv/sv03/033/high.png"},
  {"tcgdexId":"sv03-042","name":"Eiscue ex","series":"Obsidian Flames","setId":"sv03","setName":"Obsidian Flames","cardNumber":"042","rarity":"Double rare","category":"POKEMON","image":"https://assets.tcgdex.net/en/sv/sv03/042/high.png"},
];

const GRADES: CardGrade[] = ["PSA_10", "PSA_9", "BGS_10"];
const NICKNAMES = [
  "레드", "그린", "블루", "오박사", "웅", "이슬", "봉이", "체렌",
  "벨", "지우", "로켓단원", "단델", "홉", "마리", "로즈", "피오니",
];

const HOUR = 3_600_000;
const now = Date.now();

/** UTC 벽시계 문자열(타임존 표기 없음) — 백엔드 LocalDateTime 형식과 맞춘다. */
function utcWallClock(ms: number): string {
  return new Date(ms).toISOString().slice(0, 19);
}

// ── 카드 ──────────────────────────────────────────────────────────────────
export const mockCards: CardResponse[] = CARD_SEED.map((seed, i) => ({
  id: i + 1,
  userId: 100 + (i % 5),
  tcgdexId: seed.tcgdexId,
  name: seed.name,
  series: seed.series,
  setId: seed.setId,
  setName: seed.setName,
  cardNumber: seed.cardNumber,
  rarity: seed.rarity,
  category: seed.category,
  grade: GRADES[i % GRADES.length],
  imageUrl: seed.image,
  source: "TCGDEX",
  status: "ACTIVE",
  // 최근 등록 카드가 자연스러운 순서로 보이도록 최신 카드일수록 최근에 등록
  createdAt: utcWallClock(now - (CARD_SEED.length - i) * 6 * HOUR),
  updatedAt: utcWallClock(now - (CARD_SEED.length - i) * 6 * HOUR),
  activeAuction: null,
  activeAuctionCount: 0,
}));

// ── 경매 ──────────────────────────────────────────────────────────────────
interface AuctionPlan {
  cardIndex: number;
  status: AuctionStatus;
  startingPrice: number;
  buyoutPrice: number;
  /** 최고 입찰가 (입찰 없으면 null) */
  highestPrice: number | null;
  /** 시작 시각 (현재 기준 상대 시간, 시 단위) */
  startOffsetH: number;
  /** 종료 시각 (현재 기준 상대 시간, 시 단위 / 음수면 이미 종료) */
  endOffsetH: number;
}

// 앞쪽 카드는 진행 중 경매, 뒤쪽 일부는 종료/유찰 경매로 구성한다.
const AUCTION_PLANS: AuctionPlan[] = [
  { cardIndex: 0,  status: "ACTIVE",    startingPrice: 50_000,  buyoutPrice: 250_000, highestPrice: 120_000, startOffsetH: -20, endOffsetH: 2 },
  { cardIndex: 1,  status: "ACTIVE",    startingPrice: 150_000, buyoutPrice: 600_000, highestPrice: 320_000, startOffsetH: -30, endOffsetH: 5 },
  { cardIndex: 2,  status: "ACTIVE",    startingPrice: 40_000,  buyoutPrice: 200_000, highestPrice: null,    startOffsetH: -3,  endOffsetH: 9 },
  { cardIndex: 3,  status: "ACTIVE",    startingPrice: 80_000,  buyoutPrice: 350_000, highestPrice: 145_000, startOffsetH: -26, endOffsetH: 13 },
  { cardIndex: 4,  status: "ACTIVE",    startingPrice: 35_000,  buyoutPrice: 180_000, highestPrice: 62_000,  startOffsetH: -10, endOffsetH: 20 },
  { cardIndex: 5,  status: "ACTIVE",    startingPrice: 130_000, buyoutPrice: 550_000, highestPrice: null,    startOffsetH: -2,  endOffsetH: 27 },
  { cardIndex: 6,  status: "ACTIVE",    startingPrice: 45_000,  buyoutPrice: 220_000, highestPrice: 88_000,  startOffsetH: -40, endOffsetH: 33 },
  { cardIndex: 7,  status: "ACTIVE",    startingPrice: 60_000,  buyoutPrice: 300_000, highestPrice: 175_000, startOffsetH: -50, endOffsetH: 44 },
  { cardIndex: 8,  status: "ACTIVE",    startingPrice: 55_000,  buyoutPrice: 260_000, highestPrice: null,    startOffsetH: -1,  endOffsetH: 52 },
  { cardIndex: 9,  status: "ACTIVE",    startingPrice: 90_000,  buyoutPrice: 400_000, highestPrice: 210_000, startOffsetH: -60, endOffsetH: 61 },
  { cardIndex: 10, status: "ACTIVE",    startingPrice: 120_000, buyoutPrice: 520_000, highestPrice: 260_000, startOffsetH: -70, endOffsetH: 68 },
  { cardIndex: 11, status: "ACTIVE",    startingPrice: 70_000,  buyoutPrice: 330_000, highestPrice: null,    startOffsetH: -4,  endOffsetH: 71 },
  { cardIndex: 12, status: "ENDED",     startingPrice: 100_000, buyoutPrice: 450_000, highestPrice: 380_000, startOffsetH: -100, endOffsetH: -6 },
  { cardIndex: 13, status: "ENDED",     startingPrice: 65_000,  buyoutPrice: 280_000, highestPrice: 240_000, startOffsetH: -120, endOffsetH: -24 },
  { cardIndex: 14, status: "NO_BIDDER", startingPrice: 200_000, buyoutPrice: 700_000, highestPrice: null,    startOffsetH: -90,  endOffsetH: -12 },
  { cardIndex: 15, status: "NO_BIDDER", startingPrice: 160_000, buyoutPrice: 620_000, highestPrice: null,    startOffsetH: -80,  endOffsetH: -30 },
];

function titleFor(card: CardResponse): string {
  return `${card.grade.replace("_", " ")} ${card.name} ${card.setName}`;
}

// 입찰 내역: 시작가에서 최고가까지 여러 명이 올려가며 입찰한 것으로 생성
function buildBids(auctionId: number, plan: AuctionPlan, endedMs: number): BidItem[] {
  if (plan.highestPrice == null) return [];
  const steps = 4;
  const bids: BidItem[] = [];
  const lo = plan.startingPrice;
  const hi = plan.highestPrice;
  for (let k = 0; k < steps; k++) {
    const price = Math.round((lo + ((hi - lo) * (k + 1)) / steps) / 1000) * 1000;
    bids.push({
      bidId: auctionId * 100 + k,
      bidderId: 200 + ((auctionId + k) % NICKNAMES.length),
      bidderNickname: NICKNAMES[(auctionId + k) % NICKNAMES.length],
      bidPrice: k === steps - 1 ? hi : price,
      // 종료 시각 이전, 최근 입찰일수록 뒤쪽 시간
      createdAt: utcWallClock(endedMs - (steps - k) * 90 * 60_000),
    });
  }
  // 최신순(내림차순)으로 반환
  return bids.reverse();
}

const auctionListItems: AuctionListItem[] = [];
const auctionDetails: AuctionDetail[] = [];
const bidsByAuction: Record<number, BidItem[]> = {};

AUCTION_PLANS.forEach((plan, idx) => {
  const auctionId = idx + 1;
  const card = mockCards[plan.cardIndex];
  const startedMs = now + plan.startOffsetH * HOUR;
  const endedMs = now + plan.endOffsetH * HOUR;
  const startedAt = utcWallClock(startedMs);
  const endedAt = utcWallClock(endedMs);
  const bids = buildBids(auctionId, plan, endedMs);
  bidsByAuction[auctionId] = bids;

  const listItem: AuctionListItem = {
    auctionId,
    title: titleFor(card),
    cardId: card.id,
    cardName: card.name,
    grade: card.grade,
    cardImageUrl: card.imageUrl,
    startingPrice: plan.startingPrice,
    buyoutPrice: plan.buyoutPrice,
    highestPrice: plan.highestPrice,
    status: plan.status,
    startedAt,
    endedAt,
  };
  auctionListItems.push(listItem);

  const topBid = bids[0] ?? null;
  auctionDetails.push({
    ...listItem,
    id: auctionId,
    sellerId: card.userId,
    sellerNickname: NICKNAMES[card.userId % NICKNAMES.length],
    description:
      `${card.setName} ${card.name} 입니다.\n` +
      `${card.grade.replace("_", " ")} 등급 감정 완료된 카드이며, 상태 최상급입니다.\n` +
      `실물 사진과 감정 케이스 그대로 안전하게 배송해 드립니다.`,
    highestBidderId: topBid ? topBid.bidderId : null,
    highestBidderNickname: topBid ? topBid.bidderNickname : null,
    likeCount: (auctionId * 7) % 40,
    isLiked: false,
  });

  // 진행 중 경매는 카드의 activeAuction / activeAuctionCount 채움
  if (plan.status === "ACTIVE") {
    const summary: ActiveAuctionSummary = {
      auctionId,
      title: listItem.title,
      startingPrice: plan.startingPrice,
      buyoutPrice: plan.buyoutPrice,
      highestPrice: plan.highestPrice,
      startedAt,
      endedAt,
    };
    card.activeAuction = summary;
    card.activeAuctionCount = 1;
  }
});

export const mockAuctionListItems = auctionListItems;
export const mockAuctionDetails = auctionDetails;
export const mockBidsByAuction = bidsByAuction;

// ── 로그인 더미 유저 ────────────────────────────────────────────────────────
import type { User } from "@/types/user.types";

export const mockUser: User = {
  id: 999,
  email: "trainer@pocat.demo",
  nickname: "지우",
  phone: "010-1234-5678",
  role: "USER",
  bankName: "포켓뱅크",
  bankAccount: "123-456-789012",
  address: "관동지방 태초마을 1번지",
  unpaidStrike: 0,
  isBidBlocked: false,
  hasBillingKey: true,
  createdAt: utcWallClock(now - 30 * 24 * HOUR),
};

// ── 시리즈 / 세트 카탈로그 (seed 카드에서 파생) ──────────────────────────────
import type { SeriesResponse, PokemonSetResponse } from "@/types/catalog.types";

const seriesNames = [...new Set(CARD_SEED.map((c) => c.series))];
export const mockSeries: SeriesResponse[] = seriesNames.map((name, i) => ({
  id: i + 1,
  name,
  nameKo: null,
}));

const seenSets = new Map<string, CardSeed>();
CARD_SEED.forEach((c) => {
  if (!seenSets.has(c.setId)) seenSets.set(c.setId, c);
});
export const mockSets: PokemonSetResponse[] = [...seenSets.values()].map((c, i) => ({
  id: i + 1,
  setId: c.setId,
  name: c.setName,
  nameKo: null,
  seriesId: mockSeries.find((s) => s.name === c.series)?.id ?? null,
}));

// ── 경매 등록(POST) 흉내 ─────────────────────────────────────────────────────
let nextAuctionId = auctionListItems.reduce((m, a) => Math.max(m, a.auctionId), 0) + 1;

export interface CreateAuctionBody {
  cardId: number;
  title: string;
  description?: string;
  startingPrice: number;
  buyoutPrice?: number;
}

/**
 * 새 경매를 메모리에 추가하고 생성 응답을 돌려준다.
 * 데모 편의를 위해 곧바로 ACTIVE(24시간 진행) 상태로 만든다.
 * (실제 서버는 검수 후 활성화되지만, 등록 직후 상세/목록/홈에서 바로 보이도록 함)
 */
export function createMockAuction(body: CreateAuctionBody) {
  const card = mockCards.find((c) => c.id === body.cardId);
  const auctionId = nextAuctionId++;
  const startedMs = now;
  const endedMs = now + 24 * HOUR;
  const startedAt = utcWallClock(startedMs);
  const endedAt = utcWallClock(endedMs);
  const status: AuctionStatus = "ACTIVE";

  const listItem: AuctionListItem = {
    auctionId,
    title: body.title,
    cardId: body.cardId,
    cardName: card?.name ?? "알 수 없는 카드",
    grade: card?.grade ?? "PSA_10",
    cardImageUrl: card?.imageUrl ?? null,
    startingPrice: body.startingPrice,
    buyoutPrice: body.buyoutPrice ?? 0,
    highestPrice: null,
    status,
    startedAt,
    endedAt,
  };
  // 최신 등록이 목록 맨 앞에 오도록 앞에 추가
  auctionListItems.unshift(listItem);
  bidsByAuction[auctionId] = [];

  auctionDetails.unshift({
    ...listItem,
    id: auctionId,
    sellerId: mockUser.id,
    sellerNickname: mockUser.nickname,
    description: body.description ?? "",
    highestBidderId: null,
    highestBidderNickname: null,
    likeCount: 0,
    isLiked: false,
  });

  if (card) {
    card.activeAuction = {
      auctionId,
      title: listItem.title,
      startingPrice: listItem.startingPrice,
      buyoutPrice: body.buyoutPrice ?? null,
      highestPrice: null,
      startedAt,
      endedAt,
    };
    card.activeAuctionCount = 1;
  }

  return {
    auctionId,
    cardId: body.cardId,
    title: body.title,
    description: body.description ?? null,
    startingPrice: body.startingPrice,
    buyoutPrice: body.buyoutPrice ?? null,
    status,
    startedAt,
    endedAt,
  };
}

/** 카드에 연결된 진행 중 경매 요약 목록 */
export function mockCardAuctionSummaries(cardId: number): ActiveAuctionSummary[] {
  return auctionDetails
    .filter((a) => a.cardId === cardId && a.status === "ACTIVE")
    .map((a) => ({
      auctionId: a.auctionId,
      title: a.title,
      startingPrice: a.startingPrice,
      buyoutPrice: a.buyoutPrice,
      highestPrice: a.highestPrice,
      startedAt: a.startedAt,
      endedAt: a.endedAt,
    }));
}
