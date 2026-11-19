import { newId } from "../models/store.js";
import { HttpError, normalizedEmail, requiredText } from "../utils/http.js";

const stayCatalog = {
  "azure-breeze": { name: "Azure Breeze Luxury Resort & Spa", nightlyRate: 180 },
  "palm-jungle-retreat": { name: "Palm Jungle Retreat", nightlyRate: 142 },
  "lagoon-ocean-suite": { name: "Lagoon Oceanview Suite", nightlyRate: 220 },
  "bamboo-hideaway": { name: "Bamboo Hideaway", nightlyRate: 96 },
};
const reservationStatuses = new Set(["requested", "confirmed", "cancelled", "completed"]);
const CLEANING_FEE = 24;
const SERVICE_FEE = 18;

function calculateStayDetails({ staySlug, checkIn, checkOut, guests }) {
  const stay = stayCatalog[staySlug];
  if (!stay) throw new HttpError(400, "Choose a valid stay.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOut)) {
    throw new HttpError(400, "Choose valid check-in and check-out dates.");
  }
  const start = Date.parse(`${checkIn}T00:00:00.000Z`);
  const end = Date.parse(`${checkOut}T00:00:00.000Z`);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < today.getTime() || end <= start) {
    throw new HttpError(400, "Check-out must be after a valid future check-in date.");
  }
  if (!Number.isInteger(guests) || guests < 1 || guests > 6) throw new HttpError(400, "Guests must be between 1 and 6.");
  const nights = Math.round((end - start) / 86400000);
  return {
    stayName: stay.name,
    nightlyRate: stay.nightlyRate,
    nights,
    guests,
    roomTotal: stay.nightlyRate * nights,
    cleaningFee: CLEANING_FEE,
    serviceFee: SERVICE_FEE,
    total: stay.nightlyRate * nights + CLEANING_FEE + SERVICE_FEE,
    currency: "USD",
  };
}

