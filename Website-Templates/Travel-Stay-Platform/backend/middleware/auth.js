import { HttpError } from "../utils/http.js";
import { safeUser, verifyToken } from "../services/auth-service.js";

export function createAuthMiddleware(store, secret) {
  const requireUser = async (req, res, next) => {
    const authorization = req.get("authorization") || "";
    if (!authorization.startsWith("Bearer ")) throw new HttpError(401, "Please sign in to continue.");
    const claims = verifyToken(authorization.slice(7), secret);
    if (!claims) throw new HttpError(401, "Your sign-in has expired. Please sign in again.");
    const state = await store.read();
    const user = state.users.find((item) => item.id === claims.sub);
    if (!user || user.role !== claims.role) throw new HttpError(401, "Your account is no longer available.");
    req.user = safeUser(user);
    next();
  };

  const requireClient = (req, res, next) => {
    if (req.user.role !== "client") throw new HttpError(403, "Guest account access is required.");
    next();
  };

  const requireAdmin = (req, res, next) => {
    if (req.user.role !== "admin") throw new HttpError(403, "Administrator access is required.");
    next();
  };

  return { requireUser, requireClient, requireAdmin, client: [requireUser, requireClient], admin: [requireUser, requireAdmin] };
}
