import { Router } from "express";
import { createAdminController } from "../controllers/admin-controller.js";
import { createAuthController } from "../controllers/auth-controller.js";
import { createClientController } from "../controllers/client-controller.js";
import { createPublicController } from "../controllers/public-controller.js";
import { createAuthMiddleware } from "../middleware/auth.js";
import { createRateLimiter } from "../utils/http.js";

export function createApiRouter({ store, secret, env, mailer, production }) {
  const router = Router();
  const auth = createAuthController({ store, secret, env, mailer, production });
  const client = createClientController(store);
  const adminController = createAdminController(store, env);
  const publicController = createPublicController(store);
  const { requireUser, requireClient, admin } = createAuthMiddleware(store, secret);
  const clientAuth = [requireUser, requireClient];
  const authRateLimit = createRateLimiter({ limit: 10, windowMs: 15 * 60 * 1000 });

  router.get("/health", publicController.health);
  router.get("/public/case-studies", publicController.listCaseStudies);

  router.post("/auth/signup", authRateLimit, auth.signup);
  router.post("/auth/admin-signup", authRateLimit, auth.adminSignup);
  router.post("/auth/login", authRateLimit, auth.login);
  router.post("/auth/forgot-password", authRateLimit, auth.forgotPassword);
  router.post("/auth/reset-password", authRateLimit, auth.resetPassword);
  router.get("/auth/me", requireUser, auth.me);
  router.post("/auth/logout", requireUser, auth.logout);

  router.get("/client/dashboard", ...clientAuth, client.dashboard);
  router.get("/client/inquiries", ...clientAuth, client.inquiries);
  router.post("/client/inquiries", ...clientAuth, client.submitInquiry);
  router.get("/client/messages", ...clientAuth, client.messages);
  router.post("/client/messages", ...clientAuth, client.sendMessage);

  router.post("/public/inquiries", ...clientAuth, client.submitInquiry);

  router.get("/admin/dashboard", ...admin, adminController.dashboard);
  router.get("/admin/projects", ...admin, adminController.listProjects);
  router.post("/admin/projects", ...admin, adminController.createProject);
  router.patch("/admin/projects/:id", ...admin, adminController.updateProject);
  router.get("/admin/case-studies", ...admin, adminController.listCaseStudies);
  router.post("/admin/case-studies/upload-signature", ...admin, adminController.signCaseStudyImageUpload);
  router.post("/admin/case-studies", ...admin, adminController.createCaseStudy);
  router.patch("/admin/case-studies/:id", ...admin, adminController.updateCaseStudy);
  router.delete("/admin/case-studies/:id", ...admin, adminController.deleteCaseStudy);
  router.get("/admin/clients", ...admin, adminController.listClients);
  router.post("/admin/clients", ...admin, adminController.createClient);
  router.patch("/admin/clients/:id", ...admin, adminController.updateClient);
  router.get("/admin/team", ...admin, adminController.listTeam);
  router.post("/admin/team", ...admin, adminController.createTeamMember);
  router.patch("/admin/team/:id", ...admin, adminController.updateTeamMember);
  router.get("/admin/invoices", ...admin, adminController.listInvoices);
  router.post("/admin/invoices", ...admin, adminController.createInvoice);
  router.patch("/admin/invoices/:id", ...admin, adminController.updateInvoice);
  router.get("/admin/messages", ...admin, adminController.listMessages);
  router.post("/admin/messages", ...admin, adminController.sendMessage);
  router.patch("/admin/messages/:id/read", ...admin, adminController.markMessageRead);
  router.get("/admin/settings", ...admin, adminController.getSettings);
  router.put("/admin/settings", ...admin, adminController.updateSettings);
  router.get("/admin/inquiries", ...admin, adminController.listInquiries);
  router.post("/admin/inquiries/:id/reply", ...admin, adminController.replyToInquiry);
  router.patch("/admin/inquiries/:id", ...admin, adminController.updateInquiry);

  return router;
}
