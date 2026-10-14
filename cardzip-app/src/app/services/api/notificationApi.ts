import { API_BASE_URL } from './config';

export interface UserNotification {
  _id: string;
  category: string;
  title: string;
  message: string;
  reference: string;
  occurredAt: string;
  readAt: string | null;
}

interface NotificationListResponse {
  data: UserNotification[];
  unreadCount: number;
}

interface NotificationItemResponse {
  data: UserNotification;
}

const request = async (token: string, path: string, method = 'GET'): Promise<unknown> => {
  const response = await fetch(`${API_BASE_URL}/api/notifications${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: ['Bearer', token].join(' '),
    },
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body && typeof body === 'object' && 'message' in body
      ? String(body.message)
      : `Request failed (${response.status})`;
    throw new Error(message);
  }
  return body;
};

export const fetchNotificationsApi = async (token: string): Promise<NotificationListResponse> => {
  return await request(token, '?page=1&limit=100') as NotificationListResponse;
};

export const markNotificationReadApi = async (token: string, id: string): Promise<UserNotification> => {
  const response = await request(token, `/${encodeURIComponent(id)}/read`, 'PATCH') as NotificationItemResponse;
  return response.data;
};

export const markAllNotificationsReadApi = async (token: string): Promise<void> => {
  await request(token, '/read-all', 'PATCH');
};
