import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { AlertTriangle, Ban, ChevronRight, Clock, Heart, Search, Zap } from "lucide-react";
import { CardItem } from "@/app/card/components/CardItem";
import { getAuctions, getMyAuctions } from "@/api/auction/auctionApi";
import { getMyLikes, toggleLike } from "@/api/auction/likeApi";
import { getCards } from "@/api/card/cardApi";
import { useAuth } from "@/app/auth/context/AuthContext";
import type { AuctionListItem } from "@/types/auction.types";
import type { LikeResponse } from "@/types/like.types";
import type { CardGrade, CardResponse } from "@/types/card.types";

const PIKACHU_URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png";
const EEVEE_URL   = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png";

const GRADE_TABS = [
  { label: "전체", value: "" },
  { label: "✦ PSA 10", value: "PSA_10" },
  { label: "◈ PSA 9",  value: "PSA_9"  },
  { label: "★ BGS 10", value: "BGS_10" },
];

const SORT_OPTIONS = [
  { label: "마감 임박순", value: "endedAt,asc"        },
  { label: "최신순",      value: "startedAt,desc"     },
  { label: "높은 입찰가", value: "highestPrice,desc"  },
  { label: "낮은 시작가", value: "startingPrice,asc"  },
];

const CATEGORY_OPTIONS = [
  { label: "전체", value: "" },
  { label: "포켓몬", value: "POKEMON" },
  { label: "트레이너", value: "TRAINERS" },
  { label: "에너지", value: "ENERGY" },
];

const PAGE_SIZE = 12;

function gradeBadgeClass(grade: string) {
  if (grade === "PSA_10") return "bg-amber-400 text-amber-900 font-bold";
  if (grade === "BGS_10") return "bg-rose-500 text-white font-bold";
  return "bg-slate-300 text-slate-700 dark:bg-slate-600 dark:text-slate-100 font-semibold";
}

function CountdownTimer({ endedAt }: { endedAt: string }) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const update = () => {
      const d = new Date(endedAt).getTime() - Date.now();
      if (d < 0) { setTimeLeft("종료"); return; }
      const h = Math.floor(d / 3600000);
      const m = Math.floor((d % 3600000) / 60000);
      const s = Math.floor((d % 60000) / 1000);
      setTimeLeft(`${h}시간 ${m}분 ${s}초`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endedAt]);
  return <span>{timeLeft}</span>;
}

