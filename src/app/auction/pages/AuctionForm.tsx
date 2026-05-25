import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, Gavel, ImageIcon, Search, Zap } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/auth/context/AuthContext";
import { getMyRequests } from "@/api/card/cardApi";
import { createAuction } from "@/api/auction/auctionApi";
import { CardItem } from "@/app/card/components/CardItem";
import type { CardResponse, CardGrade } from "@/types/card.types";

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

export function AuctionForm() {
  const navigate  = useNavigate();
  const { isAuthenticated } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: card selection
  const [cards,     setCards]     = useState<CardResponse[]>([]);
  const [cardQuery, setCardQuery] = useState("");
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [selectedCard, setSelectedCard] = useState<CardResponse | null>(null);

  // Step 2: auction details
  const [title,        setTitle]        = useState("");
  const [description,  setDescription]  = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [buyoutPrice,  setBuyoutPrice]  = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { navigate("/login"); return; }
    setIsLoadingCards(true);
    getMyRequests({ status: "ACTIVE", size: 100 })
      .then(res => setCards(res.content))
      .catch(() => setCards([]))
      .finally(() => setIsLoadingCards(false));
  }, [isAuthenticated, navigate]);

  const filteredCards = cards.filter(c =>
    c.name.toLowerCase().includes(cardQuery.toLowerCase()) ||
    c.setName.toLowerCase().includes(cardQuery.toLowerCase())
  );

  function handleSelectCard(card: CardResponse) {
    setSelectedCard(card);
    if (!title) setTitle(`[${card.grade}] ${card.name}`);
  }

  function handleNext() {
    if (!selectedCard) { toast.error("카드를 선택해주세요."); return; }
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCard) return;
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
      const res = await createAuction({
        cardId:       selectedCard.id,
        title:        title.trim(),
        description:  description.trim() || undefined,
        startingPrice: sp,
        buyoutPrice:  bp,
      });
      toast.success("🎉 경매가 등록되었습니다!");
      navigate(`/auctions/${res.auctionId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "등록에 실패했습니다.");
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
            onClick={() => step === 2 ? setStep(1) : navigate("/")}
            className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 2 ? "카드 선택으로" : "경매장으로"}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#CC0000] flex items-center justify-center shrink-0">
              <Gavel className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#FFCB05]">경매 등록</h1>
              <p className="text-sm text-white/50 mt-0.5">
                {step === 1 ? "Step 1 — 경매할 카드 선택" : "Step 2 — 경매 정보 입력"}
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-6">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step > s
                    ? "bg-green-500 text-white"
                    : step === s
                    ? "bg-[#CC0000] text-white"
                    : "bg-white/10 text-white/40"
                }`}>
                  {step > s ? <Check className="w-3.5 h-3.5" /> : s}
                </div>
                <span className={`text-xs ${step >= s ? "text-white/80" : "text-white/30"}`}>
                  {s === 1 ? "카드 선택" : "경매 정보"}
                </span>
                {s < 2 && <div className="w-8 h-px bg-white/20 mx-1" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-4xl">

        {/* ── Step 1: card picker ─────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={cardQuery}
                onChange={e => setCardQuery(e.target.value)}
                placeholder="카드 이름 또는 세트명으로 검색..."
                className="w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm bg-background focus:outline-none focus:border-[#CC0000] transition-colors"
              />
            </div>

            {isLoadingCards ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-[2/3] bg-muted rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredCards.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="text-5xl">💰</div>
                <p className="text-muted-foreground font-medium">등록된 카드가 없습니다.</p>
                <p className="text-sm text-muted-foreground">
                  경매를 등록하려면 먼저 카드를 등록하고 승인을 받아야 합니다.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {filteredCards.map(card => (
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

        {/* ── Step 2: auction details ──────────────────────────────────── */}
        {step === 2 && selectedCard && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Card preview (sidebar) */}
            <div className="md:col-span-1">
              <div className="sticky top-24 space-y-3">
                {selectedCard.imageUrl ? (
                  <CardItem
                    imageUrl={selectedCard.imageUrl}
                    name={selectedCard.name}
                    grade={selectedCard.grade as CardGrade}
                    className="w-full"
                  />
                ) : (
                  <div className="aspect-[2/3] rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex items-center justify-center text-5xl border border-white/10">
                    💰
                  </div>
                )}
                <div className="bg-card border rounded-2xl p-4 space-y-1 text-sm">
                  <p className="font-bold">{selectedCard.name}</p>
                  <p className="text-muted-foreground text-xs">{selectedCard.setName}</p>
                  <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded border ${gradeBadgeClass(selectedCard.grade)}`}>
                    {gradeLabel(selectedCard.grade)}
                  </span>
                </div>
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
                ⚡ 경매 등록 후 관리자 검수를 거쳐 활성화됩니다. 시작가와 즉시 구매가는 등록 후 변경이 어렵습니다.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> 이전
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#CC0000] hover:bg-[#aa0000] text-white py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                >
                  <Gavel className="w-4 h-4" />
                  {isSubmitting ? "등록 중..." : "경매 등록하기"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
