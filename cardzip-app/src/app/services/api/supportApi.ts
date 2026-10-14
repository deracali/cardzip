import { API_BASE_URL } from './config';

export interface SupportMessage {
  _id: string;
  senderRole: 'user' | 'admin' | 'staff';
  message: string;
  createdAt: string;
}

export interface SupportRequest {
  _id: string;
  subject: string;
  description: string;
  status: 'open' | 'assigned' | 'in_progress' | 'resolved';
  messages: SupportMessage[];
  createdAt: string;
}

interface DataResponse<T> {
  data: T;
}

const request = async <T>(token: string, path: string, method = 'GET', body?: object): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}/api/support/requests${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: ['Bearer', token].join(' '),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = result && typeof result === 'object' && 'message' in result
      ? String(result.message)
      : `Request failed (${response.status})`;
    throw new Error(message);
  }
  return result as T;
};

export const listSupportRequestsApi = async (token: string): Promise<SupportRequest[]> => {
  const result = await request<DataResponse<SupportRequest[]>>(token, '/my?page=1&limit=50');
  return result.data;
};

export const createSupportRequestApi = async (token: string, subject: string, description: string): Promise<SupportRequest> => {
  const result = await request<DataResponse<SupportRequest>>(token, '', 'POST', { subject, description });
  return result.data;
};

export const replySupportRequestApi = async (token: string, id: string, message: string): Promise<SupportRequest> => {
  const result = await request<DataResponse<SupportRequest>>(token, `/${encodeURIComponent(id)}/replies`, 'POST', { message });
  return result.data;
};
