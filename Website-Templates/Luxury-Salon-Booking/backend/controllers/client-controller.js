import { randomUUID } from "node:crypto";
import { appointmentTimes, services, stylists } from "../services/salon-data.js";
import { HttpError } from "../utils/http.js";

export function createClientController(store) {
  async function dashboard(req, res) {
    const appointments = await store.listAppointments({ clientId: req.user.id, limit: 100 });
    res.json({ appointments });
  }

  async function createAppointment(req, res) {
    const service = services.find((item) => item.id === req.body?.serviceId);
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
    if (!stylists.includes(stylist)) throw new HttpError(400, "Choose an available stylist.");
    if (notes.length > 500) throw new HttpError(400, "Appointment notes must be 500 characters or fewer.");
    const appointment = {
      id: randomUUID(),
      clientId: req.user.id,
      clientName: req.user.name,
      clientEmail: req.user.email,
      serviceId: service.id,
      serviceName: service.name,
      category: service.category,
      duration: service.duration,
      price: service.price,
      date,
      time,
      stylist,
      notes,
      status: "Requested",
      createdAt: new Date().toISOString(),
    };
    await store.createAppointment(appointment);
    res.status(201).json({ appointment });
  }

  return { dashboard, createAppointment };
}
