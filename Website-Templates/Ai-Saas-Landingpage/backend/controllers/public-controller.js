import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { authorizedClaims, createToken } from "../middleware/auth.js";
import { duplicateAsConflict, notFound, publicLead, publicUser, requireObject, validateLead } from "./validation.js";

const scrypt = promisify(scryptCallback);

export function createPublicController({ store, authSecret }) {
  return {
    health: async () => ({ status: 200, body: { status: "ok" } }),
    pages: async () => ({ status: 200, body: { data: (await store.listPages()).filter((page) => page.showInNavigation) } }),
    page: async (_request, _body, match) => {
      const page = await store.getPage(match[1]);
      if (!page) throw notFound("Page content was not found.");
      return { status: 200, body: { data: page } };
    },
    plans: async () => ({ status: 200, body: { data: await store.listPlans() } }),
    submitLead: async (request, body) => {
      const input = validateLead(requireObject(body));
      const authorization = request.headers.authorization;
      const user = authorization ? await store.findUserById(authorizedClaims(request, authSecret, "user").sub) : null;
      if (authorization && !user) throw notFound("This account no longer exists.");
      const lead = await store.createLead(user
        ? { ...input, userId: user.id, name: user.name, email: user.email }
        : input);
      return { status: 201, body: { data: publicLead(lead) } };
    },
    signUp: async (_request, body) => {
      const input = requireObject(body);
      const name = String(input.name || "").trim();
      const email = String(input.email || "").trim().toLowerCase();
      const password = String(input.password || "");
      if (!name || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || password.length > 256) {
        const error = new Error("Enter your name, a valid email, and a password of at least 8 characters.");
        error.status = 400;
        throw error;
      }
      const passwordSalt = randomBytes(16).toString("hex");
      try {
        const user = await store.createUser({ name, email, passwordSalt, passwordHash: (await scrypt(password, passwordSalt, 64)).toString("hex") });
        return { status: 201, body: { token: createToken(user.id, "user", authSecret), user: publicUser(user) } };
      } catch (error) {
        throw duplicateAsConflict(error);
      }
    },
    login: async (_request, body) => {
      const input = requireObject(body);
      const email = String(input.email || "").trim().toLowerCase();
      const password = String(input.password || "");
      const user = await store.findUserByEmail(email);
      const hash = user ? (await scrypt(password, user.passwordSalt, 64)).toString("hex") : "";
      const valid = user && hash.length === user.passwordHash.length
        && timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(user.passwordHash, "hex"));
      if (!valid) {
        const error = new Error("Email or password is incorrect.");
        error.status = 401;
        throw error;
      }
      return { status: 200, body: { token: createToken(user.id, "user", authSecret), user: publicUser(user) } };
    },
    me: async (request) => {
      const claims = authorizedClaims(request, authSecret, "user");
      const user = await store.findUserById(claims.sub);
      if (!user) throw notFound("This account no longer exists.");
      return { status: 200, body: { user: publicUser(user) } };
    },
    accountLeads: async (request) => {
      const claims = authorizedClaims(request, authSecret, "user");
      const user = await store.findUserById(claims.sub);
      if (!user) throw notFound("This account no longer exists.");
      return { status: 200, body: { data: (await store.listUserLeads(user.id)).map(publicLead) } };
    },
  };
}
