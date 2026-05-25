import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, PenLine } from "lucide-react";
import { createPost, getPost, updatePost } from "@/api/community/freeCommunityApi";
import { useAuth } from "@/app/auth/context/AuthContext";
import { toast } from "sonner";

export function FreeBoardForm() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [title,   setTitle]   = useState("");
  const [content, setContent] = useState("");
  const [isLoading,  setIsLoading]  = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);

  useEffect(() => {
    if (!isAuthenticated) { navigate("/login"); return; }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isEdit) return;
    setIsFetching(true);
    getPost(Number(id))
      .then(post => { setTitle(post.title); setContent(post.content); })
      .catch(() => { toast.error("게시글을 불러오지 못했습니다."); navigate("/free"); })
      .finally(() => setIsFetching(false));
  }, [id, isEdit, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { toast.error("제목과 내용을 입력해주세요."); return; }
    setIsLoading(true);
    try {
      if (isEdit) {
        await updatePost(Number(id), { title: title.trim(), content: content.trim() });
        toast.success("수정되었습니다.");
        navigate(`/free/${id}`);
      } else {
        const post = await createPost({ title: title.trim(), content: content.trim() });
        toast.success("게시글이 등록되었습니다.");
        navigate(`/free/${post.id}`);
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
        <div className="container mx-auto px-4 max-w-2xl">
          <button onClick={() => navigate(isEdit ? `/free/${id}` : "/free")} className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" /> 돌아가기
          </button>
          <div className="flex items-center gap-2">
            <PenLine className="w-5 h-5 text-[#FFCB05]" />
            <h1 className="text-2xl font-extrabold text-[#FFCB05]">
              {isEdit ? "게시글 수정" : "새 게시글"}
            </h1>
          </div>
          <p className="text-sm text-white/50 mt-1">자유게시판</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1.5">제목</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={100}
              placeholder="제목을 입력하세요"
              className="w-full border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-[#CC0000] transition-colors"
            />
            <p className="text-[11px] text-muted-foreground mt-1 text-right">{title.length}/100</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">내용</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={14}
              placeholder="내용을 입력하세요"
              className="w-full border rounded-xl px-4 py-3 text-sm bg-background resize-none focus:outline-none focus:border-[#CC0000] transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(isEdit ? `/free/${id}` : "/free")}
              className="flex-1 border py-2.5 rounded-xl text-sm hover:bg-muted transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-[#CC0000] hover:bg-[#aa0000] text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {isLoading ? "저장 중..." : isEdit ? "수정 완료" : "등록하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
