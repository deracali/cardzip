import { newId } from "../models/store.js";
import { optionalText, publicRecord, requiredText } from "../utils/http.js";

export function createClientController(store) {
  return {
    dashboard: async (req, res) => {
      const state = await store.read();
      res.json({
        user: req.user,
        projects: state.projects.filter((project) => project.clientEmail === req.user.email),
        invoices: state.invoices.filter((invoice) => invoice.clientEmail === req.user.email).map(publicRecord),
        messages: state.messages.filter((message) => message.clientEmail === req.user.email).map(publicRecord),
        inquiries: state.inquiries.filter((inquiry) => inquiry.userId === req.user.id).map(publicRecord),
      });
    },
    inquiries: async (req, res) => {
      const state = await store.read();
      res.json({ inquiries: state.inquiries.filter((inquiry) => inquiry.userId === req.user.id).map(publicRecord) });
    },
    submitInquiry: async (req, res) => {
      const inquiry = await store.update((state) => {
        const created = {
          id: newId("inquiry"),
          userId: req.user.id,
          name: req.user.name,
          email: req.user.email,
          company: optionalText(req.user.company, "Company", 160),
          phone: requiredText(req.body.phone, "Phone number", 40),
          project: requiredText(req.body.project, "Project details", 4000),
          budget: requiredText(req.body.budget, "Budget", 80),
          status: "New",
          createdAt: new Date().toISOString(),
        };
        state.inquiries.unshift(created);
        state.activities.unshift({ id: newId("activity"), title: "New project inquiry", detail: `${created.name} (${created.email}) sent a project brief`, createdAt: created.createdAt });
        return created;
      });
      res.status(201).json({ message: "Thanks — your project brief has been sent.", inquiry: publicRecord(inquiry) });
    },
    messages: async (req, res) => {
      const state = await store.read();
      res.json({ messages: state.messages.filter((message) => message.clientEmail === req.user.email).map(publicRecord) });
    },
    sendMessage: async (req, res) => {
      const body = requiredText(req.body.message, "Message", 2000);
      const message = await store.update((state) => {
        const created = {
          id: newId("message"),
          client: req.user.name,
          clientEmail: req.user.email,
          body,
          sender: "client",
          createdAt: new Date().toISOString(),
          read: false,
        };
        state.messages.push(created);
        state.activities.unshift({ id: newId("activity"), title: "Client message", detail: `${req.user.name} sent a message`, createdAt: created.createdAt });
        return created;
      });
      res.status(201).json({ message });
    },
  };
}
