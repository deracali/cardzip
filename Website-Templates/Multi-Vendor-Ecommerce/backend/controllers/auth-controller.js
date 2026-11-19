import { hashPassword, signToken, verifyPassword } from "../services/auth-service.js";
import { HttpError, normalizedEmail, safeUser, validatePassword, requiredText } from "../utils/http.js";
import { newId } from "../models/store.js";

export function createAuthController({ store, secret }) {
  return {
    signup: async (req, res) => {
      const name = requiredText(req.body.name, "Name", 120, 2);
      const email = normalizedEmail(req.body.email);
      validatePassword(req.body.password);
      const role = req.body.role || "client";
      if (!["client", "vendor"].includes(role)) throw new HttpError(400, "Choose a customer or seller account.");
      const passwordHash = await hashPassword(req.body.password);
      const user = await store.update((state) => {
        if (state.users.some((item) => item.email === email)) throw new HttpError(409, "An account with that email already exists.");
        const created = {
          id: newId(role),
          name,
          email,
          role,
          ...(role === "vendor" ? { vendorStatus: "pending" } : {}),
          passwordHash,
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
      const passwordMatches = user
        ? await verifyPassword(req.body.password, user.passwordHash)
        : await verifyPassword(req.body.password, await hashPassword("invalid-password-placeholder"));
      if (!passwordMatches || !user) throw new HttpError(401, "Email or password is incorrect.");
      if (req.body.expectedRole && user.role !== req.body.expectedRole) throw new HttpError(403, "This account cannot access that portal.");
      res.json({ token: signToken(user, secret), user: safeUser(user) });
    },

    me: (req, res) => res.json({ user: req.user }),
    logout: (req, res) => res.json({ message: "Signed out." }),
  };
}
