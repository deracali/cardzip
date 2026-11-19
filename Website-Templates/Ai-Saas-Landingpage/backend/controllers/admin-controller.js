import { createHmac, timingSafeEqual } from "node:crypto";
import { authorizedClaims, createToken } from "../middleware/auth.js";
import { duplicateAsConflict, notFound, publicLead, publicUser, requireObject, validateLead, validateLeadResponse, validatePage, validatePlan } from "./validation.js";

const leadStatuses = new Set(["new", "contacted", "qualified", "closed"]);

export function createAdminController({ store, authSecret, adminEmail, adminPasswordHash }) {
  const authorize = (request) => authorizedClaims(request, authSecret, "admin", adminEmail);
  return {
    login: async (_request, body) => {
      const input = requireObject(body);
      const email = String(input.email || "").trim().toLowerCase();
      const passwordHash = createHmac("sha256", authSecret).update(String(input.password || "")).digest();
      if (email !== adminEmail || !timingSafeEqual(passwordHash, adminPasswordHash)) {
        const error = new Error("Email or password is incorrect.");
        error.status = 401;
        throw error;
      }
      return { status: 200, body: { token: createToken(adminEmail, "admin", authSecret) } };
    },
    leads: async (request, _body, _match, url) => {
      authorize(request);
      const status = url.searchParams.get("status");
      if (status && status !== "all" && !leadStatuses.has(status)) {
        const error = new Error("Choose a valid lead status.");
        error.status = 400;
        throw error;
      }
      return { status: 200, body: { data: (await store.listLeads({ status, search: (url.searchParams.get("search") || "").trim() })).map(publicLead) } };
    },
    createLead: async (request, body) => {
      authorize(request);
      return { status: 201, body: { data: publicLead(await store.createLead(validateLead(requireObject(body)))) } };
    },
    updateLead: async (request, body, match) => {
      authorize(request);
      const input = requireObject(body);
      if (!leadStatuses.has(input.status)) {
        const error = new Error("Choose a valid lead status.");
        error.status = 400;
        throw error;
      }
      const changes = { status: input.status };
      if (Object.hasOwn(input, "response")) {
        changes.response = validateLeadResponse(input);
        changes.respondedAt = changes.response ? new Date().toISOString() : null;
      }
      const lead = await store.updateLead(match[1], changes);
      if (!lead) throw notFound("Inquiry was not found.");
      return { status: 200, body: { data: publicLead(lead) } };
    },
    deleteLead: async (request, _body, match) => {
      authorize(request);
      if (!await store.deleteLead(match[1])) throw notFound("Inquiry was not found.");
      return { status: 200, body: { data: { id: match[1] } } };
    },
    users: async (request, _body, _match, url) => {
      authorize(request);
      return { status: 200, body: { data: await store.listUsers((url.searchParams.get("search") || "").trim()) } };
    },
    updateUser: async (request, body, match) => {
      authorize(request);
      const input = requireObject(body);
      const name = String(input.name || "").trim();
      const email = String(input.email || "").trim().toLowerCase();
      if (!name || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
        const error = new Error("Enter a valid user name and email.");
        error.status = 400;
        throw error;
      }
      let user;
      try {
        user = await store.updateUser(match[1], { name, email });
      } catch (error) {
        throw duplicateAsConflict(error);
      }
      if (!user) throw notFound("User was not found.");
      return { status: 200, body: { data: publicUser(user) } };
    },
    deleteUser: async (request, _body, match) => {
      authorize(request);
      if (!await store.deleteUser(match[1])) throw notFound("User was not found.");
      return { status: 200, body: { data: { id: match[1] } } };
    },
    pages: async (request) => {
      authorize(request);
      return { status: 200, body: { data: await store.listPages() } };
    },
    createPage: async (request, body) => {
      authorize(request);
      try {
        return { status: 201, body: { data: await store.createPage(validatePage(requireObject(body))) } };
      } catch (error) {
        throw duplicateAsConflict(error);
      }
    },
    updatePage: async (request, body, match) => {
      authorize(request);
      try {
        const page = await store.updatePage(match[1], validatePage(requireObject(body)));
        if (!page) throw notFound("Page was not found.");
        return { status: 200, body: { data: page } };
      } catch (error) {
        throw duplicateAsConflict(error);
      }
    },
    deletePage: async (request, _body, match) => {
      authorize(request);
      if (!await store.deletePage(match[1])) throw notFound("Page was not found.");
      return { status: 200, body: { data: { id: match[1] } } };
    },
    plans: async (request) => {
      authorize(request);
      return { status: 200, body: { data: await store.listPlans() } };
    },
    createPlan: async (request, body) => {
      authorize(request);
      try {
        return { status: 201, body: { data: await store.createPlan(validatePlan(requireObject(body))) } };
      } catch (error) {
        throw duplicateAsConflict(error);
      }
    },
    updatePlan: async (request, body, match) => {
      authorize(request);
      try {
        const plan = await store.updatePlan(match[1], validatePlan(requireObject(body)));
        if (!plan) throw notFound("Plan was not found.");
        return { status: 200, body: { data: plan } };
      } catch (error) {
        throw duplicateAsConflict(error);
      }
    },
    deletePlan: async (request, _body, match) => {
      authorize(request);
      if (!await store.deletePlan(match[1])) throw notFound("Plan was not found.");
      return { status: 200, body: { data: { id: match[1] } } };
    },
  };
}
