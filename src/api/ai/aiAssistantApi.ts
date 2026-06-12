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

      // 이벤트는 빈 줄(\n\n 또는 \r\n\r\n)로 구분된다.
      const blocks = buffer.split(/\r?\n\r?\n/);
      buffer = blocks.pop() ?? "";

      for (const block of blocks) {
        let event = "";
        // 한 이벤트에 data: 줄이 여러 개 올 수 있으며 \n 으로 이어붙여야 한다.
        // (백엔드가 줄바꿈 포함 청크를 보내면 Spring이 data: 줄을 분할해 전송함)
        const dataLines: string[] = [];

        for (const line of block.split(/\r?\n/)) {
          if (line.startsWith(":")) continue; // SSE 주석
          const colon = line.indexOf(":");
          const field = colon === -1 ? line : line.slice(0, colon);
          let val = colon === -1 ? "" : line.slice(colon + 1);
          // SSE 규격: 콜론 뒤 선두 공백은 "한 칸만" 제거 (마크다운 들여쓰기 보존)
          if (val.startsWith(" ")) val = val.slice(1);
          if (field === "event") event = val;
          else if (field === "data") dataLines.push(val);
        }

        const data = dataLines.join("\n");

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
