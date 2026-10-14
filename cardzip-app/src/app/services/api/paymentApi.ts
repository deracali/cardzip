import { API_BASE_URL } from './config';

interface PaystackInitialization {
  reference: string;
  authorizationUrl: string;
  amount: number;
  currency: string;
}

interface PaystackVerification {
  status: 'completed';
  balance?: number;
  currency?: string;
}

const paymentRequest = async <T>(token: string, path: string, body: Record<string, unknown>): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}/api/payments/paystack/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const message = result && typeof result === 'object' && 'message' in result
      ? String(result.message)
      : `Paystack request failed (${response.status}).`;
    throw new Error(message);
  }
  if (result && typeof result === 'object' && 'data' in result) return result.data as T;
  throw new Error('The payment server returned an invalid response.');
};

export const initializeWalletFundingApi = (
  token: string,
  amount: number,
  callbackUrl: string,
): Promise<PaystackInitialization> => paymentRequest(token, 'initialize', {
  amount,
  purpose: 'wallet_funding',
  callbackUrl,
});

export const verifyWalletFundingApi = (token: string, reference: string): Promise<PaystackVerification> => (
  paymentRequest(token, 'verify', { reference })
);
