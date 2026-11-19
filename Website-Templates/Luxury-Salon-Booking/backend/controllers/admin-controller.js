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

  return { dashboard, updateAppointment };
}
