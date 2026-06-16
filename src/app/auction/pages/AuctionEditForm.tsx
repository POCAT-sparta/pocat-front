import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { ArrowLeft, Gavel, ImageIcon, Zap } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/auth/context/AuthContext";
import { getAuctionDetail, updateAuction } from "@/api/auction/auctionApi";
import type { AuctionListItem } from "@/types/auction.types";

function gradeLabel(grade: string) {
  if (grade === "PSA_10") return "⭐ PSA 10";
  if (grade === "BGS_10") return "💎 BGS 10";
  if (grade === "PSA_9")  return "🥈 PSA 9";
  return grade;
}

function gradeBadgeClass(grade: string) {
  if (grade === "PSA_10") return "bg-amber-400/20 text-amber-300 border-amber-400/40";
  if (grade === "BGS_10") return "bg-rose-400/20 text-rose-300 border-rose-400/40";
  return "bg-slate-400/20 text-slate-300 border-slate-400/40";
}

export function AuctionEditForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { auctionId } = useParams<{ auctionId: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // MyAuctions 카드에서 넘겨준 목록 데이터 (검수중 경매는 상세 조회 불가 → 이 값으로 prefill)
  const stateAuction = (location.state as { auction?: AuctionListItem } | null)?.auction;

  const [card, setCard] = useState<{ name: string; grade: string; imageUrl: string | null } | null>(
    stateAuction
      ? { name: stateAuction.cardName, grade: stateAuction.grade, imageUrl: stateAuction.cardImageUrl }
      : null
  );

  const [title,         setTitle]         = useState(stateAuction?.title ?? "");
  const [description,   setDescription]   = useState("");
  const [startingPrice, setStartingPrice] = useState(stateAuction ? String(stateAuction.startingPrice) : "");
  const [buyoutPrice,   setBuyoutPrice]   = useState(stateAuction?.buyoutPrice ? String(stateAuction.buyoutPrice) : "");

  const [isLoading,    setIsLoading]    = useState(!stateAuction);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { navigate("/login"); return; }
    if (!auctionId) { navigate("/my-auctions"); return; }

    // 상세 조회로 설명(description)까지 보강. 검수중(미공개) 경매는 에러가 날 수 있어
    // state 데이터가 있으면 무시하고 진행, 없으면 목록으로 되돌린다.
    getAuctionDetail(Number(auctionId))
      .then((detail) => {
        setCard({ name: detail.cardName, grade: detail.grade, imageUrl: detail.cardImageUrl });
        setTitle((prev) => prev || detail.title);
        setDescription(detail.description ?? "");
        setStartingPrice((prev) => prev || String(detail.startingPrice));
        setBuyoutPrice((prev) => prev || (detail.buyoutPrice ? String(detail.buyoutPrice) : ""));
      })
      .catch(() => {
        if (!stateAuction) {
          toast.error("경매 정보를 불러오지 못했습니다.");
          navigate("/my-auctions");
        }
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auctionId, isAuthenticated, authLoading, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!auctionId) return;
    if (!title.trim() || !startingPrice) {
      toast.error("제목과 시작가를 입력해주세요.");
      return;
    }
    const sp = Number(startingPrice);
    const bp = buyoutPrice ? Number(buyoutPrice) : undefined;
    if (isNaN(sp) || sp <= 0) { toast.error("올바른 시작가를 입력해주세요."); return; }
    if (bp !== undefined && bp <= sp) { toast.error("즉시 구매가는 시작가보다 높아야 합니다."); return; }

    setIsSubmitting(true);
    try {
      await updateAuction(Number(auctionId), {
        title:         title.trim(),
        description:   description.trim() || undefined,
        startingPrice: sp,
        buyoutPrice:   bp,
      });
      toast.success("경매 정보가 수정되었습니다.");
      navigate("/my-auctions");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "수정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header banner ──────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white py-10 border-b border-white/10">
        <div className="container mx-auto px-4 max-w-4xl">
          <button
            onClick={() => navigate("/my-auctions")}
            className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> 내 경매로
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#CC0000] flex items-center justify-center shrink-0">
              <Gavel className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#FFCB05]">경매 수정</h1>
              <p className="text-sm text-white/50 mt-0.5">경매 정보를 수정합니다</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
            <div className="md:col-span-1 aspect-[2/3] bg-muted rounded-2xl" />
            <div className="md:col-span-2 space-y-5">
              <div className="h-10 bg-muted rounded-xl" />
              <div className="h-10 bg-muted rounded-xl" />
              <div className="h-24 bg-muted rounded-xl" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card preview (sidebar) */}
            <div className="md:col-span-1">
              <div className="sticky top-24 space-y-3">
                {card?.imageUrl ? (
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    className="w-full aspect-[2/3] object-cover rounded-2xl border border-white/10"
                  />
                ) : (
                  <div className="aspect-[2/3] rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex items-center justify-center text-5xl border border-white/10">
                    💰
                  </div>
                )}
                {card && (
                  <div className="bg-card border rounded-2xl p-4 space-y-1 text-sm">
                    <p className="font-bold">{card.name}</p>
                    <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded border ${gradeBadgeClass(card.grade)}`}>
                      {gradeLabel(card.grade)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="md:col-span-2 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold mb-1.5">경매 제목</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  maxLength={100}
                  placeholder="예) [PSA 10] 리자몽 1세대 홀로그래픽"
                  className="w-full border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-[#CC0000] transition-colors"
                />
              </div>

              {/* Starting price */}
              <div>
                <label className="block text-sm font-semibold mb-1.5">시작가 <span className="text-[#CC0000]">*</span></label>
                <div className="relative">
                  <input
                    type="number"
                    value={startingPrice}
                    onChange={e => setStartingPrice(e.target.value)}
                    min={1}
                    placeholder="0"
                    className="w-full border rounded-xl px-4 py-2.5 pr-10 text-sm bg-background focus:outline-none focus:border-[#CC0000] transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">원</span>
                </div>
              </div>

              {/* Buyout price */}
              <div>
                <label className="block text-sm font-semibold mb-1.5">
                  <Zap className="w-4 h-4 inline mr-1 text-[#FFCB05]" />
                  즉시 구매가 <span className="font-normal text-muted-foreground">(선택)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={buyoutPrice}
                    onChange={e => setBuyoutPrice(e.target.value)}
                    min={1}
                    placeholder="설정 시 즉시 구매 가능"
                    className="w-full border rounded-xl px-4 py-2.5 pr-10 text-sm bg-background focus:outline-none focus:border-[#FFCB05] transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">원</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold mb-1.5">
                  <ImageIcon className="w-4 h-4 inline mr-1" />
                  경매 설명 <span className="font-normal text-muted-foreground">(선택)</span>
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={6}
                  placeholder="카드 상태, 특이사항, 거래 방식 등을 입력하세요..."
                  className="w-full border rounded-xl px-4 py-3 text-sm bg-background resize-none focus:outline-none focus:border-[#CC0000] transition-colors"
                />
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-xs text-amber-700 dark:text-amber-300">
                ⚡ 입찰이 시작된 경매는 시작가·즉시 구매가 변경이 제한될 수 있습니다.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/my-auctions")}
                  className="px-4 py-2.5 border rounded-xl text-sm hover:bg-muted transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#CC0000] hover:bg-[#aa0000] text-white py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                >
                  <Gavel className="w-4 h-4" />
                  {isSubmitting ? "저장 중..." : "수정 완료"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
