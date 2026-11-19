export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function safeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    ...(user.phone ? { phone: user.phone } : {}),
  };
}

export function createRateLimiter({ limit, windowMs }) {
  const attempts = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const current = attempts.get(key);
    const entry = !current || current.resetAt <= now
      ? { count: 0, resetAt: now + windowMs }
      : current;
    entry.count += 1;
    attempts.set(key, entry);
    if (entry.count > limit) return res.status(429).json({ error: "Too many attempts. Please try again later." });
    next();
  };
}
