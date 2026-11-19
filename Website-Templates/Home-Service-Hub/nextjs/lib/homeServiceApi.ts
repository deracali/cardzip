export type HomeRole = "client" | "admin";

export type HomeUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: HomeRole;
};

export type HomeSession = {
  token: string;
  user: HomeUser;
};

export type Appointment = {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  serviceId: string;
  serviceName: string;
  urgency: "standard" | "emergency" | "weekend";
  preferredDate: string;
  address: string;
  phone: string;
  description: string;
  quote: number;
  status: "Requested" | "Scheduled" | "In Progress" | "Completed" | "Cancelled";
  createdAt: string;
};

const sessionKey = "fixflow-session";
const apiBaseUrl = (process.env.NEXT_PUBLIC_HOME_SERVICE_API_URL || "http://localhost:5200/api").replace(/\/+$/, "");

export function getSession(): HomeSession | null {
  try {
    const value = JSON.parse(localStorage.getItem(sessionKey) || "null") as HomeSession | null;
    return value && typeof value.token === "string" && value.user ? value : null;
  } catch {
    return null;
  }
}

export function saveSession(session: HomeSession) {
  localStorage.setItem(sessionKey, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(sessionKey);
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  authenticated?: boolean;
};

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
    throw new Error(`Could not connect to the FixFlow API at ${apiBaseUrl}: ${message}`, { cause: error });
  }
  const result = await response.json().catch(() => null) as Record<string, unknown> | null;
  if (!response.ok) {
    const apiError = new Error(typeof result?.error === "string" ? result.error : `Request failed (${response.status}).`);
    Object.assign(apiError, { status: response.status });
    throw apiError;
  }
  if (!result || typeof result !== "object") throw new Error("The FixFlow API returned an invalid response.");
  return result as T;
}

export function errorStatus(error: unknown) {
  return error && typeof error === "object" && "status" in error
    ? (error as { status?: number }).status
    : undefined;
}

export const homeServiceApi = {
  login: (body: { email: string; password: string; expectedRole: HomeRole }) =>
    request<HomeSession>("/auth/login", { method: "POST", body, authenticated: false }),
  signup: (body: { name: string; email: string; phone: string; password: string }) =>
    request<HomeSession>("/auth/signup", { method: "POST", body, authenticated: false }),
  clientDashboard: () => request<{ user: HomeUser; appointments: Appointment[] }>("/client/dashboard"),
  createAppointment: (body: Omit<Appointment, "id" | "clientId" | "clientName" | "clientEmail" | "serviceName" | "quote" | "status" | "createdAt">) =>
    request<{ appointment: Appointment }>("/client/appointments", { method: "POST", body }),
  adminDashboard: () => request<{
    metrics: { clients: number; appointments: number; newRequests: number; activeAppointments: number };
    appointments: Appointment[];
    clients: HomeUser[];
  }>("/admin/dashboard"),
  updateAppointment: (id: string, status: Appointment["status"]) =>
    request<{ appointment: Appointment }>(`/admin/appointments/${encodeURIComponent(id)}`, { method: "PATCH", body: { status } }),
};
