import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  deleteAllNotifications,
  deleteNotification,
  getNotifications,
  readAllNotifications,
  readNotification,
} from "@/api/notification/notificationApi";
import { subscribe } from "@/shared/lib/stompClient";
import { useAuth } from "@/app/auth/context/AuthContext";
import { notificationLink } from "@/app/notification/lib/notificationRouting";
import type {
  NotificationEvent,
  NotificationListResponse,
  NotificationResponse,
} from "@/types/notification.types";

interface NotificationContextValue {
  notifications: NotificationResponse[];
  unreadCount: number;
  hasNext: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
  remove: (id: number) => Promise<void>;
  removeAll: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const unreadCount = notifications.reduce((acc, n) => acc + (n.isRead ? 0 : 1), 0);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getNotifications();
      setNotifications(res.content);
      setNextCursor(res.nextCursor);
      setHasNext(res.hasNext);
    } catch {
      /* 조용히 실패 — 벨은 비어있는 상태로 유지 */
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasNext || nextCursor == null) return;
    try {
      const res = await getNotifications(nextCursor);
      setNotifications((prev) => {
        const seen = new Set(prev.map((n) => n.notificationId));
        return [...prev, ...res.content.filter((n) => !seen.has(n.notificationId))];
      });
      setNextCursor(res.nextCursor);
      setHasNext(res.hasNext);
    } catch {
      /* noop */
    }
  }, [hasNext, nextCursor]);

  const markRead = useCallback(async (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n))
    );
    try {
      await readNotification(id);
    } catch {
      /* 낙관적 갱신 유지 */
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await readAllNotifications();
    } catch {
      /* noop */
    }
  }, []);

  const remove = useCallback(async (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.notificationId !== id));
    try {
      await deleteNotification(id);
    } catch {
      /* noop */
    }
  }, []);

  const removeAll = useCallback(async () => {
    setNotifications([]);
    setHasNext(false);
    setNextCursor(null);
    try {
      await deleteAllNotifications();
    } catch {
      /* noop */
    }
  }, []);

  // 로그인 시 초기 로드 / 로그아웃 시 비움
  useEffect(() => {
    if (isAuthenticated) {
      refresh();
    } else {
      setNotifications([]);
      setHasNext(false);
      setNextCursor(null);
    }
  }, [isAuthenticated, refresh]);

  // 실시간 구독: /sub/notifications/{userId}
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    const unsubscribe = subscribe(`/sub/notifications/${user.id}`, (body) => {
      // 이 목적지로는 두 가지 모양이 온다:
      //  (1) 구독 직후 1회: 미읽음 목록 NotificationListResponse({ content, ... })
      //  (2) 이후 새 알림마다: 단일 NotificationEvent
      // 목록을 단일 이벤트로 잘못 처리하면 message/createdAt 이 undefined 가 되어
      // 빈 토스트 + Invalid Date 짜투리 알림이 로그인마다 생긴다.
      if (Array.isArray((body as Partial<NotificationListResponse>).content)) {
        const list = (body as NotificationListResponse).content;
        setNotifications((prev) => {
          const seen = new Set(prev.map((n) => n.notificationId));
          const fresh = list.filter((n) => !seen.has(n.notificationId));
          return [...fresh, ...prev];
        });
        return; // 초기 목록 덤프 — 토스트 없음
      }

      const event = body as NotificationEvent;
      if (event.notificationId == null) return; // 알 수 없는 페이로드 방어
      const incoming: NotificationResponse = {
        notificationId: event.notificationId,
        type: event.type,
        message: event.message,
        isRead: false,
        relatedData:
          event.relatedData == null ? null : JSON.stringify(event.relatedData),
        createdAt: event.createdAt,
      };
      setNotifications((prev) => {
        if (prev.some((n) => n.notificationId === incoming.notificationId)) return prev;
        return [incoming, ...prev];
      });

      const link = notificationLink(event.type, event.relatedData);
      toast(event.message, {
        action: link
          ? { label: "보기", onClick: () => navigateRef.current(link) }
          : undefined,
      });
    });
    return unsubscribe;
  }, [isAuthenticated, user?.id]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        hasNext,
        isLoading,
        refresh,
        loadMore,
        markRead,
        markAllRead,
        remove,
        removeAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
