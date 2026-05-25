import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router";
import { Gavel, Clock, Heart, Shield, Package, User, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { getAuctionDetail } from "@/api/auction/auctionApi.ts";
import { useAuth } from "../../auth/context/AuthContext.tsx";
import type { AuctionDetail as AuctionDetailType, BidItem } from "@/types/auction.types";
import {buyout, getAuctionBids, placeBid, toggleLike} from "@/api/auction/bidApi.ts";

function useCountdown(endedAt: string) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const distance = new Date(endedAt).getTime() - Date.now();
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

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "진행중", className: "bg-green-100 text-green-700" },
  PENDING: { label: "대기중", className: "bg-yellow-100 text-yellow-700" },
  ENDED: { label: "종료", className: "bg-gray-100 text-gray-700" },
  CANCELLED: { label: "취소됨", className: "bg-red-100 text-red-700" },
  PAYMENT_PENDING: { label: "결제 대기", className: "bg-blue-100 text-blue-700" },
};

export function AuctionDetail() {
  const { auctionId } = useParams<{ auctionId: string }>();
  const { isAuthenticated, user } = useAuth();

  const [auction, setAuction] = useState<AuctionDetailType | null>(null);
  const [bids, setBids] = useState<BidItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [bidInput, setBidInput] = useState("");
  const [isBidding, setIsBidding] = useState(false);
  const [isBuyingOut, setIsBuyingOut] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const timeLeft = useCountdown(auction?.endedAt ?? new Date().toISOString());

  const fetchData = useCallback(async () => {
    if (!auctionId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [detail, bidPage] = await Promise.all([
        getAuctionDetail(Number(auctionId)),
        getAuctionBids(Number(auctionId)),
      ]);
      setAuction(detail);
      setBids(bidPage.content);
    } catch (e) {
      setError(e instanceof Error ? e.message : "경매 정보를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [auctionId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleBid() {
    const price = Number(bidInput);
    if (!price || price <= 0) {
      toast.error("올바른 입찰 금액을 입력해주세요.");
      return;
    }
    setIsBidding(true);
    try {
      await placeBid(Number(auctionId), { bidPrice: price });
      toast.success("입찰 완료!");
      setBidInput("");
      await fetchData();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "입찰에 실패했습니다.");
    } finally {
      setIsBidding(false);
    }
  }

  async function handleBuyout() {
    if (!auction) return;
    setIsBuyingOut(true);
    try {
      await buyout(Number(auctionId), auction.buyoutPrice);
      toast.success("즉시 구매 완료!");
      await fetchData();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "즉시 구매에 실패했습니다.");
    } finally {
      setIsBuyingOut(false);
    }
  }

  async function handleLike() {
    if (!isAuthenticated) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    if (!auction) return;
    setIsLiking(true);
    try {
      const res = await toggleLike(auction.auctionId);
      setAuction((prev) =>
        prev
          ? {
              ...prev,
              isLiked: res.isLiked,
              likeCount: prev.likeCount + (res.isLiked ? 1 : -1),
            }
          : prev
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "요청에 실패했습니다.");
    } finally {
      setIsLiking(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
            <div className="aspect-[3/4] bg-muted rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-32 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error ?? "경매를 찾을 수 없습니다."}</p>
          <Link to="/auctions" className="text-primary hover:underline">경매 목록으로 돌아가기</Link>
        </div>
      </div>
    );
  }

  const isActive = auction.status === "ACTIVE";
  const isOwner = user?.id === auction.sellerId;
  const minBid = auction.highestPrice + 1;
  const statusInfo = STATUS_LABEL[auction.status] ?? { label: auction.status, className: "bg-gray-100 text-gray-700" };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">홈</Link>
          <span>/</span>
          <Link to="/auctions" className="hover:text-foreground">경매</Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-[200px]">{auction.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* 이미지 */}
          <div className="bg-card border rounded-lg overflow-hidden">
            <div className="aspect-[3/4] bg-muted">
              {auction.cardImageUrl ? (
                <img
                  src={auction.cardImageUrl}
                  alt={auction.cardName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  이미지 없음
                </div>
              )}
            </div>
          </div>

          {/* 정보 패널 */}
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm">
                  {auction.grade}
                </span>
                <span className={`px-3 py-1 rounded text-sm font-medium ${statusInfo.className}`}>
                  {statusInfo.label}
                </span>
              </div>
              <h1 className="text-2xl font-bold mb-1">{auction.title}</h1>
              <p className="text-muted-foreground text-sm">{auction.cardName}</p>
            </div>

            {/* 판매자 */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>판매자: <span className="text-foreground font-medium">{auction.sellerNickname}</span></span>
            </div>

            {/* 가격 정보 */}
            <div className="bg-card border rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">시작가</span>
                <span className="font-medium">{auction.startingPrice.toLocaleString()}원</span>
              </div>
              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-muted-foreground text-sm">현재 최고 입찰가</span>
                <span className="text-2xl font-bold text-red-500">
                  {auction.highestPrice.toLocaleString()}원
                </span>
              </div>
              {auction.highestBidderNickname && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">최고 입찰자</span>
                  <span className="text-sm font-medium">{auction.highestBidderNickname}</span>
                </div>
              )}
              {auction.buyoutPrice > 0 && (
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-muted-foreground text-sm">즉시 구매가</span>
                  <span className="text-lg font-bold text-primary">
                    {auction.buyoutPrice.toLocaleString()}원
                  </span>
                </div>
              )}
            </div>

            {/* 남은 시간 */}
            {isActive && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
                <Clock className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <div className="text-xs text-red-600 dark:text-red-400">남은 시간</div>
                  <div className="font-bold text-red-600 dark:text-red-400">{timeLeft}</div>
                </div>
              </div>
            )}

            {/* 입찰 폼 */}
            {isActive && !isOwner && (
              <div className="bg-card border rounded-lg p-5 space-y-3">
                {isAuthenticated ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        입찰 금액 <span className="text-muted-foreground font-normal">(최소 {minBid.toLocaleString()}원)</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={bidInput}
                          onChange={(e) => setBidInput(e.target.value)}
                          placeholder={minBid.toLocaleString()}
                          className="flex-1 border rounded-lg px-3 py-2 bg-background text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                          onClick={handleBid}
                          disabled={isBidding}
                          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 text-sm whitespace-nowrap"
                        >
                          <Gavel className="w-4 h-4" />
                          {isBidding ? "입찰 중..." : "입찰하기"}
                        </button>
                      </div>
                    </div>

                    {auction.buyoutPrice > 0 && (
                      <button
                        onClick={handleBuyout}
                        disabled={isBuyingOut}
                        className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm font-medium"
                      >
                        {isBuyingOut ? "처리 중..." : `즉시 구매 ${auction.buyoutPrice.toLocaleString()}원`}
                      </button>
                    )}
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="block text-center bg-primary text-primary-foreground py-2.5 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    로그인 후 입찰하기
                  </Link>
                )}
              </div>
            )}

            {/* 찜 + 보조 정보 */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors text-sm ${
                  auction.isLiked
                    ? "bg-red-50 border-red-300 text-red-500"
                    : "hover:bg-muted text-muted-foreground"
                }`}
              >
                <Heart className={`w-4 h-4 ${auction.isLiked ? "fill-current" : ""}`} />
                {auction.likeCount}
              </button>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Package className="w-4 h-4" />
                  <span>전문가 검수 완료</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  <span>정품 보장</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 하단: 설명 + 입찰 내역 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* 경매 설명 */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="mb-4">경매 설명</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                {auction.description || "설명이 없습니다."}
              </p>
            </div>

            {/* 입찰 내역 */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="mb-4">입찰 내역</h2>
              {bids.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">아직 입찰이 없습니다.</p>
              ) : (
                <div className="divide-y">
                  {bids.map((bid, idx) => (
                    <div key={bid.bidId} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx === 0 ? "bg-yellow-400 text-yellow-900" : "bg-muted text-muted-foreground"
                        }`}>
                          {idx + 1}
                        </div>
                        <span className="text-sm font-medium">{bid.bidderNickname}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-500">{bid.bidPrice.toLocaleString()}원</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(bid.createdAt).toLocaleString("ko-KR")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 경매 정보 사이드바 */}
          <div className="bg-card border rounded-lg p-6 self-start sticky top-24">
            <h3 className="mb-4 font-semibold">경매 정보</h3>
            <div className="space-y-3 text-sm">
              <InfoRow label="카드명" value={auction.cardName} />
              <InfoRow label="등급" value={auction.grade} />
              <InfoRow label="시작가" value={`${auction.startingPrice.toLocaleString()}원`} />
              {auction.buyoutPrice > 0 && (
                <InfoRow label="즉시구매가" value={`${auction.buyoutPrice.toLocaleString()}원`} />
              )}
              <InfoRow
                label="시작일"
                value={new Date(auction.startedAt).toLocaleDateString("ko-KR")}
              />
              <InfoRow
                label="종료일"
                value={new Date(auction.endedAt).toLocaleDateString("ko-KR")}
              />
              <InfoRow label="상태" value={statusInfo.label} />
            </div>
            <div className="mt-6 pt-4 border-t">
              <Link
                to="/auctions"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                경매 목록으로
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
    <div className="flex justify-between items-center py-1.5 border-b last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
