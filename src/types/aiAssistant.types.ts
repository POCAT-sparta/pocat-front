export interface AiChatRequest {
  message: string;
  sessionId?: string;
}

export interface AiChatResponse {
  reply: string;
  sessionId: string;
  toolsUsed: string[];
  promptTokens: number;
  completionTokens: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
