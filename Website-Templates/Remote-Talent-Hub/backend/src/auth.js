import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const derivedKey = await scrypt(password, salt, 64);
  return `${salt.toString("base64url")}.${derivedKey.toString("base64url")}`;
}

export async function verifyPassword(password, storedHash) {
  const [saltValue, hashValue] = String(storedHash || "").split(".");
  if (!saltValue || !hashValue) return false;
  const expected = Buffer.from(hashValue, "base64url");
  const actual = await scrypt(password, Buffer.from(saltValue, "base64url"), expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function createToken(user, secret, now = Date.now()) {
  const header = encode({ alg: "HS256", typ: "JWT" });
  const payload = encode({
    sub: user.id,
    role: user.role,
    iat: Math.floor(now / 1000),
    exp: Math.floor(now / 1000) + 60 * 60 * 8,
  });
  const unsignedToken = `${header}.${payload}`;
  const signature = createHmac("sha256", secret).update(unsignedToken).digest("base64url");
  return `${unsignedToken}.${signature}`;
}

export function verifyToken(token, secret, now = Date.now()) {
  const [headerValue, payloadValue, signatureValue, extra] = String(token || "").split(".");
  if (!headerValue || !payloadValue || !signatureValue || extra) {
    throw new Error("Invalid access token.");
  }

  const unsignedToken = `${headerValue}.${payloadValue}`;
  const expected = createHmac("sha256", secret).update(unsignedToken).digest();
  const actual = Buffer.from(signatureValue, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    throw new Error("Invalid access token.");
  }

  let header;
  let payload;
  try {
    header = JSON.parse(Buffer.from(headerValue, "base64url").toString("utf8"));
    payload = JSON.parse(Buffer.from(payloadValue, "base64url").toString("utf8"));
  } catch {
    throw new Error("Invalid access token.");
  }

  if (header.alg !== "HS256" || typeof payload.sub !== "string" ||
      typeof payload.exp !== "number" || payload.exp <= Math.floor(now / 1000)) {
    throw new Error("Expired or invalid access token.");
  }
  return { id: payload.sub, role: payload.role };
}

export function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    primaryRole: user.primaryRole || "",
    createdAt: user.createdAt,
  };
}
