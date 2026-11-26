export type SalonRole = "client" | "admin";
export type SalonUser = { id: string; name: string; email: string; phone?: string; role: SalonRole };
export type SalonSession = { token: string; user: SalonUser };
export type SalonAppointment = {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  serviceId: string;
  serviceName: string;
  category: string;
  duration: string;
  price: number;
  date: string;
  time: string;
  stylist: string;
  notes: string;
  status: string;
  createdAt: string;
  paymentReference?: string;
  paymentAmountMinor?: number;
  paymentCurrency?: string;
};
export type SalonService = {
  id: string;
  name: string;
  category: string;
  description: string;
  duration: string;
  price: number;
  image: string;
  badge?: string;
  active: boolean;
};
export type SalonServiceInput = Omit<SalonService, "id">;
export type SalonStylist = {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  active: boolean;
};
export type SalonStylistInput = Omit<SalonStylist, "id">;

const sessionKey = "lumiere-session";
const apiBaseUrl = (process.env.NEXT_PUBLIC_SALON_API_URL || "http://localhost:5600/api").replace(/\/+$/, "");

export function getSession(): SalonSession | null {
  if (typeof window === "undefined") return null;
  try {
    const value = JSON.parse(window.localStorage.getItem(sessionKey) || "null") as SalonSession | null;
    return value && typeof value.token === "string" && value.user ? value : null;
  } catch {
    return null;
  }
}

export function saveSession(session: SalonSession) {
  window.localStorage.setItem(sessionKey, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(sessionKey);
}

export function errorStatus(error: unknown): number | undefined {
  return error && typeof error === "object" && "status" in error
    ? (error as { status?: number }).status
    : undefined;
}

type RequestOptions = { method?: string; body?: unknown };

async function request<T>(path: string, { method = "GET", body }: RequestOptions = {}): Promise<T> {
  const session = getSession();
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network request failed.";
    throw new Error(`Could not connect to Lumière API at ${apiBaseUrl}: ${message}`, { cause: error });
  }
  const result = await response.json().catch(() => null) as Record<string, unknown> | null;
  if (!response.ok) {
    const apiError = new Error(typeof result?.error === "string" ? result.error : `Request failed (${response.status}).`);
    Object.assign(apiError, { status: response.status });
    throw apiError;
  }
  if (!result || typeof result !== "object") throw new Error("Lumière API returned an invalid response.");
  return result as T;
}

export const salonApi = {
  services: () => request<{ services: SalonService[] }>("/services"),
  stylists: () => request<{ stylists: SalonStylist[] }>("/stylists"),
  signup: (body: { name: string; email: string; password: string; phone?: string }) =>
    request<SalonSession>("/auth/signup", { method: "POST", body }),
  login: (body: { email: string; password: string }) =>
    request<SalonSession>("/auth/login", { method: "POST", body }),
  clientDashboard: () => request<{ appointments: SalonAppointment[] }>("/client/dashboard"),
  createAppointment: (body: { serviceId: string; date: string; time: string; stylist: string; notes: string }) =>
    request<{ appointment: SalonAppointment }>("/client/appointments", { method: "POST", body }),
  adminDashboard: () => request<{
    metrics: { clients: number; appointments: number; requested: number; confirmed: number; completed: number };
    appointments: SalonAppointment[];
    clients: SalonUser[];
  }>("/admin/dashboard"),
  updateAppointment: (id: string, status: string) =>
    request<{ appointment: SalonAppointment }>(`/admin/appointments/${encodeURIComponent(id)}`, { method: "PATCH", body: { status } }),
  adminServices: () => request<{ services: SalonService[] }>("/admin/services"),
  createService: (body: SalonServiceInput) =>
    request<{ service: SalonService }>("/admin/services", { method: "POST", body }),
  updateService: (id: string, body: Partial<SalonServiceInput>) =>
    request<{ service: SalonService }>(`/admin/services/${encodeURIComponent(id)}`, { method: "PATCH", body }),
  adminStylists: () => request<{ stylists: SalonStylist[] }>("/admin/stylists"),
  createStylist: (body: SalonStylistInput) =>
    request<{ stylist: SalonStylist }>("/admin/stylists", { method: "POST", body }),
  updateStylist: (id: string, body: Partial<SalonStylistInput>) =>
    request<{ stylist: SalonStylist }>(`/admin/stylists/${encodeURIComponent(id)}`, { method: "PATCH", body }),
};
