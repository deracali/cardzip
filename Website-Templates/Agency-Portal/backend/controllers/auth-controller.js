import { createHmac, randomBytes } from "node:crypto";
import { hashPassword, safeCompareText, signToken, verifyPassword } from "../services/auth-service.js";
import { HttpError, normalizedEmail, safeUser, validatePassword, requiredText } from "../utils/http.js";
import { newId } from "../models/store.js";

export function createAuthController({ store, secret, env, mailer, production }) {
  return {
    signup: async (req, res) => {
      const name = requiredText(req.body.name, "Name", 120);
      const company = requiredText(req.body.company, "Company", 160);
      const email = normalizedEmail(req.body.email);
      validatePassword(req.body.password);
      const user = await store.update(async (state) => {
        if (state.users.some((item) => item.email === email)) throw new HttpError(409, "An account with that email already exists.");
        const created = {
          id: newId("user"),
          name,
          company,
          email,
          role: "client",
          passwordHash: await hashPassword(req.body.password),
          createdAt: new Date().toISOString(),
        };
        state.users.push(created);
        if (!state.clients.some((client) => client.email === email)) {
          state.clients.push({ id: newId("client"), name, company, email, status: "Active", createdAt: created.createdAt });
        }
        return created;
      });
      res.status(201).json({ token: signToken(user, secret), user: safeUser(user) });
    },

    adminSignup: async (req, res) => {
      const inviteCode = typeof req.body.inviteCode === "string" && req.body.inviteCode.trim()
        ? req.body.inviteCode.trim()
        : undefined;
      if (inviteCode) {
        if (!env.ADMIN_SIGNUP_CODE) throw new HttpError(503, "Admin invitations are not configured. Set ADMIN_SIGNUP_CODE on the API server.");
        if (typeof inviteCode !== "string" || !safeCompareText(inviteCode, env.ADMIN_SIGNUP_CODE)) {
          throw new HttpError(403, "The admin invitation code is invalid.");
        }
      }
      const name = requiredText(req.body.name, "Name", 120);
      const company = requiredText(req.body.company, "Studio name", 160);
      const email = normalizedEmail(req.body.email);
      validatePassword(req.body.password);
      const user = await store.update(async (state) => {
        if (!inviteCode && state.users.some((item) => item.role === "admin")) {
          throw new HttpError(403, "An admin invitation code is required to create additional admin accounts.");
        }
        if (state.users.some((item) => item.email === email)) throw new HttpError(409, "An account with that email already exists.");
        const created = {
          id: newId("user"),
          name,
          company,
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

    forgotPassword: async (req, res) => {
      const email = normalizedEmail(req.body.email);
      const token = randomBytes(32).toString("base64url");
      const tokenHash = createHmac("sha256", secret).update(token).digest("hex");
      const expiry = Date.now() + 60 * 60 * 1000;
      const user = await store.update((state) => {
        const found = state.users.find((item) => item.email === email);
        if (!found) return null;
        found.resetTokenHash = tokenHash;
        found.resetExpiresAt = expiry;
        return safeUser(found);
      });
      if (user && mailer) {
        const resetPath = user.role === "admin" ? "/admin/reset-password" : "/reset-password";
        const resetUrl = new URL(resetPath, env.FRONTEND_URL || "http://localhost:3000");
        resetUrl.searchParams.set("token", token);
        await mailer.sendMail({
          from: env.SMTP_FROM || env.SMTP_USER,
          to: user.email,
          subject: "Reset your NOVA Studio password",
          text: `Use this link within one hour to reset your password: ${resetUrl.toString()}`,
        });
      } else if (user && production) {
        throw new HttpError(503, "Password reset email is not configured. Contact the studio administrator.");
      }
      res.json({
        message: "If an account exists for that email, password reset instructions are available.",
        ...(user && !production && !mailer ? { resetToken: token } : {}),
      });
    },

    resetPassword: async (req, res) => {
      const token = requiredText(req.body.token, "Reset token", 256);
      validatePassword(req.body.password);
      const tokenHash = createHmac("sha256", secret).update(token).digest("hex");
      const updated = await store.update(async (state) => {
        const user = state.users.find((item) => item.resetTokenHash === tokenHash && item.resetExpiresAt > Date.now());
        if (!user) throw new HttpError(400, "This password reset link is invalid or expired.");
        user.passwordHash = await hashPassword(req.body.password);
        delete user.resetTokenHash;
        delete user.resetExpiresAt;
        return safeUser(user);
      });
      res.json({ message: "Password updated. Sign in with your new password.", user: updated });
    },

    me: (req, res) => res.json({ user: req.user }),
    logout: (req, res) => res.json({ message: "Signed out." }),
  };
}
