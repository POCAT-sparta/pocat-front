import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { getMyChats } from "@/api/chat/chatApi.ts";
import { useAuth } from "@/app/auth/context/AuthContext";
import { ChatRoomModal } from "@/app/chat/components/ChatRoomModal";
import type { ChatRoomListItem, ChatStatus } from "@/types/chat.types";

const STATUS_LABEL: Record<ChatStatus, { label: string; className: string }> = {
  ACTIVE: { label: "거래중", className: "bg-green-500/15 text-green-400" },
  COMPLETED: { label: "거래완료", className: "bg-white/10 text-white/50" },
  CANCELLED: { label: "취소됨", className: "bg-red-500/15 text-red-400" },
};

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "방금 전";
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}일 전`;
  return new Date(iso).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });
}

export function ChatList() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [chats, setChats] = useState<ChatRoomListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [active, setActive] = useState<ChatRoomListItem | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    getMyChats()
      .then(setChats)
      .catch(() => toast.error("채팅 목록을 불러오지 못했습니다."))
      .finally(() => setIsLoading(false));
  }, [authLoading, isAuthenticated, navigate]);

  function handleClose() {
    setActive(null);
    // 닫을 때 마지막 메시지/읽음 상태 갱신
    getMyChats().then(setChats).catch(() => {});
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white py-10 border-b border-white/10">
          <div className="container mx-auto px-4 max-w-3xl">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-[#FFCB05]" /> 내 채팅
            </h1>
            <p className="text-sm text-white/50 mt-1">거래 문의 대화를 한 곳에서 확인하세요.</p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded-2xl" />
              ))}
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">아직 진행 중인 채팅이 없어요.</p>
              <button
                onClick={() => navigate("/trade")}
                className="mt-2 px-5 py-2.5 rounded-xl bg-[#CC0000] hover:bg-[#aa0000] text-white text-sm font-semibold transition-colors"
              >
                거래게시판 둘러보기
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {chats.map((chat) => {
                const status = STATUS_LABEL[chat.status];
                return (
                  <li key={chat.chatId}>
                    <button
                      onClick={() => setActive(chat)}
                      className="w-full text-left bg-card border rounded-2xl p-4 flex items-center gap-4 hover:border-[#FFCB05]/40 hover:shadow-md transition-all"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#FFCB05] flex items-center justify-center text-[#1a1a2e] font-extrabold text-lg shrink-0">
                        {chat.opponentNickname[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">{chat.opponentNickname} 트레이너</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${status.className}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">📦 {chat.postTitle}</p>
                        <p className="text-sm text-foreground/70 truncate mt-1">
                          {chat.lastMessage ?? "아직 대화가 없습니다."}
                        </p>
                      </div>
                      <span className="text-[11px] text-muted-foreground shrink-0 self-start">
                        {formatRelative(chat.updatedAt)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {active && (
        <ChatRoomModal
          chatId={active.chatId}
          opponentNickname={active.opponentNickname}
          onClose={handleClose}
        />
      )}
    </>
  );
}
