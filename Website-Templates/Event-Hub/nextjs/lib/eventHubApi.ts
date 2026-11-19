export type EventItem = {
  id?: string;
  _id?: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  price: number;
  image: string;
  description: string;
  lineup: string;
  tag: string;
  published?: boolean;
};

export type EventUser = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: "admin" | "organizer" | "attendee";
  organizerStatus?: string;
};

export type Booking = {
  _id: string;
  reference: string;
  eventTitle: string;
  ticketType: string;
  quantity: number;
  total: number;
  status: string;
  attendeeName?: string;
  attendeeEmail?: string;
  createdAt: string;
};

const apiBaseUrl = (process.env.NEXT_PUBLIC_EVENT_HUB_API_URL || "http://localhost:5400/api").replace(/\/+$/, "");

export function errorStatus(error: unknown) {
  return error && typeof error === "object" && "status" in error
    ? (error as { status?: number }).status
    : undefined;
}

async function request<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method: options.method || "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network request failed.";
    throw new Error(`Could not connect to PulseLive API at ${apiBaseUrl}: ${message}`, { cause: error });
  }
  const result = await response.json().catch(() => null) as Record<string, unknown> | null;
  if (!response.ok) {
    const apiError = new Error(typeof result?.error === "string" ? result.error : `Request failed (${response.status}).`);
    Object.assign(apiError, { status: response.status });
    throw apiError;
  }
  if (!result || typeof result !== "object") throw new Error("PulseLive API returned an invalid response.");
  return result as T;
}

export const eventHubApi = {
  listEvents: () => request<{ events: EventItem[] }>("/events"),
  getEvent: (slug: string) => request<{ event: EventItem }>(`/events/${encodeURIComponent(slug)}`),
  register: (body: { name: string; email: string; password: string; accountType: "attendee" | "organizer" }) =>
    request<{ user: EventUser }>("/auth/register", { method: "POST", body }),
  login: (body: { email: string; password: string }) =>
    request<{ user: EventUser }>("/auth/login", { method: "POST", body }),
  logout: () => request<{ success: boolean }>("/auth/logout", { method: "POST" }),
  currentUser: () => request<{ user: EventUser }>("/auth/me"),
  createBooking: (body: { eventSlug: string; ticketType: string; quantity: number }) =>
    request<{ booking: Booking; message: string }>("/bookings", { method: "POST", body }),
  myBookings: () => request<{ bookings: Booking[] }>("/bookings/mine"),
  organizerEvents: () => request<{ events: EventItem[] }>("/organizer/events"),
  organizerBookings: () => request<{ bookings: Booking[] }>("/organizer/bookings"),
  adminSummary: () => request<{ metrics: Record<string, number> }>("/admin/summary"),
  adminEvents: () => request<{ events: EventItem[] }>("/admin/events"),
  adminBookings: () => request<{ bookings: Booking[] }>("/admin/bookings"),
  adminOrganizers: () => request<{ organizers: EventUser[] }>("/admin/organizers"),
  adminAttendees: () => request<{ attendees: EventUser[] }>("/admin/attendees"),
};
