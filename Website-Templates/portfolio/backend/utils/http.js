export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function safeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    handle: user.handle,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export function requiredText(value, label, { min = 1, max = 200 } = {}) {
  if (typeof value !== "string") throw new HttpError(400, `${label} is required.`);
  const text = value.trim();
  if (text.length < min || text.length > max) {
    throw new HttpError(400, `${label} must be between ${min} and ${max} characters.`);
  }
  return text;
}

export function validatePassword(value) {
  if (typeof value !== "string" || value.length < 8 || value.length > 200) {
    throw new HttpError(400, "Password must be between 8 and 200 characters.");
  }
  return value;
}

export function createRateLimiter({ limit, windowMs }) {
  const attempts = new Map();
  return (req, res, next) => {
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const recent = (attempts.get(key) || []).filter((timestamp) => now - timestamp < windowMs);
    if (recent.length >= limit) {
      res.set("Retry-After", String(Math.ceil(windowMs / 1000)));
      return res.status(429).json({ error: "Too many attempts. Please try again later." });
    }
    recent.push(now);
    attempts.set(key, recent);
    return next();
  };
}
