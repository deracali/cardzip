import { HttpError, safeUser } from "../utils/http.js";
import { verifyToken } from "../services/auth-service.js";

export function createAuthMiddleware(store, secret) {
  const requireUser = async (req, res, next) => {
    const authorization = req.get("authorization") || "";
    if (!authorization.startsWith("Bearer ")) throw new HttpError(401, "Please sign in to continue.");
    const claims = verifyToken(authorization.slice(7), secret);
    const user = await store.findUserById(claims.sub);
    if (!user) throw new HttpError(401, "Your account is no longer available.");
    req.user = safeUser(user);
    next();
  };

  const requireRole = (role, message) => (req, res, next) => {
    if (req.user.role !== role) throw new HttpError(403, message);
    next();
  };

  const requireAdmin = requireRole("admin", "Admin access is required.");
  const requireClient = requireRole("client", "Client account access is required.");
  return { requireUser, requireAdmin, requireClient, admin: [requireUser, requireAdmin], client: [requireUser, requireClient] };
}
