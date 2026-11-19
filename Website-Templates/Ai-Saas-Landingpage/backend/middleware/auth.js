import { createHmac, timingSafeEqual } from "node:crypto";

export function createToken(subject, role, secret, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ sub: subject, role, exp: Math.floor(now / 1000) + 60 * 60 * 12 })).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyToken(token, secret, now = Date.now()) {
  if (!token || typeof token !== "string") return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;
  const expected = createHmac("sha256", secret).update(payload).digest();
  const actual = Buffer.from(signature, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return claims.exp > Math.floor(now / 1000) ? claims : null;
  } catch {
    return null;
  }
}

export function authorizedClaims(request, secret, role, adminEmail) {
  const claims = verifyToken(request.headers.authorization?.replace(/^Bearer\s+/i, ""), secret);
  if (!claims || claims.role !== role || (role === "admin" && claims.sub !== adminEmail)) {
    const error = new Error(role === "admin" ? "Admin sign-in is required." : "Sign in to continue.");
    error.status = 401;
    throw error;
  }
  return claims;
}
