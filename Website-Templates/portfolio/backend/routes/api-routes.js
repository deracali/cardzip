import { Router } from "express";
import { randomUUID } from "node:crypto";
import { requireAuth } from "../middleware/auth-middleware.js";
import { hashPassword, signToken, verifyPassword } from "../services/auth-service.js";
import { createRateLimiter, HttpError, normalizeEmail, requiredText, safeUser, validatePassword } from "../utils/http.js";

const reviewStatuses = new Set(["requested", "confirmed", "declined", "completed"]);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const handlePattern = /^[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?$/;

function normalizeHandle(value) {
  const handle = requiredText(value, "Creator handle", { min: 2, max: 32 }).toLowerCase();
  if (!handlePattern.test(handle)) {
    throw new HttpError(400, "Use 2–32 letters, numbers, or internal hyphens for your creator handle.");
  }
  return handle;
}

function createSession(user, secret) {
  return { token: signToken(user.id, secret), user: safeUser(user) };
}

export function createApiRouter({ store, secret }) {
  const router = Router();
  const auth = requireAuth({ store, secret });
  const clientAuth = requireAuth({ store, secret, role: "client" });
  const adminAuth = requireAuth({ store, secret, role: "admin" });
  const authLimit = createRateLimiter({ limit: 12, windowMs: 15 * 60 * 1000 });

  router.get("/health", (_req, res) => res.json({ status: "ok", service: "creatorhub-portfolio-api" }));

  router.post("/auth/signup", authLimit, async (req, res) => {
    const name = requiredText(req.body?.name, "Name", { min: 2, max: 100 });
    const email = normalizeEmail(req.body?.email);
    if (!emailPattern.test(email)) throw new HttpError(400, "Enter a valid email address.");
    const handle = normalizeHandle(req.body?.handle);
    const password = validatePassword(req.body?.password);
    const passwordHash = await hashPassword(password);
    const user = {
      id: randomUUID(),
      name,
      email,
      handle,
      role: "client",
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    await store.update((state) => {
      if (state.users.some((item) => item.email === email)) throw new HttpError(409, "An account with this email already exists.");
      if (state.users.some((item) => item.handle === handle)) throw new HttpError(409, "That creator handle is already taken.");
      state.users.push(user);
    });
    res.status(201).json(createSession(user, secret));
  });

  router.post("/auth/login", authLimit, async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const password = validatePassword(req.body?.password);
    const requestedRole = req.body?.role === "admin" ? "admin" : "client";
    const state = await store.read();
    const user = state.users.find((item) => item.email === email && item.role === requestedRole);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new HttpError(401, "Email or password is incorrect.");
    }
    res.json(createSession(user, secret));
  });

  router.get("/auth/me", auth, (req, res) => res.json({ user: req.user }));

  router.get("/client/dashboard", clientAuth, async (req, res) => {
    const state = await store.read();
    const reviewRequests = state.reviewRequests
      .filter((item) => item.clientId === req.user.id)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
    res.json({ user: req.user, reviewRequests });
  });

  router.post("/client/review-requests", clientAuth, async (req, res) => {
    const goal = requiredText(req.body?.goal, "Review goals", { min: 10, max: 2000 });
    let portfolioUrl = "";
    if (req.body?.portfolioUrl) {
      portfolioUrl = requiredText(req.body.portfolioUrl, "Portfolio URL", { max: 500 });
      let parsedUrl;
      try {
        parsedUrl = new URL(portfolioUrl);
      } catch {
        throw new HttpError(400, "Enter a valid portfolio URL.");
      }
      if (!["http:", "https:"].includes(parsedUrl.protocol)) throw new HttpError(400, "Portfolio URL must use HTTPS or HTTP.");
    }
    const reviewRequest = {
      id: randomUUID(),
      clientId: req.user.id,
      clientName: req.user.name,
      clientEmail: req.user.email,
      goal,
      portfolioUrl,
      status: "requested",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await store.update((state) => state.reviewRequests.push(reviewRequest));
    res.status(201).json({ reviewRequest });
  });

  router.get("/admin/dashboard", adminAuth, async (_req, res) => {
    const state = await store.read();
    const clients = state.users.filter((item) => item.role === "client");
    const reviewRequests = state.reviewRequests
      .slice()
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
    res.json({
      stats: {
        clients: clients.length,
        totalRequests: reviewRequests.length,
        requested: reviewRequests.filter((item) => item.status === "requested").length,
      },
      clients: clients.map(safeUser),
      reviewRequests,
    });
  });

  router.patch("/admin/review-requests/:id", adminAuth, async (req, res) => {
    const status = req.body?.status;
    if (!reviewStatuses.has(status) || status === "requested") {
      throw new HttpError(400, "Choose confirmed, declined, or completed.");
    }
    let updatedRequest;
    await store.update((state) => {
      const reviewRequest = state.reviewRequests.find((item) => item.id === req.params.id);
      if (!reviewRequest) throw new HttpError(404, "Review request not found.");
      reviewRequest.status = status;
      reviewRequest.updatedAt = new Date().toISOString();
      updatedRequest = reviewRequest;
    });
    res.json({ reviewRequest: updatedRequest });
  });

  return router;
}
