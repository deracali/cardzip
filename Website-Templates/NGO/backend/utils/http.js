export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function requiredText(value, label, maxLength = 180, minLength = 1) {
  if (typeof value !== "string" || value.trim().length < minLength || value.trim().length > maxLength) {
    throw new HttpError(400, `${label} must be between ${minLength} and ${maxLength} characters.`);
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
  return { id: user.id, name: user.name, email: user.email, role: user.role };
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