function SectionHeader({ emoji, title, to, linkLabel }: {
  emoji: string;
  title: string;
  to?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">{emoji}</span>
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        <div className="h-0.5 w-6 bg-[#CC0000] rounded-full" />
      </div>
      {to && (
        <Link to={to} className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-[#CC0000] transition-colors">
          {linkLabel ?? "전체보기"} <ChevronRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

function AuctionMiniCard({ imageUrl, cardName, grade, highestPrice, endedAt, to }: {
  imageUrl: string | null;
  cardName: string;
  grade: string;
  highestPrice: number | null;
  endedAt: string;
  to: string;
}) {
  return (
    <Link to={to} className="flex-shrink-0 w-32 flex flex-col group">
      <div className="aspect-[2/3] bg-muted rounded-xl overflow-hidden relative shadow-sm group-hover:shadow-md transition-shadow">
        {imageUrl ? (
          <img src={imageUrl} alt={cardName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">이미지 없음</div>
        )}
        <span className={`absolute top-1 left-1 text-[9px] px-1.5 py-0.5 rounded-full ${gradeBadgeClass(grade)}`}>
          {grade}
        </span>
      </div>
      <p className="text-[11px] font-semibold mt-1.5 line-clamp-1 group-hover:text-[#CC0000] transition-colors">{cardName}</p>
      <p className="text-xs text-[#CC0000] font-bold">{highestPrice != null ? `${highestPrice.toLocaleString()}원` : "입찰 전"}</p>
      <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground mt-0.5">
        <Clock className="w-2.5 h-2.5 shrink-0" />
        <CountdownTimer endedAt={endedAt} />
      </div>
    </Link>
  );
}

export function Home() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [auctions, setAuctions]           = useState<AuctionListItem[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage]                   = useState(0);
  const [hasMore, setHasMore]             = useState(false);
  const [isLoading, setIsLoading]         = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError]         = useState(false);

  const [grade,       setGrade]       = useState("");
  const [category,    setCategory]    = useState("");
  const [sort,        setSort]        = useState("endedAt,asc");
  const [keyword,     setKeyword]     = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [likedIds,        setLikedIds]        = useState<Set<number>>(new Set());
  const [myLikes,         setMyLikes]         = useState<LikeResponse[]>([]);
  const [isLikesLoading,  setIsLikesLoading]  = useState(false);

  const [myAuctions,          setMyAuctions]          = useState<AuctionListItem[]>([]);
  const [isMyAuctionsLoading, setIsMyAuctionsLoading] = useState(false);

  const [recentCards,    setRecentCards]    = useState<CardResponse[]>([]);
  const [isCardsLoading, setIsCardsLoading] = useState(true);

  // 1초마다 갱신되는 현재 시각. 페이지를 열어둔 사이 마감된 경매를 실시간으로
  // 목록에서 제외하기 위해 사용한다.
  const [nowTs, setNowTs] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const fetchAuctions = useCallback(async (reset: boolean) => {
    const targetPage = reset ? 0 : page + 1;
    if (reset) { setIsLoading(true); setLoadError(false); }
    else        { setIsLoadingMore(true); }

    try {
      const res = await getAuctions({
        keyword: keyword || undefined,
        grade:   grade    || undefined,
        cardCategory: category ? (category as "POKEMON" | "TRAINERS" | "ENERGY" | "UNKNOWN") : undefined,
        sort,
        status: "ACTIVE",
        page: targetPage,
        size: PAGE_SIZE,
      });

      // 백엔드가 status 필터를 무시하는 경우를 대비한 방어용 클라이언트 필터.
      // 진행 중(ACTIVE)이면서 마감 시각이 지나지 않은 경매만 노출한다.
      const now = Date.now();
      const activeContent = res.content.filter(
        (a) => a.status === "ACTIVE" && new Date(a.endedAt).getTime() > now
      );
      console.log("res : " , res)
      console.log("reset : " , reset)
      if (reset) {
        setAuctions(activeContent);
        setPage(0);
      } else {
        setAuctions((prev) => [...prev, ...activeContent]);
        setPage(targetPage);
      }

      setTotalElements(res.totalElements);
      setHasMore(targetPage < res.totalPages - 1);
    } catch {
      if (reset) setLoadError(true);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grade, category, sort, keyword, page]);

  useEffect(() => {
    fetchAuctions(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grade, category, sort, keyword]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setIsLikesLoading(true);
    getMyLikes(0, 10)
      .then((res) => {
        setMyLikes(res.content);
        setLikedIds(new Set(res.content.map((l) => l.auctionId)));
      })
      .catch(() => {})
      .finally(() => setIsLikesLoading(false));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setIsMyAuctionsLoading(true);
    getMyAuctions({ status: "ACTIVE", size: 10, sort: "endedAt,asc" })
      .then((res) => setMyAuctions(res.content))
      .catch(() => {})
      .finally(() => setIsMyAuctionsLoading(false));
  }, [isAuthenticated]);

  useEffect(() => {
    setIsCardsLoading(true);
    getCards({ size: 8, sort: "createdAt,desc" })
      .then((res) => setRecentCards(res.content))
      .catch(() => {})
      .finally(() => setIsCardsLoading(false));
  }, []);

  async function handleToggleLike(e: React.MouseEvent, auctionId: number) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { navigate("/login"); return; }

    const wasLiked = likedIds.has(auctionId);
    setLikedIds((prev) => {
      const next = new Set(prev);
      wasLiked ? next.delete(auctionId) : next.add(auctionId);
      return next;
    });
    try {
      await toggleLike(auctionId);
    } catch {
      setLikedIds((prev) => {
        const next = new Set(prev);
        wasLiked ? next.add(auctionId) : next.delete(auctionId);
        return next;
      });
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setKeyword(searchInput.trim());
  }

  // 진행 중(ACTIVE)이면서 아직 마감 시각이 지나지 않은 경매만 노출한다.
  // fetch 시점뿐 아니라 nowTs 틱마다 재평가되어, 보는 중에 종료된 경매도 사라진다.
  const visibleAuctions = auctions.filter(
    (a) => a.status === "ACTIVE" && new Date(a.endedAt).getTime() > nowTs
  );
  const visibleMyAuctions = myAuctions.filter(
    (a) => a.status === "ACTIVE" && new Date(a.endedAt).getTime() > nowTs
  );

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23] text-white">
        <div className="relative container mx-auto px-4 py-14 flex items-center justify-between gap-6">
          <div className="flex-1 min-w-0">
            {/* Live badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center gap-1.5 bg-[#CC0000] text-white text-xs px-3 py-1 rounded-full font-semibold tracking-wide">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE AUCTION
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold mb-2 leading-tight">
              <span className="text-[#FFCB05]">포켓몬 카드</span>
              <br />실시간 경매장
            </h1>
            <p className="text-sm md:text-base text-white/70 mb-5">
              레어 카드를 직접 입찰하고 컬렉션을 완성하세요
            </p>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 mb-5">
                <span className="text-2xl">⚡</span>
                <p className="text-sm text-white/80">
                  <strong className="text-[#FFCB05]">{user.nickname}</strong> 트레이너, 어서오세요!
                </p>
              </div>
            ) : (
              <div className="flex gap-3 mb-5">
                <Link to="/login"  className="bg-[#CC0000] hover:bg-[#aa0000] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                  로그인
                </Link>
                <Link to="/signup" className="bg-[#FFCB05] hover:bg-yellow-400 text-[#1a1a2e] px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                  회원가입
                </Link>
              </div>
            )}

            {!isLoading && !loadError && (
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#FFCB05]" />
                <span className="text-sm text-white/70">
                  현재 <span className="text-[#FFCB05] font-bold">{totalElements.toLocaleString()}</span>개 경매 진행 중
                </span>
              </div>
            )}
          </div>

          {/* Pikachu image */}
          <div className="hidden md:flex flex-col items-center gap-3 shrink-0">
            <img
              src={PIKACHU_URL}
              alt="Pikachu"
              className="w-44 h-44 object-contain drop-shadow-[0_0_24px_rgba(255,203,5,0.5)] animate-bounce"
              style={{ animationDuration: "3s" }}
            />
            <img
              src={EEVEE_URL}
              alt="Eevee"
              className="w-28 h-28 object-contain drop-shadow-[0_0_16px_rgba(210,180,140,0.4)]"
            />
          </div>
        </div>
      </section>

      {/* ── Sticky filter bar ─────────────────────────────────────────────── */}
      <div className="sticky top-16 z-40 bg-[#16213e] text-white border-b border-white/10 shadow-lg">
        <div className="container mx-auto px-4 py-2.5 flex flex-wrap items-center gap-2">
          {/* Grade tabs */}
          <div className="flex items-center gap-1">
            {GRADE_TABS.map((g) => (
              <button
                key={g.value}
                onClick={() => setGrade(g.value)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap font-medium ${
                  grade === g.value
                    ? "bg-[#FFCB05] text-[#1a1a2e]"
                    : "bg-white/10 hover:bg-white/20 text-white/80"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-white/20 hidden sm:block" />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-white/10 border-0 rounded-lg px-2 py-1.5 text-xs text-white cursor-pointer"
          >
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="text-black">{o.label}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-white/10 border-0 rounded-lg px-2 py-1.5 text-xs text-white cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="text-black">{o.label}</option>
            ))}
          </select>

          <form onSubmit={handleSearch} className="flex items-center bg-white/10 rounded-lg px-3 py-1.5 gap-2 flex-1 min-w-[140px] max-w-xs ml-auto">
            <Search className="w-3.5 h-3.5 text-white/60 shrink-0" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="카드명 검색..."
              className="bg-transparent border-none outline-none w-full text-xs text-white placeholder:text-white/40"
            />
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-12">

        {/* ── Alert banners (user API: unpaidStrike, isBidBlocked) ──────── */}
        {isAuthenticated && user && (user.unpaidStrike > 0 || user.isBidBlocked) && (
          <div className="space-y-2">
            {user.unpaidStrike > 0 && (
              <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-300 dark:border-yellow-700 rounded-xl px-4 py-3 text-sm text-yellow-800 dark:text-yellow-200">
                <AlertTriangle className="w-4 h-4 shrink-0 text-yellow-500" />
                <span>⚡ 미결제 패널티 <strong>{user.unpaidStrike}회</strong> 누적 — 3회 이상 시 입찰이 자동 차단됩니다.</span>
                <Link to="/profile" className="ml-auto underline text-xs whitespace-nowrap opacity-70 hover:opacity-100">확인하기</Link>
              </div>
            )}
            {user.isBidBlocked && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 border border-red-300 dark:border-red-700 rounded-xl px-4 py-3 text-sm text-red-800 dark:text-red-200">
                <Ban className="w-4 h-4 shrink-0" />
                🚫 현재 입찰이 차단된 계정입니다. 고객센터에 문의해주세요.
              </div>
            )}
          </div>
        )}

        {/* ── My liked auctions (like API: getMyLikes) ──────────────────── */}
        {isAuthenticated && (
          <section>
            <SectionHeader emoji="❤️" title="내 관심 경매" />
            {isLikesLoading ? (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-32 animate-pulse">
                    <div className="aspect-[2/3] bg-muted rounded-xl mb-2" />
                    <div className="h-2.5 bg-muted rounded w-3/4 mb-1" />
                    <div className="h-2.5 bg-muted rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : myLikes.length === 0 ? (
              <div className="flex items-center gap-3 py-4 px-5 bg-pink-50 dark:bg-pink-950/20 rounded-xl border border-pink-100 dark:border-pink-900 text-sm text-pink-600 dark:text-pink-300">
                <span className="text-2xl">💰</span>
                관심 경매가 없습니다. 카드에 ♥ 를 눌러 추가해보세요!
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {myLikes.map((like) => (
                  <AuctionMiniCard
                    key={like.likeId}
                    imageUrl={like.cardImageUrl}
                    cardName={like.cardName}
                    grade={like.grade}
                    highestPrice={like.highestPrice}
                    endedAt={like.endedAt}
                    to={`/auctions/${like.auctionId}`}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── My active auctions (auction API: getMyAuctions) ───────────── */}
        {isAuthenticated && (
          <section>
            <SectionHeader emoji="🏆" title="내 진행 경매" to="/profile" linkLabel="프로필에서 보기" />
            {isMyAuctionsLoading ? (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-32 animate-pulse">
                    <div className="aspect-[2/3] bg-muted rounded-xl mb-2" />
                    <div className="h-2.5 bg-muted rounded w-3/4 mb-1" />
                    <div className="h-2.5 bg-muted rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : visibleMyAuctions.length === 0 ? (
              <div className="flex items-center gap-3 py-4 px-5 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900 text-sm text-blue-600 dark:text-blue-300">
                <span className="text-2xl">🎮</span>
                진행 중인 경매가 없습니다. 카드를 등록해 경매를 시작해보세요!
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {visibleMyAuctions.map((auction) => (
                  <AuctionMiniCard
                    key={auction.auctionId}
                    imageUrl={auction.cardImageUrl}
                    cardName={auction.cardName}
                    grade={auction.grade}
                    highestPrice={auction.highestPrice ?? auction.startingPrice}
                    endedAt={auction.endedAt}
                    to={`/auctions/${auction.auctionId}`}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Main auction grid (auction API: getAuctions + toggleLike) ──── */}
        <section>
          <SectionHeader
            emoji="⚡"
            title={keyword ? `"${keyword}" 검색 결과` : "진행 중인 경매"}
          />

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col">
                  <div className="aspect-[2/3] bg-muted rounded-2xl mb-3" />
                  <div className="h-3 bg-muted rounded w-3/4 mb-1.5" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : loadError ? (
            <div className="text-center py-20">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">경매 정보를 불러오지 못했습니다.</p>
              <button
                onClick={() => fetchAuctions(true)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#FFCB05] text-[#1a1a2e] hover:brightness-95 transition"
              >
                다시 시도
              </button>
            </div>
          ) : visibleAuctions.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-3">😴</p>
              <p className="text-muted-foreground">
                {keyword ? `"${keyword}"에 대한 경매가 없습니다.` : "진행 중인 경매가 없습니다."}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {visibleAuctions.map((auction) => (
                  <div
                    key={auction.auctionId}
                    onClick={() => navigate(`/auctions/${auction.auctionId}`)}
                    className="flex flex-col group cursor-pointer"
                  >
                    <div className="relative">
                      <CardItem
                        imageUrl={auction.cardImageUrl ?? ""}
                        name={auction.cardName}
                        grade={auction.grade as CardGrade}
                        className="w-full"
                      />
                      <span className="absolute top-2 left-2 bg-[#CC0000] text-white text-[9px] font-bold px-2 py-0.5 rounded-full z-10 shadow">
                        경매중
                      </span>
                      <button
                        onClick={(e) => handleToggleLike(e, auction.auctionId)}
                        title={isAuthenticated ? "관심 경매 추가" : "로그인 후 이용"}
                        className="absolute top-2 right-2 w-8 h-8 bg-white/90 dark:bg-black/70 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-20"
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            likedIds.has(auction.auctionId)
                              ? "text-rose-500 fill-rose-500"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="mt-3 space-y-1.5">
                      <p className="text-sm font-semibold line-clamp-1 group-hover:text-[#CC0000] transition-colors">
                        {auction.cardName}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{auction.title}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${gradeBadgeClass(auction.grade)}`}>
                          {auction.grade}
                        </span>
                        <span className="text-sm font-bold text-[#CC0000]">
                          {(auction.highestPrice ?? auction.startingPrice).toLocaleString()}원
                        </span>
                      </div>
                      {auction.buyoutPrice > 0 && (
                        <p className="text-[11px] text-muted-foreground">
                          즉시구매 {auction.buyoutPrice.toLocaleString()}원
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="w-3 h-3 shrink-0 text-[#CC0000]" />
                        <CountdownTimer endedAt={auction.endedAt} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <button
                    onClick={() => fetchAuctions(false)}
                    disabled={isLoadingMore}
                    className="px-8 py-2.5 bg-[#CC0000] hover:bg-[#aa0000] text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingMore ? "불러오는 중..." : "더 보기 ↓"}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* ── Recent cards (card API: getCards) ─────────────────────────── */}
        {!isCardsLoading && recentCards.length > 0 && (
          <section>
            <SectionHeader emoji="💰" title="최근 등록 카드" />
            <div className="flex gap-4 overflow-x-auto pb-3">
              {recentCards.map((card) => (
                <div key={card.id} className="flex-shrink-0 w-40 flex flex-col">
                  <CardItem imageUrl={card.imageUrl ?? ""} name={card.name} grade={card.grade} className="w-full" />
                  <div className="mt-2 space-y-0.5">
                    <p className="text-xs font-semibold line-clamp-1">{card.name}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{card.setName}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full inline-block ${gradeBadgeClass(card.grade)}`}>
                      {card.grade}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Pokémon fun footer banner ──────────────────────────────────── */}
        <section className="rounded-2xl overflow-hidden bg-gradient-to-r from-[#1a1a2e] to-[#CC0000] text-white p-8 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold mb-1">🎮 트레이너가 되어보세요!</h3>
            <p className="text-sm text-white/70">포켓몬 카드를 모으고, 경매하고, 컬렉션을 완성하세요</p>
          </div>
          {!isAuthenticated && (
            <Link
              to="/signup"
              className="shrink-0 bg-[#FFCB05] hover:bg-yellow-400 text-[#1a1a2e] font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              지금 시작하기 →
            </Link>
          )}
        </section>
      </div>
    </div>
  );
}
