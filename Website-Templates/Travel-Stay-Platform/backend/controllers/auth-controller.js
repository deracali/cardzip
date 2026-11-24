import { hashPassword, safeUser, signToken, verifyPassword } from "../services/auth-service.js";
import { newId } from "../models/store.js";
import { HttpError, normalizedEmail, requiredText, safeCompareText, validatePassword } from "../utils/http.js";

export function createAuthController(store, { secret, env }) {
  return {
    signup: async (req, res) => {
      const name = requiredText(req.body.name, "Name", 120);
      const email = normalizedEmail(req.body.email);
      validatePassword(req.body.password);
      const user = await store.update(async (state) => {
        if (state.users.some((item) => item.email === email)) throw new HttpError(409, "An account with that email already exists.");
        const created = {
          id: newId("user"),
          name,
          email,
          role: "client",
          passwordHash: await hashPassword(req.body.password),
          createdAt: new Date().toISOString(),
        };
        state.users.push(created);
        return created;
      });
      res.status(201).json({ token: signToken(user, secret), user: safeUser(user) });
    },

    adminSignup: async (req, res) => {
      const inviteCode = requiredText(req.body.inviteCode, "Administrator invitation code", 256);
      const expectedCode = env.ADMIN_SIGNUP_CODE || (env.NODE_ENV === "development" ? "ESCAPES-LOCAL-ADMIN" : "");
      if (!expectedCode || !safeCompareText(inviteCode, expectedCode)) {
        throw new HttpError(403, "The administrator invitation code is invalid or not configured.");
      }
      const name = requiredText(req.body.name, "Name", 120);
      const email = normalizedEmail(req.body.email);
      validatePassword(req.body.password);
      const user = await store.update(async (state) => {
        if (state.users.some((item) => item.role === "admin")) {
          throw new HttpError(409, "An administrator account has already been created.");
        }
        if (state.users.some((item) => item.email === email)) throw new HttpError(409, "An account with that email already exists.");
        const created = {
          id: newId("user"),
          name,
          email,
          role: "admin",
          passwordHash: await hashPassword(req.body.password),
          createdAt: new Date().toISOString(),
        };
        state.users.push(created);
        return created;
      });
      res.status(201).json({ token: signToken(user, secret), user: safeUser(user) });
    },

    login: async (req, res) => {
      const email = normalizedEmail(req.body.email);
      if (typeof req.body.password !== "string") throw new HttpError(400, "Password is required.");
      const state = await store.read();
      const user = state.users.find((item) => item.email === email);
      const matches = user
        ? await verifyPassword(req.body.password, user.passwordHash)
        : await verifyPassword(req.body.password, await hashPassword("invalid-password-placeholder"));
      if (!matches || !user) throw new HttpError(401, "Email or password is incorrect.");
      if (req.body.expectedRole && user.role !== req.body.expectedRole) throw new HttpError(403, "This account cannot access that portal.");
      res.json({ token: signToken(user, secret), user: safeUser(user) });
    },

    me: (req, res) => res.json({ user: req.user }),
  };
}
