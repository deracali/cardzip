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

export const uploadProfileImageApi = async (
  token: string,
  file: { uri: string; name: string; type: string },
): Promise<string> => {
  const body = new FormData();
  body.append('image', { uri: file.uri, name: file.name, type: file.type } as never);
  const result = await new Promise<{ status: number; body: unknown }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', `${API_BASE_URL}/api/users/me/profile-image`);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.onload = () => {
      try {
        resolve({ status: xhr.status, body: JSON.parse(xhr.responseText) as unknown });
      } catch (error) {
        reject(error);
      }
    };
    xhr.onerror = () => reject(new Error('Network error while uploading your profile image.'));
    xhr.ontimeout = () => reject(new Error('Profile image upload timed out.'));
    xhr.timeout = 60000;
    xhr.send(body);
  });
  if (result.status < 200 || result.status >= 300) {
    const response = result.body as { message?: string } | null;
    throw new Error(response?.message || `Request failed (${result.status}).`);
  }
  const response = result.body as { data?: { profileImage?: string } } | null;
  if (!response?.data?.profileImage) throw new Error('The uploaded profile image was not returned.');
  return response.data.profileImage;
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