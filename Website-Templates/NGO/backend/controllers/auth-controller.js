import { hashPassword, safeCompareText, signToken, verifyPassword } from "../services/auth-service.js";
import { HttpError, normalizedEmail, safeUser, requiredText, validatePassword } from "../utils/http.js";
import { newId } from "../models/store.js";

export function createAuthController({ store, secret, env }) {
  return {
    signup: async (req, res) => {
      const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
      const name = requiredText(body.name, "Name", 120, 2);
      const email = normalizedEmail(body.email);
      validatePassword(body.password);
      const passwordHash = await hashPassword(body.password);
      const user = await store.update((state) => {
        if (state.users.some((item) => item.email === email)) throw new HttpError(409, "An account with that email already exists.");
        const created = {
          id: newId("client"),
          name,
          email,
          role: "client",
          passwordHash,
          createdAt: new Date().toISOString(),
        };
        state.users.push(created);
        return created;
      });
      res.status(201).json({ token: signToken(user, secret), user: safeUser(user) });
    },

    adminSignup: async (req, res) => {
      const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
      if (!env.ADMIN_SIGNUP_CODE) throw new HttpError(503, "Admin invitations are not configured on the Kindred API.");
      const inviteCode = requiredText(body.inviteCode, "Admin invitation code", 256);
      if (!safeCompareText(inviteCode, env.ADMIN_SIGNUP_CODE)) throw new HttpError(403, "The admin invitation code is invalid.");
      const name = requiredText(body.name, "Name", 120, 2);
      const email = normalizedEmail(body.email);
      validatePassword(body.password);
      const passwordHash = await hashPassword(body.password);
      const user = await store.update((state) => {
        if (state.users.some((item) => item.email === email)) throw new HttpError(409, "An account with that email already exists.");
        const created = { id: newId("admin"), name, email, role: "admin", passwordHash, createdAt: new Date().toISOString() };
        state.users.push(created);
        return created;
      });
      res.status(201).json({ token: signToken(user, secret), user: safeUser(user) });
    },

    login: async (req, res) => {
      const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
      const email = normalizedEmail(body.email);
      if (typeof body.password !== "string") throw new HttpError(400, "Password is required.");
      const state = await store.read();
      const user = state.users.find((item) => item.email === email);
      const matches = user
        ? await verifyPassword(body.password, user.passwordHash)
        : await verifyPassword(body.password, await hashPassword("invalid-password-placeholder"));
      if (!matches || !user) throw new HttpError(401, "Email or password is incorrect.");
      if (body.expectedRole && user.role !== body.expectedRole) {
        throw new HttpError(403, "This account cannot access that portal.");
      }
      res.json({ token: signToken(user, secret), user: safeUser(user) });
    },

    me: (req, res) => res.json({ user: req.user }),
    logout: (req, res) => res.json({ message: "Signed out." }),
  };
}
