import { HttpError, requiredText } from "../utils/http.js";
import { newId } from "../models/store.js";

const serviceIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function serviceValues(body, current) {
  const id = current?.id || requiredText(body.id, "Service ID", 60);
  if (!serviceIdPattern.test(id)) throw new HttpError(400, "Service ID must use lowercase letters, numbers, and hyphens.");
  if (id === "maintenance-plan") throw new HttpError(400, "The maintenance plan is managed through membership checkout.");
  const price = Number(body.price ?? current?.price);
  if (!Number.isSafeInteger(price) || price < 1 || price > 100000) {
    throw new HttpError(400, "Service price must be a whole number between 1 and 100000.");
  }
  if (body.active !== undefined && typeof body.active !== "boolean") {
    throw new HttpError(400, "Service availability must be enabled or disabled.");
  }
  return {
    id,
    name: requiredText(body.name ?? current?.name, "Service name", 100),
    description: requiredText(body.description ?? current?.description, "Service description", 1000),
    price,
    duration: requiredText(body.duration ?? current?.duration, "Service duration", 60),
    category: requiredText(body.category ?? current?.category, "Service category", 60),
    active: body.active ?? current?.active ?? true,
  };
}

function technicianValues(body, current) {
  if (body.active !== undefined && typeof body.active !== "boolean") {
    throw new HttpError(400, "Technician availability must be enabled or disabled.");
  }
  return {
    id: current?.id || newId("technician"),
    name: requiredText(body.name ?? current?.name, "Technician name", 100),
    specialty: requiredText(body.specialty ?? current?.specialty, "Specialty", 100),
    experience: requiredText(body.experience ?? current?.experience, "Experience", 60),
    location: requiredText(body.location ?? current?.location, "Location", 120),
    bio: requiredText(body.bio ?? current?.bio, "Biography", 500),
    active: body.active ?? current?.active ?? true,
  };
}

export function createCatalogController(store) {
  return {
    publicCatalog: async (_req, res) => {
      const state = await store.read();
      res.json({
        services: state.services.filter((service) => service.active),
        technicians: state.technicians.filter((technician) => technician.active),
      });
    },

    adminCatalog: async (_req, res) => {
      const state = await store.read();
      res.json({ services: state.services, technicians: state.technicians });
    },

    createService: async (req, res) => {
      const service = serviceValues(req.body);
      const created = await store.update((state) => {
        if (state.services.some((item) => item.id === service.id)) {
          throw new HttpError(409, "A service with that ID already exists.");
        }
        state.services.push(service);
        return service;
      });
      res.status(201).json({ service: created });
    },

    updateService: async (req, res) => {
      const serviceId = requiredText(req.params.id, "Service ID", 60);
      const updated = await store.update((state) => {
        const current = state.services.find((item) => item.id === serviceId);
        if (!current) throw new HttpError(404, "Service not found.");
        Object.assign(current, serviceValues(req.body, current));
        current.updatedAt = new Date().toISOString();
        return current;
      });
      res.json({ service: updated });
    },

    createTechnician: async (req, res) => {
      const technician = technicianValues(req.body);
      const created = await store.update((state) => {
        state.technicians.push(technician);
        return technician;
      });
      res.status(201).json({ technician: created });
    },

    updateTechnician: async (req, res) => {
      const technicianId = requiredText(req.params.id, "Technician ID", 80);
      const updated = await store.update((state) => {
        const current = state.technicians.find((item) => item.id === technicianId);
        if (!current) throw new HttpError(404, "Technician not found.");
        Object.assign(current, technicianValues(req.body, current));
        current.updatedAt = new Date().toISOString();
        return current;
      });
      res.json({ technician: updated });
    },
  };
}
