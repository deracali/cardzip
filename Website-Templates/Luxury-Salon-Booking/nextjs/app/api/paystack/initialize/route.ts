import { randomUUID } from "node:crypto";
import { appointmentTimes } from "../../../../lib/salonData";
import {
  getPaymentCallbackUrl,
  getPaystackSecret,
  getUsdToNgnRate,
  routeErrorResponse,
  RouteError,
  salonServerRequest,
} from "../../../../lib/paystack";
import type { SalonService, SalonStylist, SalonUser } from "../../../../lib/salonApi";

type BookingInput = {
  serviceId?: unknown;
  date?: unknown;
  time?: unknown;
  stylist?: unknown;
  notes?: unknown;
};

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value &&
    value >= new Date().toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) throw new RouteError(401, "Sign in to continue to checkout.");

    let input: BookingInput;
    try {
      input = await request.json() as BookingInput;
    } catch {
      throw new RouteError(400, "The appointment details must be valid JSON.");
    }

    const serviceId = typeof input.serviceId === "string" ? input.serviceId : "";
    const date = typeof input.date === "string" ? input.date : "";
    const time = typeof input.time === "string" ? input.time : "";
    const stylist = typeof input.stylist === "string" ? input.stylist : "";
    const notes = typeof input.notes === "string" ? input.notes.trim() : "";
    if (!serviceId || !isValidDate(date)) throw new RouteError(400, "Choose an available appointment date and service.");
    if (!appointmentTimes.includes(time)) throw new RouteError(400, "Choose an available appointment time.");
    if (notes.length > 500) throw new RouteError(400, "Appointment notes must be 500 characters or fewer.");

    const [profile, catalog, stylistCatalog] = await Promise.all([
      salonServerRequest<{ user: SalonUser }>("/auth/me", token),
      salonServerRequest<{ services: SalonService[] }>("/services"),
      salonServerRequest<{ stylists: SalonStylist[] }>("/stylists"),
    ]);
    if (profile.user.role !== "client") throw new RouteError(403, "Only client accounts can book a salon appointment.");
    const service = catalog.services.find((item) => item.id === serviceId && item.active);
    if (!service) throw new RouteError(400, "Choose a currently available salon service.");
    if (!stylistCatalog.stylists.some((item) => item.name === stylist && item.active)) {
      throw new RouteError(400, "Choose a currently available stylist.");
    }
    if (!profile.user.email) throw new RouteError(400, "Add an email address to your account before checkout.");

    const rate = getUsdToNgnRate();
    const amountMinor = Math.round(service.price * rate * 100);
    if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) throw new RouteError(400, "The appointment price cannot be converted to a valid Paystack amount.");
    const reference = `lumiere_${randomUUID().replace(/-/g, "")}`;
    const secret = getPaystackSecret();
    const callbackUrl = getPaymentCallbackUrl();
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        email: profile.user.email,
        amount: String(amountMinor),
        currency: "NGN",
        reference,
        callback_url: callbackUrl,
        metadata: {
          source: "lumiere-nextjs",
          lumiere: {
            userId: profile.user.id,
            serviceId: service.id,
            date,
            time,
            stylist,
            notes,
            priceUsd: service.price,
            expectedAmountMinor: amountMinor,
            currency: "NGN",
          },
        },
      }),
      signal: AbortSignal.timeout(15000),
    });
    const result = await response.json().catch(() => null) as {
      status?: boolean;
      message?: string;
      data?: { authorization_url?: string; reference?: string };
    } | null;
    if (!response.ok || !result?.status || !result.data?.authorization_url || result.data.reference !== reference) {
      console.error("Paystack initialization was rejected:", response.status, result?.message || "Unexpected response");
      throw new RouteError(502, "Paystack could not start checkout. Please try again.");
    }
    return Response.json({
      authorizationUrl: result.data.authorization_url,
      reference,
      amountMinor,
      amountNgn: amountMinor / 100,
      currency: "NGN",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return routeErrorResponse(error, "Paystack initialization");
  }
}
