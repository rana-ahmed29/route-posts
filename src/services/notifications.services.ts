import axios from "axios";
import type { NotificationsI } from "../types/notifications";

const API_URL = import.meta.env.VITE_BASE_URL;


export async function getNotifications(params: {
  unread?: boolean;
  page?: number;
  limit?: number;
}) {
  const { unread = false, page = 1, limit = 10 } = params;
  const data = await axios.get<NotificationsI>(`${API_URL}/notifications`, {
    params: { unread, page, limit },
    headers: {
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
  });
  return data;
}


export async function getUnreadNotificationsCount() {
  const { data } = await axios.get(`${API_URL}/notifications/unread-count`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
  });
  return data;
}


export async function markNotificationAsRead(notificationId: string) {
  const { data } = await axios.patch(
    `${API_URL}/notifications/${notificationId}/read`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      },
    },
  );
  return data;
}


export async function markAllNotificationsAsRead() {
  const { data } = await axios.patch(
    `${API_URL}/notifications/read-all`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      },
    },
  );
  return data;
}
