import { createToken, hashPassword, publicUser, verifyPassword } from "../auth.js";
import { httpError, requiredText } from "../utils/http.js";

const clientRoles = new Set(["candidate", "employer"]);

export function createAuthController({ store, jwtSecret }) {
  return {
    signup: async (request, response, next) => {
      try {
        const name = requiredText(request.body.name, "Name", 2, 120);
        const email = requiredText(request.body.email, "Email", 3, 254).toLowerCase();
        const password = requiredText(request.body.password, "Password", 8, 128);
        const role = request.body.role;
        if (!clientRoles.has(role)) throw httpError(400, "Choose either the candidate or employer role.");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw httpError(400, "Enter a valid email address.");
        if (await store.findUserByEmail(email)) throw httpError(409, "An account with this email already exists.");
        const user = await store.insertUser({
          name,
          email,
          passwordHash: await hashPassword(password),
          role,
          primaryRole: typeof request.body.primaryRole === "string"
            ? request.body.primaryRole.trim().slice(0, 120)
            : "",
          status: "active",
          createdAt: new Date().toISOString(),
        });
        response.status(201).json({ token: createToken(user, jwtSecret), user: publicUser(user) });
      } catch (error) {
        next(error.code === 11000 ? httpError(409, "An account with this email already exists.") : error);
      }
    },

    login: async (request, response, next) => {
      try {
        const email = requiredText(request.body.email, "Email", 3, 254).toLowerCase();
        const password = requiredText(request.body.password, "Password", 1, 128);
        const user = await store.findUserByEmail(email);
        if (!user || !(await verifyPassword(password, user.passwordHash))) {
          throw httpError(401, "Email or password is incorrect.");
        }
        if (user.status === "suspended") throw httpError(403, "This account has been suspended.");
        if (request.body.role && user.role !== request.body.role) {
          throw httpError(403, "This account cannot access that portal.");
        }
        response.json({ token: createToken(user, jwtSecret), user: publicUser(user) });
      } catch (error) {
        next(error);
      }
    },

    me: (request, response) => response.json({ user: publicUser(request.user) }),
  };
}
