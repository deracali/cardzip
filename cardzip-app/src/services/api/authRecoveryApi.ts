import { API_BASE_URL } from './config';

const request = async (path: string, body: Record<string, string>) => {
  const response = await fetch(`${API_BASE_URL}/api/users/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const record = typeof result === 'object' && result !== null
      ? result as Record<string, unknown>
      : {};
    throw new Error(String(record.message ?? record.error ?? `Request failed (${response.status})`));
  }
  return result;
};

export const requestPasswordResetCode = (email: string) =>
  request('reset-code', { email });

export const resetPasswordWithCode = (email: string, code: string, newPassword: string) =>
  request('reset-password', { email, code, newPassword });
