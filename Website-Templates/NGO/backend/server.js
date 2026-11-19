import "dotenv/config";
import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { createMongoStore, createStore } from "./models/store.js";
import { createApiRouter } from "./routes/api-routes.js";

const serverPath = fileURLToPath(import.meta.url);

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
      res.set("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
    } else if (origin) {
      return res.status(403).json({ error: "This website is not allowed to access the Kindred API." });
    }
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });
  app.use(express.json({ limit: "50kb" }));
  app.use("/api", createApiRouter({ store, secret, env }));
  app.use((req, res) => res.status(404).json({ error: "API endpoint not found." }));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error instanceof SyntaxError && "body" in error) return res.status(400).json({ error: "Request body must be valid JSON." });
    if (error.status) return res.status(error.status).json({ error: error.message });
    console.error("Kindred API request failed:", error);
    res.status(500).json({ error: "The Kindred API could not complete the request." });
  });
  return app;
}

if (process.argv[1] && path.resolve(process.argv[1]) === serverPath) {
  const app = createApp();
  const port = Number(process.env.PORT || 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("PORT must be a valid port number.");
  try {
    await app.locals.store.connect?.();
  } catch (error) {
    console.error("Kindred API could not connect to MongoDB.");
    console.error(error instanceof Error ? error.message : error);
    await app.locals.store.close?.();
    process.exitCode = 1;
  }
  if (process.exitCode !== 1) {
    const server = createServer(app).listen(port, () => {
      console.log(`Kindred API listening on http://localhost:${port}`);
    });
    const shutdown = async () => {
      await new Promise((resolve) => server.close(resolve));
      await app.locals.store.close?.();
    };
    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
  }
}
