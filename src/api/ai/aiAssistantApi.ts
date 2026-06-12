import { apiClient, getAccessToken } from "@/shared/lib/apiClient.ts";
import type { ApiResponse } from "@/shared/types/api.ts";
import type { AiChatResponse } from "@/types/aiAssistant.types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

/** AI 어시스턴트 비스트리밍 채팅 */
export async function chatWithAi(message: string, sessionId?: string): Promise<AiChatResponse> {
  const res = await apiClient.post<ApiResponse<AiChatResponse>>("/api/ai/assistant/chat", {
    message,
    sessionId,
  });
  return res.data;
}

interface StreamHandlers {
  onMessage: (chunk: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}

/** AI 어시스턴트 SSE 스트리밍 채팅 */
export async function streamAssistant(
  message: string,
  sessionId: string,
  handlers: StreamHandlers,
  signal?: AbortSignal
): Promise<void> {
  try {
    const query = new URLSearchParams({ message, sessionId });
    const res = await fetch(`${BASE_URL}/api/ai/assistant/stream?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
        Accept: "text/event-stream",
      },
      signal,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "요청 실패" }));
      handlers.onError(err.message ?? "요청 실패");
      return;
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const blocks = buffer.split("\n\n");
      buffer = blocks.pop() ?? "";

      for (const block of blocks) {
        let event = "";
        let data = "";

        for (const line of block.split("\n")) {
          if (line.startsWith("event:")) {
            event = line.slice("event:".length).trimStart();
          } else if (line.startsWith("data:")) {
            data = line.slice("data:".length).trimStart();
          }
        }

        if (event === "message") {
          handlers.onMessage(data);
        } else if (event === "done") {
          handlers.onDone();
        } else if (event === "error") {
          handlers.onError(data);
        }
      }
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") return;
    throw e;
  }
}
