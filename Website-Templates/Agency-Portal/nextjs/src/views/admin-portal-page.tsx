"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CreditCard,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Brand } from "../components/Shared";
import {
  agencyApi,
  clearSession,
  getSessionUser,
  saveSession,
} from "../services/agency-api";
import type {
  Client,
  CaseStudy,
  Inquiry,
  Invoice,
  Message,
  Project,
  Settings as StudioSettings,
  TeamMember,
  User,
} from "../services/agency-api";
import "./admin-portal.css";

export type AdminSection =
  | "overview"
  | "projects"
  | "case-studies"
  | "clients"
  | "team"
  | "invoices"
  | "inquiries"
  | "messages"
  | "settings";

export type AdminAuthMode = "login" | "signup" | "forgot" | "reset";

type Activity = { id: string; title: string; detail: string; createdAt: string };
type Dashboard = {
  metrics?: { activeProjects: number; monthlyRevenue: number; activeClients: number; pendingApprovals: number };
  projects?: Project[];
  activity?: Activity[];
};
type AdminPayload = Dashboard & {
  clients?: Client[];
  caseStudies?: CaseStudy[];
  team?: TeamMember[];
  invoices?: Invoice[];
  inquiries?: Inquiry[];
  messages?: Message[];
  settings?: StudioSettings;
};
type AdminRow = Project | CaseStudy | Client | TeamMember | Invoice | Inquiry | Message;

const navigation: { name: AdminSection; label: string; icon: typeof LayoutDashboard }[] = [
  { name: "overview", label: "Overview", icon: LayoutDashboard },
  { name: "projects", label: "Projects", icon: FolderKanban },
  { name: "case-studies", label: "Case studies", icon: BriefcaseBusiness },
  { name: "clients", label: "Clients", icon: BriefcaseBusiness },
  { name: "team", label: "Team", icon: Users },
  { name: "invoices", label: "Invoices", icon: CreditCard },
  { name: "inquiries", label: "Inquiries", icon: MessageSquare },
  { name: "messages", label: "Messages", icon: MessageSquare },
  { name: "settings", label: "Settings", icon: Settings },
];

const sectionTitles = Object.fromEntries(navigation.map(({ name, label }) => [name, label])) as Record<AdminSection, string>;

const createFields: Partial<Record<AdminSection, { name: string; label: string; type?: string; required?: boolean }[]>> = {
  projects: [
    { name: "name", label: "Project name" },
    { name: "client", label: "Client name" },
    { name: "clientEmail", label: "Client email", type: "email", required: false },
    { name: "service", label: "Service" },
    { name: "due", label: "Due date", required: false },
    { name: "budget", label: "Budget", type: "number", required: false },
  ],
  "case-studies": [
    { name: "name", label: "Case study title" },
    { name: "client", label: "Client or brand" },
    { name: "type", label: "Project type" },
    { name: "alt", label: "Cover image description" },
    { name: "summary", label: "Short summary" },
    { name: "description", label: "Case study description", type: "textarea" },
    { name: "result", label: "Result / impact" },
    { name: "deliverables", label: "Deliverables (one per line)", type: "textarea" },
  ],
  clients: [
    { name: "name", label: "Client name" },
    { name: "company", label: "Company" },
    { name: "email", label: "Email", type: "email" },
  ],
  team: [
    { name: "name", label: "Member name" },
    { name: "role", label: "Role" },
    { name: "email", label: "Email", type: "email" },
  ],
  invoices: [
    { name: "client", label: "Client name" },
    { name: "clientEmail", label: "Client email", type: "email", required: false },
    { name: "amount", label: "Amount", type: "number" },
  ],
  messages: [
    { name: "clientEmail", label: "Client email", type: "email" },
    { name: "message", label: "Message", type: "textarea" },
  ],
};

const statusChoices: Partial<Record<AdminSection, readonly string[]>> = {
  projects: ["Planning", "In progress", "Review", "Completed"],
  clients: ["Onboarding", "Active", "Paused"],
  team: ["Available", "On a project", "Away"],
  invoices: ["Due soon", "Paid", "Overdue"],
  inquiries: ["New", "Contacted", "Accepted", "Closed"],
};

