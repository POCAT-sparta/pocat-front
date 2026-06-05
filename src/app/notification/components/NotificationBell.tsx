import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Bell, Check, Trash2, X } from "lucide-react";
import { useNotifications } from "@/app/notification/context/NotificationContext";
import { notificationLink, notificationMeta } from "@/app/notification/lib/notificationRouting";
import type { NotificationResponse } from "@/types/notification.types";

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "방금";
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}일 전`;
  return new Date(iso).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });
}

export function NotificationBell() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    hasNext,
    isLoading,
    loadMore,
    markRead,
    markAllRead,
    remove,
    removeAll,
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function handleItemClick(n: NotificationResponse) {
    if (!n.isRead) markRead(n.notificationId);
    const link = notificationLink(n.type, n.relatedData);
    if (link) {
      setOpen(false);
      navigate(link);
    }
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
        aria-label="알림"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#CC0000] text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[340px] max-w-[calc(100vw-2rem)] bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              🔔 알림
              {unreadCount > 0 && (
                <span className="text-[10px] text-[#FFCB05]">{unreadCount}개 안읽음</span>
              )}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={markAllRead}
                disabled={unreadCount === 0}
                className="flex items-center gap-1 text-[11px] text-white/50 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-30"
              >
                <Check className="w-3 h-3" /> 모두 읽음
              </button>
              <button
                onClick={removeAll}
                disabled={notifications.length === 0}
                className="flex items-center gap-1 text-[11px] text-white/50 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-30"
              >
                <Trash2 className="w-3 h-3" /> 비우기
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <div className="py-12 text-center text-white/30 text-sm">불러오는 중…</div>
            ) : notifications.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-2 text-white/30 text-sm">
                <Bell className="w-7 h-7" />
                새로운 알림이 없습니다.
              </div>
            ) : (
              <ul>
                {notifications.map((n) => {
                  const meta = notificationMeta(n.type);
                  const link = notificationLink(n.type, n.relatedData);
                  return (
                    <li
                      key={n.notificationId}
                      className={`group flex gap-3 px-4 py-3 border-b border-white/5 transition-colors ${
                        link ? "cursor-pointer" : ""
                      } ${n.isRead ? "hover:bg-white/5" : "bg-white/[0.04] hover:bg-white/10"}`}
                      onClick={() => handleItemClick(n)}
                    >
                      <span className={`text-lg shrink-0 ${meta.accent}`}>{meta.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${n.isRead ? "text-white/60" : "text-white"}`}>
                          {n.message}
                        </p>
                        <span className="text-[10px] text-white/30">{formatRelative(n.createdAt)}</span>
                      </div>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#CC0000] shrink-0 mt-1.5" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          remove(n.notificationId);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all shrink-0"
                        aria-label="알림 삭제"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {hasNext && (
            <button
              onClick={loadMore}
              className="w-full py-2.5 text-xs text-white/50 hover:text-white hover:bg-white/5 transition-colors border-t border-white/10"
            >
              더 보기
            </button>
          )}
        </div>
      )}
    </div>
  );
}
