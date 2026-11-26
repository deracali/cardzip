import "dotenv/config";
import { setServers } from "node:dns";
import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { createApiRouter } from "./routes/api-routes.js";
import { createPaystackService } from "./services/paystack-service.js";
import { hashPassword } from "./services/auth-service.js";
import { createMongoStore, newId } from "./models/store.js";
import { HttpError, normalizedEmail } from "./utils/http.js";

const currentFile = fileURLToPath(import.meta.url);

export function createApp(options = {}) {
  const env = options.env || process.env;
  const production = (env.NODE_ENV || "development") === "production";
  if (production && (!env.JWT_SECRET || env.JWT_SECRET.length < 32)) {
    throw new Error("JWT_SECRET must be set to at least 32 characters in production.");
  }
  const secret = options.jwtSecret || env.JWT_SECRET || randomBytes(32).toString("hex");
  const paystack = options.paystack || createPaystackService({
    secretKey: env.PAYSTACK_SECRET_KEY,
    currency: env.PAYSTACK_CURRENCY || "USD",
    callbackUrl: env.PAYSTACK_CALLBACK_URL || "http://localhost:3000/payment/return",
    production,
  });
  const store = options.store || createMongoStore(env.MONGODB_URI);
  const allowedOrigins = new Set(
    (env.ALLOWED_ORIGINS || "http://localhost:5173,http://localhost:3000")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
  const app = express();
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    const origin = req.get("origin");
    if (origin && allowedOrigins.has(origin)) {
      res.set("Access-Control-Allow-Origin", origin);
      res.set("Vary", "Origin");
      res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
      res.set("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
    } else if (origin) {
      return res.status(403).json({ error: "This website is not allowed to access the FixFlow API." });
    }
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });
  app.use(express.json({
    limit: "100kb",
    verify: (req, _res, buffer) => { req.rawBody = Buffer.from(buffer); },
  }));
  app.use("/api", createApiRouter({ store, secret, paystack }));
  app.use((_req, res) => res.status(404).json({ error: "API endpoint not found." }));
  app.use((error, _req, res, next) => {
    if (res.headersSent) return next(error);
    if (error instanceof SyntaxError && "body" in error) {
      return res.status(400).json({ error: "Request body must be valid JSON." });
    }
    if (error instanceof HttpError) return res.status(error.status).json({ error: error.message });
    console.error("FixFlow API request failed:", error);
    return res.status(500).json({ error: "The FixFlow API could not complete the request." });
  });
  return app;
}

async function seedAdmin(store, env) {
  const email = normalizedEmail(env.ADMIN_EMAIL);
  const password = env.ADMIN_PASSWORD;
  if (typeof password !== "string" || password.length < 12 || password.length > 128) {
    throw new Error("ADMIN_PASSWORD must be between 12 and 128 characters.");
  }
  const seeded = await store.update(async (state) => {
    if (state.users.some((user) => user.role === "admin")) return false;
    if (state.users.some((user) => user.email === email)) {
      throw new Error("ADMIN_EMAIL is already registered as a client.");
    }
    state.users.push({
      id: newId("user"),
      name: "FixFlow Administrator",
      email,
      phone: "",
      role: "admin",
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
    });
    return true;
  });
  if (seeded) console.log(`Seeded FixFlow administrator: ${email}`);
}

async function start() {
  const env = process.env;
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be set to at least 32 characters.");
  }
  const port = Number(env.PORT || 5200);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("PORT must be a valid port number.");
  if (env.MONGODB_URI?.startsWith("mongodb+srv://")) {
    const dnsServers = (env.MONGODB_DNS_SERVERS || "1.1.1.1,1.0.0.1,8.8.8.8")
      .split(",")
      .map((server) => server.trim())
      .filter(Boolean);
    if (!dnsServers.length) throw new Error("MONGODB_DNS_SERVERS must contain at least one DNS server.");
    setServers(dnsServers);
  }
  const store = createMongoStore(env.MONGODB_URI);
  try {
    await store.connect();
    await seedAdmin(store, env);
  } catch (error) {
    console.error("FixFlow API could not initialize MongoDB or the admin account.");
    console.error(error instanceof Error ? error.message : error);
    await store.close();
    process.exitCode = 1;
    return;
  }
  const app = createApp({ env, store });
  const server = createServer(app).listen(port, () => {
    console.log(`FixFlow API listening on http://localhost:${port}`);
  });
  const shutdown = async () => {
    await new Promise((resolve) => server.close(resolve));
    await store.close();
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  start().catch((error) => {
    console.error("Unable to start FixFlow API:", error.message);
    process.exitCode = 1;
  });
}
