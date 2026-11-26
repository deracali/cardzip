import { createHmac, timingSafeEqual } from "node:crypto";
import { HttpError } from "../utils/http.js";

const currencies = new Set(["NGN", "GHS", "KES", "ZAR", "USD"]);

export function createPaystackService({
  secretKey = process.env.PAYSTACK_SECRET_KEY,
  currency = process.env.PAYSTACK_CURRENCY || "NGN",
  callbackUrl = process.env.PAYSTACK_CALLBACK_URL || "http://localhost:3000/payment/return",
  production = process.env.NODE_ENV === "production",
  fetchImpl = globalThis.fetch,
} = {}) {
  if (!currencies.has(currency)) throw new Error("PAYSTACK_CURRENCY must be NGN, GHS, KES, ZAR, or USD.");
  let parsedCallbackUrl;
  try {
    parsedCallbackUrl = new URL(callbackUrl);
  } catch {
    throw new Error("PAYSTACK_CALLBACK_URL must be a valid absolute URL.");
  }
  if (!["http:", "https:"].includes(parsedCallbackUrl.protocol) || (production && parsedCallbackUrl.protocol !== "https:")) {
    throw new Error("PAYSTACK_CALLBACK_URL must use HTTPS in production.");
  }

  async function request(path, options = {}) {
    if (!secretKey) throw new HttpError(503, "Paystack is not configured on the API.");
    let response;
    try {
      response = await fetchImpl(`https://api.paystack.co${path}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      throw new HttpError(502, "Could not connect to Paystack. Please try again.");
    }

    let result;
    try {
      result = await response.json();
    } catch {
      throw new HttpError(502, "Paystack returned an invalid response.");
    }
    if (!response.ok || result?.status !== true || !result.data) {
      throw new HttpError(502, "Paystack could not complete the payment request.");
    }
    return result.data;
  }

  return {
    currency,
    isConfigured: () => typeof secretKey === "string" && secretKey.length > 0,
    async initialize({ email, amount, reference, metadata }) {
      const result = await request("/transaction/initialize", {
        method: "POST",
        body: JSON.stringify({
          email,
          amount,
          currency,
          reference,
          callback_url: callbackUrl,
          metadata,
        }),
      });
      if (typeof result.authorization_url !== "string" || result.reference !== reference) {
        throw new HttpError(502, "Paystack returned incomplete checkout details.");
      }
      let authorizationUrl;
      try {
        authorizationUrl = new URL(result.authorization_url);
      } catch {
        throw new HttpError(502, "Paystack returned an invalid checkout URL.");
      }
      if (authorizationUrl.protocol !== "https:") {
        throw new HttpError(502, "Paystack returned an insecure checkout URL.");
      }
      return { authorizationUrl: authorizationUrl.toString(), reference: result.reference };
    },
    verify: (reference) => request(`/transaction/verify/${encodeURIComponent(reference)}`),
    verifyWebhookSignature(rawBody, signature) {
      if (!secretKey || !Buffer.isBuffer(rawBody) || typeof signature !== "string" || !/^[a-f\d]{128}$/i.test(signature)) {
        return false;
      }
      const expected = createHmac("sha512", secretKey).update(rawBody).digest();
      const provided = Buffer.from(signature, "hex");
      return expected.length === provided.length && timingSafeEqual(expected, provided);
    },
  };
}
