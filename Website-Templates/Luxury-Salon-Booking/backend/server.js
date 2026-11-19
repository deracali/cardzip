import "dotenv/config";
import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { createApiRouter } from "./routes/api-routes.js";
import { createMongoStore } from "./models/store.js";
import { hashPassword } from "./services/auth-service.js";

const currentFile = fileURLToPath(import.meta.url);

export async function seedAdmin(store, env = process.env) {
  const email = typeof env.ADMIN_EMAIL === "string" ? env.ADMIN_EMAIL.trim().toLowerCase() : "";
  const password = typeof env.ADMIN_PASSWORD === "string" ? env.ADMIN_PASSWORD : "";
  if (!email || password.length < 12) {
    throw new Error("Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters.");
  }
  const existing = await store.findUserByEmail(email);
  if (existing) {
    if (existing.role !== "admin") throw new Error("ADMIN_EMAIL belongs to a non-admin user.");
    return;
  }
  await store.createUser({
    id: randomBytes(16).toString("hex"),
    name: "Lumière Administrator",
    email,
    passwordHash: await hashPassword(password),
    role: "admin",
    createdAt: new Date().toISOString(),
  });
}

export function createApp(options = {}) {
  const env = options.env || process.env;
  const production = (env.NODE_ENV || "development") === "production";
  if (production && (!env.JWT_SECRET || env.JWT_SECRET.length < 32)) {
    throw new Error("JWT_SECRET must be set to at least 32 characters in production.");
  }
  const secret = options.secret || env.JWT_SECRET || randomBytes(32).toString("hex");
  const store = options.store || createMongoStore(env.MONGODB_URI, env.MONGODB_DB_NAME || "lumiere_salon");
  const allowedOrigins = new Set((env.ALLOWED_ORIGINS || "http://localhost:5173,http://localhost:3000")
    .split(",").map((origin) => origin.trim()).filter(Boolean));
  const app = express();
  app.disable("x-powered-by");
  app.locals.store = store;
  app.use((req, res, next) => {
    const origin = req.get("origin");
    if (origin && !allowedOrigins.has(origin)) return res.status(403).json({ error: "This website is not allowed to access the Lumière API." });
    if (origin) {
      res.set("Access-Control-Allow-Origin", origin);
      res.set("Vary", "Origin");
      res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
      res.set("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
    }
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });
  app.use(express.json({ limit: "50kb" }));
  app.use("/api", createApiRouter({ store, secret }));
  app.use((req, res) => res.status(404).json({ error: "API endpoint not found." }));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error instanceof SyntaxError && "body" in error) return res.status(400).json({ error: "Request body must be valid JSON." });
    if (error.status) return res.status(error.status).json({ error: error.message });
    console.error("Lumière API request failed:", error);
    res.status(500).json({ error: "The Lumière API could not complete the request." });
  });
  return app;
}

if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  const app = createApp();
  const store = app.locals.store;
  const port = Number(process.env.PORT || 5600);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("PORT must be a valid port number.");
  try {
    await store.connect();
    await seedAdmin(store);
    const server = createServer(app).listen(port, () => {
      console.log(`Lumière Salon API listening on http://localhost:${port}`);
    });
    const shutdown = async () => {
      await new Promise((resolve) => server.close(resolve));
      await store.close();
    };
    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
  } catch (error) {
    console.error("Lumière Salon API could not start.");
    console.error(error instanceof Error ? error.message : error);
    await store.close?.();
    process.exitCode = 1;
  }
}
