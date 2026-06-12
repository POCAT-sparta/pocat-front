import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Bot, Send } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/auth/context/AuthContext";
import { streamAssistant } from "@/api/ai/aiAssistantApi";
import type { ChatMessage } from "@/types/aiAssistant.types";

const MAX_MESSAGE_LENGTH = 2000;

export function AiAssistant() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const trimmedLength = input.length;
  const isOverLimit = trimmedLength > MAX_MESSAGE_LENGTH;
  const canSend = input.trim().length > 0 && !isOverLimit && !isStreaming;

  async function handleSend() {
    const message = input.trim();
    if (!message || isOverLimit || isStreaming) return;

    const currentSessionId = sessionId ?? crypto.randomUUID();
    if (!sessionId) setSessionId(currentSessionId);

    setMessages((prev) => [
      ...prev,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);
    setInput("");
    setIsStreaming(true);

    await streamAssistant(message, currentSessionId, {
      onMessage: (chunk) => {
        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: updated[lastIndex].content + chunk,
          };
          return updated;
        });
      },
      onDone: () => {
        setIsStreaming(false);
      },
      onError: (msg) => {
        toast.error(msg || "AI 응답 중 오류가 발생했습니다.");
        setIsStreaming(false);
      },
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">로딩 중…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white py-10 border-b border-white/10">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-2xl font-bold flex items-center gap-2">🤖 AI 어시스턴트</h1>
          <p className="text-sm text-white/50 mt-1">
            카드, 경매, 입찰에 대해 무엇이든 물어보세요. AI가 실시간으로 답변해드려요.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6 max-w-3xl flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-[400px]">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-24">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Bot className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">
                카드, 경매, 입찰에 대해 물어보세요.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-wrap break-words ${
                    msg.role === "user"
                      ? "bg-[#CC0000] text-white rounded-br-sm"
                      : "bg-card border rounded-bl-sm"
                  }`}
                >
                  {msg.content || (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" />
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t pt-4">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              placeholder="메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
              rows={2}
              className="flex-1 bg-card border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#FFCB05]/50 transition-colors resize-none disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!canSend}
              className="shrink-0 w-10 h-10 bg-[#CC0000] hover:bg-[#aa0000] text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex justify-end mt-1">
            <span
              className={`text-[11px] ${
                isOverLimit ? "text-[#CC0000] font-semibold" : "text-muted-foreground"
              }`}
            >
              {trimmedLength} / {MAX_MESSAGE_LENGTH}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
