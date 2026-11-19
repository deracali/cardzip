import { createAdminController } from "../controllers/admin-controller.js";
import { createPublicController } from "../controllers/public-controller.js";

export function createApiRouter(configuration) {
  const publicController = createPublicController(configuration);
  const adminController = createAdminController(configuration);
  const routes = [
    ["GET", /^\/api\/health$/, publicController.health],
    ["GET", /^\/api\/pages$/, publicController.pages],
    ["GET", /^\/api\/pages\/([^/]+)$/, publicController.page],
    ["GET", /^\/api\/plans$/, publicController.plans],
    ["POST", /^\/api\/leads$/, publicController.submitLead],
    ["POST", /^\/api\/auth\/signup$/, publicController.signUp],
    ["POST", /^\/api\/auth\/login$/, publicController.login],
    ["GET", /^\/api\/auth\/me$/, publicController.me],
    ["GET", /^\/api\/auth\/leads$/, publicController.accountLeads],
    ["POST", /^\/api\/admin\/login$/, adminController.login],
    ["GET", /^\/api\/admin\/leads$/, adminController.leads],
    ["POST", /^\/api\/admin\/leads$/, adminController.createLead],
    ["PATCH", /^\/api\/admin\/leads\/([a-f0-9]+)$/, adminController.updateLead],
    ["DELETE", /^\/api\/admin\/leads\/([a-f0-9]+)$/, adminController.deleteLead],
    ["GET", /^\/api\/admin\/users$/, adminController.users],
    ["PATCH", /^\/api\/admin\/users\/([a-f0-9]+)$/, adminController.updateUser],
    ["DELETE", /^\/api\/admin\/users\/([a-f0-9]+)$/, adminController.deleteUser],
    ["GET", /^\/api\/admin\/pages$/, adminController.pages],
    ["POST", /^\/api\/admin\/pages$/, adminController.createPage],
    ["PATCH", /^\/api\/admin\/pages\/([a-f0-9]+)$/, adminController.updatePage],
    ["DELETE", /^\/api\/admin\/pages\/([a-f0-9]+)$/, adminController.deletePage],
    ["GET", /^\/api\/admin\/plans$/, adminController.plans],
    ["POST", /^\/api\/admin\/plans$/, adminController.createPlan],
    ["PATCH", /^\/api\/admin\/plans\/([a-f0-9]+)$/, adminController.updatePlan],
    ["DELETE", /^\/api\/admin\/plans\/([a-f0-9]+)$/, adminController.deletePlan],
  ];

  return async (request, body, url) => {
    for (const [method, pattern, handler] of routes) {
      if (request.method !== method) continue;
      const match = url.pathname.match(pattern);
      if (!match) continue;
      if (match[1] && method === "GET" && pattern.source.includes("\\/pages\\/")) match[1] = decodeURIComponent(match[1]);
      return handler(request, body, match, url);
    }
    return null;
  };
}
