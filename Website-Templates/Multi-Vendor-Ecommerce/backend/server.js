import "dotenv/config";
import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { createMongoStore, createStore, newId } from "./models/store.js";
import { hashPassword } from "./services/auth-service.js";
import { createPaymentService } from "./services/payment-service.js";
import { createApiRouter } from "./routes/api-routes.js";
import { normalizedEmail, requiredText, validatePassword } from "./utils/http.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp(options = {}) {
  const env = options.env || process.env;
  const production = (env.NODE_ENV || "development") === "production";
  if (production && (!env.JWT_SECRET || env.JWT_SECRET.length < 32)) {
    throw new Error("JWT_SECRET must be set to at least 32 characters in production.");
  }
  const secret = options.jwtSecret || env.JWT_SECRET || randomBytes(32).toString("hex");
  const store = options.store || (options.dataFile
    ? createStore(options.dataFile)
    : createMongoStore(env.MONGODB_URI));
  const payments = options.paymentService || createPaymentService({ env, fetchImpl: options.fetchImpl });
  const frontendUrl = env.MARKETHUB_FRONTEND_URL || "http://localhost:3000";
  const allowedOrigins = new Set(
    (env.ALLOWED_ORIGINS || "http://localhost:5173,http://localhost:3000")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
  const app = express();
  app.locals.store = store;
  app.disable("x-powered-by");
  app.set("trust proxy", production ? 1 : false);
  app.use((req, res, next) => {
    const origin = req.get("origin");
    if (origin && allowedOrigins.has(origin)) {
      res.set("Access-Control-Allow-Origin", origin);
      res.set("Vary", "Origin");
      res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
      res.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    } else if (origin) {
      return res.status(403).json({ error: "This website is not allowed to access the MarketHub API." });
    }
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });
  app.use(express.json({
    limit: "100kb",
    verify: (req, res, buffer) => { req.rawBody = Buffer.from(buffer); },
  }));
  app.use("/api", createApiRouter({ store, secret, payments, frontendUrl }));
  app.use((req, res) => res.status(404).json({ error: "API endpoint not found." }));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error instanceof SyntaxError && "body" in error) return res.status(400).json({ error: "Request body must be valid JSON." });
    if (error.status) return res.status(error.status).json({ error: error.message });
    console.error("MarketHub API request failed:", error);
    res.status(500).json({ error: "The MarketHub API could not complete the request." });
  });

  app.locals.initialize = async () => {
    await store.connect?.();
    const emailValue = env.ADMIN_EMAIL;
    const password = env.ADMIN_PASSWORD;
    if (!emailValue && !password && !production) return;
    if (!emailValue || !password) throw new Error("Set both ADMIN_EMAIL and ADMIN_PASSWORD to bootstrap the MarketHub admin.");
    const email = normalizedEmail(emailValue);
    requiredText(env.ADMIN_NAME || "MarketHub Admin", "Admin name", 120, 2);
    validatePassword(password);
    const name = (env.ADMIN_NAME || "MarketHub Admin").trim();
    const passwordHash = await hashPassword(password);
    await store.update((state) => {
      const existing = state.users.find((user) => user.email === email);
      if (existing) {
        if (existing.role !== "admin") throw new Error("The configured admin email belongs to a non-admin account; refusing to elevate it.");
        return;
      }
      state.users.push({
        id: newId("admin"),
        name,
        email,
        role: "admin",
        passwordHash,
        createdAt: new Date().toISOString(),
      });
    });
  };

  return app;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const app = createApp();
  const port = Number(process.env.PORT || 5500);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("PORT must be a valid port number.");
  try {
    await app.locals.initialize();
  } catch (error) {
    console.error("MarketHub API could not initialize.");
    console.error(error instanceof Error ? error.message : error);
    await app.locals.store.close?.();
    process.exitCode = 1;
  }
  if (process.exitCode !== 1) {
    const server = createServer(app).listen(port, () => {
      console.log(`MarketHub API listening on http://localhost:${port}`);
    });
    const shutdown = async () => {
      await new Promise((resolve) => server.close(resolve));
      await app.locals.store.close?.();
    };
    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
  }
}
