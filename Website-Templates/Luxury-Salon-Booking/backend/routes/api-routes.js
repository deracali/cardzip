import { Router } from "express";
import { createAdminController } from "../controllers/admin-controller.js";
import { createAuthController } from "../controllers/auth-controller.js";
import { createClientController } from "../controllers/client-controller.js";
import { createAuthMiddleware } from "../middleware/auth.js";
import { createPaymentProofMiddleware } from "../middleware/payment-proof.js";
import { createRateLimiter } from "../utils/http.js";

export function createApiRouter({ store, secret, paymentProofSecret }) {
  const router = Router();
  const auth = createAuthController(store, secret);
  const client = createClientController(store);
  const admin = createAdminController(store);
  const access = createAuthMiddleware(store, secret);
  const rateLimitAuth = createRateLimiter({ limit: 10, windowMs: 15 * 60 * 1000 });

  router.get("/health", (req, res) => res.json({ status: "ok", service: "lumiere-salon-api" }));
  router.post("/auth/signup", rateLimitAuth, auth.signup);
  router.post("/auth/login", rateLimitAuth, auth.login);
  router.get("/auth/me", access.requireUser, auth.currentUser);
  router.get("/services", client.catalog);
  router.get("/stylists", client.stylistCatalog);
  router.get("/client/dashboard", ...access.client, client.dashboard);
  router.post("/client/appointments", ...access.client, createPaymentProofMiddleware(paymentProofSecret), client.createAppointment);
  router.get("/admin/dashboard", ...access.admin, admin.dashboard);
  router.patch("/admin/appointments/:id", ...access.admin, admin.updateAppointment);
  router.get("/admin/services", ...access.admin, admin.serviceCatalog);
  router.post("/admin/services", ...access.admin, admin.createService);
  router.patch("/admin/services/:id", ...access.admin, admin.updateService);
  router.get("/admin/stylists", ...access.admin, admin.stylistCatalog);
  router.post("/admin/stylists", ...access.admin, admin.createStylist);
  router.patch("/admin/stylists/:id", ...access.admin, admin.updateStylist);

  return router;
}
