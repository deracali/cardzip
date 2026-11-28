import { verifyToken } from "../auth.js";
import { httpError } from "../utils/http.js";

export function createAuthMiddleware(store, jwtSecret) {
  const authenticate = async (request, _response, next) => {
    const authorization = request.get("authorization") || "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    if (!token) return next(httpError(401, "Sign in to continue."));

    let identity;
    try {
      identity = verifyToken(token, jwtSecret);
    } catch {
      return next(httpError(401, "Invalid or expired access token."));
    }

    let user;
    try {
      user = await store.findUserById(identity.id);
    } catch (error) {
      return next(error);
    }
    if (!user || user.role !== identity.role || user.status === "suspended") {
      return next(httpError(401, "Your session is no longer valid. Sign in again."));
    }
    request.user = user;
    next();
  };

  const requireRoles = (...roles) => (request, _response, next) => {
    if (!roles.includes(request.user.role)) {
      return next(httpError(403, "Your account does not have permission to access this resource."));
    }
    next();
  };

  return { authenticate, requireRoles };
}
