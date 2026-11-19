import { timingSafeEqual } from "node:crypto";

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function requiredText(value, label, maxLength = 500) {
  if (typeof value !== "string" || !value.trim()) throw new HttpError(400, `${label} is required.`);
  const text = value.trim();
  if (text.length > maxLength) throw new HttpError(400, `${label} must be ${maxLength} characters or fewer.`);
  return text;
}

export function normalizedEmail(value) {
  const email = requiredText(value, "Email", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, "Enter a valid email address.");
  return email;
}

export function validatePassword(value) {
  if (typeof value !== "string" || value.length < 10 || value.length > 128) {
    throw new HttpError(400, "Password must be between 10 and 128 characters.");
  }
}

export function safeCompareText(left, right) {
  if (typeof left !== "string" || typeof right !== "string") return false;
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function createRateLimiter({ limit = 10, windowMs = 15 * 60 * 1000 } = {}) {
  const clients = new Map();
  return (req, res, next) => {
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const entry = clients.get(key);
    const current = entry && entry.resetAt > now ? entry : { count: 0, resetAt: now + windowMs };
    current.count += 1;
    clients.set(key, current);
    if (clients.size > 10000) {
      for (const [client, state] of clients) if (state.resetAt <= now) clients.delete(client);
    }
    if (current.count > limit) throw new HttpError(429, "Too many attempts. Please wait and try again.");
    res.set("RateLimit-Limit", String(limit));
    res.set("RateLimit-Remaining", String(Math.max(0, limit - current.count)));
    next();
  };
}
