import { hashPassword, signToken, verifyPassword } from "../services/auth-service.js";
import { HttpError, normalizedEmail, optionalText, requiredText, safeUser, validatePassword } from "../utils/http.js";
import { newId } from "../models/store.js";

export function createAuthController({ store, secret }) {
  return {
    signup: async (req, res) => {
      const name = requiredText(req.body?.name, "Name", 120);
      const email = normalizedEmail(req.body?.email);
      const phone = optionalText(req.body?.phone, "Phone number", 40);
      const password = req.body?.password;
      validatePassword(password);
      const user = await store.update(async (state) => {
        if (state.users.some((item) => item.email === email)) {
          throw new HttpError(409, "An account with that email already exists.");
        }
        const created = {
          id: newId("user"),
          name,
          email,
          phone,
          role: "client",
          passwordHash: await hashPassword(password),
          createdAt: new Date().toISOString(),
        };
        state.users.push(created);
        return created;
      });
      res.status(201).json({ token: signToken(user, secret), user: safeUser(user) });
    },

    login: async (req, res) => {
      const email = normalizedEmail(req.body?.email);
      const password = req.body?.password;
      if (typeof password !== "string") throw new HttpError(400, "Password is required.");
      const expectedRole = req.body?.expectedRole;
      if (expectedRole !== undefined && !["admin", "client"].includes(expectedRole)) {
        throw new HttpError(400, "Choose a valid account type.");
      }
      const state = await store.read();
      const user = state.users.find((item) => item.email === email);
      const matches = user
        ? await verifyPassword(password, user.passwordHash)
        : await verifyPassword(password, await hashPassword("invalid-password-placeholder"));
      if (!matches || !user) throw new HttpError(401, "Email or password is incorrect.");
      if (expectedRole && user.role !== expectedRole) throw new HttpError(403, "This account cannot access that portal.");
      res.json({ token: signToken(user, secret), user: safeUser(user) });
    },

    me: (req, res) => res.json({ user: req.user }),
    logout: (_req, res) => res.json({ message: "Signed out." }),
  };
}
