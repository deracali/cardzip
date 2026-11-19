export type FoodRole = "client" | "admin";
export type FoodUser = { id: string; name: string; email: string; phone?: string; role: FoodRole };
export type FoodSession = { token: string; user: FoodUser };
export type FoodOrderItem = { dishId: string; name: string; quantity: number; unitPrice: number };
export type FoodOrder = {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  items: FoodOrderItem[];
  address: string;
  phone: string;
  instructions: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: string;
  createdAt: string;
};

const sessionKey = "sizzle-smile-session";
const apiBaseUrl = (process.env.NEXT_PUBLIC_FOOD_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");

export function getSession(): FoodSession | null {
  try {
    const value = JSON.parse(localStorage.getItem(sessionKey) || "null") as FoodSession | null;
    return value && typeof value.token === "string" && value.user ? value : null;
  } catch {
    return null;
  }
}

export function saveSession(session: FoodSession) {
  localStorage.setItem(sessionKey, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(sessionKey);
}

export function getCart(): Record<string, number> {
  try {
    const value = JSON.parse(localStorage.getItem("sizzle-cart") || "{}");
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}

export function saveCart(cart: Record<string, number>) {
  localStorage.setItem("sizzle-cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("food-cart-change"));
}

export function errorStatus(error: unknown) {
  return error && typeof error === "object" && "status" in error
    ? (error as { status?: number }).status
    : undefined;
}

type RequestOptions = { method?: string; body?: unknown; authenticated?: boolean };

async function request<T>(path: string, { method = "GET", body, authenticated = true }: RequestOptions = {}): Promise<T> {
  const session = authenticated ? getSession() : null;
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network request failed.";
    throw new Error(`Could not connect to Sizzle&Smile API at ${apiBaseUrl}: ${message}`, { cause: error });
  }
  const result = await response.json().catch(() => null) as Record<string, unknown> | null;
  if (!response.ok) {
    const apiError = new Error(typeof result?.error === "string" ? result.error : `Request failed (${response.status}).`);
    Object.assign(apiError, { status: response.status });
    throw apiError;
  }
  if (!result || typeof result !== "object") throw new Error("Sizzle&Smile API returned an invalid response.");
  return result as T;
}

export const foodApi = {
  login: (body: { email: string; password: string; expectedRole: FoodRole }) =>
    request<FoodSession>("/auth/login", { method: "POST", body, authenticated: false }),
  signup: (body: { name: string; email: string; phone: string; password: string }) =>
    request<FoodSession>("/auth/signup", { method: "POST", body, authenticated: false }),
  logout: () => request<{ message: string }>("/auth/logout", { method: "POST" }),
  clientDashboard: () => request<{ user: FoodUser; orders: FoodOrder[] }>("/client/dashboard"),
  createOrder: (body: { items: { dishId: string; quantity: number }[]; address: string; phone: string; instructions: string }) =>
    request<{ order: FoodOrder }>("/client/orders", { method: "POST", body }),
  adminDashboard: () => request<{
    metrics: { clients: number; orders: number; openOrders: number; deliveredSales: number };
    recentOrders: FoodOrder[];
    clients: FoodUser[];
  }>("/admin/dashboard"),
  updateOrder: (id: string, status: string) =>
    request<{ order: FoodOrder }>(`/admin/orders/${encodeURIComponent(id)}`, { method: "PATCH", body: { status } }),
};
