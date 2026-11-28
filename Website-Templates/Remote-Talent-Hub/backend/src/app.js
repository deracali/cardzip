import cors from "cors";
import express from "express";
import { createApiRoutes } from "./routes/api-routes.js";

export function createApp({ store, jwtSecret, corsOrigins = [], paymentOptions = {} }) {
  if (!store) throw new Error("A data store is required.");
  if (typeof jwtSecret !== "string" || jwtSecret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters.");
  }

  const app = express();
  app.use(cors({
    origin(origin, callback) {
      if (!origin || corsOrigins.includes(origin)) return callback(null, true);
      callback(Object.assign(new Error("This origin is not allowed by the API."), { status: 403 }));
    },
  }));
  app.use(express.json({ limit: "50kb" }));
  app.use("/api", createApiRoutes({ store, jwtSecret, paymentOptions }));
  app.use((_request, _response, next) => {
    next(Object.assign(new Error("API route not found."), { status: 404 }));
  });
  app.use((error, _request, response, _next) => {
    const status = Number.isInteger(error.status) ? error.status : 500;
    if (status >= 500) console.error("Remote Talent Hub API error:", error);
    response.status(status).json({
      message: status >= 500 ? "The API could not complete the request." : error.message,
    });
  });

  return app;
}
