export type User = {
  id: string;
  name: string;
  company: string;
  email: string;
  role: "admin" | "client";
};

export type Project = {
  id: string;
  name: string;
  client: string;
  clientEmail: string;
  service: string;
  due: string;
  status: "In progress" | "Review" | "Planning" | "Completed";
  progress: number;
  budget: number;
};

export type Client = {
  id: string;
  name: string;
  company: string;
  email: string;
  status: "Active" | "Onboarding" | "Paused";
  createdAt: string;
  projects?: number;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  email: string;
  status: "Available" | "On a project" | "Away";
};

export type Invoice = {
  id: string;
  client: string;
  clientEmail: string;
  date: string;
  amount: number;
  status: "Due soon" | "Paid" | "Overdue";
};

export type Inquiry = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  project: string;
  budget: string;
  status: "New" | "Contacted" | "Accepted" | "Closed";
  createdAt: string;
  response?: string;
  respondedAt?: string;
};

export type CaseStudy = {
  id: string;
  slug: string;
  name: string;
  client: string;
  type: string;
  visual: string;
  image: string;
  images: string[];
  alt: string;
  summary: string;
  description: string;
  result: string;
  deliverables: string[];
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  id: string;
  client: string;
  clientEmail: string;
  body: string;
  sender: "admin" | "client";
  createdAt: string;
  read: boolean;
};

export type Settings = {
  studioName: string;
  email: string;
  website: string;
  description: string;
  notifications: {
    projectUpdates: boolean;
    clientActivity: boolean;
    weeklySummary: boolean;
  };
};

