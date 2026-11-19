import { createHmac, timingSafeEqual } from "node:crypto";
import { HttpError } from "../utils/http.js";

const CURRENCY = "USD";
const CURRENCY_SUBUNITS = 100;
const PAYSTACK_API = "https://api.paystack.co";
const STRIPE_API = "https://api.stripe.com/v1";

function isMatchingSignature(expected, actual) {
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(actual, "hex");
  return expectedBuffer.length === actualBuffer.length
    && timingSafeEqual(expectedBuffer, actualBuffer);
}

function getSignatureParts(header) {
  const parts = new Map();
  for (const item of String(header || "").split(",")) {
    const [key, value] = item.split("=", 2);
    if (key && value) parts.set(key.trim(), value.trim());
  }
  return parts;
}

async function readProviderResponse(response, provider) {
  const result = await response.json().catch(() => null);
  if (!response.ok || !result) {
    throw new HttpError(502, `${provider} could not complete the payment request.`);
  }
  return result;
}

export function createPaymentService({ env = process.env, fetchImpl = fetch, clock = Date.now } = {}) {
  const paystackSecret = env.PAYSTACK_SECRET_KEY?.trim() || "";
  const stripeSecret = env.STRIPE_SECRET_KEY?.trim() || "";
  const stripeWebhookSecret = env.STRIPE_WEBHOOK_SECRET?.trim() || "";

  const paystackReady = Boolean(paystackSecret) && env.PAYSTACK_CURRENCY === CURRENCY;
  const stripeReady = Boolean(stripeSecret)
    && Boolean(stripeWebhookSecret)
    && env.STRIPE_CURRENCY === CURRENCY;

  function requireProvider(provider) {
    const enabled = provider === "paystack" ? paystackReady : provider === "stripe" ? stripeReady : false;
    if (!enabled) throw new HttpError(503, `${provider === "stripe" ? "Stripe" : "Paystack"} checkout is not configured for ${CURRENCY}.`);
  }

  async function paystackRequest(endpoint, options = {}) {
    const response = await fetchImpl(`${PAYSTACK_API}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
    const result = await readProviderResponse(response, "Paystack");
    if (!result.status) throw new HttpError(502, "Paystack rejected the payment request.");
    return result.data;
  }

  async function stripeRequest(endpoint, options = {}) {
    const response = await fetchImpl(`${STRIPE_API}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${stripeSecret}`,
        Accept: "application/json",
        ...options.headers,
      },
    });
    const result = await readProviderResponse(response, "Stripe");
    if (result.error) throw new HttpError(502, "Stripe rejected the payment request.");
    return result;
  }

  return {
    providers() {
      return {
        currency: CURRENCY,
        providers: [
          { id: "paystack", name: "Paystack", enabled: paystackReady },
          { id: "stripe", name: "Stripe", enabled: stripeReady },
        ],
      };
    },

    async initialize({ provider, order, returnUrl }) {
      if (!["paystack", "stripe"].includes(provider)) throw new HttpError(400, "Choose Paystack or Stripe.");
      requireProvider(provider);
      const amountMinor = Math.round(order.total * CURRENCY_SUBUNITS);
      if (!Number.isSafeInteger(amountMinor) || amountMinor < 1) {
        throw new HttpError(400, "The order total is invalid.");
      }

      if (provider === "paystack") {
        const data = await paystackRequest("/transaction/initialize", {
          method: "POST",
          body: JSON.stringify({
            email: order.shippingAddress.email,
            amount: amountMinor,
            currency: CURRENCY,
            reference: order.paymentReference,
            callback_url: returnUrl,
            metadata: {
              orderId: order.id,
              orderNumber: order.orderNumber,
              userId: order.userId,
            },
          }),
        });
        if (!data?.authorization_url || data.reference !== order.paymentReference) {
          throw new HttpError(502, "Paystack returned an invalid checkout response.");
        }
        return { checkoutUrl: data.authorization_url, reference: data.reference };
      }

      if (provider === "stripe") {
        const form = new URLSearchParams({
          mode: "payment",
          success_url: `${returnUrl}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${returnUrl}&cancelled=1`,
          client_reference_id: order.orderNumber,
          customer_email: order.shippingAddress.email,
          "metadata[orderId]": order.id,
          "metadata[orderNumber]": order.orderNumber,
          "metadata[userId]": order.userId,
          "line_items[0][price_data][currency]": CURRENCY.toLowerCase(),
          "line_items[0][price_data][unit_amount]": String(amountMinor),
          "line_items[0][price_data][product_data][name]": `MarketHub order ${order.orderNumber}`,
          "line_items[0][quantity]": "1",
        });
        const session = await stripeRequest("/checkout/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: form.toString(),
        });
        if (!session?.url || !session.id) {
          throw new HttpError(502, "Stripe returned an invalid checkout response.");
        }
        return { checkoutUrl: session.url, sessionId: session.id };
      }

      throw new HttpError(400, "Choose Paystack or Stripe.");
    },

    async verifyPaystack(reference) {
      requireProvider("paystack");
      const data = await paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`);
      return {
        reference: data?.reference,
        status: data?.status,
        amount: data?.amount,
        currency: data?.currency,
        orderId: data?.metadata?.orderId,
      };
    },

    async verifyStripe(sessionId) {
      requireProvider("stripe");
      const session = await stripeRequest(`/checkout/sessions/${encodeURIComponent(sessionId)}`);
      return {
        sessionId: session?.id,
        status: session?.payment_status,
        amount: session?.amount_total,
        currency: session?.currency?.toUpperCase(),
        orderId: session?.metadata?.orderId,
      };
    },

    async expireStripeSession(sessionId) {
      requireProvider("stripe");
      const current = await stripeRequest(`/checkout/sessions/${encodeURIComponent(sessionId)}`);
      if (current?.status === "expired") {
        return {
          sessionId: current.id,
          status: current.status,
          paymentStatus: current.payment_status,
          amount: current.amount_total,
          currency: current.currency?.toUpperCase(),
          orderId: current.metadata?.orderId,
        };
      }
      if (current?.status !== "open") {
        return {
          sessionId: current?.id,
          status: current?.status,
          paymentStatus: current?.payment_status,
          amount: current?.amount_total,
          currency: current?.currency?.toUpperCase(),
          orderId: current?.metadata?.orderId,
        };
      }
      const session = await stripeRequest(`/checkout/sessions/${encodeURIComponent(sessionId)}/expire`, {
        method: "POST",
      });
      return {
        sessionId: session?.id,
        status: session?.status,
        paymentStatus: session?.payment_status,
        amount: session?.amount_total,
        currency: session?.currency?.toUpperCase(),
        orderId: session?.metadata?.orderId,
      };
    },

    verifyPaystackWebhook(rawBody, signature) {
      if (!paystackSecret || !Buffer.isBuffer(rawBody) || typeof signature !== "string") {
        throw new HttpError(400, "Paystack webhook signature is invalid.");
      }
      const expected = createHmac("sha512", paystackSecret).update(rawBody).digest("hex");
      if (!isMatchingSignature(expected, signature)) {
        throw new HttpError(400, "Paystack webhook signature is invalid.");
      }
      try {
        return JSON.parse(rawBody.toString("utf8"));
      } catch {
        throw new HttpError(400, "Paystack webhook body is invalid.");
      }
    },

    verifyStripeWebhook(rawBody, signature) {
      if (!stripeWebhookSecret || !Buffer.isBuffer(rawBody) || typeof signature !== "string") {
        throw new HttpError(400, "Stripe webhook signature is invalid.");
      }
      const parts = getSignatureParts(signature);
      const timestamp = Number(parts.get("t"));
      const signatureValue = parts.get("v1");
      if (!Number.isInteger(timestamp) || !signatureValue
        || Math.abs(Math.floor(clock() / 1000) - timestamp) > 300) {
        throw new HttpError(400, "Stripe webhook signature is invalid.");
      }
      const expected = createHmac("sha256", stripeWebhookSecret)
        .update(`${timestamp}.`)
        .update(rawBody)
        .digest("hex");
      if (!isMatchingSignature(expected, signatureValue)) {
        throw new HttpError(400, "Stripe webhook signature is invalid.");
      }
      try {
        return JSON.parse(rawBody.toString("utf8"));
      } catch {
        throw new HttpError(400, "Stripe webhook body is invalid.");
      }
    },
  };
}
