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
