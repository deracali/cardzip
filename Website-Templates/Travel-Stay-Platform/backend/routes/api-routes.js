import { Router } from "express";
import { createAuthController } from "../controllers/auth-controller.js";
import { createBookingController } from "../controllers/booking-controller.js";
import { createAuthMiddleware } from "../middleware/auth.js";
import { createRateLimiter } from "../utils/http.js";

export function createApiRouter({ store, secret, env, payments, allowedOrigins }) {
  const router = Router();
  const auth = createAuthController(store, { secret, env });
  const bookings = createBookingController({ store, payments, env, allowedOrigins });
  const { requireUser, requireClient, requireAdmin } = createAuthMiddleware(store, secret);
  const client = [requireUser, requireClient];
  const admin = [requireUser, requireAdmin];
  const authRateLimit = createRateLimiter({ limit: 10, windowMs: 15 * 60 * 1000 });
  const bookingRateLimit = createRateLimiter({ limit: 8, windowMs: 60 * 60 * 1000 });

  router.get("/health", (req, res) => res.json({ status: "ok", service: "escapes-travel-stay-api" }));
  router.post("/auth/signup", authRateLimit, auth.signup);
  router.post("/auth/admin-signup", authRateLimit, auth.adminSignup);
  router.post("/auth/login", authRateLimit, auth.login);
  router.get("/auth/me", requireUser, auth.me);

  router.get("/client/payment/providers", ...client, bookings.providers);
  router.post("/client/bookings/checkout", ...client, bookingRateLimit, bookings.createCheckout);
  router.post("/client/bookings/verify", ...client, bookingRateLimit, bookings.verify);
  router.get("/client/dashboard", ...client, bookings.clientDashboard);
  router.get("/admin/dashboard", ...admin, bookings.adminDashboard);
  router.patch("/admin/bookings/:id", ...admin, bookings.updateReservation);
  router.webhooks = {
    stripe: (req, res) => bookings.webhook(req, res, "stripe"),
    paystack: (req, res) => bookings.webhook(req, res, "paystack"),
  };
  return router;
}
