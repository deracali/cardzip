import { createHmac } from "node:crypto";

export class RouteError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function getSalonApiBaseUrl() {
  const configuredUrl = process.env.SALON_API_URL || process.env.NEXT_PUBLIC_SALON_API_URL;
  if (!configuredUrl && process.env.NODE_ENV === "production") {
    throw new RouteError(503, "SALON_API_URL must be configured for online booking.");
  }
  return (configuredUrl || "http://localhost:5600/api").replace(/\/+$/, "");
}

export function getPaystackSecret() {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !secret.startsWith("sk_")) {
    throw new RouteError(503, "Paystack is not configured. Set the server-only PAYSTACK_SECRET_KEY.");
  }
  return secret;
}

export function getUsdToNgnRate() {
  const rate = Number(process.env.PAYSTACK_USD_TO_NGN_RATE);
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new RouteError(503, "Set PAYSTACK_USD_TO_NGN_RATE to the current USD-to-NGN conversion rate.");
  }
  return rate;
}

export function getPaymentProofSecret() {
  const secret = process.env.PAYMENT_PROOF_SECRET;
  if (!secret || secret.length < 32) {
    throw new RouteError(503, "Set PAYMENT_PROOF_SECRET to the same random secret on Next.js and the salon API (at least 32 characters).");
  }
  return secret;
}

export function getPaymentCallbackUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === "production" ? "" : "http://localhost:3000");
  if (!configuredUrl) throw new RouteError(503, "NEXT_PUBLIC_APP_URL must be configured for Paystack callbacks.");
  let appUrl: URL;
  try {
    appUrl = new URL(configuredUrl);
  } catch {
    throw new RouteError(503, "NEXT_PUBLIC_APP_URL must be a valid absolute URL.");
  }
  if (process.env.NODE_ENV === "production" && appUrl.protocol !== "https:") {
    throw new RouteError(503, "NEXT_PUBLIC_APP_URL must use HTTPS in production.");
  }
  return new URL("/payment/callback", appUrl).toString();
}

export async function salonServerRequest<T>(
  path: string,
  token?: string,
  options: { method?: string; body?: unknown; paymentProof?: string } = {},
): Promise<T> {
  const response = await fetch(`${getSalonApiBaseUrl()}${path}`, {
    method: options.method || "GET",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(options.paymentProof ? { "X-Payment-Proof": options.paymentProof } : {}),
    },
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  const result = await response.json().catch(() => null) as { error?: string } | null;
  if (!response.ok) {
    throw new RouteError(response.status, typeof result?.error === "string" ? result.error : `Salon API request failed (${response.status}).`);
  }
  if (!result || typeof result !== "object") throw new RouteError(502, "Salon API returned an invalid response.");
  return result as T;
}

export function routeErrorResponse(error: unknown, operation: string) {
  if (error instanceof RouteError) return Response.json({ error: error.message }, { status: error.status });
  console.error(`Lumière ${operation} failed:`, error);
  return Response.json({ error: "The request could not be completed. Please try again." }, { status: 500 });
}

export function signAppointmentPaymentProof(userId: string, appointment: {
  paymentReference: string;
  paymentAmountMinor: number;
  paymentCurrency: string;
  serviceId: string;
  date: string;
  time: string;
  stylist: string;
  notes: string;
  paidPriceUsd: number;
}, secret: string) {
  const payload = JSON.stringify([
    "lumiere-appointment-v1",
    userId,
    appointment.paymentReference,
    appointment.paymentAmountMinor,
    appointment.paymentCurrency,
    appointment.serviceId,
    appointment.date,
    appointment.time,
    appointment.stylist,
    appointment.notes || "",
    appointment.paidPriceUsd,
  ]);
  return createHmac("sha256", secret).update(payload).digest("hex");
}
