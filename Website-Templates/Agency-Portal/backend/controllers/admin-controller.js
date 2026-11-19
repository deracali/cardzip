import { createHmac } from "node:crypto";
import { newId } from "../models/store.js";
import { HttpError, normalizedEmail, optionalText, requiredText } from "../utils/http.js";

const projectStatuses = new Set(["In progress", "Review", "Planning", "Completed"]);
const clientStatuses = new Set(["Active", "Onboarding", "Paused"]);
const teamStatuses = new Set(["Available", "On a project", "Away"]);
const invoiceStatuses = new Set(["Due soon", "Paid", "Overdue"]);
const inquiryStatuses = new Set(["New", "Contacted", "Accepted", "Closed"]);

function caseStudyText(body, field, label, maxLength, existing = "") {
  return body[field] === undefined ? existing : requiredText(body[field], label, maxLength);
}

function caseStudyImage(value, label) {
  const image = optionalText(value, label, 2000);
  if (!image) return "";
  try {
    const url = new URL(image);
    if (url.protocol === "https:" && url.hostname === "res.cloudinary.com") return url.toString();
  } catch {
    throw new HttpError(400, `${label} must be a Cloudinary image URL.`);
  }
  throw new HttpError(400, `${label} must be a Cloudinary image URL.`);
}

function caseStudyList(value, label, maxItems, maxLength, required = false) {
  if (value === undefined && !required) return undefined;
  if (!Array.isArray(value) || value.length > maxItems) throw new HttpError(400, `${label} must contain no more than ${maxItems} items.`);
  if (required && value.length === 0) throw new HttpError(400, `${label} must contain at least one item.`);
  return value.map((item) => requiredText(item, label, maxLength));
}

function applyCaseStudyFields(record, body, creating = false) {
  record.name = caseStudyText(body, "name", "Title", 180, record.name);
  record.client = caseStudyText(body, "client", "Client", 160, record.client);
  record.type = caseStudyText(body, "type", "Project type", 120, record.type);
  record.image = body.image === undefined && !creating
    ? record.image
    : caseStudyImage(requiredText(body.image, "Cover image URL", 2000), "Cover image");
  record.images = body.images === undefined && !creating
    ? record.images || []
    : (caseStudyList(body.images || [], "Gallery image", 12, 2000) || []).map((image) => caseStudyImage(image, "Gallery image"));
  record.alt = caseStudyText(body, "alt", "Image description", 300, record.alt);
  record.summary = caseStudyText(body, "summary", "Summary", 500, record.summary);
  record.description = caseStudyText(body, "description", "Case study description", 4000, record.description);
  record.result = caseStudyText(body, "result", "Result", 300, record.result);
  record.deliverables = caseStudyList(body.deliverables, "Deliverable", 20, 160, creating) ?? record.deliverables;
}

function updateRecord(store, collection, id, label, apply) {
  return store.update((state) => {
    const record = state[collection].find((item) => item.id === id);
    if (!record) throw new HttpError(404, `${label} not found.`);
    apply(record);
    return record;
  });
}

function updateStatus(store, collection, id, label, allowed, status) {
  return updateRecord(store, collection, id, label, (record) => {
    if (status === undefined) return;
    if (!allowed.has(status)) throw new HttpError(400, `${label} status is invalid.`);
    record.status = status;
  });
}

