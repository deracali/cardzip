import { randomUUID } from "node:crypto";
import { hashPassword, signToken, verifyPassword } from "../services/auth-service.js";
import { HttpError, safeUser } from "../utils/http.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function createAuthController(store, secret) {
  async function signup(req, res) {
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const phone = typeof req.body?.phone === "string" ? req.body.phone.trim() : "";
    if (name.length < 2 || name.length > 100) throw new HttpError(400, "Enter your name using 2 to 100 characters.");
    if (!emailPattern.test(email) || email.length > 254) throw new HttpError(400, "Enter a valid email address.");
    if (password.length < 8 || password.length > 128) throw new HttpError(400, "Password must be between 8 and 128 characters.");
    if (phone.length > 40) throw new HttpError(400, "Phone number must be 40 characters or fewer.");
    if (await store.findUserByEmail(email)) throw new HttpError(409, "An account with that email already exists.");
    const user = {
      id: randomUUID(),
      name,
      email,
      ...(phone ? { phone } : {}),
      passwordHash: await hashPassword(password),
      role: "client",
      createdAt: new Date().toISOString(),
    };
    try {
      await store.createUser(user);
    } catch (error) {
      if (error?.code === 11000) throw new HttpError(409, "An account with that email already exists.");
      throw error;
    }
    const publicUser = safeUser(user);
    res.status(201).json({ user: publicUser, token: signToken(user, secret) });
  }

  async function login(req, res) {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!emailPattern.test(email) || !password) throw new HttpError(400, "Enter your email and password.");
    const user = await store.findUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.passwordHash))) throw new HttpError(401, "Email or password is incorrect.");
    res.json({ user: safeUser(user), token: signToken(user, secret) });
  }

  async function currentUser(req, res) {
    res.json({ user: req.user });
  }

  return { signup, login, currentUser };
}
