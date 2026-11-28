import { randomUUID } from "node:crypto";
import { HttpError, normalizedEmail, requiredText } from "../utils/http.js";

const bookingStatuses = new Set(["requested", "confirmed", "completed", "cancelled"]);

export function createBookingController(store) {
  return {
    create: async (req, res) => {
      const serviceId = requiredText(req.body.serviceId, "Service", 60);
      const urgency = req.body.urgency === "emergency" ? "emergency" : "standard";
      const name = requiredText(req.body.name, "Name", 120);
      const phone = requiredText(req.body.phone, "Phone number", 40);
      const email = normalizedEmail(req.body.email);
      const zip = requiredText(req.body.zip, "ZIP code", 5);
      if (!/^\d{5}$/.test(zip)) throw new HttpError(400, "Enter a valid 5-digit ZIP code.");
      const date = requiredText(req.body.date, "Appointment date", 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
        throw new HttpError(400, "Enter a valid appointment date.");
      }
      const time = requiredText(req.body.time, "Arrival window", 60);
      const notes = typeof req.body.notes === "string" ? req.body.notes.trim().slice(0, 1000) : "";
      const booking = await store.update((state) => {
        const service = state.services.find((item) => item.id === serviceId && item.active);
        if (!service) throw new HttpError(400, "Choose an available HVAC service. Memberships use the membership checkout.");
        const created = {
          id: `booking_${randomUUID()}`,
          reference: `PF-${randomUUID().slice(0, 8).toUpperCase()}`,
          userId: req.user?.role === "client" ? req.user.id : null,
          serviceId,
          urgency,
          estimate: service.price + (urgency === "emergency" ? 100 : 0),
          name,
          phone,
          email,
          zip,
          date,
          time,
          notes,
          status: "requested",
          createdAt: new Date().toISOString(),
        };
        state.bookings.push(created);
        return created;
      });
      res.status(201).json({ booking });
    },

    clientDashboard: async (req, res) => {
      const state = await store.read();
      const bookings = state.bookings.filter((item) => item.userId === req.user.id);
      const memberships = state.memberships.filter((item) => item.userId === req.user.id);
      const activeMembership = memberships.find((item) => item.status === "active" && Date.parse(item.expiresAt) > Date.now()) || null;
      res.json({
        bookings: bookings.sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
        memberships: memberships.sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
        activeMembership,
      });
    },

    adminDashboard: async (req, res) => {
      const state = await store.read();
      const memberships = state.memberships;
      res.json({
        metrics: {
          customers: state.users.filter((item) => item.role === "client").length,
          bookings: state.bookings.length,
          requestedBookings: state.bookings.filter((item) => item.status === "requested").length,
          activeMemberships: memberships.filter((item) => item.status === "active" && Date.parse(item.expiresAt) > Date.now()).length,
        },
        bookings: state.bookings.sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
        memberships: memberships.sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
        customers: state.users.filter((item) => item.role === "client").map(({ passwordHash, ...user }) => user),
        services: state.services,
        technicians: state.technicians,
      });
    },

    updateBooking: async (req, res) => {
      const status = requiredText(req.body.status, "Booking status", 20);
      if (!bookingStatuses.has(status)) throw new HttpError(400, "Choose a valid booking status.");
      const booking = await store.update((state) => {
        const found = state.bookings.find((item) => item.id === req.params.id);
        if (!found) throw new HttpError(404, "Booking not found.");
        found.status = status;
        found.updatedAt = new Date().toISOString();
        return found;
      });
      res.json({ booking });
    },
  };
}
