"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getAdminToken,
  NexaraApiError,
  nexaraApi,
  setAdminToken,
  type NexaraLead,
  type NexaraDocument,
  type NexaraPage,
  type NexaraPlan,
  type NexaraUser,
  type NexaraAgent,
  type NexaraWorkflow,
  type NexaraIntegration,
  type NexaraAdminAnalytics,
} from "../../services/nexara-api";
import { Activity, ArrowRight, ArrowUpRight, BookOpen, Boxes, Bot, FileText, Inbox, LayoutDashboard, LogOut, Plug, Plus, RefreshCw, Search, Settings, UsersRound, Workflow, type LucideIcon } from "lucide-react";
import "./admin.css";

type AdminSection = "overview" | "agents" | "workflows" | "integrations" | "pages" | "plans" | "leads" | "users" | "docs" | "analytics" | "settings";
type RecordEditor = { section: "pages" | "plans"; id: string | null; json: string } | null;
type CatalogSection = "agents" | "workflows" | "integrations";
type CatalogRecord = NexaraAgent | NexaraWorkflow | NexaraIntegration;
type CatalogDraft = {
  section: CatalogSection;
  id: string | null;
  slug: string;
  name: string;
  description: string;
  team: string;
  mode: string;
  trigger: string;
  steps: string;
  category: string;
};
const leadStatuses: NexaraLead["status"][] = ["new", "contacted", "qualified", "closed"];
const sections: { id: AdminSection; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "agents", label: "AI agents", icon: Bot },
  { id: "workflows", label: "Workflows", icon: Workflow },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "leads", label: "Inquiries", icon: Inbox },
  { id: "pages", label: "Website pages", icon: FileText },
  { id: "plans", label: "Plans & pricing", icon: Boxes },
  { id: "users", label: "Customers", icon: UsersRound },
  { id: "docs", label: "Documentation", icon: BookOpen },
  { id: "analytics", label: "Analytics", icon: Activity },
  { id: "settings", label: "Settings", icon: Settings },
];
const apiSections: AdminSection[] = ["pages", "plans", "leads", "users", "docs"];
const catalogSections: CatalogSection[] = ["agents", "workflows", "integrations"];
const sectionCopy: Record<AdminSection, { eyebrow: string; description: string }> = {
  overview: { eyebrow: "WORKSPACE AT A GLANCE", description: "Monitor your website, customers, and incoming inquiries." },
  agents: { eyebrow: "AGENT DEFINITIONS", description: "Manage agent catalog records stored by the connected API. Records do not execute AI tasks." },
  workflows: { eyebrow: "WORKFLOW DEFINITIONS", description: "Manage workflow patterns stored by the connected API. Execution is not configured." },
  integrations: { eyebrow: "INTEGRATION CATALOG", description: "Manage provider metadata. OAuth authorization and live connections are separate." },
  leads: { eyebrow: "CUSTOMER CONVERSATIONS", description: "Manage inquiries and send responses to customers through the API." },
  pages: { eyebrow: "WEBSITE CONTENT", description: "Create, update, and publish website pages through the API." },
  plans: { eyebrow: "PRICING MANAGEMENT", description: "Manage the pricing plans published on your website through the API." },
  users: { eyebrow: "CUSTOMER ACCOUNTS", description: "Review and update customer accounts through the API." },
  docs: { eyebrow: "PRODUCT DOCUMENTATION", description: "Publish or remove product guides using the connected API." },
  analytics: { eyebrow: "LIVE ACCOUNT METRICS", description: "Counts and seven-day saved-record activity are loaded from your API." },
  settings: { eyebrow: "WORKSPACE SETTINGS", description: "This preview does not expose server or account configuration controls." },
};

function isPage(value: unknown): value is Omit<NexaraPage, "id" | "updatedAt"> {
  if (!value || typeof value !== "object") return false;
  const page = value as Record<string, unknown>;
  return typeof page.slug === "string" && typeof page.title === "string"
    && typeof page.eyebrow === "string" && typeof page.description === "string"
    && typeof page.showInNavigation === "boolean" && Array.isArray(page.sections);
}

