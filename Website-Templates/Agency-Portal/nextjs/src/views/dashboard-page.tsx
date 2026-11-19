"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Bell, BriefcaseBusiness, CreditCard, FolderKanban, LayoutDashboard, LockKeyhole, MessageSquare, MoreHorizontal, Plus, ShieldCheck } from "lucide-react";
import { Brand } from "../components/Shared";
import { agencyApi, clearSession, getSessionUser } from "../services/agency-api";
import type { Inquiry, Invoice, Message, Project, User } from "../services/agency-api";

type ClientDashboard = { user: User; projects: Project[]; invoices: Invoice[]; messages: Message[]; inquiries: Inquiry[] };

export default function DashboardPage() {
  const [active, setActive] = useState("Overview");
  const [dashboard, setDashboard] = useState<ClientDashboard | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "client") {
      window.location.replace("/login");
      return;
    }
    agencyApi.client.dashboard()
      .then(setDashboard)
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load your workspace."));
  }, []);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const message = String(new FormData(form).get("message") || "");
    setBusy(true);
    setError("");
    try {
      await agencyApi.client.sendMessage(message);
      form.reset();
      setDashboard(await agencyApi.client.dashboard());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Your message could not be sent.");
    } finally {
      setBusy(false);
    }
  }

  function signOut() {
    clearSession();
    window.location.assign("/login");
  }

  const nav = [
    { name: "Overview", icon: LayoutDashboard },
    { name: "Projects", icon: FolderKanban },
    { name: "Invoices", icon: CreditCard },
    { name: "Inquiries", icon: BriefcaseBusiness },
    { name: "Messages", icon: MessageSquare },
  ];
  const projects = dashboard?.projects || [];
  const invoices = dashboard?.invoices || [];
  const messages = dashboard?.messages || [];
  const inquiries = dashboard?.inquiries || [];
  const notifications = [
    ...messages.filter((message) => message.sender === "admin").slice(0, 4).map((message) => ({
      id: `message-${message.id}`, section: "Messages", title: "New studio message", detail: message.body,
    })),
    ...invoices.filter((invoice) => invoice.status !== "Paid").slice(0, 4).map((invoice) => ({
      id: `invoice-${invoice.id}`, section: "Invoices", title: "Invoice needs attention", detail: `${invoice.id} · ${invoice.status}`,
    })),
    ...projects.filter((project) => project.status !== "Completed").slice(0, 4).map((project) => ({
      id: `project-${project.id}`, section: "Projects", title: "Project update", detail: `${project.name} · ${project.status}`,
    })),
  ];

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Brand compact />
        <div className="workspace-picker"><span className="workspace-avatar">{dashboard?.user.company.slice(0, 1) || "N"}</span><span><strong>{dashboard?.user.company || "Client workspace"}</strong><small>Client workspace</small></span></div>
        <nav aria-label="Dashboard navigation">{nav.map(({ name, icon: Icon }) => <button className={active === name ? "active" : ""} type="button" key={name} onClick={() => setActive(name)}><Icon size={16} />{name}{name === "Projects" && <span className="nav-count">{projects.length}</span>}</button>)}</nav>
        <div className="sidebar-bottom">
          <Link href="/messages"><MessageSquare size={15} /> Message the studio</Link>
          <button className="client-signout" type="button" onClick={signOut}><LockKeyhole size={15} /> Sign out</button>
          <div className="user-profile"><span className="user-avatar">{dashboard?.user.name.slice(0, 2).toUpperCase() || "CL"}</span><span><strong>{dashboard?.user.name || "Client"}</strong><small>{dashboard?.user.email || ""}</small></span><MoreHorizontal size={16} /></div>
        </div>
      </aside>
      <main className="dashboard-main">
        <header className="dashboard-topbar"><div className="mobile-dash-brand"><Brand compact /></div><div className="dashboard-breadcrumb">Workspace <ArrowRight size={12} /> {active}</div><div className="dashboard-top-actions"><div className="dashboard-notification-wrap"><button className="icon-action" type="button" aria-label={`Notifications${notifications.length ? `, ${notifications.length} updates` : ""}`} aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((open) => !open)}><Bell size={16} />{notifications.length > 0 && <i>{notifications.length > 9 ? "9+" : notifications.length}</i>}</button>{notificationsOpen && <section className="dashboard-notification-popover" aria-label="Notifications"><div className="dashboard-notification-heading"><strong>Updates</strong><span>{notifications.length}</span></div>{notifications.length ? notifications.map((notification) => <button type="button" key={notification.id} onClick={() => { setActive(notification.section); setNotificationsOpen(false); }}><strong>{notification.title}</strong><span>{notification.detail}</span></button>) : <p>You’re all caught up. New project, invoice, and chat updates will appear here.</p>}</section>}</div><Link className="button button-cyan" href="/quote"><Plus size={14} /> New Project</Link></div></header>
        <div className="dashboard-content">
          <div className="dashboard-greeting"><div><span className="section-kicker">CLIENT WORKSPACE</span><h1>Welcome back, {dashboard?.user.name || "…"}</h1><p>Your live project updates, invoices, and conversations.</p></div></div>
          {error && <p className="dashboard-notice" role="alert">{error}</p>}
          {!dashboard && !error && <p className="dashboard-notice" role="status">Loading your workspace…</p>}
          {dashboard && active === "Overview" && <section className="metrics-grid" aria-label="Workspace metrics">
            <MetricCard label="Projects" value={String(projects.length)} change={`${projects.filter((project) => project.status !== "Completed").length} active`} icon={FolderKanban} color="cyan" />
            <MetricCard label="Invoices" value={String(invoices.length)} change={`${invoices.filter((invoice) => invoice.status !== "Paid").length} outstanding`} icon={CreditCard} color="purple" />
            <MetricCard label="Messages" value={String(messages.length)} change="Live conversation" icon={MessageSquare} color="blue" />
            <MetricCard label="Inquiries" value={String(inquiries.length)} change={`${inquiries.filter((inquiry) => inquiry.status === "Accepted").length} accepted`} icon={BriefcaseBusiness} color="purple" />
            <MetricCard label="Account" value="Active" change={dashboard.user.company} icon={ShieldCheck} color="green" />
          </section>}
          {dashboard && (active === "Overview" || active === "Projects") && <section className="dashboard-panel client-record-panel"><div className="panel-title"><h2>Projects</h2><span>{projects.length} total</span></div>{projects.map((project) => <article className="client-record" key={project.id}><div><strong>{project.name}</strong><small>{project.service} · due {project.due}</small></div><span>{project.status} · {project.progress}%</span></article>)}{projects.length === 0 && <p className="dashboard-notice">Your studio has not added any projects yet.</p>}</section>}
          {dashboard && (active === "Overview" || active === "Invoices") && <section className="dashboard-panel client-record-panel"><div className="panel-title"><h2>Invoices</h2><span>{invoices.length} total</span></div>{invoices.map((invoice: Invoice) => <article className="client-record" key={invoice.id}><div><strong>{invoice.id}</strong><small>{invoice.date}</small></div><span>{new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(invoice.amount)} · {invoice.status}</span></article>)}{invoices.length === 0 && <p className="dashboard-notice">There are no invoices yet.</p>}</section>}
          {dashboard && (active === "Overview" || active === "Inquiries") && <section className="dashboard-panel client-record-panel"><div className="panel-title"><h2>Project inquiries</h2><span>{inquiries.length} total</span></div>{inquiries.map((inquiry: Inquiry) => <article className="client-record client-inquiry-card" key={inquiry.id}><div className="client-inquiry-details"><strong>{inquiry.company || "Project inquiry"}</strong><small>{new Date(inquiry.createdAt).toLocaleDateString()} · {inquiry.budget}</small><p>{inquiry.project}</p>{inquiry.response && <div className="client-inquiry-response"><strong>Studio response</strong><p>{inquiry.response}</p></div>}</div><span className={`client-status-badge status-${inquiry.status.toLowerCase()}`}>{inquiry.status}</span></article>)}{inquiries.length === 0 && <p className="dashboard-empty-state">Your project inquiries and studio decisions will appear here.</p>}</section>}
          {dashboard && active === "Messages" && <section className="dashboard-panel client-record-panel"><div className="panel-title"><h2>Messages</h2><Link href="/messages">Open full message page <ArrowRight size={14} /></Link></div>{messages.map((message: Message) => <article className="client-record" key={message.id}><div><strong>{message.sender === "client" ? "You" : "NOVA Studio"}</strong><small>{new Date(message.createdAt).toLocaleString()}</small></div><span>{message.body}</span></article>)}{messages.length === 0 && <p className="dashboard-notice">Send a message to start a conversation with the studio.</p>}<form className="client-message-form" onSubmit={sendMessage}><textarea name="message" aria-label="Message" placeholder="Write a message…" maxLength={2000} required /><button className="button button-cyan" disabled={busy}>{busy ? "Sending…" : "Send message"}</button></form></section>}
        </div>
      </main>
    </div>
  );
}

function MetricCard({ label, value, change, icon: Icon, color }: { label: string; value: string; change: string; icon: typeof LayoutDashboard; color: string }) {
  return <article className={`metric-card metric-${color}`}><div className="metric-label">{label}<span><Icon size={16} /></span></div><strong>{value}</strong><small>{change}</small></article>;
}
