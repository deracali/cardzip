import "dotenv/config";
import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import nodemailer from "nodemailer";
import { createMongoStore, createStore } from "./models/store.js";
import { createApiRouter } from "./routes/api-routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createMailer(env) {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD) return null;
  const port = Number(env.SMTP_PORT || 587);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("SMTP_PORT must be a valid port number.");
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port,
    secure: env.SMTP_SECURE === "true",
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
  });
}

export function createApp(options = {}) {
  const env = options.env || process.env;
  const production = (env.NODE_ENV || "development") === "production";
  if (production && (!env.JWT_SECRET || env.JWT_SECRET.length < 32)) {
    throw new Error("JWT_SECRET must be set to at least 32 characters in production.");
  }
  const secret = options.jwtSecret || env.JWT_SECRET || randomBytes(32).toString("hex");
  const store = options.store || (options.dataFile
    ? createStore(options.dataFile)
    : createMongoStore(env.MONGODB_URI, {
      dnsServers: env.MONGODB_DNS_SERVERS
        ? env.MONGODB_DNS_SERVERS.split(",").map((server) => server.trim()).filter(Boolean)
        : undefined,
    }));
  const mailer = options.mailer ?? createMailer(env);
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
      res.set("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, OPTIONS");
    } else if (origin) {
      return res.status(403).json({ error: "This website is not allowed to access the agency API." });
    }
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });
  app.use(express.json({ limit: "100kb" }));
  app.use("/api", createApiRouter({ store, secret, env, mailer, production }));

  app.use((req, res) => res.status(404).json({ error: "API endpoint not found." }));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error instanceof SyntaxError && "body" in error) return res.status(400).json({ error: "Request body must be valid JSON." });
    if (error.status) return res.status(error.status).json({ error: error.message });
    console.error("Agency API request failed:", error);
    res.status(500).json({ error: "The agency API could not complete the request." });
  });

  return app;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const app = createApp();
  const port = Number(process.env.PORT || 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("PORT must be a valid port number.");
  let databaseReady = false;
  try {
    await app.locals.store.connect?.();
    databaseReady = true;
  } catch (error) {
    console.error("NOVA Studio API could not connect to MongoDB.");
    console.error(error instanceof Error ? error.message : error);
    await app.locals.store.close?.();
    process.exitCode = 1;
  }
  if (databaseReady) {
    const server = createServer(app).listen(port, () => {
      console.log(`NOVA Studio API listening on http://localhost:${port}`);
    });
    const shutdown = async () => {
      await new Promise((resolve) => server.close(resolve));
      await app.locals.store.close?.();
    };
    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
  }
}