function rowTitle(row: AdminRow): string {
  if ("name" in row) return row.name;
  if ("client" in row) return row.client;
  return "";
}

function rowDescription(row: AdminRow): string {
  if ("body" in row) return row.body;
  if ("summary" in row) return row.summary;
  if ("project" in row) return `${row.email} · ${row.project}`;
  if ("service" in row) return `${row.service} · ${row.client}`;
  if ("role" in row) return `${row.role} · ${row.email}`;
  if ("company" in row) return `${row.company} · ${row.email}`;
  if ("budget" in row && "email" in row) return `${row.email} · ${row.budget}`;
  return typeof row.clientEmail === "string" ? row.clientEmail : "";
}

export function AdminAuthPage({ mode }: { mode: AdminAuthMode }) {
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const copy = {
    login: { title: "Welcome back", subtitle: "Sign in to manage your studio.", button: "Sign in" },
    signup: { title: "Create your admin account", subtitle: "The first admin account can be created without an invitation code. Additional admins need one.", button: "Create account" },
    forgot: { title: "Reset your password", subtitle: "Enter the admin email to request reset instructions.", button: "Send reset link" },
    reset: { title: "Choose a new password", subtitle: "Create a strong password for your account.", button: "Update password" },
  }[mode];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    setError("");
    setNotice("");
    setBusy(true);
    try {
      if (mode === "forgot") {
        const result = await agencyApi.auth.forgotPassword(String(values.email));
        setNotice(result.resetToken
          ? `Password reset token (development only): ${result.resetToken}`
          : result.message);
      } else if (mode === "reset") {
        const token = new URLSearchParams(window.location.search).get("token") || String(values.token || "");
        const result = await agencyApi.auth.resetPassword(token, String(values.password));
        setNotice(result.message);
      } else {
        const session = mode === "signup"
          ? await agencyApi.auth.signupAdmin({
            name: String(values.name),
            company: String(values.company),
            email: String(values.email),
            password: String(values.password),
            inviteCode: String(values.inviteCode),
          })
          : await agencyApi.auth.login({
            email: String(values.email),
            password: String(values.password),
            expectedRole: "admin",
          });
        if (session.user.role !== "admin") throw new Error("This account does not have admin access.");
        saveSession(session);
        window.location.assign("/admin");
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to complete the request.");
    } finally {
      setBusy(false);
    }
  }

  const hasResetToken = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("token");

  return (
    <main className="agency-admin-auth">
      <section className="agency-admin-auth-card">
        <Link className="agency-admin-back" href="/"> <ArrowRight size={14} /> Back to NOVA Studio</Link>
        <div className="agency-admin-auth-brand"><Brand compact /></div>
        <span className="agency-admin-kicker">STUDIO ADMINISTRATION</span>
        <h1>{copy.title}</h1>
        <p>{copy.subtitle}</p>
        <form className="agency-admin-auth-form" onSubmit={handleSubmit}>
          {mode === "signup" && <>
            <label>Full name<input name="name" autoComplete="name" required /></label>
            <label>Studio name<input name="company" autoComplete="organization" required /></label>
            <label>Admin invitation code (optional)<input name="inviteCode" autoComplete="off" /></label>
          </>}
          {(mode === "login" || mode === "signup" || mode === "forgot") && (
            <label>Email<input name="email" type="email" autoComplete="email" required /></label>
          )}
          {(mode === "login" || mode === "signup" || mode === "reset") && (
            <label>{mode === "reset" ? "New password" : "Password"}
              <span className="agency-admin-password">
                <input name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required />
                <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</button>
              </span>
            </label>
          )}
          {mode === "reset" && !hasResetToken && <label>Reset token<input name="token" autoComplete="off" required /></label>}
          <button className="agency-admin-primary" type="submit" disabled={busy}>{busy ? "Please wait…" : copy.button}<ArrowRight size={15} /></button>
          {error && <p className="agency-admin-inline-notice" role="alert">{error}</p>}
          {notice && <p className="agency-admin-inline-notice" role="status">{notice}</p>}
        </form>
        {mode === "login" && <Link className="agency-admin-forgot-link" href="/admin/forgot-password">Forgot password?</Link>}
        {(mode === "login" || mode === "signup") && <div className="agency-admin-auth-foot">
          {mode === "login" ? <>New to the admin workspace? <Link href="/admin/signup">Create an account</Link></> : <>Already have access? <Link href="/admin/login">Sign in</Link></>}
        </div>}
        <div className="agency-admin-auth-security"><ShieldCheck size={14} /> Private studio workspace</div>
      </section>
      <aside className="agency-admin-auth-aside"><div className="agency-admin-auth-aside-content">
        <span className="agency-admin-kicker">YOUR STUDIO, IN SYNC</span>
        <h2>Manage real projects, client relationships, and messages.</h2>
        <p>Your workspace data is loaded from the studio API and saved in MongoDB.</p>
      </div></aside>
    </main>
  );
}

