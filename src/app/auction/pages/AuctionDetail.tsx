import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { Gavel, Clock, Heart, Shield, Package, ChevronLeft, Trophy, Zap, Star } from "lucide-react";
import { toast } from "sonner";
import { getAuctionDetail } from "@/api/auction/auctionApi.ts";
import { useAuth } from "../../auth/context/AuthContext.tsx";
import type { AuctionDetail as AuctionDetailType, BidItem } from "@/types/auction.types";
import { buyout, getAuctionBids, placeBid, toggleLike } from "@/api/auction/bidApi.ts";
import { CardItem } from "@/app/card/components/CardItem";
import type { CardGrade } from "@/types/card.types";
import { serverTime, formatKST } from "@/shared/lib/datetime";

// ── Utilities ───────────────────────────────────────────────────────────────
function useCountdown(endedAt: string) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const update = () => {
      const distance = serverTime(endedAt) - Date.now();
      if (distance < 0) { setTimeLeft("종료"); return; }
      const d = Math.floor(distance / (1000 * 60 * 60 * 24));
      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(d > 0 ? `${d}일 ${h}시간 ${m}분` : `${h}시간 ${m}분 ${s}초`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endedAt]);
  return timeLeft;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ACTIVE:          { label: "진행중",   color: "bg-green-500/20 text-green-400 border-green-500/30" },
  PENDING:         { label: "대기중",   color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  ENDED:           { label: "종료됨",   color: "bg-white/10 text-white/50 border-white/20" },
  CANCELLED:       { label: "취소됨",   color: "bg-red-500/20 text-red-400 border-red-500/30" },
  PAYMENT_PENDING: { label: "결제 대기", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
};

function gradeBadgeClass(grade: string) {
  if (grade === "PSA_10") return "bg-amber-400/20 text-amber-300 border-amber-400/40";
  if (grade === "BGS_10") return "bg-rose-400/20 text-rose-300 border-rose-400/40";
  return "bg-slate-400/20 text-slate-300 border-slate-400/40";
}

function gradeLabel(grade: string) {
  if (grade === "PSA_10") return "⭐ PSA 10";
  if (grade === "BGS_10") return "💎 BGS 10";
  if (grade === "PSA_9")  return "🥈 PSA 9";
  return grade;
}

function rankBadge(idx: number) {
  if (idx === 0) return { icon: <Trophy className="w-3.5 h-3.5" />, cls: "bg-amber-400/20 text-amber-300 border-amber-400/40" };
  if (idx === 1) return { icon: <Star className="w-3.5 h-3.5" />,   cls: "bg-slate-400/20 text-slate-300 border-slate-400/40" };
  if (idx === 2) return { icon: <Star className="w-3.5 h-3.5" />,   cls: "bg-orange-700/20 text-orange-400 border-orange-700/40" };
  return { icon: <span className="text-[10px] font-bold">{idx + 1}</span>, cls: "bg-white/5 text-white/40 border-white/10" };
}

// ── Main component ──────────────────────────────────────────────────────────
export function AuctionDetail() {
  const { auctionId } = useParams<{ auctionId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [auction, setAuction]     = useState<AuctionDetailType | null>(null);
  const [bids,    setBids]         = useState<BidItem[]>([]);
  const [isLoading, setIsLoading]  = useState(true);

  const [bidInput,    setBidInput]    = useState("");
  const [isBidding,   setIsBidding]   = useState(false);
  const [isBuyingOut, setIsBuyingOut] = useState(false);
  const [isLiking,    setIsLiking]    = useState(false);

  function requireBillingKey(): boolean {
    if (!user?.hasBillingKey) {
      toast.error("입찰/구매를 위해 먼저 마이페이지에서 빌링키(카드)를 등록해주세요.");
      navigate("/profile");
      return false;
    }
    return true;
  }

  const timeLeft = useCountdown(auction?.endedAt ?? new Date().toISOString());

  const fetchData = useCallback(async () => {
    if (!auctionId) return;
    setIsLoading(true);
    try {
      // 상세는 판매자 본인이면 PENDING(검수 대기)에서도 조회된다.
      const detail = await getAuctionDetail(Number(auctionId));
      setAuction(detail);
      // 입찰 목록은 ACTIVE 경매에서만 조회 가능하다(검수 대기/종료 등은 백엔드가 막음).
      // 실패해도 상세 화면은 그대로 보여준다.
      try {
        const bidPage = await getAuctionBids(Number(auctionId));
        setBids(bidPage.content);
      } catch {
        setBids([]);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "경매 정보를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [auctionId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleBid() {
    if (!isAuthenticated) { toast.error("로그인이 필요합니다."); navigate("/login"); return; }
    if (!requireBillingKey()) return;
    const price = Number(bidInput);
    if (!price || price <= 0) { toast.error("올바른 입찰 금액을 입력해주세요."); return; }
    setIsBidding(true);
    try {
      await placeBid(Number(auctionId), { bidPrice: price });
      toast.success("⚡ 입찰 완료!");
      setBidInput("");
      await fetchData();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "입찰에 실패했습니다.");
    } finally {
      setIsBidding(false); }
  }

  async function handleBuyout() {
    if (!auction) return;
    if (!isAuthenticated) { toast.error("로그인이 필요합니다."); navigate("/login"); return; }
    if (!requireBillingKey()) return;
    setIsBuyingOut(true);
    try {
      // 백엔드가 빌링키 자동결제까지 처리하므로 응답으로 성공 여부만 확인한다.
      const res = await buyout(Number(auctionId));
      const paid = res.orderStatus === "PAYMENT_COMPLETED" || res.paymentStatus === "COMPLETED";
      if (paid) {
        toast.success("결제 완료! 카드가 곧 배송됩니다.");
      } else {
        toast.error("결제가 완료되지 않았습니다. 내 주문에서 다시 시도해주세요.");
      }
      await fetchData();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "즉시구매에 실패했습니다.");
    } finally {
      setIsBuyingOut(false);
    }
  }

  async function handleLike() {
    if (!isAuthenticated) { toast.error("로그인이 필요합니다."); return; }
    if (!auction) return;
    setIsLiking(true);
    try {
      const res = await toggleLike(auction.auctionId);
      setAuction(prev => prev ? { ...prev, isLiked: res.isLiked, likeCount: prev.likeCount + (res.isLiked ? 1 : -1) } : prev);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "요청에 실패했습니다.");
    } finally {
      setIsLiking(false);
    }
  }

  // ── Loading skeleton ────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] h-40 animate-pulse" />
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
            <div className="aspect-[2/3] bg-muted rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-40 bg-muted rounded-2xl" />
              <div className="h-16 bg-muted rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">😢</div>
          <p className="text-muted-foreground">경매를 찾을 수 없습니다.</p>
          <Link to="/" className="inline-flex items-center gap-2 text-[#CC0000] hover:underline text-sm">
            <ChevronLeft className="w-4 h-4" /> 경매장으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const isActive         = auction.status === "ACTIVE";
  const isOwner          = user?.id === auction.sellerId;
  const minBid           = auction.highestPrice != null ? auction.highestPrice + 1 : auction.startingPrice;
  const statusCfg        = STATUS_CONFIG[auction.status] ?? { label: auction.status, color: "bg-white/10 text-white/50 border-white/20" };

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero header ──────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white py-10 border-b border-white/10">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link to="/" className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-4 transition-colors">
            <ChevronLeft className="w-4 h-4" /> 경매장
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${gradeBadgeClass(auction.grade)}`}>
              {gradeLabel(auction.grade)}
            </span>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${statusCfg.color}`}>
              {isActive && <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse" />}
              {statusCfg.label}
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-white mb-2 leading-tight">{auction.title}</h1>
          <p className="text-white/50 text-sm">{auction.cardName}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

          {/* ── Card (3D) ─────────────────────────────────────────────────── */}
          <div className="flex items-start justify-center">
            {auction.cardImageUrl ? (
              <CardItem
                imageUrl={auction.cardImageUrl}
                name={auction.cardName}
                grade={auction.grade as CardGrade}
                className="w-full max-w-sm"
              />
            ) : (
              <div className="w-full max-w-sm aspect-[2/3] rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex items-center justify-center text-7xl border border-white/10">
                💰
              </div>
            )}
          </div>

          {/* ── Info panel ────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">

            {/* Seller */}
            <div className="flex items-center gap-3 bg-card border rounded-2xl px-4 py-3">
              <div className="w-10 h-10 rounded-full bg-[#FFCB05] flex items-center justify-center text-[#1a1a2e] font-extrabold shrink-0">
                {auction.sellerNickname[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">판매자</p>
                <p className="font-semibold text-sm">{auction.sellerNickname} 트레이너</p>
              </div>
            </div>

            {/* Price card */}
            <div className="bg-card border rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">시작가</span>
                <span className="font-medium">{auction.startingPrice.toLocaleString()}원</span>
              </div>
              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground mb-1">현재 최고 입찰가</p>
                <p className="text-3xl font-extrabold text-[#CC0000]">{(auction.highestPrice ?? auction.startingPrice).toLocaleString()}원</p>
                {auction.highestBidderNickname && (
                  <p className="text-xs text-muted-foreground mt-1">
                    최고 입찰자: <span className="font-medium text-foreground">{auction.highestBidderNickname}</span>
                  </p>
                )}
              </div>
              {auction.buyoutPrice > 0 && (
                <div className="flex items-center justify-between border-t pt-3 text-sm">
                  <span className="text-muted-foreground">즉시 구매가</span>
                  <span className="font-bold text-[#FFCB05]">{auction.buyoutPrice.toLocaleString()}원</span>
                </div>
              )}
            </div>

            {/* Countdown */}
            {isActive && (
              <div className="flex items-center gap-3 bg-[#CC0000]/10 border border-[#CC0000]/30 rounded-2xl px-4 py-3">
                <Clock className="w-5 h-5 text-[#CC0000] shrink-0" />
                <div>
                  <p className="text-[10px] text-[#CC0000]/80 font-medium uppercase tracking-wide">남은 시간</p>
                  <p className="font-extrabold text-[#CC0000] text-lg leading-none mt-0.5">{timeLeft}</p>
                </div>
              </div>
            )}

            {/* Bid form */}
            {isActive && !isOwner && (
              <div className="bg-card border rounded-2xl p-5 space-y-3">
                {isAuthenticated ? (
                  <>
                    <label className="block text-sm font-semibold">
                      입찰 금액
                      <span className="font-normal text-muted-foreground ml-1">(최소 {minBid.toLocaleString()}원)</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={bidInput}
                        onChange={e => setBidInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") handleBid(); }}
                        placeholder={minBid.toLocaleString()}
                        className="flex-1 border rounded-xl px-3.5 py-2.5 bg-background text-sm outline-none focus:border-[#CC0000] transition-colors"
                      />
                      <button
                        onClick={handleBid}
                        disabled={isBidding}
                        className="flex items-center gap-1.5 bg-[#CC0000] hover:bg-[#aa0000] text-white px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm font-semibold whitespace-nowrap"
                      >
                        <Gavel className="w-4 h-4" />
                        {isBidding ? "입찰 중..." : "입찰"}
                      </button>
                    </div>

                    {auction.buyoutPrice > 0 && (
                      <button
                        onClick={handleBuyout}
                        disabled={isBuyingOut}
                        className="w-full bg-[#FFCB05] hover:bg-[#e6b800] text-[#1a1a2e] py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm font-bold flex items-center justify-center gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        {isBuyingOut ? "결제 처리 중..." : `즉시 구매 ${auction.buyoutPrice.toLocaleString()}원`}
                      </button>
                    )}
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="block text-center bg-[#CC0000] hover:bg-[#aa0000] text-white py-2.5 rounded-xl transition-colors text-sm font-semibold"
                  >
                    로그인 후 입찰하기
                  </Link>
                )}
              </div>
            )}

            {/* Like + badges */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm font-medium ${
                  auction.isLiked
                    ? "bg-[#CC0000]/10 border-[#CC0000]/40 text-[#CC0000]"
                    : "hover:bg-muted text-muted-foreground border-border"
                } disabled:opacity-50`}
              >
                <Heart className={`w-4 h-4 ${auction.isLiked ? "fill-current" : ""}`} />
                {auction.likeCount}
              </button>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5" /> 전문가 검수</span>
                <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> 정품 보장</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom: description + bids + sidebar ───────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Description */}
            <div className="bg-card border rounded-2xl p-6">
              <h2 className="font-bold text-sm uppercase tracking-wide text-muted-foreground mb-4">상품 설명</h2>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {auction.description || "설명이 없습니다."}
              </p>
            </div>

            {/* Bid history */}
            <div className="bg-card border rounded-2xl p-6">
              <h2 className="font-bold text-sm uppercase tracking-wide text-muted-foreground mb-4">
                입찰 내역 <span className="font-normal text-xs ml-1">({bids.length}건)</span>
              </h2>
              {bids.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <div className="text-4xl">⚡</div>
                  <p className="text-muted-foreground text-sm">아직 입찰이 없습니다.</p>
                  <p className="text-xs text-muted-foreground">첫 번째 트레이너가 되어보세요!</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {bids.map((bid, idx) => {
                    const { icon, cls } = rankBadge(idx);
                    return (
                      <div key={bid.bidId} className="flex items-center justify-between py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center border text-xs ${cls}`}>
                            {icon}
                          </div>
                          <span className="text-sm font-medium">{bid.bidderNickname}</span>
                          {idx === 0 && (
                            <span className="text-[10px] bg-amber-400/10 text-amber-400 border border-amber-400/30 rounded-full px-2 py-0.5">
                              최고 입찰
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <div className={`font-extrabold text-sm ${idx === 0 ? "text-[#CC0000]" : "text-foreground"}`}>
                            {bid.bidPrice.toLocaleString()}원
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {formatKST(bid.createdAt, { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <div className="bg-card border rounded-2xl p-6 self-start sticky top-24 space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground">경매 정보</h3>
            <div className="space-y-1">
              <InfoRow label="카드명"   value={auction.cardName} />
              <InfoRow label="등급"     value={gradeLabel(auction.grade)} />
              <InfoRow label="시작가"   value={`${auction.startingPrice.toLocaleString()}원`} />
              {auction.buyoutPrice > 0 && (
                <InfoRow label="즉시구매가" value={`${auction.buyoutPrice.toLocaleString()}원`} />
              )}
              <InfoRow
                label="시작일"
                value={formatKST(auction.startedAt, { year: "numeric", month: "2-digit", day: "2-digit" })}
              />
              <InfoRow
                label="종료일"
                value={formatKST(auction.endedAt, { year: "numeric", month: "2-digit", day: "2-digit" })}
              />
              <InfoRow label="상태" value={statusCfg.label} />
            </div>

            <div className="pt-2 border-t">
              <Link
                to="/"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                경매장으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b last:border-b-0 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
