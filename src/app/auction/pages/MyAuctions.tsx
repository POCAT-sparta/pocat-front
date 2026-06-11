import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Gavel, Heart, Plus, Clock, Trophy, Package } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/auth/context/AuthContext";
import { getMyAuctions } from "@/api/auction/auctionApi";
import { getMyLikes } from "@/api/auction/likeApi";
import type { AuctionListItem } from "@/types/auction.types";
import type { LikeResponse } from "@/types/like.types";

function gradeBadgeClass(grade: string) {
  if (grade === "PSA_10") return "bg-amber-400/20 text-amber-300 border-amber-400/40";
  if (grade === "BGS_10") return "bg-rose-400/20 text-rose-300 border-rose-400/40";
  return "bg-slate-400/20 text-slate-300 border-slate-400/40";
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ACTIVE:          { label: "진행중",   color: "bg-green-500/20 text-green-400 border-green-500/30" },
  PENDING:         { label: "검수중",   color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  ENDED:           { label: "종료",     color: "bg-white/10 text-white/50 border-white/20" },
  CANCELLED:       { label: "취소됨",   color: "bg-red-500/20 text-red-400 border-red-500/30" },
  PAYMENT_PENDING: { label: "결제 대기", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  INSPECTING:      { label: "검수중",   color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  REJECTED:        { label: "반려됨",   color: "bg-red-500/20 text-red-400 border-red-500/30" },
  NO_BIDDER:       { label: "유찰",     color: "bg-white/10 text-white/50 border-white/20" },
};

/**
 * 검수 전(미공개) 상태. 검수 합격으로 ACTIVE 가 되기 전까진 공개 경매 상세가
 * 존재하지 않아, 상세 페이지(GET /auctions/{id})가 에러를 반환한다 → 진입 차단.
 */
const PRE_PUBLISH_STATUSES = ["PENDING", "INSPECTING", "REJECTED"];
function isAuctionViewable(status: string) {
  return !PRE_PUBLISH_STATUSES.includes(status);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });
}

function AuctionCard({ auction, onClick }: { auction: AuctionListItem; onClick: () => void }) {
  const status = STATUS_CONFIG[auction.status] ?? { label: auction.status, color: "bg-white/10 text-white/50 border-white/20" };
  const viewable = isAuctionViewable(auction.status);
  return (
    <div
      onClick={onClick}
      className={`bg-card border rounded-2xl overflow-hidden transition-all group ${
        viewable ? "hover:shadow-lg hover:border-[#CC0000]/30 cursor-pointer" : "cursor-default"
      }`}
    >
      <div className="aspect-[3/2] bg-muted relative overflow-hidden">
        {auction.cardImageUrl ? (
          <img
            src={auction.cardImageUrl}
            alt={auction.cardName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
            💰
          </div>
        )}
        <span className={`absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-lg border font-medium ${gradeBadgeClass(auction.grade)}`}>
          {auction.grade}
        </span>
        <span className={`absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-lg border font-medium ${status.color}`}>
          {status.label}
        </span>
      </div>
      <div className="p-3 space-y-1.5">
        <p className="text-sm font-semibold line-clamp-1 group-hover:text-[#CC0000] transition-colors">{auction.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-1">{auction.cardName}</p>
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-extrabold text-[#CC0000]">{(auction.highestPrice ?? auction.startingPrice).toLocaleString()}원</span>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="w-3 h-3" />
            {formatDate(auction.endedAt)}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MyAuctions() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"selling" | "likes">("selling");

  const [myAuctions,    setMyAuctions]    = useState<AuctionListItem[]>([]);
  const [myLikes,       setMyLikes]       = useState<LikeResponse[]>([]);
  const [isLoading,     setIsLoading]     = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { navigate("/login"); return; }

    setIsLoading(true);
    Promise.all([
      getMyAuctions({ size: 50 }).catch(() => ({ content: [] as AuctionListItem[] })),
      getMyLikes(0, 50).catch(() => ({ content: [] as LikeResponse[] })),
    ]).then(([auctionRes, likeRes]) => {
      setMyAuctions(auctionRes.content);
      setMyLikes(likeRes.content);
    }).finally(() => setIsLoading(false));
  }, [isAuthenticated, authLoading, navigate]);

  const activeAuctions = myAuctions.filter(a => ["ACTIVE", "PENDING", "INSPECTING"].includes(a.status));
  const endedAuctions  = myAuctions.filter(a => ["ENDED", "PAYMENT_PENDING", "CANCELLED", "REJECTED", "NO_BIDDER"].includes(a.status));

  function openAuction(a: AuctionListItem) {
    if (!isAuctionViewable(a.status)) {
      toast.info(
        a.status === "REJECTED"
          ? "검수에서 반려된 경매입니다. 경매장에 공개되지 않습니다."
          : "아직 검수 중인 경매입니다. 검수 완료 후 경매장에 공개됩니다."
      );
      return;
    }
    navigate(`/auctions/${a.auctionId}`);
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] h-40 animate-pulse" />
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/2] bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white py-10 border-b border-white/10">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#FFCB05] flex items-center justify-center text-[#1a1a2e] font-extrabold text-xl shrink-0">
                {user?.nickname?.[0]?.toUpperCase() ?? "T"}
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wide">트레이너</p>
                <h1 className="text-2xl font-extrabold text-[#FFCB05]">{user?.nickname}</h1>
                <p className="text-xs text-white/60 mt-0.5">내 경매 관리</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/auctions/new")}
              className="flex items-center gap-2 bg-[#CC0000] hover:bg-[#aa0000] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" /> 경매 등록
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white/5 rounded-xl px-4 py-3 text-center">
              <p className="text-2xl font-extrabold text-[#FFCB05]">{activeAuctions.length}</p>
              <p className="text-xs text-white/60 mt-0.5">진행 중</p>
            </div>
            <div className="bg-white/5 rounded-xl px-4 py-3 text-center">
              <p className="text-2xl font-extrabold text-white">{endedAuctions.length}</p>
              <p className="text-xs text-white/60 mt-0.5">종료된 경매</p>
            </div>
            <div className="bg-white/5 rounded-xl px-4 py-3 text-center">
              <p className="text-2xl font-extrabold text-rose-400">{myLikes.length}</p>
              <p className="text-xs text-white/60 mt-0.5">관심 경매</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-5xl">

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <div className="flex gap-2 mb-8 border-b border-border">
          {[
            { id: "selling" as const, label: "판매 경매", icon: <Package className="w-4 h-4" /> },
            { id: "likes"   as const, label: "관심 경매",  icon: <Heart className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? "border-[#CC0000] text-[#CC0000]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── Selling tab ─────────────────────────────────────────────────── */}
        {activeTab === "selling" && (
          <div className="space-y-8">
            {/* Active */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <h2 className="font-bold text-sm uppercase tracking-wide">진행 중인 경매</h2>
                <span className="text-xs text-muted-foreground">({activeAuctions.length})</span>
              </div>
              {activeAuctions.length === 0 ? (
                <div className="bg-card border rounded-2xl p-10 text-center space-y-3">
                  <div className="text-4xl">⚡</div>
                  <p className="text-muted-foreground text-sm">진행 중인 경매가 없습니다.</p>
                  <button
                    onClick={() => navigate("/auctions/new")}
                    className="inline-flex items-center gap-2 bg-[#CC0000] hover:bg-[#aa0000] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                  >
                    <Plus className="w-4 h-4" /> 경매 등록하기
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {activeAuctions.map(a => (
                    <AuctionCard key={a.auctionId} auction={a} onClick={() => openAuction(a)} />
                  ))}
                </div>
              )}
            </div>

            {/* Ended */}
            {endedAuctions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Gavel className="w-4 h-4 text-muted-foreground" />
                  <h2 className="font-bold text-sm uppercase tracking-wide text-muted-foreground">종료된 경매</h2>
                  <span className="text-xs text-muted-foreground">({endedAuctions.length})</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {endedAuctions.map(a => (
                    <AuctionCard key={a.auctionId} auction={a} onClick={() => openAuction(a)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Likes tab ───────────────────────────────────────────────────── */}
        {activeTab === "likes" && (
          <div>
            {myLikes.length === 0 ? (
              <div className="bg-card border rounded-2xl p-12 text-center space-y-3">
                <div className="text-5xl">💔</div>
                <p className="text-muted-foreground">관심 경매가 없습니다.</p>
                <p className="text-xs text-muted-foreground">경매장에서 하트를 눌러 관심 경매를 추가하세요.</p>
                <button
                  onClick={() => navigate("/")}
                  className="inline-flex items-center gap-2 bg-[#CC0000] hover:bg-[#aa0000] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                >
                  <Trophy className="w-4 h-4" /> 경매장 가기
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {myLikes.map(like => (
                  <div
                    key={like.auctionId}
                    onClick={() => navigate(`/auctions/${like.auctionId}`)}
                    className="bg-card border rounded-2xl overflow-hidden hover:shadow-lg hover:border-rose-500/30 transition-all cursor-pointer group"
                  >
                    <div className="aspect-[3/2] bg-muted relative overflow-hidden">
                      {like.cardImageUrl ? (
                        <img src={like.cardImageUrl} alt={like.cardName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">💰</div>
                      )}
                      <div className="absolute top-2 right-2 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center">
                        <Heart className="w-3 h-3 text-white fill-white" />
                      </div>
                    </div>
                    <div className="p-3 space-y-1">
                      <p className="text-sm font-semibold line-clamp-1 group-hover:text-[#CC0000] transition-colors">{like.cardName}</p>
                      <p className="text-sm font-extrabold text-[#CC0000]">{like.highestPrice?.toLocaleString()}원</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