export function AdminWorkspace({ section, inquiryId }: { section: AdminSection; inquiryId?: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [payload, setPayload] = useState<AdminPayload>({});
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [caseStudyCover, setCaseStudyCover] = useState("");
  const [caseStudyGallery, setCaseStudyGallery] = useState<string[]>([]);

  useEffect(() => {
    const currentUser = getSessionUser();
    if (!currentUser || currentUser.role !== "admin") {
      window.location.replace("/admin/login");
      return;
    }
    setUser(currentUser);
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setError("");
    const load = section === "overview"
      ? agencyApi.admin.dashboard()
      : section === "projects" ? agencyApi.admin.projects()
        : section === "case-studies" ? agencyApi.admin.caseStudies()
        : section === "clients" ? agencyApi.admin.clients()
          : section === "team" ? agencyApi.admin.team()
            : section === "invoices" ? agencyApi.admin.invoices()
              : section === "inquiries" ? agencyApi.admin.inquiries()
                : section === "messages" ? agencyApi.admin.messages()
                  : agencyApi.admin.settings();
    load.then((result) => {
      if (active) setPayload(result);
    }).catch((requestError: unknown) => {
      if (!active) return;
      const message = requestError instanceof Error ? requestError.message : "Unable to load this workspace.";
      setError(message);
      if (/sign in|session|account/i.test(message)) {
        clearSession();
        window.location.replace("/admin/login");
      }
    });
    return () => { active = false; };
  }, [section, user]);

  const allRows: AdminRow[] = section === "projects" ? payload.projects || []
    : section === "case-studies" ? payload.caseStudies || []
    : section === "clients" ? payload.clients || []
      : section === "team" ? payload.team || []
        : section === "invoices" ? payload.invoices || []
          : section === "inquiries" ? payload.inquiries || []
            : section === "messages" ? payload.messages || []
              : [];
  const rows = useMemo(
    () => allRows.filter((row) => JSON.stringify(row).toLowerCase().includes(search.toLowerCase())),
    [allRows, search],
  );
  const selectedInquiry = inquiryId ? (payload.inquiries || []).find((inquiry) => inquiry.id === inquiryId) : undefined;

  async function refresh() {
    const result = section === "overview" ? await agencyApi.admin.dashboard()
      : section === "projects" ? await agencyApi.admin.projects()
        : section === "case-studies" ? await agencyApi.admin.caseStudies()
        : section === "clients" ? await agencyApi.admin.clients()
          : section === "team" ? await agencyApi.admin.team()
            : section === "invoices" ? await agencyApi.admin.invoices()
              : section === "inquiries" ? await agencyApi.admin.inquiries()
                : section === "messages" ? await agencyApi.admin.messages()
                  : await agencyApi.admin.settings();
    setPayload(result);
  }

  async function createRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    setBusy(true);
    setError("");
    try {
      if (section === "projects") await agencyApi.admin.createProject({
        name: String(values.name), client: String(values.client), clientEmail: String(values.clientEmail || ""),
        service: String(values.service), due: String(values.due || ""), budget: Number(values.budget || 0), progress: 0,
      });
      if (section === "case-studies") await agencyApi.admin.createCaseStudy({
        name: String(values.name),
        client: String(values.client),
        type: String(values.type),
        image: caseStudyCover,
        images: caseStudyGallery,
        alt: String(values.alt),
        summary: String(values.summary),
        description: String(values.description),
        result: String(values.result),
        deliverables: String(values.deliverables || "").split(/\r?\n/).map((value) => value.trim()).filter(Boolean),
      });
      if (section === "clients") await agencyApi.admin.createClient({ name: String(values.name), company: String(values.company), email: String(values.email) });
      if (section === "team") await agencyApi.admin.createTeamMember({ name: String(values.name), role: String(values.role), email: String(values.email) });
      if (section === "invoices") await agencyApi.admin.createInvoice({ client: String(values.client), clientEmail: String(values.clientEmail || ""), amount: Number(values.amount) });
      if (section === "messages") await agencyApi.admin.sendMessage({ clientEmail: String(values.clientEmail), message: String(values.message) });
      form.reset();
      if (section === "case-studies") {
        setCaseStudyCover("");
        setCaseStudyGallery([]);
      }
      await refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save this record.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadCaseStudyCover(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      setCaseStudyCover(await agencyApi.uploadCaseStudyImage(file));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to upload the cover image.");
      input.value = "";
    } finally {
      setBusy(false);
    }
  }

  async function uploadCaseStudyGallery(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const files = Array.from(input.files || []);
    if (!files.length) return;
    if (files.length + caseStudyGallery.length > 12) {
      setError("You can add up to 12 gallery images.");
      input.value = "";
      return;
    }
    setBusy(true);
    setError("");
    try {
      const uploaded = await Promise.all(files.map((file) => agencyApi.uploadCaseStudyImage(file)));
      setCaseStudyGallery((images) => [...images, ...uploaded]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to upload gallery images.");
    } finally {
      input.value = "";
      setBusy(false);
    }
  }

  async function updateStatus(row: AdminRow, status: string) {
    setError("");
    try {
      if (section === "projects") await agencyApi.admin.updateProject(row.id, { status: status as Project["status"] });
      if (section === "clients") await agencyApi.admin.updateClient(row.id, { status: status as Client["status"] });
      if (section === "team") await agencyApi.admin.updateTeamMember(row.id, { status: status as TeamMember["status"] });
      if (section === "invoices") await agencyApi.admin.updateInvoice(row.id, { status: status as Invoice["status"] });
      if (section === "inquiries") await agencyApi.admin.updateInquiry(row.id, { status: status as Inquiry["status"] });
      await refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update this record.");
    }

  }

  async function deleteCaseStudy(id: string) {
    if (!window.confirm("Remove this case study from the website?")) return;
    setBusy(true);
    setError("");
    try {
      await agencyApi.admin.deleteCaseStudy(id);
      await refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to remove the case study.");
    } finally {
      setBusy(false);
    }
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!payload.settings) return;
    const values = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await agencyApi.admin.updateSettings({
        studioName: String(values.get("studioName")),
        email: String(values.get("email")),
        website: String(values.get("website")),
        description: String(values.get("description")),
        notifications: {
          projectUpdates: values.get("projectUpdates") === "on",
          clientActivity: values.get("clientActivity") === "on",
          weeklySummary: values.get("weeklySummary") === "on",
        },
      });
      await refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save settings.");
    } finally {
      setBusy(false);
    }
  }

  async function markRead(id: string) {
    setError("");
    try {
      await agencyApi.admin.markMessageRead(id);
      await refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update the message.");
    }
  }

  async function sendReply(event: FormEvent<HTMLFormElement>, clientEmail: string) {
    event.preventDefault();
    const form = event.currentTarget;
    const message = String(new FormData(form).get("reply") || "");
    setBusy(true);
    setError("");
    try {
      await agencyApi.admin.sendMessage({ clientEmail, message });
      setReplyTo(null);
      await refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to send the reply.");
    } finally {
      setBusy(false);
    }
  }

  async function replyToInquiry(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const form = event.currentTarget;
    const message = String(new FormData(form).get("reply") || "");
    setBusy(true);
    setError("");
    try {
      await agencyApi.admin.replyToInquiry(id, message);
      form.reset();
      await refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to send the inquiry response.");
    } finally {
      setBusy(false);
    }
  }

  function signOut() {
    clearSession();
    window.location.assign("/admin/login");
  }

  const fields = createFields[section] || [];

  return (
    <div className="agency-admin-shell">
      <aside className="agency-admin-sidebar">
        <div className="agency-admin-brand"><Brand compact /><span className="agency-admin-admin-tag">ADMIN</span></div>
        <div className="agency-admin-workspace"><span className="agency-admin-workspace-mark">N</span><span><strong>{user?.company || "Studio"}</strong><small>Agency workspace</small></span></div>
        <span className="agency-admin-nav-label">WORKSPACE</span>
        <nav className="agency-admin-nav" aria-label="Admin navigation">
          {navigation.map(({ name, label, icon: Icon }) => <Link key={name} className={section === name ? "active" : ""} href={name === "overview" ? "/admin" : `/admin/${name}`}><Icon size={17} />{label}{name === "messages" && payload.messages && <span className="agency-admin-nav-badge">{payload.messages.filter((message) => !message.read).length}</span>}</Link>)}
        </nav>
        <div className="agency-admin-sidebar-bottom">
          <button type="button" onClick={signOut}><LogOut size={16} /> Sign out</button>
          <div className="agency-admin-user"><span className="agency-admin-avatar avatar-mint">{user?.name.slice(0, 2).toUpperCase() || "AD"}</span><span><strong>{user?.name || "Admin"}</strong><small>{user?.email || ""}</small></span></div>
        </div>
      </aside>
      <main className="agency-admin-main">
        <header className="agency-admin-topbar">
          <div className="agency-admin-breadcrumb"><span>Workspace</span><ArrowRight size={13} /><strong>{sectionTitles[section]}</strong></div>
          <div className="agency-admin-top-actions">
            <label className="agency-admin-search"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search..." aria-label="Search current page" /></label>
            <Link className="agency-admin-view-site" href="/">View site <ArrowRight size={14} /></Link>
          </div>
        </header>
        <div className="agency-admin-content">
          {error && <p className="agency-admin-error" role="alert">{error}</p>}
          {section === "overview" && <Overview data={payload} />}
          {section === "settings" && payload.settings && <SettingsForm settings={payload.settings} busy={busy} onSubmit={saveSettings} />}
          {fields.length > 0 && <form className={`agency-admin-new-project agency-admin-create-form${section === "case-studies" ? " agency-admin-case-study-form" : ""}`} onSubmit={createRecord}>
            <div className="agency-admin-form-heading"><h2>{section === "case-studies" ? "Publish a case study" : `Add ${section === "messages" ? "message" : section === "team" ? "team member" : section.slice(0, -1)}`}</h2><p>{section === "case-studies" ? "Share the project details and image assets shown on your public website." : "Complete the fields below to add this to your workspace."}</p></div>
            {section === "case-studies" && <section className="agency-admin-upload-panel">
              <div><strong>Case study images</strong><small>Upload a cover image and up to 12 gallery images. Images are stored securely in Cloudinary.</small></div>
              <label className="agency-admin-upload-field">Cover image<input key={caseStudyCover ? "uploaded" : "empty"} type="file" accept="image/*" required={!caseStudyCover} onChange={uploadCaseStudyCover} /><small>Maximum file size: 10 MB</small></label>
              {caseStudyCover && <div className="agency-admin-image-preview"><img src={caseStudyCover} alt="Case study cover preview" /><button type="button" onClick={() => setCaseStudyCover("")}>Remove cover</button></div>}
              <label className="agency-admin-upload-field">Gallery images<input type="file" accept="image/*" multiple onChange={uploadCaseStudyGallery} /><small>{caseStudyGallery.length} of 12 images uploaded · Maximum 10 MB each</small></label>
              {caseStudyGallery.length > 0 && <div className="agency-admin-gallery-previews">{caseStudyGallery.map((image, index) => <div key={image}><img src={image} alt={`Gallery preview ${index + 1}`} /><button type="button" aria-label={`Remove gallery image ${index + 1}`} onClick={() => setCaseStudyGallery((images) => images.filter((item) => item !== image))}>Remove</button></div>)}</div>}
            </section>}
            {fields.map(({ name, label, type, required }) => <label className={type === "textarea" ? "agency-admin-field-wide" : ""} key={name}>{label}{type === "textarea"
              ? <textarea name={name} required={required !== false} maxLength={2000} />
              : <input name={name} type={type || "text"} min={type === "number" ? "0" : undefined} required={required !== false} />}</label>)}
            <button className="agency-admin-primary-button" type="submit" disabled={busy}>{busy ? "Please wait…" : section === "case-studies" ? "Publish case study" : `Add ${section === "messages" ? "message" : section === "team" ? "team" : section.slice(0, -1)}`}</button>
          </form>}
          {inquiryId && selectedInquiry && <section className="agency-admin-inquiry-detail">
            <Link className="agency-admin-text-link" href="/admin/inquiries"><ArrowRight size={14} /> Back to inquiries</Link>
            <article className="agency-admin-panel agency-admin-inquiry-card">
              <div><span className="agency-admin-kicker">PROJECT INQUIRY</span><h2>{selectedInquiry.name}</h2><p>{selectedInquiry.company || "Independent client"} · {new Date(selectedInquiry.createdAt).toLocaleString()}</p></div>
              <dl><div><dt>Email</dt><dd><a href={`mailto:${selectedInquiry.email}`}>{selectedInquiry.email}</a></dd></div><div><dt>Phone</dt><dd><a href={`tel:${selectedInquiry.phone || ""}`}>{selectedInquiry.phone || "Not provided"}</a></dd></div><div><dt>Budget</dt><dd>{selectedInquiry.budget}</dd></div><div><dt>Status</dt><dd>{selectedInquiry.status}</dd></div></dl>
              <section><h3>Project details</h3><p>{selectedInquiry.project}</p></section>
              {selectedInquiry.response && <section><h3>Latest response sent to client</h3><p>{selectedInquiry.response}</p><small>{selectedInquiry.respondedAt ? new Date(selectedInquiry.respondedAt).toLocaleString() : ""}</small></section>}
              <form className="agency-admin-inquiry-reply" onSubmit={(event) => replyToInquiry(event, selectedInquiry.id)}><label htmlFor="inquiry-reply">Respond to {selectedInquiry.name}</label><textarea id="inquiry-reply" name="reply" maxLength={2000} placeholder="Write a response. It will appear in the client's messages." required /><button className="agency-admin-primary-button" type="submit" disabled={busy}>{busy ? "Sending…" : "Send response to client"}</button></form>
            </article>
          </section>}
          {inquiryId && !selectedInquiry && <p className="agency-admin-empty">{payload.inquiries ? "Inquiry not found." : "Loading inquiry…"}</p>}
          {rowKeySection(section) && !(section === "inquiries" && inquiryId) && <section className="agency-admin-panel agency-admin-list">
            <div className="agency-admin-panel-heading"><div><h2>{sectionTitles[section]}</h2><p>{rows.length} records</p></div></div>
            {rows.map((row) => <article className="agency-admin-record" key={row.id}>
              <div><strong>{rowTitle(row)}</strong><p>{rowDescription(row)}</p><small>{"createdAt" in row ? new Date(row.createdAt).toLocaleString() : "date" in row ? row.date : "due" in row ? row.due : ""}</small></div>
              {"amount" in row && <strong>{new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(row.amount)}</strong>}
              {"status" in row && statusChoices[section] && <label className="agency-admin-status-label">Status<select value={row.status} onChange={(event) => updateStatus(row, event.target.value)}>{statusChoices[section]?.map((status) => <option key={status}>{status}</option>)}</select></label>}
              {"sender" in row && <div className="agency-admin-message-actions"><span>{row.sender} · {row.read ? "Read" : "Unread"}</span>{!row.read && <button type="button" onClick={() => markRead(row.id)}>Mark read</button>}{row.sender === "client" && <button type="button" onClick={() => setReplyTo(replyTo === row.id ? null : row.id)}>{replyTo === row.id ? "Cancel reply" : "Reply"}</button>}</div>}
              {"sender" in row && replyTo === row.id && <form className="agency-admin-reply-form" onSubmit={(event) => sendReply(event, row.clientEmail)}><label>Reply to {row.client}<textarea name="reply" maxLength={2000} required placeholder="Write your reply…" /></label><button className="agency-admin-primary-button" type="submit" disabled={busy}>{busy ? "Sending…" : "Send reply"}</button></form>}
              {"budget" in row && <small>{row.budget}</small>}
              {"project" in row && <Link className="agency-admin-inquiry-open" href={`/admin/inquiries/${encodeURIComponent(row.id)}`}>Open inquiry <ArrowRight size={14} /></Link>}
              {"slug" in row && <button className="agency-admin-remove-case-study" type="button" onClick={() => deleteCaseStudy(row.id)} disabled={busy}>Remove from website</button>}
            </article>)}
            {rows.length === 0 && <p className="agency-admin-empty">No {section} records yet.</p>}
          </section>}
        </div>
      </main>
    </div>
  );
}

