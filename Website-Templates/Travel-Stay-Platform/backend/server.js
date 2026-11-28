import "dotenv/config";
import { configureMongoDns } from "./utils/mongodb-dns.js";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

configureMongoDns(process.env);
const [{ createMongoStore }, { createPaymentService }, { createApiRouter }] = await Promise.all([
  import("./models/store.js"),
  import("./services/payment-service.js"),
  import("./routes/api-routes.js"),
]);

export function createApp(options = {}) {
  const env = options.env || process.env;
  configureMongoDns(env);
  const production = (env.NODE_ENV || "development") === "production";
  if (production && (!env.JWT_SECRET || env.JWT_SECRET.length < 32)) {
    throw new Error("JWT_SECRET must be set to at least 32 characters in production.");
  }
  const secret = options.jwtSecret || env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET must be set before starting the API.");
  const store = options.store || createMongoStore(env.MONGODB_URI);
  const payments = createPaymentService(env, options.fetchImpl || fetch);
  const allowedOrigins = new Set((env.ALLOWED_ORIGINS || "http://localhost:5173,http://localhost:3000")
    .split(",").map((origin) => origin.trim()).filter(Boolean));
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", production ? 1 : false);
  app.locals.store = store;
  app.locals.payments = payments;

  app.use((req, res, next) => {
    const origin = req.get("origin");
    if (origin && allowedOrigins.has(origin)) {
      res.set("Access-Control-Allow-Origin", origin);
      res.set("Vary", "Origin");
      res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
      res.set("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
    } else if (origin) {
      return res.status(403).json({ error: "This website is not allowed to access the Escapes API." });
    }
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });
  const router = createApiRouter({ store, secret, env, payments, allowedOrigins });
  app.post("/api/webhooks/stripe", express.raw({ type: "application/json", limit: "100kb" }),
    (req, res, next) => router.webhooks.stripe(req, res).catch(next));
  app.post("/api/webhooks/paystack", express.raw({ type: "application/json", limit: "100kb" }),
    (req, res, next) => router.webhooks.paystack(req, res).catch(next));
  app.use(express.json({ limit: "100kb" }));
  app.use("/api", router);

  app.use((req, res) => res.status(404).json({ error: "API endpoint not found." }));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error instanceof SyntaxError && "body" in error) return res.status(400).json({ error: "Request body must be valid JSON." });
    if (error.status) return res.status(error.status).json({ error: error.message });
    console.error("Escapes API request failed:", error);
    res.status(500).json({ error: "The Escapes API could not complete the request." });
  });
  return app;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const app = createApp();
  const port = Number(process.env.PORT || 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("PORT must be a valid port number.");
  let ready = false;
  try {
    await app.locals.store.connect?.();
    ready = true;
  } catch (error) {
    console.error("Escapes API could not connect to MongoDB.");
    console.error(error instanceof Error ? error.message : error);
    await app.locals.store.close?.();
    process.exitCode = 1;
  }
  if (ready) {
    const server = createServer(app).listen(port, () => console.log(`Escapes API listening on http://localhost:${port}`));
    const shutdown = async () => {
      await new Promise((resolve) => server.close(resolve));
      await app.locals.store.close?.();
    };
    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
  }
}
