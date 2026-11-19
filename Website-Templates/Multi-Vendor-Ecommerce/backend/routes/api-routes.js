import { Router } from "express";
import { createAdminController } from "../controllers/admin-controller.js";
import { createAuthController } from "../controllers/auth-controller.js";
import { createClientController } from "../controllers/client-controller.js";
import { createPaymentController } from "../controllers/payment-controller.js";
import { createPublicController } from "../controllers/public-controller.js";
import { createVendorController } from "../controllers/vendor-controller.js";
import { createAuthMiddleware } from "../middleware/auth.js";
import { createRateLimiter } from "../utils/http.js";

export function createApiRouter({ store, secret, payments, frontendUrl }) {
  const router = Router();
  const auth = createAuthController({ store, secret });
  const client = createClientController(store);
  const payment = createPaymentController({ store, payments, frontendUrl });
  const vendor = createVendorController(store);
  const admin = createAdminController(store);
  const publicController = createPublicController(store);
  const { requireUser, requireRole } = createAuthMiddleware(store, secret);
  const authRateLimit = createRateLimiter({ limit: 10, windowMs: 15 * 60 * 1000 });

  router.get("/health", publicController.health);
  router.get("/products", payment.expireStaleReservations, publicController.products);
  router.get("/shops", publicController.shops);
  router.get("/payments/providers", payment.providers);
  router.post("/payments/paystack/webhook", payment.paystackWebhook);
  router.post("/payments/stripe/webhook", payment.stripeWebhook);

  router.post("/auth/signup", authRateLimit, auth.signup);
  router.post("/auth/login", authRateLimit, auth.login);
  router.get("/auth/me", requireUser, auth.me);
  router.post("/auth/logout", requireUser, auth.logout);

  router.get("/client/dashboard", requireUser, requireRole("client"), payment.expireStaleReservations, client.dashboard);
  router.post("/client/orders", requireUser, requireRole("client"), client.createOrder);
  router.post("/client/checkout", requireUser, requireRole("client"), payment.checkout);
  router.post("/client/payments/paystack/verify", requireUser, requireRole("client"), payment.verifyPaystack);
  router.post("/client/payments/stripe/verify", requireUser, requireRole("client"), payment.verifyStripe);
  router.post("/client/payments/stripe/cancel", requireUser, requireRole("client"), payment.cancelStripe);
  router.get("/client/orders/:orderNumber", requireUser, requireRole("client"), payment.expireStaleReservations, client.order);

  router.get("/vendor/dashboard", requireUser, requireRole("vendor"), payment.expireStaleReservations, vendor.dashboard);
  router.post("/vendor/products", requireUser, requireRole("vendor"), vendor.createProduct);
  router.patch("/vendor/products/:productId", requireUser, requireRole("vendor"), vendor.updateProduct);
  router.delete("/vendor/products/:productId", requireUser, requireRole("vendor"), vendor.deleteProduct);

  router.get("/admin/dashboard", requireUser, requireRole("admin"), payment.expireStaleReservations, admin.dashboard);
  router.patch("/admin/vendors/:vendorId", requireUser, requireRole("admin"), admin.updateVendor);
  router.patch("/admin/orders/:orderId", requireUser, requireRole("admin"), admin.updateOrder);

  return router;
}
