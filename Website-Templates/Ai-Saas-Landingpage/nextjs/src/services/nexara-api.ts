const API_BASE_URL = (process.env.NEXT_PUBLIC_NEXARA_API_URL || "http://localhost:5001/api").replace(/\/+$/, "");
const USER_TOKEN_KEY = "nexara-user-token";
const ADMIN_TOKEN_KEY = "nexara-admin-token";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
};

export class NexaraApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "NexaraApiError";
  }
}

async function request<T>(path: string, { method = "GET", body, token }: RequestOptions = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      cache: "no-store",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    throw new Error(`Could not connect to the Nexara API at ${API_BASE_URL}: ${message}`);
  }
  const result = await response.json().catch(() => ({})) as { error?: string };
  if (!response.ok) throw new NexaraApiError(`${method} ${path} failed (${response.status}): ${result.error || "Unexpected API response."}`, response.status);
  return result as T;
}

export type NexaraLead = {
  id: string;
  type: "contact" | "signup" | "checkout" | "demo";
  name: string;
  email: string;
  company: string;
  message: string;
  plan: string;
  billing: string;
  status: "new" | "contacted" | "qualified" | "closed";
  response?: string;
  respondedAt?: string | null;
  createdAt: string;
};

export type NexaraUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type NexaraPage = {
  id: string;
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  showInNavigation: boolean;
  sections: { title?: string; body?: string; items?: { title?: string; body?: string; href?: string }[] }[];
  updatedAt: string;
};

export type NexaraPlan = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: { monthly: number; annual: number };
  features: string[];
  cta: string;
  popular: boolean;
  updatedAt: string;
};

export type NexaraDocument = {
  id: string;
  slug: string;
  title: string;
  description: string;
  filename: string;
  contentType: "application/pdf" | "text/plain" | "text/markdown";
  contentBase64?: string;
  createdAt: string;
};

export type NexaraAgent = {
  id: string;
  slug: string;
  name: string;
  team: string;
  description: string;
  mode: string;
  createdAt: string;
  updatedAt: string;
};

export type NexaraWorkflow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  trigger: string;
  steps: string[];
  createdAt: string;
  updatedAt: string;
};

export type NexaraIntegration = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  createdAt: string;
  updatedAt: string;
};

export type NexaraAdminAnalytics = {
  totals: {
    leads: number;
    users: number;
    pages: number;
    plans: number;
    documents: number;
    agents: number;
    workflows: number;
    integrations: number;
  };
  activity: { date: string; count: number }[];
};

type AdminUser = NexaraUser;

