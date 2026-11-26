import {
  getPaymentProofSecret,
  getPaystackSecret,
  routeErrorResponse,
  RouteError,
  salonServerRequest,
  signAppointmentPaymentProof,
} from "../../../../lib/paystack";
import type { SalonAppointment, SalonUser } from "../../../../lib/salonApi";

type BookingMetadata = {
  userId?: unknown;
  serviceId?: unknown;
  date?: unknown;
  time?: unknown;
  stylist?: unknown;
  notes?: unknown;
  priceUsd?: unknown;
  expectedAmountMinor?: unknown;
  currency?: unknown;
};

type PaystackVerification = {
  status?: boolean;
  message?: string;
  data?: {
    status?: string;
    reference?: string;
    amount?: number;
    currency?: string;
    customer?: { email?: string };
    metadata?: { source?: unknown; lumiere?: unknown } | null;
  };
};

export async function POST(request: Request) {
  let paymentReference = "";
  try {
    const token = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) throw new RouteError(401, "Sign in again to confirm your appointment.");

    let input: { reference?: unknown };
    try {
      input = await request.json() as { reference?: unknown };
    } catch {
      throw new RouteError(400, "A valid Paystack transaction reference is required.");
    }
    paymentReference = typeof input.reference === "string" ? input.reference : "";
    if (!paymentReference || paymentReference.length > 100) throw new RouteError(400, "A valid Paystack transaction reference is required.");

    const secret = getPaystackSecret();
    const proofSecret = getPaymentProofSecret();
    const { user } = await salonServerRequest<{ user: SalonUser }>("/auth/me", token);
    if (user.role !== "client") throw new RouteError(403, "Only client accounts can confirm a salon appointment.");

    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(paymentReference)}`, {
      headers: { Authorization: `Bearer ${secret}`, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    const result = await response.json().catch(() => null) as PaystackVerification | null;
    if (!response.ok || !result?.status || !result.data) {
      console.error("Paystack verification request failed:", response.status, result?.message || "Unexpected response");
      throw new RouteError(502, "Paystack could not verify this transaction. Please retry.");
    }

    const transaction = result.data;
    const metadata = transaction.metadata;
    const booking = metadata?.lumiere as BookingMetadata | undefined;
    if (
      transaction.status !== "success" ||
      transaction.reference !== paymentReference ||
      transaction.currency !== "NGN" ||
      typeof transaction.amount !== "number" ||
      !booking ||
      metadata?.source !== "lumiere-nextjs" ||
      booking.currency !== "NGN" ||
      booking.userId !== user.id ||
      booking.expectedAmountMinor !== transaction.amount ||
      typeof booking.priceUsd !== "number" ||
      typeof booking.serviceId !== "string" ||
      typeof booking.date !== "string" ||
      typeof booking.time !== "string" ||
      typeof booking.stylist !== "string" ||
      typeof booking.notes !== "string"
    ) {
      throw new RouteError(402, "This transaction does not match the appointment checkout. No appointment was created.");
    }
    if (transaction.customer?.email?.trim().toLowerCase() !== user.email?.trim().toLowerCase()) {
      throw new RouteError(403, "This payment was made for a different account.");
    }

    const appointment = {
      serviceId: booking.serviceId,
      date: booking.date,
      time: booking.time,
      stylist: booking.stylist,
      notes: booking.notes,
      paymentReference,
      paymentAmountMinor: transaction.amount,
      paymentCurrency: transaction.currency,
      paidPriceUsd: booking.priceUsd,
    };
    const proof = signAppointmentPaymentProof(user.id, appointment, proofSecret);
    try {
      const saved = await salonServerRequest<{ appointment: SalonAppointment }>("/client/appointments", token, {
        method: "POST",
        body: appointment,
        paymentProof: proof,
      });
      return Response.json(saved, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      console.error(`Verified Paystack payment ${paymentReference} could not be attached to a booking:`, error);
      throw new RouteError(502, `Payment succeeded (reference ${paymentReference}), but the appointment could not be saved. Please retry or contact the salon with this reference.`);
    }
  } catch (error) {
    return routeErrorResponse(error, "Paystack verification");
  }
}
