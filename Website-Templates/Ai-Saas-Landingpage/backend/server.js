import { createHmac } from "node:crypto";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createMemoryStore } from "./models/memory-store.js";
import { connectMongoStore } from "./models/mongo-store.js";
import { createApiRouter } from "./routes/api.js";

try {
  process.loadEnvFile();
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const MAX_BODY_BYTES = 64 * 1024;
const json = (response, status, payload) => {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify(payload));
};

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw Object.assign(new Error("Request body is too large."), { status: 413 });
    chunks.push(chunk);
  }
  if (!size) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw Object.assign(new Error("Request body must be valid JSON."), { status: 400 });
  }
}

export function createAppServer({
  port = Number(process.env.PORT || 5001),
  origins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(",").map((origin) => origin.trim()).filter(Boolean),
  adminEmail = process.env.ADMIN_EMAIL,
  adminPassword = process.env.ADMIN_PASSWORD,
  authSecret = process.env.AUTH_SECRET,
  mongoUri = process.env.MONGODB_URI,
  databaseName = process.env.MONGODB_DB_NAME || "nexara",
  host = process.env.HOST || "localhost",
  store: suppliedStore,
} = {}) {
  if (!adminEmail || !adminPassword || adminPassword.length < 12) throw new Error("Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters.");
  if (!authSecret || authSecret.length < 32) throw new Error("Set AUTH_SECRET to a random value of at least 32 characters.");

  const normalizedAdminEmail = adminEmail.trim().toLowerCase();
  const adminPasswordHash = createHmac("sha256", authSecret).update(adminPassword).digest();
  const database = suppliedStore ? Promise.resolve({ store: suppliedStore, close: async () => {} }) : connectMongoStore(mongoUri, databaseName);
  const ready = database.then(({ store }) => createApiRouter({ store, authSecret, adminEmail: normalizedAdminEmail, adminPasswordHash }));

  const server = createServer(async (request, response) => {
    const origin = request.headers.origin;
    if (origin && !origins.includes(origin)) {
      json(response, 403, { error: "Origin is not allowed." });
      return;
    }
    if (origin) {
      response.setHeader("Access-Control-Allow-Origin", origin);
      response.setHeader("Vary", "Origin");
      response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
      response.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    }
    if (request.method === "OPTIONS") {
      response.writeHead(204);
      response.end();
      return;
    }

    try {
      const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
      if (!url.pathname.startsWith("/api/")) {
        json(response, 404, { error: "Route not found." });
        return;
      }
      const body = request.method === "GET" ? {} : await readJson(request);
      const router = await ready;
      const result = await router(request, body, url);
      if (!result) {
        json(response, 404, { error: "Route not found." });
        return;
      }
      json(response, result.status, result.body);
    } catch (error) {
      if (response.headersSent) {
        response.destroy(error);
        return;
      }
      const status = Number(error.status) || 500;
      if (status >= 500) console.error("API request failed:", error);
      json(response, status, { error: status >= 500 ? "The server could not complete the request." : error.message });
    }
  });

  return {
    server, host, port, ready,
    close: async () => {
      if (server.listening) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
      const connection = await database;
      await connection.close();
    },
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const app = createAppServer();
  await app.ready;
  app.server.listen(app.port, app.host, () => console.log(`Nexara API listening on http://${app.host}:${app.port}`));
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, async () => {
      await app.close();
      process.exit(0);
    });
  }
}