export function createBookingController({ store, payments, env, allowedOrigins }) {
  async function confirmVerifiedPayment(verified) {
    if (verified.status !== "paid") return null;
    const reservation = await store.read().then((state) => state.reservations.find((item) =>
      item.id === verified.reservationId && item.paymentProvider === verified.provider));
    if (!reservation || reservation.externalReference !== verified.reference) {
      throw new HttpError(404, "The payment could not be matched to a reservation.");
    }
    if (verified.amount !== reservation.total * 100 || verified.currency !== reservation.currency) {
      throw new HttpError(400, "The verified amount or currency does not match the reservation.");
    }
    return store.update((state) => {
      const found = state.reservations.find((item) => item.id === reservation.id);
      if (!found) throw new HttpError(404, "Reservation not found.");
      if (found.paymentStatus === "paid") return found;
      if (found.paymentStatus !== "pending") throw new HttpError(409, "This reservation payment is no longer pending.");
      found.paymentStatus = "paid";
      found.status = "confirmed";
      found.paidAt = new Date().toISOString();
      found.updatedAt = found.paidAt;
      return found;
    });
  }

  return {
    providers: (req, res) => res.json({ providers: payments.availableProviders() }),

    createCheckout: async (req, res) => {
      const provider = req.body.provider;
      if (provider !== "paystack" && provider !== "stripe") throw new HttpError(400, "Choose Paystack or Stripe.");
      if (!payments.isAvailable(provider)) throw new HttpError(503, `${provider} is not configured for USD payments.`);
      const staySlug = requiredText(req.body.staySlug, "Stay", 80);
      const checkIn = requiredText(req.body.checkIn, "Check-in date", 10);
      const checkOut = requiredText(req.body.checkOut, "Check-out date", 10);
      const guests = Number(req.body.guests);
      const details = calculateStayDetails({ staySlug, checkIn, checkOut, guests });
      const guestName = requiredText(req.body.guestName, "Guest name", 120);
      const guestEmail = normalizedEmail(req.body.guestEmail);
      if (guestEmail !== req.user.email) throw new HttpError(400, "Guest email must match the signed-in account.");
      const specialRequests = typeof req.body.specialRequests === "string" ? req.body.specialRequests.trim().slice(0, 1000) : "";

      const reservation = await store.update((state) => {
        const created = {
          id: newId("reservation"),
          reference: `ESC-${newId("ref").slice(-8).toUpperCase()}`,
          userId: req.user.id,
          staySlug,
          ...details,
          checkIn,
          checkOut,
          guestName,
          guestEmail,
          specialRequests,
          paymentProvider: provider,
          externalReference: null,
          status: "payment_initializing",
          paymentStatus: "initializing",
          createdAt: new Date().toISOString(),
        };
        state.reservations.push(created);
        return created;
      });

      const origin = req.get("origin");
      const frontendUrl = origin && allowedOrigins.has(origin) ? origin : env.FRONTEND_URL || "http://localhost:5173";
      try {
        const checkout = await payments.createCheckout(provider, reservation, req.user, frontendUrl);
        const updated = await store.update((state) => {
          const found = state.reservations.find((item) => item.id === reservation.id);
          if (!found) throw new HttpError(500, "The reservation could not be saved.");
          found.externalReference = checkout.externalReference;
          found.status = "pending_payment";
          found.paymentStatus = "pending";
          found.updatedAt = new Date().toISOString();
          return found;
        });
        res.status(201).json({ reservation: updated, redirectUrl: checkout.redirectUrl });
      } catch (error) {
        await store.update((state) => {
          const found = state.reservations.find((item) => item.id === reservation.id);
          if (found?.paymentStatus === "initializing") {
            found.status = "payment_failed";
            found.paymentStatus = "failed";
            found.updatedAt = new Date().toISOString();
          }
        });
        throw error;
      }
    },

    verify: async (req, res) => {
      const { reservationId, provider, reference } = req.body;
      if (!["paystack", "stripe"].includes(provider)) throw new HttpError(400, "Choose a valid payment provider.");
      if (typeof reservationId !== "string" || typeof reference !== "string") {
        throw new HttpError(400, "Reservation and payment references are required.");
      }
      const state = await store.read();
      const reservation = state.reservations.find((item) => item.id === reservationId && item.userId === req.user.id);
      if (!reservation) throw new HttpError(404, "Reservation not found.");
      if (reservation.paymentProvider !== provider || reservation.externalReference !== reference) {
        throw new HttpError(400, "The payment reference does not match this reservation.");
      }
      if (reservation.paymentStatus === "paid") {
        res.json({ reservation, verified: true });
        return;
      }
      const verified = await payments.verifyPayment(provider, reference);
      if (verified.reservationId !== reservation.id) throw new HttpError(400, "The provider payment does not match this reservation.");
      verified.provider = provider;
      const confirmed = await confirmVerifiedPayment(verified);
      res.json({ reservation: confirmed || reservation, verified: Boolean(confirmed) });
    },

    webhook: async (req, res, provider) => {
      const signature = provider === "stripe" ? req.get("stripe-signature") : req.get("x-paystack-signature");
      if (!payments.verifyWebhook(provider, req.body, signature)) throw new HttpError(400, "Payment webhook signature is invalid.");
      let event;
      try {
        event = JSON.parse(req.body.toString("utf8"));
      } catch {
        throw new HttpError(400, "Payment webhook payload is invalid.");
      }
      const reference = provider === "stripe"
        ? ["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type) ? event.data?.object?.id : null
        : event.event === "charge.success" ? event.data?.reference : null;
      if (!reference) {
        res.json({ received: true });
        return;
      }
      const verified = await payments.verifyPayment(provider, reference);
      verified.provider = provider;
      const reservation = await confirmVerifiedPayment(verified);
      res.json({ received: true, confirmed: Boolean(reservation) });
    },

    clientDashboard: async (req, res) => {
      const state = await store.read();
      const reservations = state.reservations
        .filter((item) => item.userId === req.user.id)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
      res.json({ reservations });
    },

    adminDashboard: async (req, res) => {
      const state = await store.read();
      const reservations = [...state.reservations].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
      const customers = state.users.filter((item) => item.role === "client")
        .map(({ passwordHash, ...user }) => user);
      res.json({
        metrics: {
          customers: customers.length,
          reservations: reservations.length,
          requestedReservations: reservations.filter((item) => item.status === "pending_payment").length,
          confirmedReservations: reservations.filter((item) => item.status === "confirmed").length,
          paidBookingValue: reservations.filter((item) => item.paymentStatus === "paid").reduce((total, item) => total + item.total, 0),
        },
        reservations,
        customers,
      });
    },

    updateReservation: async (req, res) => {
      const status = requiredText(req.body.status, "Reservation status", 20);
      if (!reservationStatuses.has(status)) throw new HttpError(400, "Choose a valid reservation status.");
      const reservation = await store.update((state) => {
        const found = state.reservations.find((item) => item.id === req.params.id);
        if (!found) throw new HttpError(404, "Reservation not found.");
        if (status !== "cancelled" && found.paymentStatus !== "paid") {
          throw new HttpError(409, "Only paid reservations can be confirmed or completed.");
        }
        found.status = status;
        found.updatedAt = new Date().toISOString();
        return found;
      });
      res.json({ reservation });
    },
  };
}