function rowKeySection(section: AdminSection): boolean {
  return ["projects", "case-studies", "clients", "team", "invoices", "inquiries", "messages"].includes(section);
}

function Overview({ data }: { data: AdminPayload }) {
  const metrics = data.metrics;
  const values = [
    ["Active projects", metrics?.activeProjects ?? 0],
    ["Paid revenue", new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(metrics?.monthlyRevenue ?? 0)],
    ["Active clients", metrics?.activeClients ?? 0],
    ["Pending approvals", metrics?.pendingApprovals ?? 0],
  ];
  return <>
    <PageHeading eyebrow="STUDIO WORKSPACE" title="Overview" description="Live activity and records from your studio database." />
    <section className="agency-admin-metrics" aria-label="Studio performance">
      {values.map(([label, value], index) => <article className="agency-admin-metric" key={String(label)}><div className="agency-admin-metric-top"><span>{label}</span><i className={`agency-admin-metric-icon tone-${["mint", "purple", "blue", "orange"][index]}`}><FolderKanban size={17} /></i></div><strong>{value}</strong><small>{index === 0 ? "Current workspace" : "From saved records"}</small></article>)}
    </section>
    <div className="agency-admin-overview-grid">
      <section className="agency-admin-panel"><div className="agency-admin-panel-heading"><div><h2>Recent projects</h2><p>Latest active work</p></div><Link className="agency-admin-text-link" href="/admin/projects">View all <ArrowRight size={14} /></Link></div>
        {(data.projects || []).map((project) => <div className="agency-admin-activity-row" key={project.id}><span><strong>{project.name}</strong><small>{project.client} · {project.status}</small></span><time>{project.progress}%</time></div>)}
        {!data.projects?.length && <p className="agency-admin-empty">No projects yet. Add a project to populate this workspace.</p>}
      </section>
      <section className="agency-admin-panel"><div className="agency-admin-panel-heading"><div><h2>Recent activity</h2><p>Updates from saved workspace records</p></div></div>
        {(data.activity || []).map((activity) => <div className="agency-admin-activity-row" key={activity.id}><span><strong>{activity.title}</strong><small>{activity.detail}</small></span><time>{new Date(activity.createdAt).toLocaleDateString()}</time></div>)}
        {!data.activity?.length && <p className="agency-admin-empty">New project, inquiry, and message activity will appear here.</p>}
      </section>
    </div>
  </>;
}

function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="agency-admin-page-heading"><div><span className="agency-admin-kicker">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div></div>;
}

function SettingsForm({ settings, busy, onSubmit }: { settings: StudioSettings; busy: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <form className="agency-admin-panel agency-admin-settings-form" onSubmit={onSubmit}>
    {(["studioName", "email", "website"] as const).map((field) => <label key={field}>{field === "studioName" ? "Studio name" : field[0].toUpperCase() + field.slice(1)}<input name={field} type={field === "email" ? "email" : "text"} defaultValue={settings[field]} required={field !== "website"} /></label>)}
    <label>Description<textarea name="description" defaultValue={settings.description} /></label>
    <fieldset><legend>Notifications</legend>
      {(["projectUpdates", "clientActivity", "weeklySummary"] as const).map((field) => <label className="agency-admin-setting-checkbox" key={field}><input name={field} type="checkbox" defaultChecked={settings.notifications[field]} />{field === "projectUpdates" ? "Project updates" : field === "clientActivity" ? "Client activity" : "Weekly summary"}</label>)}
    </fieldset>
    <button className="agency-admin-primary-button" type="submit" disabled={busy}>{busy ? "Saving…" : "Save settings"}</button>
  </form>;
}
