import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ImagePlus, Library } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/auth/context/AuthContext";
import { createCard, createCardWithImage } from "@/api/card/cardApi";
import { SeriesSetFilter, type SeriesSetSelection } from "@/app/card/components/SeriesSetFilter";
import type { CardCategory, CardGrade, CreateCardRequest } from "@/types/card.types";

const CATEGORIES: { label: string; value: CardCategory }[] = [
  { label: "포켓몬", value: "POKEMON" },
  { label: "트레이너", value: "TRAINERS" },
  { label: "에너지", value: "ENERGY" },
];

const GRADES: { label: string; value: CardGrade }[] = [
  { label: "PSA 10", value: "PSA_10" },
  { label: "PSA 9", value: "PSA_9" },
  { label: "BGS 10", value: "BGS_10" },
];

export function CardRegister() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [sel, setSel] = useState<SeriesSetSelection>({ series: null, set: null });
  const [name, setName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [rarity, setRarity] = useState("");
  const [category, setCategory] = useState<CardCategory>("POKEMON");
  const [grade, setGrade] = useState<CardGrade>("PSA_10");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sel.series || !sel.set) {
      toast.error("시리즈와 세트를 선택해주세요.");
      return;
    }
    if (!name.trim() || !cardNumber.trim() || !rarity.trim()) {
      toast.error("카드명, 카드번호, 레어도를 입력해주세요.");
      return;
    }

    const req: CreateCardRequest = {
      name: name.trim(),
      series: sel.series.name,
      setId: sel.set.setId,
      setName: sel.set.name,
      cardNumber: cardNumber.trim(),
      rarity: rarity.trim(),
      category,
      grade,
      source: "MANUAL",
    };

    setIsSubmitting(true);
    try {
      if (imageFile) await createCardWithImage(req, imageFile);
      else await createCard(req);
      toast.success("🎉 등록 완료! 관리자 승인 후 도감에 추가됩니다.");
      navigate("/cards");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "w-full border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-[#CC0000] transition-colors";

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white py-10 border-b border-white/10">
        <div className="container mx-auto px-4 max-w-2xl">
          <button
            onClick={() => navigate("/cards")}
            className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> 카드도감으로
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#CC0000] flex items-center justify-center shrink-0">
              <Library className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#FFCB05]">도감에 카드 추가</h1>
              <p className="text-sm text-white/50 mt-0.5">관리자 승인 후 도감에 등록됩니다.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1.5">시리즈 / 세트 <span className="text-[#CC0000]">*</span></label>
            <SeriesSetFilter includeAll={false} onChange={setSel} />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">카드명 <span className="text-[#CC0000]">*</span></label>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} placeholder="예) 리자몽 ex" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">카드번호 <span className="text-[#CC0000]">*</span></label>
              <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} maxLength={20} placeholder="예) 006/165" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">레어도 <span className="text-[#CC0000]">*</span></label>
              <input value={rarity} onChange={(e) => setRarity(e.target.value)} maxLength={50} placeholder="예) Rare Holo" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">카테고리 <span className="text-[#CC0000]">*</span></label>
              <select value={category} onChange={(e) => setCategory(e.target.value as CardCategory)} className={inputClass}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">등급 <span className="text-[#CC0000]">*</span></label>
              <select value={grade} onChange={(e) => setGrade(e.target.value as CardGrade)} className={inputClass}>
                {GRADES.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">
              <ImagePlus className="w-4 h-4 inline mr-1" />
              카드 이미지 <span className="font-normal text-muted-foreground">(선택)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#CC0000] file:text-white file:text-xs file:font-semibold hover:file:bg-[#aa0000] file:cursor-pointer"
            />
            {imageFile && <p className="text-xs text-muted-foreground mt-1.5">{imageFile.name}</p>}
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-xs text-amber-700 dark:text-amber-300">
            ⚡ 등록 후 관리자 검수를 거쳐 도감에 추가됩니다. 승인 전에는 경매에 사용할 수 없습니다.
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-[#CC0000] hover:bg-[#aa0000] text-white py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
          >
            <Library className="w-4 h-4" />
            {isSubmitting ? "등록 중..." : "도감에 등록하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
