import { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import { useAuth } from "@/app/auth/context/AuthContext";
import { useChatRoom } from "@/app/chat/hooks/useChatRoom";

interface ChatRoomModalProps {
  chatId: number;
  opponentNickname: string;
  onClose: () => void;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatRoomModal({ chatId, opponentNickname, onClose }: ChatRoomModalProps) {
  const { user } = useAuth();
  const { messages, connected, loading, opponentRead, sendMessage } = useChatRoom(
    chatId,
    user?.id
  );
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    if (!input.trim()) return;
    if (sendMessage(input)) setInput("");
  }

  const lastMineIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].mine) return i;
    }
    return -1;
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Chat window */}
      <div className="relative w-full sm:w-[400px] h-[560px] sm:h-[520px] bg-background rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-white/10">
        {/* Chat header */}
        <div className="bg-[#1a1a2e] px-4 py-3.5 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-full bg-[#FFCB05] flex items-center justify-center text-[#1a1a2e] font-extrabold text-sm shrink-0">
            {opponentNickname[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{opponentNickname} 트레이너</p>
            <p className="text-[10px] flex items-center gap-1">
              <span
                className={`w-1.5 h-1.5 rounded-full inline-block ${
                  connected ? "bg-green-400" : "bg-white/30"
                }`}
              />
              <span className={connected ? "text-[#FFCB05]" : "text-white/40"}>
                {connected ? "실시간 연결됨" : "연결 중…"}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0f0f1a]">
          {loading ? (
            <div className="flex items-center justify-center h-full text-white/30 text-sm">
              대화 내용을 불러오는 중…
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/30 text-sm gap-1">
              <span className="text-2xl">⚡</span>
              <span>첫 메시지를 보내 거래를 시작해보세요!</span>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={msg.key}
                className={`flex ${msg.mine ? "justify-end" : "justify-start"} gap-2`}
              >
                {!msg.mine && (
                  <div className="w-7 h-7 rounded-full bg-[#FFCB05] flex items-center justify-center text-[#1a1a2e] font-bold text-[10px] shrink-0 mt-0.5">
                    {msg.senderNickname[0]?.toUpperCase()}
                  </div>
                )}
                <div
                  className={`max-w-[75%] space-y-0.5 ${
                    msg.mine ? "items-end" : "items-start"
                  } flex flex-col`}
                >
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-wrap break-words ${
                      msg.mine
                        ? "bg-[#CC0000] text-white rounded-br-sm"
                        : "bg-[#1a1a2e] text-white rounded-bl-sm border border-white/10"
                    }`}
                  >
                    {msg.message}
                  </div>
                  <span className="text-[10px] text-white/30 px-1 flex items-center gap-1">
                    {msg.mine && idx === lastMineIndex && opponentRead && (
                      <span className="text-[#FFCB05]">읽음</span>
                    )}
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t bg-[#1a1a2e] flex items-center gap-2 shrink-0">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="메시지를 입력하세요..."
            className="flex-1 bg-white/10 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#FFCB05]/50 transition-colors"
          />
          <button
            onClick={handleSend}
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
