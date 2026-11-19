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

  const requireRole = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) throw new HttpError(403, "Your account cannot access this portal.");
    next();
  };

  const requireApprovedVendor = (req, res, next) => {
    if (req.user.vendorStatus !== "approved") throw new HttpError(403, "Your shop must be approved before you can manage products.");
    next();
  };

  return { requireUser, requireRole, requireApprovedVendor };
}