type SessionResponse = { token: string; user: User };
type RequestOptions = { method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"; body?: object; authenticated?: boolean };
type ApiResult = { message: string; resetToken?: string };

const apiBaseUrl = (process.env.NEXT_PUBLIC_AGENCY_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
const sessionKey = "nova-agency-session";

async function request<T>(path: string, { method = "GET", body, authenticated = true }: RequestOptions = {}): Promise<T> {
  const token = authenticated && typeof window !== "undefined" ? getToken() : null;
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = typeof result === "object" && result !== null && "error" in result
      ? String(result.error)
      : `Request failed (${response.status}).`;
    throw new Error(message);
  }
  if (typeof result !== "object" || result === null) throw new Error("The agency API returned an invalid response.");
  return result as T;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const session = window.localStorage.getItem(sessionKey);
  if (!session) return null;
  try {
    const parsed: unknown = JSON.parse(session);
    return typeof parsed === "object" && parsed !== null && "token" in parsed && typeof parsed.token === "string"
      ? parsed.token
      : null;
  } catch {
    return null;
  }
}

export function getSessionUser(): User | null {
  if (typeof window === "undefined") return null;
  const session = window.localStorage.getItem(sessionKey);
  if (!session) return null;
  try {
    const parsed: unknown = JSON.parse(session);
    if (typeof parsed !== "object" || parsed === null || !("user" in parsed)) return null;
    const user = parsed.user;
    return typeof user === "object" && user !== null && "id" in user && "role" in user
      ? user as User
      : null;
  } catch {
    return null;
  }
}

export function saveSession(session: SessionResponse): void {
  window.localStorage.setItem(sessionKey, JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(sessionKey);
}

export const agencyApi = {
  auth: {
    signupClient: (body: { name: string; company: string; email: string; password: string }) =>
      request<SessionResponse>("/auth/signup", { method: "POST", body, authenticated: false }),
    signupAdmin: (body: { name: string; company: string; email: string; password: string; inviteCode?: string }) =>
      request<SessionResponse>("/auth/admin-signup", { method: "POST", body, authenticated: false }),
    login: (body: { email: string; password: string; expectedRole: User["role"] }) =>
      request<SessionResponse>("/auth/login", { method: "POST", body, authenticated: false }),
    me: () => request<{ user: User }>("/auth/me"),
    logout: () => request<ApiResult>("/auth/logout", { method: "POST" }),
    forgotPassword: (email: string) =>
      request<ApiResult>("/auth/forgot-password", { method: "POST", body: { email }, authenticated: false }),
    resetPassword: (token: string, password: string) =>
      request<ApiResult>("/auth/reset-password", { method: "POST", body: { token, password }, authenticated: false }),
  },
  inquiries: {
    submit: (body: { phone: string; project: string; budget: string }) =>
      request<{ message: string; inquiry: Inquiry }>("/client/inquiries", { method: "POST", body }),
  },
  publicCaseStudies: () =>
    request<{ caseStudies: CaseStudy[] }>("/public/case-studies", { authenticated: false }),
  uploadCaseStudyImage: async (file: File): Promise<string> => {
    if (!file.type.startsWith("image/")) throw new Error("Choose an image file.");
    if (file.size > 10 * 1024 * 1024) throw new Error("Images must be 10 MB or smaller.");
    const signature = await request<{ cloudName: string; apiKey: string; timestamp: number; folder: string; signature: string }>(
      "/admin/case-studies/upload-signature",
      { method: "POST" },
    );
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", signature.apiKey);
    form.append("timestamp", String(signature.timestamp));
    form.append("folder", signature.folder);
    form.append("signature", signature.signature);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(signature.cloudName)}/image/upload`, {
      method: "POST",
      body: form,
    });
    const result: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const message = typeof result === "object" && result !== null && "error" in result
        && typeof result.error === "object" && result.error !== null && "message" in result.error
        ? String(result.error.message)
        : `Cloudinary upload failed (${response.status}).`;
      throw new Error(message);
    }
    if (typeof result !== "object" || result === null || !("secure_url" in result) || typeof result.secure_url !== "string") {
      throw new Error("Cloudinary returned no secure image URL.");
    }
    return result.secure_url;
  },
  admin: {
    dashboard: () => request<{ metrics: { activeProjects: number; monthlyRevenue: number; activeClients: number; pendingApprovals: number }; projects: Project[]; activity: { id: string; title: string; detail: string; createdAt: string }[] }>("/admin/dashboard"),
    projects: () => request<{ projects: Project[] }>("/admin/projects"),
    createProject: (body: Partial<Project>) => request<{ project: Project }>("/admin/projects", { method: "POST", body }),
    updateProject: (id: string, body: Partial<Project>) => request<{ project: Project }>(`/admin/projects/${encodeURIComponent(id)}`, { method: "PATCH", body }),
    caseStudies: () => request<{ caseStudies: CaseStudy[] }>("/admin/case-studies"),
    createCaseStudy: (body: Omit<CaseStudy, "id" | "slug" | "visual" | "createdAt" | "updatedAt">) =>
      request<{ caseStudy: CaseStudy }>("/admin/case-studies", { method: "POST", body }),
    updateCaseStudy: (id: string, body: Partial<CaseStudy>) =>
      request<{ caseStudy: CaseStudy }>(`/admin/case-studies/${encodeURIComponent(id)}`, { method: "PATCH", body }),
    deleteCaseStudy: (id: string) =>
      request<{ caseStudy: CaseStudy }>(`/admin/case-studies/${encodeURIComponent(id)}`, { method: "DELETE" }),
    clients: () => request<{ clients: Client[] }>("/admin/clients"),
    createClient: (body: Pick<Client, "name" | "company" | "email">) => request<{ client: Client }>("/admin/clients", { method: "POST", body }),
    updateClient: (id: string, body: Partial<Client>) => request<{ client: Client }>(`/admin/clients/${encodeURIComponent(id)}`, { method: "PATCH", body }),
    team: () => request<{ team: TeamMember[] }>("/admin/team"),
    createTeamMember: (body: Pick<TeamMember, "name" | "role" | "email">) => request<{ member: TeamMember }>("/admin/team", { method: "POST", body }),
    updateTeamMember: (id: string, body: Partial<TeamMember>) => request<{ member: TeamMember }>(`/admin/team/${encodeURIComponent(id)}`, { method: "PATCH", body }),
    invoices: () => request<{ invoices: Invoice[] }>("/admin/invoices"),
    createInvoice: (body: { client: string; clientEmail: string; amount: number }) => request<{ invoice: Invoice }>("/admin/invoices", { method: "POST", body }),
    updateInvoice: (id: string, body: Partial<Invoice>) => request<{ invoice: Invoice }>(`/admin/invoices/${encodeURIComponent(id)}`, { method: "PATCH", body }),
    inquiries: () => request<{ inquiries: Inquiry[] }>("/admin/inquiries"),
    updateInquiry: (id: string, body: Partial<Inquiry>) => request<{ inquiry: Inquiry }>(`/admin/inquiries/${encodeURIComponent(id)}`, { method: "PATCH", body }),
    replyToInquiry: (id: string, message: string) => request<{ inquiry: Inquiry; message: Message }>(`/admin/inquiries/${encodeURIComponent(id)}/reply`, { method: "POST", body: { message } }),
    messages: () => request<{ messages: Message[] }>("/admin/messages"),
    sendMessage: (body: { clientEmail: string; message: string }) => request<{ message: Message }>("/admin/messages", { method: "POST", body }),
    markMessageRead: (id: string) => request<{ message: Message }>(`/admin/messages/${encodeURIComponent(id)}/read`, { method: "PATCH" }),
    settings: () => request<{ settings: Settings }>("/admin/settings"),
    updateSettings: (body: Partial<Settings>) => request<{ settings: Settings }>("/admin/settings", { method: "PUT", body }),
  },
  client: {
    dashboard: () => request<{ user: User; projects: Project[]; invoices: Invoice[]; messages: Message[]; inquiries: Inquiry[] }>("/client/dashboard"),
    inquiries: () => request<{ inquiries: Inquiry[] }>("/client/inquiries"),
    sendMessage: (message: string) => request<{ message: Message }>("/client/messages", { method: "POST", body: { message } }),
  },
};
