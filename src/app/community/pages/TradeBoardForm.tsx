import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, ImageIcon } from "lucide-react";
import { createTradePost, getTradePost, updateTradePost } from "@/api/community/tradeCommunityApi";
import { useAuth } from "@/app/auth/context/AuthContext";
import { toast } from "sonner";

export function TradeBoardForm() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [title,     setTitle]     = useState("");
  const [content,   setContent]   = useState("");
  const [price,     setPrice]     = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [isLoading,  setIsLoading]  = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);

  useEffect(() => {
    if (!isAuthenticated) { navigate("/login"); return; }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isEdit) return;
    setIsFetching(true);
    getTradePost(Number(id))
      .then(post => {
        if (user && user.id !== post.authorId) { toast.error("수정 권한이 없습니다."); navigate(`/trade/${id}`); return; }
        setTitle(post.title);
        setContent(post.content);
        setPrice(String(post.price));
        setThumbnail(post.thumbnail ?? "");
      })
      .catch(() => { toast.error("게시글을 불러오지 못했습니다."); navigate("/trade"); })
      .finally(() => setIsFetching(false));
  }, [id, isEdit, navigate, user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !price) {
      toast.error("제목, 내용, 가격을 입력해주세요.");
      return;
    }
    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("올바른 가격을 입력해주세요.");
      return;
    }
    setIsLoading(true);
    try {
      if (isEdit) {
        await updateTradePost(Number(id), {
          title: title.trim(),
          content: content.trim(),
          price: priceNum,
          thumbnail: thumbnail.trim() || undefined,
        });
        toast.success("수정되었습니다.");
        navigate(`/trade/${id}`);
      } else {
        const post = await createTradePost({
          title: title.trim(),
          content: content.trim(),
          price: priceNum,
          thumbnail: thumbnail.trim() || undefined,
        });
        toast.success("판매글이 등록되었습니다.");
        navigate(`/trade/${post.id}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse">불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white py-10 border-b border-white/10">
        <div className="container mx-auto px-4">
          <button onClick={() => navigate(isEdit ? `/trade/${id}` : "/trade")} className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" /> 돌아가기
          </button>
          <h1 className="text-2xl font-extrabold text-[#FFCB05]">
            {isEdit ? "판매글 수정" : "판매글 등록"}
          </h1>
          <p className="text-sm text-white/50 mt-1">거래게시판</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-1.5">제목</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={100}
              placeholder="판매할 카드 이름 등을 입력하세요"
              className="w-full border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-[#CC0000] transition-colors"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-semibold mb-1.5">판매 가격</label>
            <div className="relative">
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                min={0}
                placeholder="0"
                className="w-full border rounded-xl px-4 py-2.5 pr-10 text-sm bg-background focus:outline-none focus:border-[#CC0000] transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">원</span>
            </div>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-semibold mb-1.5">
              <ImageIcon className="w-4 h-4 inline mr-1" />
              썸네일 이미지 URL <span className="font-normal text-muted-foreground">(선택)</span>
            </label>
            <input
              value={thumbnail}
              onChange={e => setThumbnail(e.target.value)}
              placeholder="https://..."
              className="w-full border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-[#CC0000] transition-colors"
            />
            {thumbnail && (
              <div className="mt-2 w-24 h-32 rounded-xl overflow-hidden border">
                <img src={thumbnail} alt="미리보기" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
              </div>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold mb-1.5">설명</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={10}
              placeholder="카드 상태, 거래 방식 등 상세 내용을 입력하세요"
              className="w-full border rounded-xl px-4 py-3 text-sm bg-background resize-none focus:outline-none focus:border-[#CC0000] transition-colors"
            />
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-xs text-amber-700 dark:text-amber-300">
            ⚡ 판매글 등록 후 구매 희망자가 채팅으로 연락드립니다.
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(isEdit ? `/trade/${id}` : "/trade")}
              className="flex-1 border py-2.5 rounded-xl text-sm hover:bg-muted transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-[#CC0000] hover:bg-[#aa0000] text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {isLoading ? "저장 중..." : isEdit ? "수정 완료" : "판매글 등록"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
