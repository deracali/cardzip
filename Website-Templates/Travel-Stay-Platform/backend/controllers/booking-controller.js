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

function calculateStayDetails({ stay, checkIn, checkOut, guests }) {
  if (!stay) throw new HttpError(400, "Choose a valid stay.");
  const nightlyRate = stay.nightlyRate ?? stay.price;
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
    nightlyRate,
    nights,
    guests,
    roomTotal: nightlyRate * nights,
    cleaningFee: CLEANING_FEE,
    serviceFee: SERVICE_FEE,
    total: nightlyRate * nights + CLEANING_FEE + SERVICE_FEE,
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

    publicStays: async (_req, res) => {
      const state = await store.read();
      res.json({ stays: state.stays });
    },

    publicStay: async (req, res) => {
      const state = await store.read();
      const stay = state.stays.find((item) => item.slug === req.params.slug);
      if (!stay) throw new HttpError(404, "Stay not found.");
      res.json({ stay });
    },

    createCheckout: async (req, res) => {
      const provider = req.body.provider;
      if (provider !== "paystack" && provider !== "stripe") throw new HttpError(400, "Choose Paystack or Stripe.");
      if (!payments.isAvailable(provider)) throw new HttpError(503, `${provider} is not configured for USD payments.`);
      const staySlug = requiredText(req.body.staySlug, "Stay", 80);
      const checkIn = requiredText(req.body.checkIn, "Check-in date", 10);
      const checkOut = requiredText(req.body.checkOut, "Check-out date", 10);
      const guests = Number(req.body.guests);
      const state = await store.read();
      const availableStay = state.stays.find((item) => item.slug === staySlug) || stayCatalog[staySlug];
      const details = calculateStayDetails({ stay: availableStay, checkIn, checkOut, guests });
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
          requestedReservations: reservations.filter((item) => item.status === "requested" || item.status === "pending_payment").length,
          confirmedReservations: reservations.filter((item) => item.status === "confirmed").length,
          grossBookingValue: reservations.reduce((total, item) => total + item.total, 0),
        },
        reservations,
        customers,
        stays: state.stays,
      });
    },

    createStay: async (req, res) => {
      const name = requiredText(req.body.name, "Property name", 160);
      const area = requiredText(req.body.area, "Location", 160);
      const room = requiredText(req.body.room, "Room type", 120);
      const type = requiredText(req.body.type, "Property type", 80);
      const description = requiredText(req.body.description, "Description", 2000);
      if (name.length < 2 || area.length < 2 || room.length < 2 || type.length < 2 || description.length < 30) {
        throw new HttpError(400, "Property fields are too short.");
      }
      const price = Number(req.body.price);
      if (!Number.isFinite(price) || price < 1 || price > 100000) {
        throw new HttpError(400, "Enter a nightly rate between 1 and 100000.");
      }
      const image = requiredText(req.body.image, "Image URL", 1000);
      let parsedImage;
      try {
        parsedImage = new URL(image);
      } catch {
        throw new HttpError(400, "Enter a valid HTTPS image URL.");
      }
      if (parsedImage.protocol !== "https:") throw new HttpError(400, "Property images must use HTTPS.");
      const categories = typeof req.body.categories === "string"
        ? req.body.categories.split(",").map((category) => category.trim()).filter(Boolean).slice(0, 8)
        : [];
      if (categories.length === 0) throw new HttpError(400, "Enter at least one property category.");
      const slug = name.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
      if (!slug) throw new HttpError(400, "The property name must include letters or numbers.");
      const stay = await store.update((state) => {
        if (state.stays.some((item) => item.slug === slug) || stayCatalog[slug]) {
          throw new HttpError(409, "A property with this name already exists.");
        }
        const created = {
          id: newId("stay"),
          slug,
          name,
          shortName: name,
          area,
          price,
          rating: "New",
          reviews: 0,
          type,
          categories,
          image,
          room,
          description,
          status: "active",
          createdAt: new Date().toISOString(),
        };
        state.stays.push(created);
        return created;
      });
      res.status(201).json({ stay });
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