export const nexaraApi = {
  submitLead: (lead: Partial<NexaraLead>, token?: string | null) => request<{ data: NexaraLead }>("/leads", { method: "POST", body: lead, token }),
  signUp: (credentials: { name: string; email: string; password: string }) =>
    request<{ token: string; user: NexaraUser }>("/auth/signup", { method: "POST", body: credentials }),
  login: (credentials: { email: string; password: string }) =>
    request<{ token: string; user: NexaraUser }>("/auth/login", { method: "POST", body: credentials }),
  currentUser: (token: string) => request<{ user: NexaraUser }>("/auth/me", { token }),
  accountLeads: (token: string) => request<{ data: NexaraLead[] }>("/auth/leads", { token }),
  adminLogin: (credentials: { email: string; password: string }) =>
    request<{ token: string }>("/admin/login", { method: "POST", body: credentials }),
  adminLeads: (token: string, query = "") =>
    request<{ data: NexaraLead[] }>(`/admin/leads${query}`, { token }),
  deleteLead: (token: string, id: string) =>
    request<{ data: { id: string } }>(`/admin/leads/${encodeURIComponent(id)}`, { method: "DELETE", token }),
  publicPages: () => request<{ data: NexaraPage[] }>("/pages"),
  publicPage: (slug: string) => request<{ data: NexaraPage }>(`/pages/${encodeURIComponent(slug)}`),
  publicPlans: () => request<{ data: NexaraPlan[] }>("/plans"),
  publicDocuments: () => request<{ data: NexaraDocument[] }>("/docs"),
  publicDocument: (slug: string) => request<{ data: NexaraDocument }>(`/docs/${encodeURIComponent(slug)}`),
  adminPages: (token: string) => request<{ data: NexaraPage[] }>("/admin/pages", { token }),
  createPage: (token: string, page: Omit<NexaraPage, "id" | "updatedAt">) =>
    request<{ data: NexaraPage }>("/admin/pages", { method: "POST", body: page, token }),
  updatePage: (token: string, id: string, page: Omit<NexaraPage, "id" | "updatedAt">) =>
    request<{ data: NexaraPage }>(`/admin/pages/${encodeURIComponent(id)}`, { method: "PATCH", body: page, token }),
  deletePage: (token: string, id: string) =>
    request<{ data: { id: string } }>(`/admin/pages/${encodeURIComponent(id)}`, { method: "DELETE", token }),
  adminPlans: (token: string) => request<{ data: NexaraPlan[] }>("/admin/plans", { token }),
  createPlan: (token: string, plan: Omit<NexaraPlan, "id" | "updatedAt">) =>
    request<{ data: NexaraPlan }>("/admin/plans", { method: "POST", body: plan, token }),
  updatePlan: (token: string, id: string, plan: Omit<NexaraPlan, "id" | "updatedAt">) =>
    request<{ data: NexaraPlan }>(`/admin/plans/${encodeURIComponent(id)}`, { method: "PATCH", body: plan, token }),
  deletePlan: (token: string, id: string) =>
    request<{ data: { id: string } }>(`/admin/plans/${encodeURIComponent(id)}`, { method: "DELETE", token }),
  adminDocuments: (token: string) => request<{ data: NexaraDocument[] }>("/admin/docs", { token }),
  uploadDocument: (token: string, document: Omit<NexaraDocument, "id" | "createdAt">) =>
    request<{ data: NexaraDocument }>("/admin/docs", { method: "POST", body: document, token }),
  deleteDocument: (token: string, id: string) =>
    request<{ data: { id: string } }>(`/admin/docs/${encodeURIComponent(id)}`, { method: "DELETE", token }),
  adminAnalytics: (token: string) => request<{ data: NexaraAdminAnalytics }>("/admin/analytics", { token }),
  adminAgents: (token: string) => request<{ data: NexaraAgent[] }>("/admin/agents", { token }),
  createAgent: (token: string, agent: Omit<NexaraAgent, "id" | "createdAt" | "updatedAt">) =>
    request<{ data: NexaraAgent }>("/admin/agents", { method: "POST", body: agent, token }),
  updateAgent: (token: string, id: string, agent: Omit<NexaraAgent, "id" | "createdAt" | "updatedAt">) =>
    request<{ data: NexaraAgent }>(`/admin/agents/${encodeURIComponent(id)}`, { method: "PATCH", body: agent, token }),
  deleteAgent: (token: string, id: string) =>
    request<{ data: { id: string } }>(`/admin/agents/${encodeURIComponent(id)}`, { method: "DELETE", token }),
  adminWorkflows: (token: string) => request<{ data: NexaraWorkflow[] }>("/admin/workflows", { token }),
  createWorkflow: (token: string, workflow: Omit<NexaraWorkflow, "id" | "createdAt" | "updatedAt">) =>
    request<{ data: NexaraWorkflow }>("/admin/workflows", { method: "POST", body: workflow, token }),
  updateWorkflow: (token: string, id: string, workflow: Omit<NexaraWorkflow, "id" | "createdAt" | "updatedAt">) =>
    request<{ data: NexaraWorkflow }>(`/admin/workflows/${encodeURIComponent(id)}`, { method: "PATCH", body: workflow, token }),
  deleteWorkflow: (token: string, id: string) =>
    request<{ data: { id: string } }>(`/admin/workflows/${encodeURIComponent(id)}`, { method: "DELETE", token }),
  adminIntegrations: (token: string) => request<{ data: NexaraIntegration[] }>("/admin/integrations", { token }),
  createIntegration: (token: string, integration: Omit<NexaraIntegration, "id" | "createdAt" | "updatedAt">) =>
    request<{ data: NexaraIntegration }>("/admin/integrations", { method: "POST", body: integration, token }),
  updateIntegration: (token: string, id: string, integration: Omit<NexaraIntegration, "id" | "createdAt" | "updatedAt">) =>
    request<{ data: NexaraIntegration }>(`/admin/integrations/${encodeURIComponent(id)}`, { method: "PATCH", body: integration, token }),
  deleteIntegration: (token: string, id: string) =>
    request<{ data: { id: string } }>(`/admin/integrations/${encodeURIComponent(id)}`, { method: "DELETE", token }),
  adminUsers: (token: string) => request<{ data: AdminUser[] }>("/admin/users", { token }),
  updateUser: (token: string, id: string, user: Pick<AdminUser, "name" | "email">) =>
    request<{ data: AdminUser }>(`/admin/users/${encodeURIComponent(id)}`, { method: "PATCH", body: user, token }),
  deleteUser: (token: string, id: string) =>
    request<{ data: { id: string } }>(`/admin/users/${encodeURIComponent(id)}`, { method: "DELETE", token }),
  updateLead: (token: string, id: string, changes: { status: NexaraLead["status"]; response?: string }) =>
    request<{ data: NexaraLead }>(`/admin/leads/${encodeURIComponent(id)}`, { method: "PATCH", body: changes, token }),
};

export const getUserToken = () => typeof window === "undefined" ? null : localStorage.getItem(USER_TOKEN_KEY);
export const setUserToken = (token: string | null) => {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(USER_TOKEN_KEY, token);
  else localStorage.removeItem(USER_TOKEN_KEY);
};
export const getAdminToken = () => typeof window === "undefined" ? null : localStorage.getItem(ADMIN_TOKEN_KEY);
export const setAdminToken = (token: string | null) => {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token);
  else localStorage.removeItem(ADMIN_TOKEN_KEY);
};
