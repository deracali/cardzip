"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getAdminToken,
  NexaraApiError,
  nexaraApi,
  setAdminToken,
  type NexaraLead,
  type NexaraPage,
  type NexaraPlan,
  type NexaraUser,
} from "../../services/nexara-api";
import { Activity, ArrowRight, ArrowUpRight, Boxes, FileText, Inbox, LayoutDashboard, LogOut, Plus, RefreshCw, Search, UsersRound } from "lucide-react";
import "./admin.css";

type AdminSection = "overview" | "pages" | "plans" | "leads" | "users";
type RecordEditor = { section: "pages" | "plans"; id: string | null; json: string } | null;
const leadStatuses: NexaraLead["status"][] = ["new", "contacted", "qualified", "closed"];
const sections: { id: AdminSection; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "leads", label: "Inquiries", icon: Inbox },
  { id: "pages", label: "Website pages", icon: FileText },
  { id: "plans", label: "Plans & pricing", icon: Boxes },
  { id: "users", label: "Customers", icon: UsersRound },
];

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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editor, setEditor] = useState<RecordEditor>(null);
  const [userEditor, setUserEditor] = useState<NexaraUser | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const loadSection = useCallback(async (adminToken: string) => {
    setLoading(true);
    setError("");
    try {
    if (section === "overview") {
      const [nextPages, nextPlans, nextLeads, nextUsers] = await Promise.all([
        nexaraApi.adminPages(adminToken),
        nexaraApi.adminPlans(adminToken),
        nexaraApi.adminLeads(adminToken),
        nexaraApi.adminUsers(adminToken),
      ]);
      setPages(nextPages.data);
      setPlans(nextPlans.data);
      setLeads(nextLeads.data);
      setUsers(nextUsers.data);
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
      setLastUpdated(new Date());
    } catch (requestError) {
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

  async function deleteRecord(type: "pages" | "plans" | "leads" | "users", id: string) {
    if (!token || !window.confirm("Delete this record? This cannot be undone.")) return;
    setError("");
    try {
      if (type === "pages") await nexaraApi.deletePage(token, id);
      if (type === "plans") await nexaraApi.deletePlan(token, id);
      if (type === "leads") await nexaraApi.deleteLead(token, id);
      if (type === "users") await nexaraApi.deleteUser(token, id);
      await loadSection(token);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not delete the record.");
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
  return <main className="nexara-admin">
    <aside className="nexara-admin-sidebar">
      <a className="nexara-admin-brand" href="/"><span className="nexara-admin-brand-mark">N</span><span>NEXARA <small>CONTROL CENTER</small></span></a>
      <p className="nexara-admin-nav-label">WORKSPACE</p>
      <nav className="nexara-admin-nav" aria-label="Admin sections">{sections.map(({ id, label, icon: Icon }) => <button type="button" key={id} className={section === id ? "active" : ""} onClick={() => { setSection(id); setEditor(null); setUserEditor(null); }}><Icon size={17} />{label}{id === "leads" && newInquiries > 0 && <span className="nexara-admin-nav-count">{newInquiries}</span>}</button>)}</nav>
      <div className="nexara-admin-sidebar-bottom"><span className="nexara-admin-online"><i /> Database connected</span><a href="/" className="nexara-admin-site-link"><ArrowUpRight size={15} /> View website</a></div>
    </aside>
    <div className="nexara-admin-main">
    <header className="nexara-admin-header">
      <div><p className="nexara-admin-breadcrumb">Nexara <span>/</span> Admin <span>/</span> {sectionName}</p><h1>{sectionName}</h1></div>
      <div className="nexara-admin-top-actions">{lastUpdated && <span className="nexara-admin-updated">Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>}<button type="button" className="nexara-admin-refresh" onClick={() => token && void loadSection(token)} disabled={loading}><RefreshCw size={15} className={loading ? "nexara-admin-spinning" : ""} /> Refresh</button><button type="button" className="nexara-admin-logout" onClick={() => { setAdminToken(null); setToken(null); }}><LogOut size={15} /> Sign out</button></div>
    </header>
    <section className="nexara-admin-content">
      <div className="nexara-admin-title"><div><p className="nexara-admin-eyebrow">{section === "overview" ? "WORKSPACE AT A GLANCE" : "CONTENT & OPERATIONS"}</p><p>{section === "overview" ? "Monitor your website, customers, and incoming inquiries." : "Manage your Nexara website and customer data."}</p></div>{section !== "overview" && <span className="nexara-admin-count">{section === "leads" ? leads.length : section === "pages" ? pages.length : section === "plans" ? plans.length : users.length} records</span>}</div>
      {section === "overview" && <div className="nexara-admin-metrics">
        <article className="nexara-admin-metric"><span className="nexara-admin-metric-icon violet"><Inbox size={18} /></span><span className="nexara-admin-metric-label">Total inquiries</span><strong>{leads.length}</strong><small>Messages received through your website</small></article>
        <article className="nexara-admin-metric"><span className="nexara-admin-metric-icon amber"><Activity size={18} /></span><span className="nexara-admin-metric-label">Needs attention</span><strong>{newInquiries}</strong><small>New inquiries awaiting a response</small></article>
        <article className="nexara-admin-metric"><span className="nexara-admin-metric-icon blue"><FileText size={18} /></span><span className="nexara-admin-metric-label">Website pages</span><strong>{pages.length}</strong><small>{pages.filter((page) => page.showInNavigation).length} shown in site navigation</small></article>
        <article className="nexara-admin-metric"><span className="nexara-admin-metric-icon green"><UsersRound size={18} /></span><span className="nexara-admin-metric-label">Customer accounts</span><strong>{users.length}</strong><small>{plans.length} published pricing plans</small></article>
      </div>}
      {section === "overview" && <div className="nexara-admin-overview-grid"><section className="nexara-admin-panel"><div className="nexara-admin-panel-head"><div><h2>Recent inquiries</h2><p>Follow up with visitors who contacted your team.</p></div><button type="button" className="nexara-admin-text-action" onClick={() => setSection("leads")}>All inquiries <ArrowRight size={14} /></button></div><div className="nexara-admin-recent-list">{leads.slice(0, 5).map((lead) => <button type="button" className="nexara-admin-recent-row" key={lead.id} onClick={() => setSection("leads")}><span className="nexara-admin-avatar">{lead.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span><span className="nexara-admin-recent-person"><strong>{lead.name}</strong><small>{lead.email}</small></span><span className={`nexara-admin-status ${lead.status}`}>{lead.status}</span><time>{new Date(lead.createdAt).toLocaleDateString()}</time><ArrowRight size={15} /></button>)}{leads.length === 0 && <p className="nexara-admin-overview-empty">No inquiries yet. New website submissions will appear here.</p>}</div></section><aside className="nexara-admin-panel nexara-admin-quick-panel"><div className="nexara-admin-panel-head"><div><h2>Quick actions</h2><p>Update your site in just a few clicks.</p></div></div><button type="button" onClick={() => { setSection("pages"); startCreateRecord("pages"); }}><span className="nexara-admin-quick-icon violet"><Plus size={16} /></span><span><strong>Create a website page</strong><small>Publish new content to your site</small></span><ArrowRight size={15} /></button><button type="button" onClick={() => { setSection("plans"); startCreateRecord("plans"); }}><span className="nexara-admin-quick-icon green"><Plus size={16} /></span><span><strong>Add a pricing plan</strong><small>Manage your published offers</small></span><ArrowRight size={15} /></button></aside></div>}
      {section !== "overview" && <nav className="nexara-admin-tabs" aria-label="Database collections">{sections.filter((item) => item.id !== "overview").map(({ id, label, icon: Icon }) => <button type="button" key={id} className={section === id ? "active" : ""} onClick={() => { setSection(id); setEditor(null); setUserEditor(null); }}><Icon size={15} />{label}</button>)}</nav>}
      {section !== "overview" && <div className="nexara-admin-filters">
        {section === "leads" && <div className="nexara-admin-search"><Search size={16} /><input aria-label="Search inquiries" placeholder="Search name, email, company…" value={search} onChange={(event) => setSearch(event.target.value)} /><select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option>{leadStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></div>}
        {["pages", "plans"].includes(section) && <button className="nexara-admin-primary-action" type="button" onClick={() => startCreateRecord(section as "pages" | "plans")}><Plus size={16} /> Create {section === "pages" ? "page" : "plan"}</button>}
        </div>}
      {error && <p className="nexara-admin-error" role="alert">{error}</p>}
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
      {section !== "overview" && <div className="nexara-admin-table-wrap"><table><thead><tr>
        {section === "pages" && <><th>PAGE</th><th>NAVIGATION</th><th>UPDATED</th><th>ACTIONS</th></>}
        {section === "plans" && <><th>PLAN</th><th>PRICE</th><th>FEATURES</th><th>ACTIONS</th></>}
        {section === "leads" && <><th>CONTACT</th><th>TYPE</th><th>COMPANY / MESSAGE</th><th>RECEIVED</th><th>STATUS</th><th>ACTIONS</th></>}
        {section === "users" && <><th>USER</th><th>CREATED</th><th>ACTIONS</th></>}
      </tr></thead><tbody>
        {section === "pages" && pages.map((page) => <tr key={page.id}><td><strong>{page.title}</strong><span>{page.slug}</span></td><td>{page.showInNavigation ? "Visible" : "Hidden"}</td><td>{new Date(page.updatedAt).toLocaleString()}</td><td><button type="button" onClick={() => startEditRecord("pages", page)}>Edit</button><button type="button" onClick={() => void deleteRecord("pages", page.id)}>Delete</button></td></tr>)}
        {section === "plans" && plans.map((plan) => <tr key={plan.id}><td><strong>{plan.name}</strong><span>{plan.slug}</span></td><td>${plan.price.monthly} / ${plan.price.annual}</td><td>{plan.features.length}</td><td><button type="button" onClick={() => startEditRecord("plans", plan)}>Edit</button><button type="button" onClick={() => void deleteRecord("plans", plan.id)}>Delete</button></td></tr>)}
        {section === "leads" && leads.map((lead) => <tr key={lead.id}><td><strong>{lead.name}</strong><a href={`mailto:${lead.email}`}>{lead.email}</a></td><td><span className={`nexara-admin-type ${lead.type}`}>{lead.type}</span></td><td><strong>{lead.company || lead.plan || "—"}</strong><span>{lead.message || "—"}</span><div className="nexara-admin-response"><label htmlFor={`response-${lead.id}`}>Reply shown in the customer dashboard</label><textarea id={`response-${lead.id}`} rows={3} maxLength={5000} value={leadResponses[lead.id] ?? lead.response ?? ""} onChange={(event) => setLeadResponses((current) => ({ ...current, [lead.id]: event.target.value }))} placeholder="Write a response for this customer…" /><button type="button" disabled={loading} onClick={() => void sendLeadResponse(lead)}>{lead.response ? "Update response" : "Send to dashboard"}</button>{lead.respondedAt && <small>Last saved {new Date(lead.respondedAt).toLocaleString()}</small>}</div></td><td>{new Date(lead.createdAt).toLocaleString()}</td><td><select aria-label={`Status for ${lead.name}`} value={lead.status} onChange={(event) => void updateLeadStatus(lead.id, event.target.value as NexaraLead["status"])}>{leadStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></td><td><button type="button" onClick={() => void deleteRecord("leads", lead.id)}>Delete</button></td></tr>)}
        {section === "users" && users.map((user) => <tr key={user.id}><td><strong>{user.name}</strong><a href={`mailto:${user.email}`}>{user.email}</a></td><td>{new Date(user.createdAt).toLocaleString()}</td><td><button type="button" onClick={() => setUserEditor(user)}>Edit</button><button type="button" onClick={() => void deleteRecord("users", user.id)}>Delete</button></td></tr>)}
        {!loading && ((section === "pages" && pages.length === 0) || (section === "plans" && plans.length === 0) || (section === "leads" && leads.length === 0) || (section === "users" && users.length === 0)) && <tr><td className="nexara-admin-empty" colSpan={6}>No records in this collection yet.</td></tr>}
      </tbody></table>{loading && <div className="nexara-admin-table-loading">Refreshing records…</div>}</div>}
    </section></div>
  </main>;
}
