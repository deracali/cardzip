import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { HttpError } from "../utils/http.js";

const scrypt = promisify(scryptCallback);

function safeCompare(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64);
  return `${salt}:${Buffer.from(derived).toString("hex")}`;
}

export async function verifyPassword(password, encoded) {
  const [salt, expectedHex] = encoded.split(":");
  if (!salt || !expectedHex) return false;
  const actual = await scrypt(password, salt, 64);
  return safeCompare(Buffer.from(actual).toString("hex"), expectedHex);
}

export function signToken(user, secret, now = Date.now()) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    sub: user.id,
    iat: Math.floor(now / 1000),
    exp: Math.floor(now / 1000) + 60 * 60 * 8,
  })).toString("base64url");
  const signature = createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${signature}`;
}

export function verifyToken(token, secret, now = Date.now()) {
  const parts = token.split(".");
  if (parts.length !== 3) throw new HttpError(401, "Please sign in to continue.");
  const expected = createHmac("sha256", secret).update(`${parts[0]}.${parts[1]}`).digest("base64url");
  if (!safeCompare(expected, parts[2])) throw new HttpError(401, "Your session is invalid. Please sign in again.");
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    if (!payload.sub || !payload.exp || payload.exp <= Math.floor(now / 1000)) {
      throw new HttpError(401, "Your session has expired. Please sign in again.");
    }
    return payload;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(401, "Your session is invalid. Please sign in again.");
  }
}

export function safeCompareText(left, right) {
  return safeCompare(left, right);
}
