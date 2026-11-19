import { createHmac, timingSafeEqual } from "node:crypto";
import { HttpError } from "../utils/http.js";

const CURRENCY = "USD";

function supportedCurrencies(value) {
  return (value || "").split(",").map((currency) => currency.trim().toUpperCase()).filter(Boolean);
}

export function createPaymentService(env, fetchImpl = fetch) {
  const providers = {
    paystack: Boolean(env.PAYSTACK_SECRET_KEY && supportedCurrencies(env.PAYSTACK_SUPPORTED_CURRENCIES).includes(CURRENCY)),
    stripe: Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET
      && supportedCurrencies(env.STRIPE_SUPPORTED_CURRENCIES).includes(CURRENCY)),
  };

  async function providerJson(response, provider) {
    let data;
    try {
      data = await response.json();
    } catch {
      throw new HttpError(502, `${provider} returned an invalid response.`);
    }
    if (!response.ok) throw new HttpError(502, `${provider} could not create or verify the payment.`);
    return data;
  }

  async function createCheckout(provider, reservation, user, frontendUrl) {
    if (!providers[provider]) throw new HttpError(503, `${provider} is not configured for USD payments.`);
    const amount = reservation.total * 100;
    if (!Number.isSafeInteger(amount) || amount < 1) throw new HttpError(400, "The reservation total is invalid.");

    if (provider === "stripe") {
      const form = new URLSearchParams({
        mode: "payment",
        success_url: `${frontendUrl}/payment/callback?provider=stripe&bookingId=${encodeURIComponent(reservation.id)}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/payment/callback?cancelled=1&bookingId=${encodeURIComponent(reservation.id)}`,
        customer_email: user.email,
        client_reference_id: reservation.id,
        "line_items[0][price_data][currency]": CURRENCY.toLowerCase(),
        "line_items[0][price_data][unit_amount]": String(amount),
        "line_items[0][price_data][product_data][name]": `${reservation.stayName} · ${reservation.nights} nights`,
        "line_items[0][quantity]": "1",
        "metadata[reservationId]": reservation.id,
        "metadata[reservationReference]": reservation.reference,
      });
      const response = await fetchImpl("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: form,
      });
      const data = await providerJson(response, "Stripe");
      if (typeof data.id !== "string" || typeof data.url !== "string") {
        throw new HttpError(502, "Stripe returned an incomplete checkout session.");
      }
      return { externalReference: data.id, redirectUrl: data.url };
    }

    const reference = `ESC-${reservation.reference}-${Date.now()}`;
    const response = await fetchImpl("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        amount,
        currency: CURRENCY,
        reference,
        callback_url: `${frontendUrl}/payment/callback?provider=paystack&bookingId=${encodeURIComponent(reservation.id)}`,
        metadata: { reservationId: reservation.id, reservationReference: reservation.reference },
      }),
    });
    const data = await providerJson(response, "Paystack");
    if (data.status !== true || typeof data.data?.authorization_url !== "string" || typeof data.data?.reference !== "string") {
      throw new HttpError(502, "Paystack returned an incomplete checkout session.");
    }
    return { externalReference: data.data.reference, redirectUrl: data.data.authorization_url };
  }

  async function verifyPayment(provider, reference) {
    if (!providers[provider]) throw new HttpError(503, `${provider} is not configured for USD payments.`);
    if (typeof reference !== "string" || !reference.trim() || reference.length > 256) {
      throw new HttpError(400, "A valid payment reference is required.");
    }
    if (provider === "stripe") {
      const response = await fetchImpl(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(reference)}`, {
        headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` },
      });
      const data = await providerJson(response, "Stripe");
      return {
        reservationId: data.metadata?.reservationId || data.client_reference_id,
        reference: data.id,
        status: data.payment_status === "paid" ? "paid" : "pending",
        amount: data.amount_total,
        currency: typeof data.currency === "string" ? data.currency.toUpperCase() : "",
      };
    }

    const response = await fetchImpl(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}` },
    });
    const data = await providerJson(response, "Paystack");
    if (data.status !== true || !data.data) throw new HttpError(502, "Paystack could not verify the payment.");
    return {
      reservationId: data.data.metadata?.reservationId,
      reference: data.data.reference,
      status: data.data.status === "success" ? "paid" : "pending",
      amount: data.data.amount,
      currency: typeof data.data.currency === "string" ? data.data.currency.toUpperCase() : "",
    };
  }

  function verifyWebhook(provider, rawBody, signatureHeader) {
    const secret = provider === "stripe" ? env.STRIPE_WEBHOOK_SECRET : env.PAYSTACK_SECRET_KEY;
    if (!secret || !Buffer.isBuffer(rawBody) || typeof signatureHeader !== "string") return false;
    if (provider === "paystack") {
      const expected = createHmac("sha512", secret).update(rawBody).digest();
      const actual = Buffer.from(signatureHeader, "hex");
      return expected.length === actual.length && timingSafeEqual(expected, actual);
    }
    const parts = signatureHeader.split(",").map((part) => part.split("=", 2));
    const timestamp = parts.find(([key]) => key === "t")?.[1];
    const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value);
    if (!timestamp || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300 || signatures.length === 0) return false;
    const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody.toString("utf8")}`).digest();
    return signatures.some((signature) => {
      const actual = Buffer.from(signature, "hex");
      return expected.length === actual.length && timingSafeEqual(expected, actual);
    });
  }

  return {
    isAvailable: (provider) => Boolean(providers[provider]),
    availableProviders: () => Object.keys(providers).filter((provider) => providers[provider]),
    createCheckout,
    verifyPayment,
    verifyWebhook,
  };
}
