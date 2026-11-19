import { HttpError, safeUser } from "../utils/http.js";
import { verifyToken } from "../services/auth-service.js";

export function createAuthMiddleware(store, secret) {
  const requireUser = async (req, res, next) => {
    const authorization = req.get("authorization") || "";
    if (!authorization.startsWith("Bearer ")) throw new HttpError(401, "Please sign in to continue.");
    const claims = verifyToken(authorization.slice(7), secret);
    const state = await store.read();
    const user = state.users.find((item) => item.id === claims.sub);
    if (!user) throw new HttpError(401, "Your account is no longer available.");
    req.user = safeUser(user);
    next();
  };

  const requireAdmin = (req, res, next) => {
    if (req.user.role !== "admin") throw new HttpError(403, "Admin access is required.");
    next();
  };

  const requireClient = (req, res, next) => {
    if (req.user.role !== "client") throw new HttpError(403, "Client portal access is required.");
    next();
  };

  return { requireUser, requireAdmin, requireClient, admin: [requireUser, requireAdmin] };
}
