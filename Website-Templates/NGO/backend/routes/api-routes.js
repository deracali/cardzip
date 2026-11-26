import { Router } from "express";
import { createAdminController } from "../controllers/admin-controller.js";
import { createAuthController } from "../controllers/auth-controller.js";
import { createClientController } from "../controllers/client-controller.js";
import { createPaymentController } from "../controllers/payment-controller.js";
import { createPublicController } from "../controllers/public-controller.js";
import { createAuthMiddleware } from "../middleware/auth.js";
import { createRateLimiter } from "../utils/http.js";

export function createApiRouter({ store, secret, env, paystack }) {
  const router = Router();
  const auth = createAuthController({ store, secret, env });
  const client = createClientController(store);
  const payments = createPaymentController({ store, paystack });
  const admin = createAdminController(store);
  const publicController = createPublicController(store);
  const { requireUser, requireClient, requireAdmin } = createAuthMiddleware(store, secret);
  const clientAuth = [requireUser, requireClient];
  const adminAuth = [requireUser, requireAdmin];
  const authRateLimit = createRateLimiter({ limit: 20, windowMs: 15 * 60 * 1000 });
  const paymentRateLimit = createRateLimiter({ limit: 12, windowMs: 10 * 60 * 1000 });

  router.get("/health", publicController.health);
  router.get("/public/campaigns", publicController.campaigns);

  router.post("/auth/signup", authRateLimit, auth.signup);
  router.post("/auth/admin-signup", authRateLimit, auth.adminSignup);
  router.post("/auth/login", authRateLimit, auth.login);
  router.get("/auth/me", requireUser, auth.me);
  router.post("/auth/logout", requireUser, auth.logout);

  router.get("/client/dashboard", ...clientAuth, client.dashboard);
  router.post("/client/donations", ...clientAuth, client.createDonation);
  router.post("/client/payments/initialize", ...clientAuth, paymentRateLimit, payments.initialize);
  router.post("/client/payments/verify", ...clientAuth, paymentRateLimit, payments.verify);
  router.post("/payments/paystack/webhook", payments.webhook);

  router.get("/admin/dashboard", ...adminAuth, admin.dashboard);
  router.get("/admin/donations", ...adminAuth, admin.donations);
  router.patch("/admin/donations/:id", ...adminAuth, admin.updateDonation);

  return router;
}
