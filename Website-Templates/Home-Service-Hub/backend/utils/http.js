import { timingSafeEqual } from "node:crypto";

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function requiredText(value, label, maxLength = 180) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > maxLength) {
    throw new HttpError(400, `${label} is required and must be ${maxLength} characters or fewer.`);
  }
  return value.trim();
}

export function optionalText(value, label, maxLength = 1000) {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string" || value.trim().length > maxLength) {
    throw new HttpError(400, `${label} must be ${maxLength} characters or fewer.`);
  }
  return value.trim();
}

export function normalizedEmail(value) {
  if (typeof value !== "string" || !emailPattern.test(value.trim()) || value.length > 254) {
    throw new HttpError(400, "Enter a valid email address.");
  }
  return value.trim().toLowerCase();
}

export function validatePassword(password) {
  if (typeof password !== "string" || password.length < 8 || password.length > 128) {
    throw new HttpError(400, "Password must be between 8 and 128 characters.");
  }
}

export function safeUser(user) {
  return { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role };
}

export function publicRecord(record) {
  const { passwordHash, ...safe } = record;
  return safe;
}

export function safeCompareText(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function createRateLimiter({ limit, windowMs }) {
  const requests = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const current = requests.get(req.ip);
    if (!current || current.resetAt <= now) {
      requests.set(req.ip, { count: 1, resetAt: now + windowMs });
      return next();
    }
    current.count += 1;
    if (current.count > limit) {
      res.set("Retry-After", String(Math.ceil((current.resetAt - now) / 1000)));
      return res.status(429).json({ error: "Too many attempts. Please try again later." });
    }
    next();
  };
}
