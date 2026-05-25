import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Eye, MessageCircle, Pencil, Send, Trash2, X } from "lucide-react";
import { deleteTradePost, getTradePost } from "@/api/community/tradeCommunityApi";
import { useAuth } from "@/app/auth/context/AuthContext";
import type { TradePostDetail } from "@/types/community.types";
import { toast } from "sonner";

interface ChatMessage {
  id: number;
  sender: "me" | "seller";
  text: string;
  time: string;
}

function now() {
  return new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

function ChatModal({ sellerNickname, onClose }: { sellerNickname: string; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 0, sender: "seller", text: `안녕하세요! 판매글에 관심 가져주셔서 감사합니다 ⚡`, time: now() },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function sendMessage(text: string) {
    if (!text.trim()) return;
    const newMsg: ChatMessage = { id: Date.now(), sender: "me", text: text.trim(), time: now() };
    setMessages(prev => [...prev, newMsg]);
    setInput("");

    // Simulated auto-reply (replace with WebSocket in production)
    setTimeout(() => {
      const replies = [
        "네, 확인했습니다! 😊",
        "언제 거래 가능하신가요?",
        "택배 거래도 가능해요 📦",
        "카드 상태는 아주 좋습니다 ✨",
        "직거래라면 강남역 어떠세요?",
      ];
      const reply: ChatMessage = {
        id: Date.now() + 1,
        sender: "seller",
        text: replies[Math.floor(Math.random() * replies.length)],
        time: now(),
      };
      setMessages(prev => [...prev, reply]);
    }, 800 + Math.random() * 600);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Chat window */}
      <div className="relative w-full sm:w-[400px] h-[560px] sm:h-[520px] bg-background rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-white/10">
        {/* Chat header */}
        <div className="bg-[#1a1a2e] px-4 py-3.5 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-full bg-[#FFCB05] flex items-center justify-center text-[#1a1a2e] font-extrabold text-sm shrink-0">
            {sellerNickname[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{sellerNickname} 트레이너</p>
            <p className="text-[10px] text-[#FFCB05] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              온라인
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0f0f1a]">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"} gap-2`}>
              {msg.sender === "seller" && (
                <div className="w-7 h-7 rounded-full bg-[#FFCB05] flex items-center justify-center text-[#1a1a2e] font-bold text-[10px] shrink-0 mt-0.5">
                  {sellerNickname[0]?.toUpperCase()}
                </div>
              )}
              <div className={`max-w-[75%] space-y-0.5 ${msg.sender === "me" ? "items-end" : "items-start"} flex flex-col`}>
                <div className={`px-3.5 py-2.5 rounded-2xl text-sm ${
                  msg.sender === "me"
                    ? "bg-[#CC0000] text-white rounded-br-sm"
                    : "bg-[#1a1a2e] text-white rounded-bl-sm border border-white/10"
                }`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-white/30 px-1">{msg.time}</span>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Notice banner */}
        <div className="px-4 py-2 bg-amber-500/10 border-t border-amber-500/20 text-[10px] text-amber-400 text-center shrink-0">
          ⚡ 실시간 채팅은 준비 중입니다 — 시뮬레이션 모드로 동작 중
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t bg-[#1a1a2e] flex items-center gap-2 shrink-0">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }}}
            placeholder="메시지를 입력하세요..."
            className="flex-1 bg-white/10 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#FFCB05]/50 transition-colors"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            className="w-10 h-10 bg-[#CC0000] hover:bg-[#aa0000] text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-40 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function TradeBoardDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [post, setPost]         = useState<TradePostDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

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

  function handleChatOpen() {
    if (!isAuthenticated) { navigate("/login"); return; }
    setChatOpen(true);
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
                  className="flex items-center justify-center gap-2 w-full bg-[#CC0000] hover:bg-[#aa0000] text-white py-3.5 rounded-2xl font-bold transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  채팅으로 구매 문의하기
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

      {chatOpen && (
        <ChatModal sellerNickname={post.authorNickname} onClose={() => setChatOpen(false)} />
      )}
    </>
  );
}
