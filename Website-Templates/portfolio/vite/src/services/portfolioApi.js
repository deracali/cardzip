const API_BASE_URL = (import.meta.env.VITE_PORTFOLIO_API_URL || "http://localhost:5700/api").replace(/\/+$/, "");
const SESSION_KEY = "creatorhub-portfolio-session";

export function getPortfolioSession() {
  if (typeof window === "undefined") return null;
  const saved = window.localStorage.getItem(SESSION_KEY);
  if (!saved) return null;
  try {
    const session = JSON.parse(saved);
    return session?.token && session?.user?.role ? session : null;
  } catch (error) {
    console.error("Could not read the CreatorHub session:", error);
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function savePortfolioSession(session) {
  if (!session?.token || !session?.user?.role) throw new Error("The Portfolio API returned an invalid session.");
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearPortfolioSession() {
  if (typeof window !== "undefined") window.localStorage.removeItem(SESSION_KEY);
}

async function request(path, { method = "GET", body, token } = {}) {
  const sessionToken = token === undefined ? getPortfolioSession()?.token : token;
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    throw new Error(`Could not connect to the Portfolio API at ${API_BASE_URL}: ${message}`, { cause: error });
  }

  let result;
  try {
    result = await response.json();
  } catch {
    result = null;
  }
  if (!response.ok) {
    const message = result && typeof result.error === "string" ? result.error : `Request failed (${response.status}).`;
    const requestError = new Error(message);
    requestError.status = response.status;
    throw requestError;
  }
  if (!result || typeof result !== "object") throw new Error("The Portfolio API returned an invalid response.");
  return result;
}

export const portfolioApi = {
  login: (body) => request("/auth/login", { method: "POST", body, token: null }),
  signup: (body) => request("/auth/signup", { method: "POST", body, token: null }),
  me: () => request("/auth/me"),
  clientDashboard: () => request("/client/dashboard"),
  createReviewRequest: (body) => request("/client/review-requests", { method: "POST", body }),
  adminDashboard: () => request("/admin/dashboard"),
  updateReviewRequest: (id, status) => request(`/admin/review-requests/${encodeURIComponent(id)}`, { method: "PATCH", body: { status } }),
};
