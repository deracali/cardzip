import { randomUUID } from "node:crypto";
import { appointmentTimes } from "../services/salon-data.js";
import { HttpError } from "../utils/http.js";

export function createClientController(store) {
  async function catalog(req, res) {
    res.json({ services: await store.listServices({ includeInactive: false }) });
  }

  async function stylistCatalog(req, res) {
    res.json({ stylists: await store.listStylists({ includeInactive: false }) });
  }

  async function dashboard(req, res) {
    const appointments = await store.listAppointments({ clientId: req.user.id, limit: 100 });
    res.json({ appointments });
  }

  async function createAppointment(req, res) {
    const serviceId = typeof req.body?.serviceId === "string" ? req.body.serviceId : "";
    const service = serviceId ? await store.findServiceById(serviceId) : null;
    const date = typeof req.body?.date === "string" ? req.body.date : "";
    const time = typeof req.body?.time === "string" ? req.body.time : "";
    const stylist = typeof req.body?.stylist === "string" ? req.body.stylist : "";
    const notes = typeof req.body?.notes === "string" ? req.body.notes.trim() : "";
    if (!service) throw new HttpError(400, "Choose an available salon service.");
    const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T00:00:00Z`) : null;
    if (!parsedDate || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) {
      throw new HttpError(400, "Choose a valid appointment date.");
    }
    const today = new Date().toISOString().slice(0, 10);
    if (date < today) throw new HttpError(400, "Appointment date cannot be in the past.");
    if (!appointmentTimes.includes(time)) throw new HttpError(400, "Choose an available appointment time.");
    if (!await store.findStylistByName(stylist)) throw new HttpError(400, "Choose an available stylist.");
    if (notes.length > 500) throw new HttpError(400, "Appointment notes must be 500 characters or fewer.");
    const existing = await store.findAppointmentByPaymentReference(req.body.paymentReference);
    if (existing) {
      if (existing.clientId !== req.user.id) throw new HttpError(409, "This payment reference is already linked to another appointment.");
      return res.json({ appointment: existing });
    }
    const appointment = {
      id: randomUUID(),
      clientId: req.user.id,
      clientName: req.user.name,
      clientEmail: req.user.email,
      serviceId: service.id,
      serviceName: service.name,
      category: service.category,
      duration: service.duration,
      price: req.body.paidPriceUsd,
      paymentReference: req.body.paymentReference,
      paymentAmountMinor: req.body.paymentAmountMinor,
      paymentCurrency: req.body.paymentCurrency,
      date,
      time,
      stylist,
      notes,
      status: "Requested",
      createdAt: new Date().toISOString(),
    };
    try {
      await store.createAppointment(appointment);
    } catch (error) {
      if (error?.code !== 11000) throw error;
      const saved = await store.findAppointmentByPaymentReference(appointment.paymentReference);
      if (saved?.clientId === req.user.id) return res.json({ appointment: saved });
      throw new HttpError(409, "This payment reference is already linked to another appointment.");
    }
    res.status(201).json({ appointment });
  }

  return { catalog, stylistCatalog, dashboard, createAppointment };
}
