import { Router } from "express";
import { createAdminController } from "../controllers/admin-controller.js";
import { createAuthController } from "../controllers/auth-controller.js";
import { createClientController } from "../controllers/client-controller.js";
import { createPaymentController } from "../controllers/payment-controller.js";
import { createAuthMiddleware } from "../middleware/auth.js";

export function createApiRoutes({ store, jwtSecret, paymentOptions = {} }) {
  const router = Router();
  const auth = createAuthController({ store, jwtSecret });
  const client = createClientController({ store });
  const admin = createAdminController({ store });
  const payment = createPaymentController({ store, ...paymentOptions });
  const { authenticate, requireRoles } = createAuthMiddleware(store, jwtSecret);

  router.get("/health", (_request, response) => response.json({ status: "ok" }));
  router.post("/auth/signup", auth.signup);
  router.post("/auth/login", auth.login);
  router.get("/auth/me", authenticate, auth.me);

  router.get("/public/jobs", client.publicJobs);
  router.get("/public/jobs/:id", client.publicJob);

  router.get("/client/dashboard", authenticate, requireRoles("candidate", "employer"), client.dashboard);
  router.post("/client/applications", authenticate, requireRoles("candidate"), client.createApplication);
  router.patch("/client/applications/:id", authenticate, requireRoles("employer"), client.updateApplication);
  router.post("/client/jobs", authenticate, requireRoles("employer"), client.createJob);
  router.get("/payments/quote", payment.quote);
  router.post("/payments/paystack/initialize", authenticate, requireRoles("employer"), payment.initialize);
  router.get("/payments/paystack/verify", authenticate, requireRoles("employer"), payment.verify);

  router.get("/admin/dashboard", authenticate, requireRoles("admin"), admin.dashboard);
  router.post("/admin/jobs", authenticate, requireRoles("admin"), admin.createJob);
  router.patch("/admin/jobs/:id", authenticate, requireRoles("admin"), admin.updateJob);
  router.patch("/admin/applications/:id", authenticate, requireRoles("admin"), admin.updateApplication);
  router.patch("/admin/users/:id", authenticate, requireRoles("admin"), admin.updateUser);
  return router;
}
