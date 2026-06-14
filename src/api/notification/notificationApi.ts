import { apiClient } from "@/shared/lib/apiClient.ts";
import type { ApiResponse } from "@/shared/types/api.ts";
import type {
  NotificationListResponse,
  NotificationResponse,
} from "@/types/notification.types";

export async function getNotifications(cursor?: number): Promise<NotificationListResponse> {
  const query = new URLSearchParams();
  if (cursor !== undefined) query.set("cursor", String(cursor));

  const qs = query.toString();
  const res = await apiClient.get<ApiResponse<NotificationListResponse>>(
    `/api/v1/notifications${qs ? `?${qs}` : ""}`
  );
  return res.data;
}

export async function readNotification(notificationId: number): Promise<NotificationResponse> {
  const res = await apiClient.patch<ApiResponse<NotificationResponse>>(
    `/api/v1/notifications/${notificationId}/read`
  );
  return res.data;
}

export async function readAllNotifications(): Promise<void> {
  await apiClient.patch<ApiResponse<void>>("/api/v1/notifications/read-all");
}

export async function deleteNotification(notificationId: number): Promise<void> {
  await apiClient.delete<ApiResponse<void>>(`/api/v1/notifications/${notificationId}`);
}

export async function deleteAllNotifications(): Promise<void> {
  await apiClient.delete<ApiResponse<void>>("/api/v1/notifications");
}