function isPlan(value: unknown): value is Omit<NexaraPlan, "id" | "updatedAt"> {
  if (!value || typeof value !== "object") return false;
  const plan = value as Record<string, unknown>;
  if (typeof plan.price !== "object" || !plan.price) return false;
  const price = plan.price as Record<string, unknown>;
  return typeof plan.slug === "string" && typeof plan.name === "string"
    && typeof plan.description === "string" && typeof plan.cta === "string"
    && typeof plan.popular === "boolean" && Array.isArray(plan.features)
    && typeof price.monthly === "number" && typeof price.annual === "number";
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [section, setSection] = useState<AdminSection>("overview");
  const [pages, setPages] = useState<NexaraPage[]>([]);
  const [plans, setPlans] = useState<NexaraPlan[]>([]);
  const [leads, setLeads] = useState<NexaraLead[]>([]);
  const [leadResponses, setLeadResponses] = useState<Record<string, string>>({});
  const [users, setUsers] = useState<NexaraUser[]>([]);
  const [documents, setDocuments] = useState<NexaraDocument[]>([]);
  const [agents, setAgents] = useState<NexaraAgent[]>([]);
  const [workflows, setWorkflows] = useState<NexaraWorkflow[]>([]);
  const [integrations, setIntegrations] = useState<NexaraIntegration[]>([]);
  const [analytics, setAnalytics] = useState<NexaraAdminAnalytics | null>(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentDescription, setDocumentDescription] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const documentFormRef = useRef<HTMLFormElement>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editor, setEditor] = useState<RecordEditor>(null);
  const [catalogEditor, setCatalogEditor] = useState<CatalogDraft | null>(null);
  const [userEditor, setUserEditor] = useState<NexaraUser | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);

  const loadSection = useCallback(async (adminToken: string) => {
    setLoading(true);
    setError("");
    try {
    if (section === "overview" || section === "analytics") {
      const [nextPages, nextPlans, nextLeads, nextUsers, nextDocuments, nextAnalytics] = await Promise.all([
        nexaraApi.adminPages(adminToken),
        nexaraApi.adminPlans(adminToken),
        nexaraApi.adminLeads(adminToken),
        nexaraApi.adminUsers(adminToken),
        nexaraApi.adminDocuments(adminToken),
        nexaraApi.adminAnalytics(adminToken),
      ]);
      setPages(nextPages.data);
      setPlans(nextPlans.data);
      setLeads(nextLeads.data);
      setUsers(nextUsers.data);
      setDocuments(nextDocuments.data);
      setAnalytics(nextAnalytics.data);
    }
    if (section === "pages") setPages((await nexaraApi.adminPages(adminToken)).data);
      if (section === "plans") setPlans((await nexaraApi.adminPlans(adminToken)).data);
      if (section === "leads") {
        const query = new URLSearchParams();
        if (search.trim()) query.set("search", search.trim());
        if (statusFilter !== "all") query.set("status", statusFilter);
        setLeads((await nexaraApi.adminLeads(adminToken, query.size ? `?${query}` : "")).data);
      }
      if (section === "users") setUsers((await nexaraApi.adminUsers(adminToken)).data);
      if (section === "docs") setDocuments((await nexaraApi.adminDocuments(adminToken)).data);
      if (section === "agents") setAgents((await nexaraApi.adminAgents(adminToken)).data);
      if (section === "workflows") setWorkflows((await nexaraApi.adminWorkflows(adminToken)).data);
      if (section === "integrations") setIntegrations((await nexaraApi.adminIntegrations(adminToken)).data);
      if (section === "overview" || section === "analytics" || apiSections.includes(section) || catalogSections.some((catalogSection) => catalogSection === section)) setApiConnected(true);
      setLastUpdated(new Date());
    } catch (requestError) {
      setApiConnected(false);
      setError(requestError instanceof Error ? requestError.message : "Could not load records.");
      if (requestError instanceof NexaraApiError && requestError.status === 401) {
        setAdminToken(null);
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  }, [section, search, statusFilter]);

  useEffect(() => {
    const savedToken = getAdminToken();
    if (savedToken) setToken(savedToken);
    setAuthReady(true);
  }, []);

  useEffect(() => {
    if (token) void loadSection(token);
  }, [token, loadSection]);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await nexaraApi.adminLogin({ email, password });
      setAdminToken(result.token);
      setToken(result.token);
      setPassword("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not sign in.");
    } finally {
      setLoading(false);
    }
  }

  function startCreateRecord(type: "pages" | "plans") {
    const blank = type === "pages"
      ? { slug: "", title: "", eyebrow: "", description: "", showInNavigation: false, sections: [] }
      : { slug: "", name: "", description: "", price: { monthly: 0, annual: 0 }, features: [], cta: "", popular: false };
    setEditor({ section: type, id: null, json: JSON.stringify(blank, null, 2) });
  }

  function startEditRecord(type: "pages" | "plans", record: NexaraPage | NexaraPlan) {
    const { id, updatedAt, ...content } = record;
    void updatedAt;
    setEditor({ section: type, id, json: JSON.stringify(content, null, 2) });
  }

  function startCreateCatalog(type: CatalogSection) {
    setCatalogEditor({
      section: type,
      id: null,
      slug: "",
      name: "",
      description: "",
      team: "",
      mode: "",
      trigger: "",
      steps: "",
      category: "",
    });
  }

  function startEditCatalog(type: CatalogSection, record: CatalogRecord) {
    setCatalogEditor({
      section: type,
      id: record.id,
      slug: record.slug,
      name: record.name,
      description: record.description,
      team: "team" in record ? record.team : "",
      mode: "mode" in record ? record.mode : "",
      trigger: "trigger" in record ? record.trigger : "",
      steps: "steps" in record ? record.steps.join("\n") : "",
      category: "category" in record ? record.category : "",
    });
  }

  function updateCatalogDraft<K extends keyof CatalogDraft>(key: K, value: CatalogDraft[K]) {
    setCatalogEditor((current) => current ? { ...current, [key]: value } : current);
  }

  async function saveCatalog(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !catalogEditor) return;
    setLoading(true);
    setError("");
    try {
      const common = {
        slug: catalogEditor.slug,
        name: catalogEditor.name,
        description: catalogEditor.description,
      };
      if (catalogEditor.section === "agents") {
        const record = { ...common, team: catalogEditor.team, mode: catalogEditor.mode };
        if (catalogEditor.id) await nexaraApi.updateAgent(token, catalogEditor.id, record);
        else await nexaraApi.createAgent(token, record);
      } else if (catalogEditor.section === "workflows") {
        const record = { ...common, trigger: catalogEditor.trigger, steps: catalogEditor.steps.split("\n").map((step) => step.trim()).filter(Boolean) };
        if (catalogEditor.id) await nexaraApi.updateWorkflow(token, catalogEditor.id, record);
        else await nexaraApi.createWorkflow(token, record);
      } else {
        const record = { ...common, category: catalogEditor.category };
        if (catalogEditor.id) await nexaraApi.updateIntegration(token, catalogEditor.id, record);
        else await nexaraApi.createIntegration(token, record);
      }
      setCatalogEditor(null);
      await loadSection(token);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not save this catalog record.");
    } finally {
      setLoading(false);
    }
  }

  async function saveRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !editor) return;
    setLoading(true);
    setError("");
    try {
      const value: unknown = JSON.parse(editor.json);
      if (editor.section === "pages") {
        if (!isPage(value)) throw new Error("Page JSON must include slug, title, eyebrow, description, showInNavigation, and sections.");
        if (editor.id) await nexaraApi.updatePage(token, editor.id, value);
        else await nexaraApi.createPage(token, value);
      } else {
        if (!isPlan(value)) throw new Error("Plan JSON must include slug, name, description, price, features, cta, and popular.");
        if (editor.id) await nexaraApi.updatePlan(token, editor.id, value);
        else await nexaraApi.createPlan(token, value);
      }
      setEditor(null);
      await loadSection(token);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not save this record.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteRecord(type: "pages" | "plans" | "leads" | "users" | "docs" | CatalogSection, id: string) {
    if (!token || !window.confirm("Delete this record? This cannot be undone.")) return;
    setError("");
    try {
      if (type === "pages") await nexaraApi.deletePage(token, id);
      if (type === "plans") await nexaraApi.deletePlan(token, id);
      if (type === "leads") await nexaraApi.deleteLead(token, id);
      if (type === "users") await nexaraApi.deleteUser(token, id);
      if (type === "docs") await nexaraApi.deleteDocument(token, id);
      if (type === "agents") await nexaraApi.deleteAgent(token, id);
      if (type === "workflows") await nexaraApi.deleteWorkflow(token, id);
      if (type === "integrations") await nexaraApi.deleteIntegration(token, id);
      await loadSection(token);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not delete the record.");
    }
  }

  async function uploadDocument(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !documentFile) return;
    setLoading(true);
    setError("");
    try {
      const extension = documentFile.name.slice(documentFile.name.lastIndexOf(".")).toLowerCase();
      const contentType: NexaraDocument["contentType"] | "" = extension === ".pdf" ? "application/pdf"
        : extension === ".txt" ? "text/plain"
          : extension === ".md" || extension === ".markdown" ? "text/markdown" : "";
      if (!contentType) throw new Error("Choose a PDF, TXT, or Markdown file.");
      const bytes = new Uint8Array(await documentFile.arrayBuffer());
      let binary = "";
      for (let index = 0; index < bytes.length; index += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
      }
      const slug = documentTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      await nexaraApi.uploadDocument(token, {
        slug,
        title: documentTitle.trim(),
        description: documentDescription.trim(),
        filename: documentFile.name,
        contentType,
        contentBase64: btoa(binary),
      });
      setDocumentTitle("");
      setDocumentDescription("");
      setDocumentFile(null);
      documentFormRef.current?.reset();
      await loadSection(token);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not upload this document.");
      setLoading(false);
    }
  }

  async function updateLeadStatus(id: string, nextStatus: NexaraLead["status"]) {
    if (!token) return;
    try {
      await nexaraApi.updateLead(token, id, { status: nextStatus });
      await loadSection(token);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not update inquiry.");
    }
  }

  async function sendLeadResponse(lead: NexaraLead) {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      await nexaraApi.updateLead(token, lead.id, {
        status: lead.status === "new" ? "contacted" : lead.status,
        response: leadResponses[lead.id] ?? lead.response ?? "",
      });
      setLeadResponses((current) => {
        const next = { ...current };
        delete next[lead.id];
        return next;
      });
      await loadSection(token);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not send this response.");
      setLoading(false);
    }
  }

  async function saveUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !userEditor) return;
    try {
      await nexaraApi.updateUser(token, userEditor.id, { name: userEditor.name, email: userEditor.email });
      setUserEditor(null);
      await loadSection(token);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not update user.");
    }
  }

  if (!authReady) {
    return <main className="nexara-admin-login"><div className="nexara-admin-login-card nexara-admin-loading"><span className="nexara-admin-brand-mark">N</span><p className="nexara-admin-eyebrow">SECURE ADMINISTRATION</p><p>Opening your workspace…</p></div></main>;
  }

  if (!token) {
    return <main className="nexara-admin-login"><form className="nexara-admin-login-card" onSubmit={signIn}>
      <a className="nexara-admin-brand" href="/"><span className="nexara-admin-brand-mark">N</span><span>NEXARA <small>CONTROL CENTER</small></span></a>
      <div className="nexara-admin-login-icon"><LayoutDashboard size={23} /></div>
      <p className="nexara-admin-eyebrow">SECURE ADMINISTRATION</p><h1>Welcome back</h1><p className="nexara-admin-login-copy">Sign in to manage your website, review customer inquiries, and update your content.</p>
      <label>Email<input autoComplete="username" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <label>Password<input autoComplete="current-password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      {error && <p className="nexara-admin-error" role="alert">{error}</p>}
      <button type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
      <a className="nexara-admin-back" href="/">Back to website</a>
    </form></main>;
  }

  const sectionName = sections.find((item) => item.id === section)?.label ?? "Overview";
  const newInquiries = leads.filter((lead) => lead.status === "new").length;
  const sectionRecordCount = section === "leads" ? leads.length
    : section === "pages" ? pages.length
      : section === "plans" ? plans.length
        : section === "users" ? users.length
          : section === "docs" ? documents.length
            : section === "agents" ? agents.length
              : section === "workflows" ? workflows.length
                : section === "integrations" ? integrations.length : null;
  const maxActivity = Math.max(1, ...(analytics?.activity.map((item) => item.count) ?? [0]));
  const recentActivity = [
    ...leads.map((lead) => ({ id: lead.id, title: lead.company || lead.name, detail: `Inquiry · ${lead.email}`, date: lead.createdAt, kind: "Conversation" })),
    ...documents.map((document) => ({ id: document.id, title: document.title, detail: `Published guide · ${document.filename}`, date: document.createdAt, kind: "Documentation" })),
  ].sort((first, second) => new Date(second.date).getTime() - new Date(first.date).getTime()).slice(0, 6);
  return <main className="nexara-admin">
    <aside className="nexara-admin-sidebar">
      <a className="nexara-admin-brand" href="/"><span className="nexara-admin-brand-mark">N</span><span>NEXARA <small>CONTROL CENTER</small></span></a>
      <p className="nexara-admin-nav-label">WORKSPACE</p>
      <nav className="nexara-admin-nav" aria-label="Admin sections">{sections.map(({ id, label, icon: Icon }) => <button type="button" key={id} className={section === id ? "active" : ""} onClick={() => { setSection(id); setEditor(null); setCatalogEditor(null); setUserEditor(null); }}><Icon size={17} />{label}{id === "leads" && newInquiries > 0 && <span className="nexara-admin-nav-count">{newInquiries}</span>}</button>)}</nav>
      <div className="nexara-admin-sidebar-bottom"><span className={`nexara-admin-online ${apiConnected ? "connected" : "disconnected"}`}><i />{apiConnected ? "API connected" : loading ? "Checking API…" : "API not verified"}</span><a href="/" className="nexara-admin-site-link"><ArrowUpRight size={15} /> View website</a></div>
    </aside>
    <div className="nexara-admin-main">
    <header className="nexara-admin-header">
      <div><p className="nexara-admin-breadcrumb">Nexara <span>/</span> Admin <span>/</span> {sectionName}</p><h1>{sectionName}</h1></div>
      <div className="nexara-admin-top-actions">{lastUpdated && <span className="nexara-admin-updated">Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>}<button type="button" className="nexara-admin-refresh" onClick={() => token && void loadSection(token)} disabled={loading}><RefreshCw size={15} className={loading ? "nexara-admin-spinning" : ""} /> Refresh</button><button type="button" className="nexara-admin-logout" onClick={() => { setAdminToken(null); setToken(null); }}><LogOut size={15} /> Sign out</button></div>
    </header>
    <section className="nexara-admin-content">
      <div className="nexara-admin-title"><div><p className="nexara-admin-eyebrow">{sectionCopy[section].eyebrow}</p><p>{sectionCopy[section].description}</p></div>{sectionRecordCount !== null && <span className="nexara-admin-count">{sectionRecordCount} records</span>}</div>
      {section === "overview" && <section className="nexara-admin-hero"><div><span className="nexara-admin-hero-kicker">NEXARA WORKFLOW INTELLIGENCE</span><h2>Make team knowledge useful, everywhere.</h2><p>Bring your tools, trusted information, and people together to build AI-assisted workflows with clear oversight.</p><div className="nexara-admin-hero-actions"><button type="button" onClick={() => setSection("agents")}>Manage agent catalog <ArrowRight size={14} /></button><button type="button" onClick={() => setSection("workflows")}>Manage workflows</button></div></div><div className="nexara-admin-hero-points"><span><i>01</i><b>Connect knowledge</b><small>Work from approved sources</small></span><span><i>02</i><b>Coordinate the work</b><small>Keep tasks moving across tools</small></span><span><i>03</i><b>Keep people in control</b><small>Review important decisions</small></span></div></section>}
      {section === "overview" && <div className="nexara-admin-metrics">
        <article className="nexara-admin-metric"><span className="nexara-admin-metric-icon violet"><Inbox size={18} /></span><span className="nexara-admin-metric-label">Total inquiries</span><strong>{leads.length}</strong><small>Messages received through your website</small></article>
        <article className="nexara-admin-metric"><span className="nexara-admin-metric-icon amber"><Activity size={18} /></span><span className="nexara-admin-metric-label">Needs attention</span><strong>{newInquiries}</strong><small>New inquiries awaiting a response</small></article>
        <article className="nexara-admin-metric"><span className="nexara-admin-metric-icon blue"><FileText size={18} /></span><span className="nexara-admin-metric-label">Website pages</span><strong>{pages.length}</strong><small>{pages.filter((page) => page.showInNavigation).length} shown in site navigation</small></article>
        <article className="nexara-admin-metric"><span className="nexara-admin-metric-icon green"><UsersRound size={18} /></span><span className="nexara-admin-metric-label">Customer accounts</span><strong>{users.length}</strong><small>{plans.length} published pricing plans</small></article>
      </div>}
      {section === "overview" && <div className="nexara-admin-overview-grid"><section className="nexara-admin-panel"><div className="nexara-admin-panel-head"><div><h2>Recent inquiries</h2><p>Follow up with visitors who contacted your team.</p></div><button type="button" className="nexara-admin-text-action" onClick={() => setSection("leads")}>All inquiries <ArrowRight size={14} /></button></div><div className="nexara-admin-recent-list">{leads.slice(0, 5).map((lead) => <button type="button" className="nexara-admin-recent-row" key={lead.id} onClick={() => setSection("leads")}><span className="nexara-admin-avatar">{lead.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span><span className="nexara-admin-recent-person"><strong>{lead.name}</strong><small>{lead.email}</small></span><span className={`nexara-admin-status ${lead.status}`}>{lead.status}</span><time>{new Date(lead.createdAt).toLocaleDateString()}</time><ArrowRight size={15} /></button>)}{leads.length === 0 && <p className="nexara-admin-overview-empty">No inquiries yet. New website submissions will appear here.</p>}</div></section><aside className="nexara-admin-panel nexara-admin-quick-panel"><div className="nexara-admin-panel-head"><div><h2>Quick actions</h2><p>Update your site in just a few clicks.</p></div></div><button type="button" onClick={() => { setSection("pages"); startCreateRecord("pages"); }}><span className="nexara-admin-quick-icon violet"><Plus size={16} /></span><span><strong>Create a website page</strong><small>Publish new content to your site</small></span><ArrowRight size={15} /></button><button type="button" onClick={() => { setSection("plans"); startCreateRecord("plans"); }}><span className="nexara-admin-quick-icon green"><Plus size={16} /></span><span><strong>Add a pricing plan</strong><small>Manage your published offers</small></span><ArrowRight size={15} /></button></aside></div>}
      {section !== "overview" && <nav className="nexara-admin-tabs" aria-label="Admin sections">{sections.filter((item) => item.id !== "overview").map(({ id, label, icon: Icon }) => <button type="button" key={id} className={section === id ? "active" : ""} onClick={() => { setSection(id); setEditor(null); setCatalogEditor(null); setUserEditor(null); }}><Icon size={15} />{label}</button>)}</nav>}
      {apiSections.includes(section) && <div className="nexara-admin-filters">
        {section === "leads" && <div className="nexara-admin-search"><Search size={16} /><input aria-label="Search inquiries" placeholder="Search name, email, company…" value={search} onChange={(event) => setSearch(event.target.value)} /><select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option>{leadStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></div>}
        {section === "docs" && <span className="nexara-admin-filter-copy">Upload a PDF, TXT, or Markdown guide (up to 2 MB). Published documents appear on the website docs page.</span>}
        {["pages", "plans"].includes(section) && <button className="nexara-admin-primary-action" type="button" onClick={() => startCreateRecord(section as "pages" | "plans")}><Plus size={16} /> Create {section === "pages" ? "page" : "plan"}</button>}
        </div>}
      {error && <p className="nexara-admin-error" role="alert">{error}</p>}
      {section === "agents" && <section className="nexara-admin-preview-page">
        <div className="nexara-admin-preview-heading"><div><p className="nexara-admin-eyebrow">AGENT DEFINITIONS</p><h2>AI agent catalog</h2></div><p>Catalog metadata is API-backed. Saving a definition does not configure or run an AI agent.</p><button className="nexara-admin-primary-action" type="button" onClick={() => startCreateCatalog("agents")}><Plus size={16} /> Add agent</button></div>
        {catalogEditor?.section === "agents" && <form className="nexara-admin-editor nexara-admin-catalog-editor" onSubmit={saveCatalog}>
          <h2>{catalogEditor.id ? "Edit agent" : "Create agent"}</h2>
          <label>Slug<input required maxLength={120} value={catalogEditor.slug} onChange={(event) => updateCatalogDraft("slug", event.target.value)} placeholder="support-triage" /></label>
          <label>Name<input required maxLength={120} value={catalogEditor.name} onChange={(event) => updateCatalogDraft("name", event.target.value)} /></label>
          <label>Description<textarea required maxLength={1000} rows={3} value={catalogEditor.description} onChange={(event) => updateCatalogDraft("description", event.target.value)} /></label>
          <label>Team<input required maxLength={100} value={catalogEditor.team} onChange={(event) => updateCatalogDraft("team", event.target.value)} /></label>
          <label>Operating mode<input required maxLength={100} value={catalogEditor.mode} onChange={(event) => updateCatalogDraft("mode", event.target.value)} placeholder="Human review" /></label>
          <div><button type="submit" disabled={loading}>Save agent</button><button type="button" onClick={() => setCatalogEditor(null)}>Cancel</button></div>
        </form>}
        <div className="nexara-admin-preview-grid">{agents.map((agent) => <article className="nexara-admin-preview-card" key={agent.id}>
          <div className="nexara-admin-preview-card-head"><span className="nexara-admin-preview-icon"><Bot size={17} /></span><span className="nexara-admin-preview-badge">Catalog record</span></div>
          <h3>{agent.name}</h3><p>{agent.description}</p><div className="nexara-admin-preview-meta"><span>{agent.team}</span><span>{agent.mode}</span><span>/{agent.slug}</span></div>
          <div className="nexara-admin-catalog-card-actions"><button type="button" onClick={() => startEditCatalog("agents", agent)}>Edit</button><button type="button" onClick={() => void deleteRecord("agents", agent.id)}>Delete</button></div>
        </article>)}{!loading && agents.length === 0 && <p className="nexara-admin-overview-empty">No agent definitions yet. Add one to create the first catalog record.</p>}</div>
      </section>}
      {section === "workflows" && <section className="nexara-admin-preview-page">
        <div className="nexara-admin-preview-heading"><div><p className="nexara-admin-eyebrow">WORKFLOW DEFINITIONS</p><h2>Workflow catalog</h2></div><p>Saved workflow patterns are metadata only; this API does not execute workflow steps.</p><button className="nexara-admin-primary-action" type="button" onClick={() => startCreateCatalog("workflows")}><Plus size={16} /> Add workflow</button></div>
        {catalogEditor?.section === "workflows" && <form className="nexara-admin-editor nexara-admin-catalog-editor" onSubmit={saveCatalog}>
          <h2>{catalogEditor.id ? "Edit workflow" : "Create workflow"}</h2>
          <label>Slug<input required maxLength={120} value={catalogEditor.slug} onChange={(event) => updateCatalogDraft("slug", event.target.value)} placeholder="support-request-triage" /></label>
          <label>Name<input required maxLength={120} value={catalogEditor.name} onChange={(event) => updateCatalogDraft("name", event.target.value)} /></label>
          <label>Description<textarea required maxLength={1000} rows={3} value={catalogEditor.description} onChange={(event) => updateCatalogDraft("description", event.target.value)} /></label>
          <label>Trigger<input required maxLength={200} value={catalogEditor.trigger} onChange={(event) => updateCatalogDraft("trigger", event.target.value)} placeholder="New support request" /></label>
          <label>Steps (one per line)<textarea required maxLength={2000} rows={5} value={catalogEditor.steps} onChange={(event) => updateCatalogDraft("steps", event.target.value)} placeholder={"Classify urgency\nFind approved guidance\nRequest human review"} /></label>
          <div><button type="submit" disabled={loading}>Save workflow</button><button type="button" onClick={() => setCatalogEditor(null)}>Cancel</button></div>
        </form>}
        <div className="nexara-admin-preview-grid">{workflows.map((workflow) => <article className="nexara-admin-preview-card" key={workflow.id}>
          <div className="nexara-admin-preview-card-head"><span className="nexara-admin-preview-icon"><Workflow size={17} /></span><span className="nexara-admin-preview-badge">Catalog record</span></div>
          <h3>{workflow.name}</h3><p>{workflow.description}</p><div className="nexara-admin-preview-meta"><span>Starts when: {workflow.trigger}</span><span>/{workflow.slug}</span></div>
          <div className="nexara-admin-workflow-steps">{workflow.steps.map((step, index) => <div key={`${workflow.id}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><b>{step}</b></div>)}</div>
          <div className="nexara-admin-catalog-card-actions"><button type="button" onClick={() => startEditCatalog("workflows", workflow)}>Edit</button><button type="button" onClick={() => void deleteRecord("workflows", workflow.id)}>Delete</button></div>
        </article>)}{!loading && workflows.length === 0 && <p className="nexara-admin-overview-empty">No workflow definitions yet. Add one to create the first catalog record.</p>}</div>
      </section>}
      {section === "integrations" && <section className="nexara-admin-preview-page">
        <div className="nexara-admin-preview-heading"><div><p className="nexara-admin-eyebrow">INTEGRATION CATALOG</p><h2>Provider directory</h2></div><p>These records describe providers only. OAuth authorization and live integration connections are not included.</p><button className="nexara-admin-primary-action" type="button" onClick={() => startCreateCatalog("integrations")}><Plus size={16} /> Add provider</button></div>
        {catalogEditor?.section === "integrations" && <form className="nexara-admin-editor nexara-admin-catalog-editor" onSubmit={saveCatalog}>
          <h2>{catalogEditor.id ? "Edit provider" : "Create provider"}</h2>
          <label>Slug<input required maxLength={120} value={catalogEditor.slug} onChange={(event) => updateCatalogDraft("slug", event.target.value)} placeholder="google-drive" /></label>
          <label>Name<input required maxLength={120} value={catalogEditor.name} onChange={(event) => updateCatalogDraft("name", event.target.value)} /></label>
          <label>Description<textarea required maxLength={1000} rows={3} value={catalogEditor.description} onChange={(event) => updateCatalogDraft("description", event.target.value)} /></label>
          <label>Category<input required maxLength={100} value={catalogEditor.category} onChange={(event) => updateCatalogDraft("category", event.target.value)} placeholder="Knowledge" /></label>
          <div><button type="submit" disabled={loading}>Save provider</button><button type="button" onClick={() => setCatalogEditor(null)}>Cancel</button></div>
        </form>}
        <div className="nexara-admin-integration-grid">{integrations.map((integration) => <article className="nexara-admin-preview-card nexara-admin-integration-card" key={integration.id}>
          <span className="nexara-admin-preview-icon"><Plug size={17} /></span><div><h3>{integration.name}</h3><p>{integration.description}</p><div className="nexara-admin-preview-meta"><span>{integration.category}</span><span>/{integration.slug}</span></div></div>
          <div className="nexara-admin-catalog-card-actions"><button type="button" onClick={() => startEditCatalog("integrations", integration)}>Edit</button><button type="button" onClick={() => void deleteRecord("integrations", integration.id)}>Delete</button></div>
        </article>)}{!loading && integrations.length === 0 && <p className="nexara-admin-overview-empty">No integration providers yet. Add one to create the first catalog record.</p>}</div>
      </section>}
      {section === "analytics" && <section className="nexara-admin-preview-page">
        <div className="nexara-admin-preview-heading"><div><p className="nexara-admin-eyebrow">LIVE ACCOUNT METRICS</p><h2>Signals from your workspace</h2></div><p>Totals and saved-record activity are read from the API; this does not represent agent or workflow executions.</p></div>
        <div className="nexara-admin-analytics-grid">
          <article><span>Total inquiries</span><strong>{analytics?.totals.leads ?? "—"}</strong><small>Stored inquiry records</small></article>
          <article><span>Needs attention</span><strong>{newInquiries}</strong><small>New inquiries</small></article>
          <article><span>Customers</span><strong>{analytics?.totals.users ?? "—"}</strong><small>Registered accounts</small></article>
          <article><span>Published documents</span><strong>{analytics?.totals.documents ?? "—"}</strong><small>Documentation records</small></article>
          <article><span>Website pages</span><strong>{analytics?.totals.pages ?? "—"}</strong><small>Managed page records</small></article>
          <article><span>Pricing plans</span><strong>{analytics?.totals.plans ?? "—"}</strong><small>Managed plan records</small></article>
          <article><span>Agent definitions</span><strong>{analytics?.totals.agents ?? "—"}</strong><small>Catalog metadata</small></article>
          <article><span>Workflow definitions</span><strong>{analytics?.totals.workflows ?? "—"}</strong><small>Catalog metadata</small></article>
          <article><span>Integration providers</span><strong>{analytics?.totals.integrations ?? "—"}</strong><small>Provider metadata</small></article>
        </div>
        <div className="nexara-admin-analytics-panels">
          <section className="nexara-admin-panel"><div className="nexara-admin-panel-head"><div><h2>Saved-record activity</h2><p>Creations and content updates during the last seven days.</p></div></div>
            <div className="nexara-admin-demo-chart"><div className="nexara-admin-demo-chart-bars" aria-label="Saved-record activity over the last seven days">{analytics?.activity.map(({ date, count }) => <span key={date} title={`${count} saved records`} style={{ height: count ? `${Math.max(4, count / maxActivity * 100)}%` : "0%" }} />)}</div>
              <div className="nexara-admin-demo-chart-labels">{analytics?.activity.map(({ date }) => <span key={date}>{new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, { weekday: "short" })}</span>)}</div>
              <p>Counts include new inquiries, accounts, documents, and catalog records, plus page and plan updates. They do not measure AI execution.</p>
            </div>
          </section>
          <section className="nexara-admin-panel"><div className="nexara-admin-panel-head"><div><h2>Recent API activity</h2><p>Latest inquiries and published guides.</p></div></div>{recentActivity.length ? <div className="nexara-admin-live-activity">{recentActivity.map((item) => <article key={`${item.kind}-${item.id}`}><span className="nexara-admin-live-dot" /><div><b>{item.title}</b><p>{item.kind} · {item.detail}</p></div><time>{new Date(item.date).toLocaleDateString()}</time></article>)}</div> : <p className="nexara-admin-overview-empty">No inquiry or documentation activity yet.</p>}</section>
        </div>
      </section>}
      {section === "settings" && <section className="nexara-admin-preview-page"><div className="nexara-admin-preview-heading"><div><p className="nexara-admin-eyebrow">WORKSPACE SETTINGS</p><h2>Connected API capabilities</h2></div><p>Manage authentication and deployment configuration in the server environment. This page does not expose or change secrets.</p></div><div className="nexara-admin-settings-grid"><article><span className="nexara-admin-preview-icon"><Activity size={17} /></span><span className="nexara-admin-eyebrow">CONNECTED API</span><h3>Authentication and account data</h3><p>Admin sign-in, customer accounts, and inquiry management use authenticated API requests.</p></article><article><span className="nexara-admin-preview-icon"><FileText size={17} /></span><span className="nexara-admin-eyebrow">CONTENT APIS</span><h3>Pages, pricing, and docs</h3><p>Website pages, pricing plans, and uploaded product guides are managed through the connected API.</p></article><article><span className="nexara-admin-preview-icon"><Settings size={17} /></span><span className="nexara-admin-eyebrow">DEPLOYMENT</span><h3>Server-managed configuration</h3><p>API URL, credentials, and production security settings are controlled by deployment environment variables.</p></article></div></section>}
      {editor && <form className="nexara-admin-editor" onSubmit={saveRecord}>
        <h2>{editor.id ? "Edit" : "Create"} {editor.section === "pages" ? "page" : "plan"}</h2>
        <p>Update the record fields as JSON. Page sections contain a title, body, and optional items with title, body, and href.</p>
        <textarea aria-label="Record JSON" spellCheck={false} rows={16} value={editor.json} onChange={(event) => setEditor({ ...editor, json: event.target.value })} />
        <div><button type="submit" disabled={loading}>Save</button><button type="button" onClick={() => setEditor(null)}>Cancel</button></div>
      </form>}
      {userEditor && <form className="nexara-admin-editor" onSubmit={saveUser}>
        <h2>Edit account</h2><label>Name<input required value={userEditor.name} onChange={(event) => setUserEditor({ ...userEditor, name: event.target.value })} /></label>
        <label>Email<input required type="email" value={userEditor.email} onChange={(event) => setUserEditor({ ...userEditor, email: event.target.value })} /></label>
        <div><button type="submit">Save user</button><button type="button" onClick={() => setUserEditor(null)}>Cancel</button></div>
      </form>}
      {section === "docs" && <form className="nexara-admin-editor" ref={documentFormRef} onSubmit={uploadDocument}>
        <h2>Publish a document</h2>
        <label>Document title<input required maxLength={160} value={documentTitle} onChange={(event) => setDocumentTitle(event.target.value)} /></label>
        <label>Short description<input required maxLength={1000} value={documentDescription} onChange={(event) => setDocumentDescription(event.target.value)} /></label>
        <label>Document file<input required type="file" accept=".pdf,.txt,.md,.markdown,application/pdf,text/plain,text/markdown" onChange={(event) => setDocumentFile(event.target.files?.[0] ?? null)} /></label>
        <div><button type="submit" disabled={loading || !documentFile}>Upload and publish</button></div>
      </form>}
      {apiSections.includes(section) && <div className="nexara-admin-table-wrap"><table><thead><tr>
        {section === "pages" && <><th>PAGE</th><th>NAVIGATION</th><th>UPDATED</th><th>ACTIONS</th></>}
        {section === "plans" && <><th>PLAN</th><th>PRICE</th><th>FEATURES</th><th>ACTIONS</th></>}
        {section === "leads" && <><th>CONTACT</th><th>TYPE</th><th>COMPANY / MESSAGE</th><th>RECEIVED</th><th>STATUS</th><th>ACTIONS</th></>}
        {section === "users" && <><th>USER</th><th>CREATED</th><th>ACTIONS</th></>}
        {section === "docs" && <><th>DOCUMENT</th><th>FILE</th><th>PUBLISHED</th><th>ACTIONS</th></>}
      </tr></thead><tbody>
        {section === "pages" && pages.map((page) => <tr key={page.id}><td><strong>{page.title}</strong><span>{page.slug}</span></td><td>{page.showInNavigation ? "Visible" : "Hidden"}</td><td>{new Date(page.updatedAt).toLocaleString()}</td><td><button type="button" onClick={() => startEditRecord("pages", page)}>Edit</button><button type="button" onClick={() => void deleteRecord("pages", page.id)}>Delete</button></td></tr>)}
        {section === "plans" && plans.map((plan) => <tr key={plan.id}><td><strong>{plan.name}</strong><span>{plan.slug}</span></td><td>${plan.price.monthly} / ${plan.price.annual}</td><td>{plan.features.length}</td><td><button type="button" onClick={() => startEditRecord("plans", plan)}>Edit</button><button type="button" onClick={() => void deleteRecord("plans", plan.id)}>Delete</button></td></tr>)}
        {section === "leads" && leads.map((lead) => <tr key={lead.id}><td><strong>{lead.name}</strong><a href={`mailto:${lead.email}`}>{lead.email}</a></td><td><span className={`nexara-admin-type ${lead.type}`}>{lead.type}</span></td><td><strong>{lead.company || lead.plan || "—"}</strong><span>{lead.message || "—"}</span><div className="nexara-admin-response"><label htmlFor={`response-${lead.id}`}>Reply shown in the customer dashboard</label><textarea id={`response-${lead.id}`} rows={3} maxLength={5000} value={leadResponses[lead.id] ?? lead.response ?? ""} onChange={(event) => setLeadResponses((current) => ({ ...current, [lead.id]: event.target.value }))} placeholder="Write a response for this customer…" /><button type="button" disabled={loading} onClick={() => void sendLeadResponse(lead)}>{lead.response ? "Update response" : "Send to dashboard"}</button>{lead.respondedAt && <small>Last saved {new Date(lead.respondedAt).toLocaleString()}</small>}</div></td><td>{new Date(lead.createdAt).toLocaleString()}</td><td><select aria-label={`Status for ${lead.name}`} value={lead.status} onChange={(event) => void updateLeadStatus(lead.id, event.target.value as NexaraLead["status"])}>{leadStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></td><td><button type="button" onClick={() => void deleteRecord("leads", lead.id)}>Delete</button></td></tr>)}
        {section === "users" && users.map((user) => <tr key={user.id}><td><strong>{user.name}</strong><a href={`mailto:${user.email}`}>{user.email}</a></td><td>{new Date(user.createdAt).toLocaleString()}</td><td><button type="button" onClick={() => setUserEditor(user)}>Edit</button><button type="button" onClick={() => void deleteRecord("users", user.id)}>Delete</button></td></tr>)}
        {section === "docs" && documents.map((document) => <tr key={document.id}><td><strong>{document.title}</strong><span>{document.description}</span></td><td>{document.filename}</td><td>{new Date(document.createdAt).toLocaleString()}</td><td><a href={`/docs/${encodeURIComponent(document.slug)}`} target="_blank" rel="noreferrer">View</a><button type="button" onClick={() => void deleteRecord("docs", document.id)}>Delete</button></td></tr>)}
        {!loading && ((section === "pages" && pages.length === 0) || (section === "plans" && plans.length === 0) || (section === "leads" && leads.length === 0) || (section === "users" && users.length === 0) || (section === "docs" && documents.length === 0)) && <tr><td className="nexara-admin-empty" colSpan={6}>No records in this collection yet.</td></tr>}
      </tbody></table>{loading && <div className="nexara-admin-table-loading">Refreshing records…</div>}</div>}
    </section></div>
  </main>;
}
