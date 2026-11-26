import { HttpError, safeUser } from "../utils/http.js";

const appointmentStatuses = new Set(["Requested", "Scheduled", "In Progress", "Completed", "Cancelled"]);

export function createAdminController(store) {
  return {
    dashboard: async (_req, res) => {
      const state = await store.read();
      const payments = state.payments || [];
      const appointments = state.appointments.map((appointment) => {
        const payment = payments.find((item) => item.appointmentId === appointment.id && item.status === "paid")
          || payments.find((item) => item.appointmentId === appointment.id);
        return {
          ...appointment,
          paymentStatus: payment?.status || "unpaid",
          paymentReference: payment?.reference,
        };
      });
      res.json({
        metrics: {
          clients: state.users.filter((user) => user.role === "client").length,
          appointments: appointments.length,
          newRequests: appointments.filter((appointment) => appointment.status === "Requested").length,
          activeAppointments: appointments.filter((appointment) => ["Scheduled", "In Progress"].includes(appointment.status)).length,
          paidPayments: payments.filter((payment) => payment.status === "paid").length,
          paidTotal: Math.round(payments.filter((payment) => payment.status === "paid").reduce((total, payment) => total + payment.amount, 0)) / 100,
        },
        appointments: appointments.slice(0, 50),
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
