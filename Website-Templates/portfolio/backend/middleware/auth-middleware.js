import { verifyToken } from "../services/auth-service.js";
import { HttpError, safeUser } from "../utils/http.js";

export function requireAuth({ store, secret, role }) {
  return async (req, _res, next) => {
    try {
      const header = req.get("authorization") || "";
      const [scheme, token] = header.split(" ");
      if (scheme !== "Bearer" || !token) throw new HttpError(401, "Please sign in to continue.");
      const payload = verifyToken(token, secret);
      const state = await store.read();
      const user = state.users.find((item) => item.id === payload.sub);
      if (!user) throw new HttpError(401, "Your account is no longer available. Please sign in again.");
      if (role && user.role !== role) throw new HttpError(403, "You do not have permission to access this page.");
      req.user = safeUser(user);
      next();
    } catch (error) {
      next(error);
    }
  };
}
