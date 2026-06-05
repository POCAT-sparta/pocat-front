import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getChatMessages, markChatAsRead } from "@/api/chat/chatApi.ts";
import {
  onConnectionChange,
  publishChatMessage,
  publishChatRead,
  subscribeChat,
} from "@/shared/lib/chatSocket.ts";
import type { ChatMessage } from "@/types/chat.types";

export interface UiMessage {
  key: string;
  senderId: number;
  senderNickname: string;
  message: string;
  createdAt: string;
  mine: boolean;
}

function toUi(msg: ChatMessage, currentUserId?: number): UiMessage {
  return {
    key: `h-${msg.id}`,
    senderId: msg.senderId,
    senderNickname: msg.senderNickname,
    message: msg.message,
    createdAt: msg.createdAt,
    mine: msg.senderId === currentUserId,
  };
}

/**
 * 채팅방 한 개의 상태를 관리한다.
 * - REST 로 과거 메시지를 불러오고
 * - WebSocket(STOMP) 으로 실시간 메시지/읽음 이벤트를 수신한다.
 * 내가 보낸 메시지는 서버가 /sub 으로 되돌려주므로 낙관적 추가는 하지 않는다.
 */
export function useChatRoom(chatId: number | null, currentUserId?: number) {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [opponentRead, setOpponentRead] = useState(false);
  const liveSeq = useRef(0);

  // 과거 메시지 로드
  useEffect(() => {
    if (chatId == null) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getChatMessages(chatId, 0, 30)
      .then((page) => {
        if (cancelled) return;
        const history = [...page.content]
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
          .map((m) => toUi(m, currentUserId));
        setMessages(history);

        // 내 마지막 메시지가 이미 읽혔는지로 초기 읽음 표시 결정
        const lastMine = [...history].reverse().find((m) => m.mine);
        const lastMineRaw = [...page.content]
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
          .reverse()
          .find((m) => m.senderId === currentUserId);
        setOpponentRead(Boolean(lastMine) && Boolean(lastMineRaw?.isRead));
      })
      .catch(() => {
        if (!cancelled) toast.error("대화 내용을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [chatId, currentUserId]);

  // 방 진입 시 읽음 처리(REST 영속화)
  useEffect(() => {
    if (chatId == null) return;
    markChatAsRead(chatId).catch(() => {});
  }, [chatId]);

  // 연결되면 상대에게도 읽음 이벤트 broadcast (실시간 읽음 표시용)
  useEffect(() => {
    if (chatId == null || !connected) return;
    publishChatRead(chatId);
  }, [chatId, connected]);

  // 실시간 구독
  useEffect(() => {
    if (chatId == null) return;
    const offConnection = onConnectionChange(setConnected);
    const unsubscribe = subscribeChat(chatId, (event) => {
      if (event.type === "MESSAGE") {
        liveSeq.current += 1;
        const mine = event.senderId === currentUserId;
        setMessages((prev) => [
          ...prev,
          {
            key: `l-${liveSeq.current}`,
            senderId: event.senderId,
            senderNickname: event.senderNickname,
            message: event.message,
            createdAt: event.createdAt,
            mine,
          },
        ]);
        if (mine) {
          setOpponentRead(false);
        } else {
          // 상대 메시지를 받았으니 즉시 읽음 알림
          publishChatRead(chatId);
        }
      } else if (event.type === "READ") {
        if (event.readerId !== currentUserId) setOpponentRead(true);
      }
    });
    return () => {
      unsubscribe();
      offConnection();
    };
  }, [chatId, currentUserId]);

  const sendMessage = useCallback(
    (text: string): boolean => {
      if (chatId == null) return false;
      const trimmed = text.trim();
      if (!trimmed) return false;
      const ok = publishChatMessage(chatId, trimmed);
      if (!ok) toast.error("연결이 끊겼습니다. 잠시 후 다시 시도해주세요.");
      return ok;
    },
    [chatId]
  );

  return { messages, connected, loading, opponentRead, sendMessage };
}
