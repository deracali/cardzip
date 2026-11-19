import "dotenv/config";
import { randomUUID } from "node:crypto";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createMongoStore } from "./models/store.js";
import { createApiRouter } from "./routes/api-routes.js";
import { hashPassword } from "./services/auth-service.js";
import { HttpError, normalizeEmail, validatePassword } from "./utils/http.js";

export async function ensureAdmin(store, { email, password }) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !normalizedEmail.includes("@")) throw new Error("ADMIN_EMAIL must be a valid email address.");
  const validPassword = validatePassword(password);
  const passwordHash = await hashPassword(validPassword);
  await store.update((state) => {
    const existing = state.users.find((user) => user.email === normalizedEmail);
    if (existing) {
      if (existing.role !== "admin") throw new Error("ADMIN_EMAIL is already assigned to a client account.");
      existing.passwordHash = passwordHash;
      existing.name = "CreatorHub Administrator";
      return;
    }
    state.users.push({
      id: `admin_${randomUUID()}`,
      name: "CreatorHub Administrator",
      email: normalizedEmail,
      handle: null,
      role: "admin",
      passwordHash,
      createdAt: new Date().toISOString(),
    });
  });
}

export function createApp({ store, secret, corsOrigins = [] }) {
  if (!store) throw new Error("A data store must be configured before creating the Portfolio API.");
  if (typeof secret !== "string" || secret.length < 32) throw new Error("JWT_SECRET must be at least 32 characters.");
  const allowedOrigins = new Set(corsOrigins);
  const app = express();
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    res.set({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    });
    const origin = req.get("origin");
    if (origin && allowedOrigins.has(origin)) {
      res.set("Access-Control-Allow-Origin", origin);
      res.set("Access-Control-Allow-Credentials", "true");
      res.set("Vary", "Origin");
    } else if (origin) {
      return next(new HttpError(403, "This origin is not allowed to access the Portfolio API."));
    }
    if (req.method === "OPTIONS") {
      res.set("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
      res.set("Access-Control-Allow-Headers", "Authorization,Content-Type");
      return res.sendStatus(204);
    }
    return next();
  });
  app.use(express.json({ limit: "32kb" }));
  app.use("/api", createApiRouter({ store, secret }));
  app.use((error, _req, res, _next) => {
    const status = Number.isInteger(error.status) ? error.status : 500;
    if (status >= 500) console.error("Portfolio API error:", error);
    res.status(status).json({ error: status >= 500 ? "The server could not complete the request." : error.message });
  });
  return app;
}

async function start() {
  const port = Number(process.env.PORT || 5700);
  const secret = process.env.JWT_SECRET;
  const databaseName = process.env.MONGODB_DATABASE || "creatorhub_portfolio";
  const corsOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173,http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const store = createMongoStore(process.env.MONGODB_URI, { databaseName });
  await store.connect();
  await ensureAdmin(store, { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
  const app = createApp({ store, secret, corsOrigins });
  const server = app.listen(port, () => console.log(`CreatorHub Portfolio API listening on http://localhost:${port}`));
  const shutdown = async () => {
    server.close(async () => {
      await store.close();
      process.exit(0);
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  start().catch((error) => {
    console.error("Could not start the CreatorHub Portfolio API:", error);
    process.exitCode = 1;
  });
}
