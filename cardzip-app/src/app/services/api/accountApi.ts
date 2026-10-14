import { AccountSummary, KycSubmission, KycSummary } from '../../types/account';
import { API_BASE_URL } from './config';

const parseResponse = async (response: Response) => {
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = typeof body === 'object' && body !== null && 'message' in body
      ? String(body.message)
      : `Request failed (${response.status})`;
    throw new Error(message);
  }
  return body as { success: boolean; data: AccountSummary | KycSummary; message?: string };
};

const authHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export const fetchMyAccountApi = async (token: string): Promise<AccountSummary> => {
  const response = await fetch(`${API_BASE_URL}/api/users/me`, { headers: authHeaders(token) });
  const result = await parseResponse(response);
  return result.data as AccountSummary;
};

export const submitKycApi = async (token: string, submission: KycSubmission): Promise<KycSummary> => {
  const response = await fetch(`${API_BASE_URL}/api/users/me/kyc`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(submission),
  });
  const result = await parseResponse(response);
  return result.data as KycSummary;
};