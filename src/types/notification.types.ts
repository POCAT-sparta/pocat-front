export interface NotificationResponse {
  notificationId: number;
  type: string;
  message: string;
  isRead: boolean;
  relatedData: string | null;
  createdAt: string;
}

export interface NotificationListResponse {
  content: NotificationResponse[];
  nextCursor: number | null;
  hasNext: boolean;
}

/** /sub/notifications/{userId} 로 실시간 수신되는 이벤트 (relatedData는 객체) */
export interface NotificationEvent {
  notificationId: number;
  userId: number;
  type: string;
  message: string;
  relatedData: unknown;
  createdAt: string;
}
