import { newId } from "../models/store.js";
import { HttpError, optionalText, requiredText } from "../utils/http.js";

const serviceOptions = {
  pipe: { name: "Pipe repair", price: 129 },
  drain: { name: "Drain cleaning", price: 99 },
  cooling: { name: "AC maintenance", price: 149 },
  heating: { name: "Heating", price: 159 },
};
const urgencySurcharges = { standard: 0, emergency: 60, weekend: 30 };

function clientAppointments(state, clientId) {
  return state.appointments
    .filter((appointment) => appointment.clientId === clientId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function createClientController(store) {
  return {
    dashboard: async (req, res) => {
      const state = await store.read();
      res.json({ user: req.user, appointments: clientAppointments(state, req.user.id) });
    },

    createAppointment: async (req, res) => {
      const serviceId = req.body?.serviceId;
      const service = serviceOptions[serviceId];
      if (!service) throw new HttpError(400, "Choose a valid home service.");
      const urgency = req.body?.urgency || "standard";
      if (!Object.hasOwn(urgencySurcharges, urgency)) throw new HttpError(400, "Choose a valid visit urgency.");
      const preferredDate = requiredText(req.body?.preferredDate, "Preferred date", 10);
      const parsedDate = new Date(`${preferredDate}T00:00:00.000Z`);
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)
        || Number.isNaN(parsedDate.getTime())
        || parsedDate.toISOString().slice(0, 10) !== preferredDate
        || preferredDate < new Date().toISOString().slice(0, 10)
      ) {
        throw new HttpError(400, "Choose a valid date that is not in the past.");
      }
      const address = requiredText(req.body?.address, "Service address", 240);
      const phone = requiredText(req.body?.phone, "Phone number", 40);
      const description = optionalText(req.body?.description, "Issue details", 500);
      const appointment = await store.update((state) => {
        const created = {
          id: newId("appointment"),
          clientId: req.user.id,
          clientName: req.user.name,
          clientEmail: req.user.email,
          serviceId,
          serviceName: service.name,
          urgency,
          preferredDate,
          address,
          phone,
          description,
          quote: service.price + urgencySurcharges[urgency],
          status: "Requested",
          createdAt: new Date().toISOString(),
        };
        state.appointments.unshift(created);
        return created;
      });
      res.status(201).json({ appointment });
    },
  };
}
