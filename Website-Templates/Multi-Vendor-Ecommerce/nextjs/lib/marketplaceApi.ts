export type MarketRole = "client" | "vendor" | "admin";

export interface MarketUser {
  id: string;
  name: string;
  email: string;
  role: MarketRole;
  vendorStatus: "pending" | "approved" | "rejected" | null;
}

export interface MarketSession {
  token: string;
  user: MarketUser;
}

export interface MarketProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  image: string;
  seller: string;
  stock: number;
  status: string;
}

export interface MarketOrder {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  items: Array<{
    productId: string;
    vendorId: string;
    productName: string;
    seller: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  subtotal: number;
  shipping: number;
  shippingMethod: string;
  tax: number;
  total: number;
  status: string;
  paymentStatus: string;
  currency?: string;
  paymentProvider?: "paystack" | "stripe";
  createdAt: string;
}

export interface MarketPaymentProvider {
  id: "paystack" | "stripe";
  name: string;
  enabled: boolean;
}

export interface MarketDashboard {
  user: MarketUser;
  orders: MarketOrder[];
  products?: MarketProduct[];
  vendors?: MarketUser[];
  metrics?: {
    customers: number;
    vendors: number;
    pendingVendors: number;
    products: number;
    orders: number;
    pendingOrders: number;
    orderValue: number;
  };
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_MARKETHUB_API_URL || "http://localhost:5500/api").replace(/\/+$/, "");
const SESSION_KEY = "markethub-session";

export function getMarketplaceSession(): MarketSession | null {
  try {
    const saved = window.localStorage.getItem(SESSION_KEY);
    if (!saved) return null;
    const session = JSON.parse(saved) as MarketSession;
    return session?.token && session?.user ? session : null;
  } catch (error) {
    console.error("Could not read the MarketHub session:", error);
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function saveMarketplaceSession(session: MarketSession): void {
  if (!session?.token || !session?.user) throw new Error("The marketplace API returned an invalid session.");
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("markethub-session-change"));
}

export function clearMarketplaceSession(): void {
  window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("markethub-session-change"));
}

async function request<T>(path: string, options: { method?: string; body?: unknown; token?: string | null } = {}): Promise<T> {
  const token = options.token === undefined ? getMarketplaceSession()?.token : options.token;
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method || "GET",
      headers: {
        Accept: "application/json",
        ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    throw new Error(`Could not connect to MarketHub API at ${API_BASE_URL}: ${message}`);
  }
  const result = await response.json().catch(() => ({})) as { error?: string };
  if (!response.ok) {
    const requestError = new Error(result.error || `Request failed (${response.status}).`) as Error & { status?: number };
    requestError.status = response.status;
    throw requestError;
  }
  return result as T;
}

export const marketplaceApi = {
  login: (body: { email: string; password: string; expectedRole?: MarketRole }) =>
    request<MarketSession>("/auth/login", { method: "POST", body, token: null }),
  signup: (body: { name: string; email: string; password: string; role: "client" | "vendor" }) =>
    request<MarketSession>("/auth/signup", { method: "POST", body, token: null }),
  me: () => request<{ user: MarketUser }>("/auth/me"),
  products: () => request<{ products: MarketProduct[] }>("/products", { token: null }),
  paymentProviders: () => request<{ currency: string; providers: MarketPaymentProvider[] }>("/payments/providers", { token: null }),
  clientDashboard: () => request<MarketDashboard>("/client/dashboard"),
  createOrder: (body: {
    items: Array<{ productId: string; quantity: number }>;
    shippingMethod: string;
    shippingAddress: { name: string; email: string; address: string; city: string; state: string; postalCode: string; country: string };
  }) => request<{ order: MarketOrder }>("/client/orders", { method: "POST", body }),
  createCheckout: (body: {
    provider: MarketPaymentProvider["id"];
    items: Array<{ productId: string; quantity: number }>;
    shippingMethod: string;
    shippingAddress: { name: string; email: string; address: string; city: string; state: string; postalCode: string; country: string };
  }) => request<{ order: MarketOrder; checkoutUrl: string }>("/client/checkout", { method: "POST", body }),
  verifyPaystackPayment: (reference: string) =>
    request<{ order: MarketOrder }>("/client/payments/paystack/verify", { method: "POST", body: { reference } }),
  verifyStripePayment: (sessionId: string) =>
    request<{ order: MarketOrder }>("/client/payments/stripe/verify", { method: "POST", body: { sessionId } }),
  cancelStripePayment: (orderNumber: string) =>
    request<{ cancelled: boolean; paid?: boolean }>("/client/payments/stripe/cancel", { method: "POST", body: { orderNumber } }),
  vendorDashboard: () => request<MarketDashboard>("/vendor/dashboard"),
  createProduct: (body: { name: string; category: string; description: string; price: number; stock: number; image?: string }) =>
    request<{ product: MarketProduct }>("/vendor/products", { method: "POST", body }),
  adminDashboard: () => request<MarketDashboard>("/admin/dashboard"),
  updateVendorStatus: (vendorId: string, status: "approved" | "rejected") =>
    request<{ vendor: MarketUser }>(`/admin/vendors/${encodeURIComponent(vendorId)}`, { method: "PATCH", body: { status } }),
  updateOrderStatus: (orderId: string, status: string) =>
    request<{ order: MarketOrder }>(`/admin/orders/${encodeURIComponent(orderId)}`, { method: "PATCH", body: { status } }),
};
