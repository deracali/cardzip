import "dotenv/config";
import { pathToFileURL } from "node:url";
import { createApp } from "./src/app.js";
import { hashPassword } from "./src/auth.js";
import { createMongoStore } from "./src/models/store.js";

export async function startServer() {
  const {
    PORT = "5000",
    MONGODB_URI,
    MONGODB_DB = "remote_talent_hub",
    JWT_SECRET,
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    CORS_ORIGINS = "http://localhost:5173,http://localhost:3000",
  } = process.env;

  if (!MONGODB_URI) throw new Error("MONGODB_URI is required.");
  if (!JWT_SECRET || JWT_SECRET.length < 32) throw new Error("JWT_SECRET must be at least 32 characters.");
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
    throw new Error("Set ADMIN_EMAIL and an ADMIN_PASSWORD with at least 12 characters.");
  }

  const store = await createMongoStore(MONGODB_URI, MONGODB_DB);
  const email = ADMIN_EMAIL.trim().toLowerCase();
  if (!(await store.findUserByEmail(email))) {
    await store.insertUser({
      name: "Remote.ly Administrator",
      email,
      passwordHash: await hashPassword(ADMIN_PASSWORD),
      role: "admin",
      primaryRole: "",
      createdAt: new Date().toISOString(),
    });
  }

  const app = createApp({
    store,
    jwtSecret: JWT_SECRET,
    corsOrigins: CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean),
  });
  const server = app.listen(Number(PORT), () => {
    console.log(`Remote Talent Hub API listening on port ${PORT}`);
  });

  const shutdown = () => {
    server.close(async () => {
      await store.client.close();
      process.exit(0);
    });
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
  return { server, store };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer().catch((error) => {
    console.error("Remote Talent Hub API failed to start:", error);
    process.exitCode = 1;
  });
}
