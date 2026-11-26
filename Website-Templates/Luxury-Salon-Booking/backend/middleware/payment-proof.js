import { createHmac, timingSafeEqual } from "node:crypto";
import { HttpError } from "../utils/http.js";

export function paymentProofPayload(userId, body) {
  return JSON.stringify([
    "lumiere-appointment-v1",
    userId,
    body.paymentReference,
    body.paymentAmountMinor,
    body.paymentCurrency,
    body.serviceId,
    body.date,
    body.time,
    body.stylist,
    body.notes || "",
    body.paidPriceUsd,
  ]);
}

export function signPaymentProof(userId, body, secret) {
  return createHmac("sha256", secret).update(paymentProofPayload(userId, body)).digest("hex");
}

export function createPaymentProofMiddleware(secret) {
  return (req, res, next) => {
    if (typeof secret !== "string" || secret.length < 32) {
      return next(new HttpError(503, "Online payment confirmation is not configured on the salon API."));
    }

    const signature = req.get("X-Payment-Proof") || "";
    const reference = req.body?.paymentReference;
    const amount = req.body?.paymentAmountMinor;
    const currency = req.body?.paymentCurrency;
    const price = req.body?.paidPriceUsd;
    if (
      typeof reference !== "string" || !reference ||
      !Number.isSafeInteger(amount) || amount <= 0 ||
      currency !== "NGN" ||
      typeof price !== "number" || !Number.isFinite(price) || price <= 0
    ) {
      return next(new HttpError(402, "A verified Paystack payment is required before booking."));
    }

    const expected = Buffer.from(signPaymentProof(req.user.id, req.body, secret), "hex");
    const received = /^[a-f0-9]{64}$/i.test(signature) ? Buffer.from(signature, "hex") : Buffer.alloc(0);
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
      return next(new HttpError(402, "Payment could not be verified for this appointment."));
    }
    return next();
  };
}