export function createAdminController(store, env = process.env) {
  return {
    dashboard: async (_req, res) => {
      const state = await store.read();
      const paidRevenue = state.invoices.filter((invoice) => invoice.status === "Paid").reduce((sum, invoice) => sum + invoice.amount, 0);
      res.json({
        metrics: {
          activeProjects: state.projects.filter((project) => project.status !== "Completed").length,
          monthlyRevenue: paidRevenue,
          activeClients: state.clients.filter((client) => client.status === "Active").length,
          pendingApprovals: state.projects.filter((project) => project.status === "Review").length + state.inquiries.filter((inquiry) => inquiry.status === "New").length,
        },
        projects: state.projects.slice(0, 5),
        activity: state.activities.slice(0, 8),
      });
    },

    listProjects: async (_req, res) => res.json({ projects: (await store.read()).projects }),
    createProject: async (req, res) => {
      const project = await store.update((state) => {
        const created = {
          id: newId("project"),
          name: requiredText(req.body.name, "Project name", 180),
          client: requiredText(req.body.client, "Client name", 160),
          clientEmail: req.body.clientEmail ? normalizedEmail(req.body.clientEmail) : "",
          service: requiredText(req.body.service || "New project", "Service", 120),
          due: optionalText(req.body.due, "Due date", 40) || "To be scheduled",
          status: req.body.status || "Planning",
          progress: Number.isInteger(req.body.progress) ? req.body.progress : 0,
          budget: Number.isFinite(req.body.budget) ? req.body.budget : 0,
        };
        if (!projectStatuses.has(created.status) || created.progress < 0 || created.progress > 100 || created.budget < 0) {
          throw new HttpError(400, "Project status, progress, or budget is invalid.");
        }
        state.projects.unshift(created);
        state.activities.unshift({ id: newId("activity"), title: "Project created", detail: `${created.name} was added to the workspace`, createdAt: new Date().toISOString() });
        return created;
      });
      res.status(201).json({ project });
    },
    updateProject: async (req, res) => {
      const project = await updateRecord(store, "projects", req.params.id, "Project", (record) => {
        if (req.body.name !== undefined) record.name = requiredText(req.body.name, "Project name", 180);
        if (req.body.client !== undefined) record.client = requiredText(req.body.client, "Client name", 160);
        if (req.body.service !== undefined) record.service = requiredText(req.body.service, "Service", 120);
        if (req.body.due !== undefined) record.due = optionalText(req.body.due, "Due date", 40);
        if (req.body.status !== undefined) {
          if (!projectStatuses.has(req.body.status)) throw new HttpError(400, "Project status is invalid.");
          record.status = req.body.status;
        }
        if (req.body.progress !== undefined) {
          if (!Number.isInteger(req.body.progress) || req.body.progress < 0 || req.body.progress > 100) throw new HttpError(400, "Progress must be between 0 and 100.");
          record.progress = req.body.progress;
        }
      });
      res.json({ project });
    },
    listCaseStudies: async (_req, res) => res.json({ caseStudies: (await store.read()).caseStudies || [] }),
    signCaseStudyImageUpload: async (_req, res) => {
      const { CLOUDINARY_CLOUD_NAME: cloudName, CLOUDINARY_API_KEY: apiKey, CLOUDINARY_API_SECRET: apiSecret } = env;
      if (!cloudName || !apiKey || !apiSecret) {
        throw new HttpError(503, "Case-study image uploads are not configured. Set the Cloudinary credentials in the agency API environment.");
      }
      const timestamp = Math.floor(Date.now() / 1000);
      const folder = "nova-case-studies";
      const signature = createHmac("sha1", apiSecret)
        .update(`folder=${folder}&timestamp=${timestamp}`)
        .digest("hex");
      res.json({ cloudName, apiKey, timestamp, folder, signature });
    },
    createCaseStudy: async (req, res) => {
      const caseStudy = await store.update((state) => {
        state.caseStudies ||= [];
        const now = new Date().toISOString();
        const created = {
          id: newId("case-study"),
          slug: "",
          name: "",
          client: "",
          type: "",
          visual: "project-custom",
          image: "",
          images: [],
          alt: "",
          summary: "",
          description: "",
          result: "",
          deliverables: [],
          createdAt: now,
          updatedAt: now,
        };
        applyCaseStudyFields(created, req.body, true);
        created.slug = created.name.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        if (state.caseStudies.some((item) => item.slug === created.slug)) created.slug = `${created.slug}-${created.id.slice(-8)}`;
        state.caseStudies.unshift(created);
        state.activities.unshift({ id: newId("activity"), title: "Case study published", detail: `${created.name} was added to the website`, createdAt: now });
        return created;
      });
      res.status(201).json({ caseStudy });
    },
    updateCaseStudy: async (req, res) => {
      const caseStudy = await store.update((state) => {
        state.caseStudies ||= [];
        const record = state.caseStudies.find((item) => item.id === req.params.id);
        if (!record) throw new HttpError(404, "Case study not found.");
        applyCaseStudyFields(record, req.body);
        record.updatedAt = new Date().toISOString();
        return record;
      });
      res.json({ caseStudy });
    },
    deleteCaseStudy: async (req, res) => {
      const caseStudy = await store.update((state) => {
        state.caseStudies ||= [];
        const index = state.caseStudies.findIndex((item) => item.id === req.params.id);
        if (index < 0) throw new HttpError(404, "Case study not found.");
        return state.caseStudies.splice(index, 1)[0];
      });
      res.json({ caseStudy });
    },

    listClients: async (_req, res) => {
      const state = await store.read();
      res.json({ clients: state.clients.map((client) => ({
        ...client,
        projects: state.projects.filter((project) => project.clientEmail === client.email).length,
      })) });
    },
    createClient: async (req, res) => {
      const client = await store.update((state) => {
        const email = normalizedEmail(req.body.email);
        if (state.clients.some((item) => item.email === email)) throw new HttpError(409, "A client with that email already exists.");
        const created = {
          id: newId("client"),
          name: requiredText(req.body.name, "Client name", 120),
          company: requiredText(req.body.company, "Company", 160),
          email,
          status: "Onboarding",
          createdAt: new Date().toISOString(),
        };
        state.clients.unshift(created);
        return created;
      });
      res.status(201).json({ client });
    },
    updateClient: async (req, res) => {
      const client = await updateStatus(store, "clients", req.params.id, "Client", clientStatuses, req.body.status);
      res.json({ client });
    },

    listTeam: async (_req, res) => res.json({ team: (await store.read()).team }),
    createTeamMember: async (req, res) => {
      const member = await store.update((state) => {
        const email = normalizedEmail(req.body.email);
        if (state.team.some((item) => item.email === email)) throw new HttpError(409, "A team member with that email already exists.");
        const created = {
          id: newId("member"),
          name: requiredText(req.body.name, "Name", 120),
          role: requiredText(req.body.role, "Role", 120),
          email,
          status: "Available",
        };
        state.team.unshift(created);
        return created;
      });
      res.status(201).json({ member });
    },
    updateTeamMember: async (req, res) => {
      const member = await updateStatus(store, "team", req.params.id, "Team member", teamStatuses, req.body.status);
      res.json({ member });
    },

    listInvoices: async (_req, res) => res.json({ invoices: (await store.read()).invoices }),
    createInvoice: async (req, res) => {
      const invoice = await store.update((state) => {
        const amount = Number(req.body.amount);
        if (!Number.isFinite(amount) || amount <= 0 || amount > 100000000) throw new HttpError(400, "Invoice amount must be greater than zero.");
        const created = {
          id: `INV-${new Date().getFullYear()}-${String(state.invoices.length + 1).padStart(3, "0")}`,
          client: requiredText(req.body.client, "Client name", 160),
          clientEmail: req.body.clientEmail ? normalizedEmail(req.body.clientEmail) : "",
          date: new Date().toISOString().slice(0, 10),
          amount,
          status: "Due soon",
        };
        state.invoices.unshift(created);
        return created;
      });
      res.status(201).json({ invoice });
    },
    updateInvoice: async (req, res) => {
      const invoice = await updateStatus(store, "invoices", req.params.id, "Invoice", invoiceStatuses, req.body.status);
      res.json({ invoice });
    },

    listMessages: async (_req, res) => {
      const state = await store.read();
      res.json({ messages: [...state.messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
    },
    sendMessage: async (req, res) => {
      const message = await store.update((state) => {
        const clientEmail = normalizedEmail(req.body.clientEmail);
        const client = state.clients.find((item) => item.email === clientEmail);
        if (!client) throw new HttpError(404, "Client not found.");
        const created = {
          id: newId("message"),
          client: client.name,
          clientEmail,
          body: requiredText(req.body.message, "Message", 2000),
          sender: "admin",
          createdAt: new Date().toISOString(),
          read: false,
        };
        state.messages.push(created);
        return created;
      });
      res.status(201).json({ message });
    },
    markMessageRead: async (req, res) => {
      const message = await updateRecord(store, "messages", req.params.id, "Message", (record) => { record.read = true; });
      res.json({ message });
    },

    getSettings: async (_req, res) => res.json({ settings: (await store.read()).settings }),
    updateSettings: async (req, res) => {
      const settings = await store.update((state) => {
        const patch = req.body;
        if (patch.studioName !== undefined) state.settings.studioName = requiredText(patch.studioName, "Studio name", 160);
        if (patch.email !== undefined) state.settings.email = normalizedEmail(patch.email);
        if (patch.website !== undefined) {
          try {
            const website = new URL(requiredText(patch.website, "Website", 300));
            if (!["http:", "https:"].includes(website.protocol)) throw new Error("invalid protocol");
            state.settings.website = website.toString();
          } catch {
            throw new HttpError(400, "Enter a valid website URL.");
          }
        }
        if (patch.description !== undefined) state.settings.description = optionalText(patch.description, "Description", 1000);
        if (patch.notifications !== undefined) {
          for (const key of ["projectUpdates", "clientActivity", "weeklySummary"]) {
            if (patch.notifications[key] !== undefined && typeof patch.notifications[key] !== "boolean") {
              throw new HttpError(400, "Notification preferences must be boolean values.");
            }
          }
          state.settings.notifications = { ...state.settings.notifications, ...patch.notifications };
        }
        return state.settings;
      });
      res.json({ settings });
    },

    listInquiries: async (_req, res) => res.json({ inquiries: (await store.read()).inquiries }),
    updateInquiry: async (req, res) => {
      const inquiry = await updateStatus(store, "inquiries", req.params.id, "Inquiry", inquiryStatuses, req.body.status);
      res.json({ inquiry });
    },
    replyToInquiry: async (req, res) => {
      const { inquiry, message } = await store.update((state) => {
        const inquiry = state.inquiries.find((item) => item.id === req.params.id);
        if (!inquiry) throw new HttpError(404, "Inquiry not found.");
        const body = requiredText(req.body.message, "Reply", 2000);
        const createdAt = new Date().toISOString();
        const createdMessage = {
          id: newId("message"),
          client: inquiry.name,
          clientEmail: inquiry.email,
          body,
          sender: "admin",
          createdAt,
          read: false,
        };
        inquiry.response = body;
        inquiry.respondedAt = createdAt;
        if (inquiry.status === "New") inquiry.status = "Contacted";
        state.messages.push(createdMessage);
        state.activities.unshift({ id: newId("activity"), title: "Inquiry response sent", detail: `NOVA Studio replied to ${inquiry.name} (${inquiry.email})`, createdAt });
        return { inquiry, message: createdMessage };
      });
      res.status(201).json({ inquiry, message });
    },
  };
}
