import * as WebBrowser from 'expo-web-browser';

export type PaystackVerificationStatus = 'completed' | 'failed' | 'pending';

interface PaystackVerificationOptions<T> {
  verify: () => Promise<T>;
  getStatus: (result: T) => PaystackVerificationStatus;
  attempts?: number;
  intervalMs?: number;
  failureMessage: string;
  pendingMessage: string;
}

export const isDefinitivePaystackFailure = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error || '');
  return /(?:paystack|payment|transaction|purchase|rental|bill).{0,100}(?:failed|abandoned|declined|rejected|not successful)|amount.{0,40}(?:mismatch|does not match)|no longer pending|invalid.{0,30}reference/i.test(message);
};

export const openPaystackCheckout = async (authorizationUrl: string, returnUrl: string) => {
  try {
    return await WebBrowser.openAuthSessionAsync(authorizationUrl, returnUrl);
  } finally {
    await WebBrowser.dismissBrowser().catch(() => undefined);
  }
};

export const verifyPaystackUntilSettled = async <T>({
  verify,
  getStatus,
  attempts = 18,
  intervalMs = 2000,
  failureMessage,
  pendingMessage,
}: PaystackVerificationOptions<T>): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const result = await verify();
      const status = getStatus(result);
      if (status === 'completed') return result;
      if (status === 'failed') throw new Error(failureMessage);
    } catch (error) {
      if (isDefinitivePaystackFailure(error)) throw error;
      lastError = error;
    }

    if (attempt < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  const cause = lastError instanceof Error ? ` ${lastError.message}` : '';
  throw new Error(`${pendingMessage}${cause ? ` ${cause}` : ''}`);
};
