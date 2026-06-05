import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Eye, MessageCircle, Pencil, Trash2 } from "lucide-react";
import { deleteTradePost, getTradePost } from "@/api/community/tradeCommunityApi";
import { createChat, getMyChats } from "@/api/chat/chatApi";
import { ChatRoomModal } from "@/app/chat/components/ChatRoomModal";
import { useAuth } from "@/app/auth/context/AuthContext";
import type { TradePostDetail } from "@/types/community.types";
import { toast } from "sonner";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function TradeBoardDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [post, setPost]         = useState<TradePostDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatId, setChatId]     = useState<number | null>(null);
  const [chatOpening, setChatOpening] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    getTradePost(Number(id))
      .then(setPost)
      .catch(() => { toast.error("게시글을 불러오지 못했습니다."); navigate("/trade"); })
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  async function handleDelete() {
    if (!confirm("판매글을 삭제하시겠습니까?")) return;
    try {
      await deleteTradePost(Number(id));
      toast.success("판매글이 삭제되었습니다.");
      navigate("/trade");
    } catch { toast.error("삭제에 실패했습니다."); }
  }

  async function handleChatOpen() {
    if (!isAuthenticated) { navigate("/login"); return; }
    if (!post) return;
    setChatOpening(true);
    try {
      const chat = await createChat(post.id);
      setChatId(chat.chatId);
    } catch {
      // 이미 채팅방이 존재하는 경우(CHAT_ALREADY_EXISTS) → 기존 방을 찾아 연다
      try {
        const myChats = await getMyChats();
        const existing = myChats.find(
          (c) => c.postTitle === post.title && c.opponentNickname === post.authorNickname
        );
        if (existing) setChatId(existing.chatId);
        else toast.error("채팅방을 여는 데 실패했습니다.");
      } catch {
        toast.error("채팅방을 여는 데 실패했습니다.");
      }
    } finally {
      setChatOpening(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-3xl animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="aspect-[3/4] bg-muted rounded-xl w-64" />
        </div>
      </div>
    );
  }

  if (!post) return null;
  const isOwner = user?.id === post.authorId;

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white py-10 border-b border-white/10">
          <div className="container mx-auto px-4 max-w-3xl">
            <Link to="/trade" className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-3 transition-colors w-fit">
              <ArrowLeft className="w-4 h-4" /> 거래게시판
            </Link>
            <h1 className="text-xl font-bold text-white mb-2">{post.title}</h1>
            <div className="flex items-center gap-4 text-xs text-white/50">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-[#FFCB05] flex items-center justify-center text-[#1a1a2e] font-bold text-[9px]">
                  {post.authorNickname[0]?.toUpperCase()}
                </div>
                <span>{post.authorNickname}</span>
              </div>
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.viewCount}</span>
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Thumbnail */}
            <div className="aspect-[3/4] bg-muted rounded-2xl overflow-hidden">
              {post.thumbnail ? (
                <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
                  <svg viewBox="0 0 80 112" className="w-20 h-28 opacity-20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="2" width="76" height="108" rx="6" stroke="white" strokeWidth="3" />
                    <circle cx="40" cy="50" r="20" stroke="white" strokeWidth="2.5" />
                    <path d="M20 50 H60" stroke="white" strokeWidth="2.5" />
                    <circle cx="40" cy="50" r="6" fill="white" />
                  </svg>
                </div>
              )}
            </div>

            {/* Info panel */}
            <div className="flex flex-col gap-4">
              {/* Price */}
              <div className="bg-card border rounded-2xl p-5">
                <p className="text-xs text-muted-foreground mb-1">판매가</p>
                <p className="text-3xl font-extrabold text-[#CC0000]">{post.price.toLocaleString()}원</p>
              </div>

              {/* Seller info */}
              <div className="bg-card border rounded-2xl p-5 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#FFCB05] flex items-center justify-center text-[#1a1a2e] font-extrabold text-lg shrink-0">
                  {post.authorNickname[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">판매자</p>
                  <p className="font-semibold">{post.authorNickname} 트레이너</p>
                </div>
              </div>

              {/* Action buttons */}
              {!isOwner ? (
                <button
                  onClick={handleChatOpen}
                  disabled={chatOpening}
                  className="flex items-center justify-center gap-2 w-full bg-[#CC0000] hover:bg-[#aa0000] text-white py-3.5 rounded-2xl font-bold transition-colors disabled:opacity-50"
                >
                  <MessageCircle className="w-5 h-5" />
                  {chatOpening ? "채팅방 여는 중…" : "채팅으로 구매 문의하기"}
                </button>
              ) : (
                <div className="flex gap-2">
                  <Link
                    to={`/trade/${post.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-1.5 border py-3 rounded-2xl text-sm hover:bg-muted transition-colors"
                  >
                    <Pencil className="w-4 h-4" /> 수정
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-red-200 text-red-500 py-3 rounded-2xl text-sm hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> 삭제
                  </button>
                </div>
              )}

              {!isAuthenticated && (
                <p className="text-xs text-center text-muted-foreground">
                  <Link to="/login" className="text-[#CC0000] hover:underline">로그인</Link> 후 채팅 문의가 가능합니다.
                </p>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="bg-card border rounded-2xl p-6">
            <h3 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wide">상품 설명</h3>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{post.content}</p>
          </div>
        </div>
      </div>

      {chatId !== null && (
        <ChatRoomModal
          chatId={chatId}
          opponentNickname={post.authorNickname}
          onClose={() => setChatId(null)}
        />
      )}
    </>
  );
}
