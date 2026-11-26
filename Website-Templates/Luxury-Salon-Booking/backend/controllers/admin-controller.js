import { randomUUID } from "node:crypto";
import { appointmentStatuses } from "../services/salon-data.js";
import { HttpError } from "../utils/http.js";

export function createAdminController(store) {
  async function dashboard(req, res) {
    const [appointments, clients, totalAppointments, requested, confirmed, completed] = await Promise.all([
      store.listAppointments({ limit: 100 }),
      store.listUsers("client"),
      store.countAppointments(),
      store.countAppointmentsByStatus("Requested"),
      store.countAppointmentsByStatus("Confirmed"),
      store.countAppointmentsByStatus("Completed"),
    ]);
    res.json({
      metrics: { clients: await store.countUsers("client"), appointments: totalAppointments, requested, confirmed, completed },
      appointments,
      clients,
    });
  }

  async function updateAppointment(req, res) {
    const status = typeof req.body?.status === "string" ? req.body.status : "";
    if (!appointmentStatuses.includes(status)) throw new HttpError(400, "Choose a valid appointment status.");
    const appointment = await store.updateAppointment(req.params.id, { status });
    if (!appointment) throw new HttpError(404, "Appointment not found.");
    res.json({ appointment });
  }

  async function serviceCatalog(req, res) {
    res.json({ services: await store.listServices() });
  }

  function readService(body, current = {}) {
    const name = typeof body?.name === "string" ? body.name.trim() : current.name;
    const category = typeof body?.category === "string" ? body.category.trim() : current.category;
    const description = typeof body?.description === "string" ? body.description.trim() : current.description;
    const duration = typeof body?.duration === "string" ? body.duration.trim() : current.duration;
    const image = typeof body?.image === "string" ? body.image.trim() : current.image;
    const badge = typeof body?.badge === "string" ? body.badge.trim() : current.badge || "";
    const price = body?.price === undefined ? current.price : Number(body.price);
    const active = body?.active === undefined ? current.active !== false : body.active;

    if (typeof name !== "string" || name.length < 2 || name.length > 100) throw new HttpError(400, "Service name must be between 2 and 100 characters.");
    if (typeof category !== "string" || !category || category.length > 50) throw new HttpError(400, "Enter a service category of 1 to 50 characters.");
    if (typeof description !== "string" || !description || description.length > 500) throw new HttpError(400, "Service description must be between 1 and 500 characters.");
    if (typeof duration !== "string" || !duration || duration.length > 50) throw new HttpError(400, "Enter a service duration of 1 to 50 characters.");
    if (!Number.isFinite(price) || price <= 0 || price > 10000) throw new HttpError(400, "Service price must be greater than zero and no more than 10000 USD.");
    if (typeof image !== "string" || image.length > 300) throw new HttpError(400, "Service image path must be 300 characters or fewer.");
    if (typeof badge !== "string" || badge.length > 40) throw new HttpError(400, "Service badge must be 40 characters or fewer.");
    if (typeof active !== "boolean") throw new HttpError(400, "Service visibility must be true or false.");
    return { name, category, description, duration, price, image, badge, active };
  }

  async function createService(req, res) {
    const service = { id: `service-${randomUUID()}`, ...readService(req.body), createdAt: new Date().toISOString() };
    await store.createService(service);
    res.status(201).json({ service });
  }

  async function updateService(req, res) {
    const existing = await store.findServiceById(req.params.id);
    if (!existing) throw new HttpError(404, "Service not found.");
    const service = await store.updateService(existing.id, readService(req.body, existing));
    if (!service) throw new HttpError(404, "Service not found.");
    res.json({ service });
  }

  async function stylistCatalog(req, res) {
    res.json({ stylists: await store.listStylists() });
  }

  function readStylist(body, current = {}) {
    const name = typeof body?.name === "string" ? body.name.trim() : current.name;
    const role = typeof body?.role === "string" ? body.role.trim() : current.role;
    const bio = typeof body?.bio === "string" ? body.bio.trim() : current.bio;
    const image = typeof body?.image === "string" ? body.image.trim() : current.image || "";
    const active = body?.active === undefined ? current.active !== false : body.active;
    if (typeof name !== "string" || name.length < 2 || name.length > 80) throw new HttpError(400, "Stylist name must be between 2 and 80 characters.");
    if (typeof role !== "string" || role.length < 2 || role.length > 80) throw new HttpError(400, "Stylist role must be between 2 and 80 characters.");
    if (typeof bio !== "string" || bio.length < 2 || bio.length > 400) throw new HttpError(400, "Stylist bio must be between 2 and 400 characters.");
    if (typeof image !== "string" || image.length > 300) throw new HttpError(400, "Stylist image path must be 300 characters or fewer.");
    if (typeof active !== "boolean") throw new HttpError(400, "Stylist visibility must be true or false.");
    return { name, role, bio, image, active };
  }

  async function createStylist(req, res) {
    const existing = (await store.listStylists()).some((stylist) => stylist.name.toLowerCase() === String(req.body?.name || "").trim().toLowerCase());
    if (existing) throw new HttpError(409, "A stylist with that name already exists.");
    const stylist = { id: `stylist-${randomUUID()}`, ...readStylist(req.body), createdAt: new Date().toISOString() };
    try {
      await store.createStylist(stylist);
    } catch (error) {
      if (error?.code === 11000) throw new HttpError(409, "A stylist with that name already exists.");
      throw error;
    }
    res.status(201).json({ stylist });
  }

  async function updateStylist(req, res) {
    const existing = await store.findStylistById(req.params.id);
    if (!existing) throw new HttpError(404, "Stylist not found.");
    const changes = readStylist(req.body, existing);
    const duplicate = (await store.listStylists()).some((stylist) =>
      stylist.id !== existing.id && stylist.name.toLowerCase() === changes.name.toLowerCase());
    if (duplicate) throw new HttpError(409, "A stylist with that name already exists.");
    let stylist;
    try {
      stylist = await store.updateStylist(existing.id, changes);
    } catch (error) {
      if (error?.code === 11000) throw new HttpError(409, "A stylist with that name already exists.");
      throw error;
    }
    if (!stylist) throw new HttpError(404, "Stylist not found.");
    res.json({ stylist });
  }

  return { dashboard, updateAppointment, serviceCatalog, createService, updateService, stylistCatalog, createStylist, updateStylist };
}
