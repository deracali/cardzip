import { createHmac, timingSafeEqual } from "node:crypto";
import { HttpError } from "../utils/http.js";

const PAYSTACK_API = "https://api.paystack.co";

export function createPaystackService({ secretKey, currency = "USD", callbackUrl, fetchImpl = fetch }) {
  const configured = Boolean(secretKey);

  function assertConfigured() {
    if (!configured) throw new HttpError(503, "Paystack is not configured. Set PAYSTACK_SECRET_KEY on the backend.");
  }

  async function request(path, options = {}) {
    assertConfigured();
    let response;
    try {
      response = await fetchImpl(`${PAYSTACK_API}${path}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${secretKey}`,
          Accept: "application/json",
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...options.headers,
        },
        signal: AbortSignal.timeout(15000),
      });
    } catch (error) {
      console.error("Could not reach Paystack:", error instanceof Error ? error.message : error);
      throw new HttpError(502, "Could not connect to Paystack. Please try again.");
    }

    let result;
    try {
      result = await response.json();
    } catch {
      throw new HttpError(502, "Paystack returned an invalid response.");
    }
    if (!response.ok || result?.status !== true || !result.data) {
      console.error("Paystack request was rejected:", response.status, result?.message || "Unexpected response");
      throw new HttpError(502, "Paystack could not complete the payment request.");
    }
    return result.data;
  }

  return {
    currency,
    assertConfigured,

    async initializeTransaction({ email, amount, reference, metadata }) {
      const data = await request("/transaction/initialize", {
        method: "POST",
        body: JSON.stringify({
          email,
          amount: Math.round(amount * 100),
          currency,
          reference,
          callback_url: callbackUrl,
          metadata,
        }),
      });
      if (typeof data.authorization_url !== "string" || data.reference !== reference) {
        throw new HttpError(502, "Paystack returned incomplete checkout details.");
      }
      return { authorizationUrl: data.authorization_url, reference: data.reference };
    },

    async verifyTransaction(reference) {
      return request(`/transaction/verify/${encodeURIComponent(reference)}`);
    },

    verifyWebhookSignature(rawBody, signature) {
      if (!configured || !Buffer.isBuffer(rawBody) || typeof signature !== "string") return false;
      const expected = createHmac("sha512", secretKey).update(rawBody).digest();
      const received = Buffer.from(signature, "hex");
      return received.length === expected.length && timingSafeEqual(received, expected);
    },
  };
}
