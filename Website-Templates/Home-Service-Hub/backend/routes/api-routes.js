import { Router } from "express";
import { createAdminController } from "../controllers/admin-controller.js";
import { createAuthController } from "../controllers/auth-controller.js";
import { createClientController } from "../controllers/client-controller.js";
import { createPublicController } from "../controllers/public-controller.js";
import { createAuthMiddleware } from "../middleware/auth.js";
import { createRateLimiter } from "../utils/http.js";

export function createApiRouter({ store, secret }) {
  const router = Router();
  const auth = createAuthController({ store, secret });
  const client = createClientController(store);
  const admin = createAdminController(store);
  const { requireUser, requireRole } = createAuthMiddleware(store, secret);
  const publicController = createPublicController();
  const authRateLimit = createRateLimiter({ limit: 10, windowMs: 15 * 60 * 1000 });
  const clientOnly = [requireUser, requireRole("client")];
  const adminOnly = [requireUser, requireRole("admin")];

  router.get("/health", publicController.health);
  router.post("/auth/signup", authRateLimit, auth.signup);
  router.post("/auth/login", authRateLimit, auth.login);
  router.get("/auth/me", requireUser, auth.me);
  router.post("/auth/logout", requireUser, auth.logout);

  router.get("/client/dashboard", ...clientOnly, client.dashboard);
  router.post("/client/appointments", ...clientOnly, client.createAppointment);

  router.get("/admin/dashboard", ...adminOnly, admin.dashboard);
  router.patch("/admin/appointments/:id", ...adminOnly, admin.updateAppointment);

  return router;
}
