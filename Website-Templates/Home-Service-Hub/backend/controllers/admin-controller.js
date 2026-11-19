import { HttpError, safeUser } from "../utils/http.js";

const appointmentStatuses = new Set(["Requested", "Scheduled", "In Progress", "Completed", "Cancelled"]);

export function createAdminController(store) {
  return {
    dashboard: async (_req, res) => {
      const state = await store.read();
      res.json({
        metrics: {
          clients: state.users.filter((user) => user.role === "client").length,
          appointments: state.appointments.length,
          newRequests: state.appointments.filter((appointment) => appointment.status === "Requested").length,
          activeAppointments: state.appointments.filter((appointment) => ["Scheduled", "In Progress"].includes(appointment.status)).length,
        },
        appointments: state.appointments.slice(0, 50),
        clients: state.users.filter((user) => user.role === "client").map(safeUser),
      });
    },

    updateAppointment: async (req, res) => {
      const status = req.body?.status;
      if (!appointmentStatuses.has(status)) throw new HttpError(400, "Choose a valid appointment status.");
      const appointment = await store.update((state) => {
        const existing = state.appointments.find((item) => item.id === req.params.id);
        if (!existing) throw new HttpError(404, "Service request not found.");
        existing.status = status;
        existing.updatedAt = new Date().toISOString();
        return existing;
      });
      res.json({ appointment });
    },
  };
}
