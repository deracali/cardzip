import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleHelp,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { clearPortfolioSession, getPortfolioSession, portfolioApi, savePortfolioSession } from "../services/portfolioApi";

function go(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function PortalBrand() {
  return <a className="brand" href="/" aria-label="CreatorHub home"><span className="brand-icon">C</span><span>CreatorHub</span></a>;
}

function PortalFrame({ children, admin = false }) {
  return <main className="portal-shell">
    <header className="portal-header"><PortalBrand /><span className="portal-role"><ShieldCheck size={14} /> {admin ? "Administrator workspace" : "Creator workspace"}</span><a className="portal-link" href={admin ? "/admin" : "/dashboard"}><LayoutDashboard size={14} /> Dashboard</a></header>
    {children}
    <footer className="portal-footer"><a href="/">CreatorHub storefront</a><a href="/docs/buyer-guide.pdf">Buyer guide <ExternalLink size={12} /></a></footer>
  </main>;
}

export function AuthPage({ signup = false, admin = false }) {
  const [values, setValues] = useState({ name: "", handle: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setSubmitting(true);
    try {
      const session = signup
        ? await portfolioApi.signup(values)
        : await portfolioApi.login({ email: values.email, password: values.password, role: admin ? "admin" : "client" });
      if (admin !== (session.user.role === "admin")) throw new Error("This account cannot access that dashboard.");
      savePortfolioSession(session);
      go(admin ? "/admin" : "/dashboard");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not complete sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  const title = signup ? "Create your creator account" : admin ? "Administrator sign in" : "Welcome back, creator";
  return <main className="auth-page">
    <section className="auth-art"><PortalBrand /><div className="auth-art-copy">
      <span className="pill pill-purple">{admin ? "PRIVATE ADMIN AREA" : "YOUR CREATOR WORKSPACE"}</span>
      <h1>{admin ? "Manage the CreatorHub portfolio service." : "One home for your work, story, and next step."}</h1>
      <p>{admin ? "Review client requests and manage their status from a role-protected workspace." : "Sign in to track your portfolio review requests and keep your creator profile moving."}</p>
      <div className="portal-promise"><ShieldCheck size={16} /><span>Every dashboard checks your account role on the server.</span></div>
    </div></section>
    <section className="auth-form-wrap">
      <a className="back-link" href="/"><ArrowLeft size={14} /> Back to store</a>
      <div className="auth-card">
        <span className="auth-logo">C</span><h2>{title}</h2>
        <p>{signup ? "Create an account to request and track a portfolio review." : admin ? "Use the administrator account configured for this installation." : "Sign in to access your private creator dashboard."}</p>
        <form onSubmit={submit}>
          {signup && <>
            <label htmlFor="signup-name">Full name</label>
            <input id="signup-name" autoComplete="name" value={values.name} onChange={(event) => update("name", event.target.value)} required />
            <label htmlFor="signup-handle">Creator handle</label>
            <div className="handle-input"><span>creatorhub.com/</span><input id="signup-handle" autoComplete="username" value={values.handle} onChange={(event) => update("handle", event.target.value)} minLength={2} maxLength={32} pattern="[A-Za-z0-9](?:[A-Za-z0-9-]{0,30}[A-Za-z0-9])?" required /></div>
          </>}
          <label htmlFor="portal-email">Email address</label>
          <input id="portal-email" type="email" autoComplete="email" value={values.email} onChange={(event) => update("email", event.target.value)} required />
          <label htmlFor="portal-password">Password</label>
          <input id="portal-password" type="password" autoComplete={signup ? "new-password" : "current-password"} minLength={8} value={values.password} onChange={(event) => update("password", event.target.value)} required />
          {message && <p className="portal-message portal-message--error" role="alert">{message}</p>}
          <button className="button button-purple auth-submit" type="submit" disabled={submitting}>{submitting ? "Please wait…" : signup ? "Create my account" : "Sign in"} <ArrowRight size={14} /></button>
        </form>
        {!admin && <p className="auth-switch">{signup ? "Already registered? " : "New to CreatorHub? "}<a href={signup ? "/login" : "/signup"}>{signup ? "Sign in" : "Create an account"}</a></p>}
        {!admin && !signup && <p className="portal-admin-link"><a href="/admin/login">Administrator sign in</a></p>}
        {admin && <p className="portal-admin-link"><a href="/login">Return to creator sign in</a></p>}
      </div>
      <span className="auth-footnote"><ShieldCheck size={13} /> Your account is protected by role-based access.</span>
    </section>
  </main>;
}

function usePortalData(role, load, refresh = 0) {
  const [state, setState] = useState({ loading: true, error: "", data: null });
  useEffect(() => {
    let active = true;
    const session = getPortfolioSession();
    if (!session) {
      go(role === "admin" ? "/admin/login" : "/login");
      return () => { active = false; };
    }
    if (session.user.role !== role) {
      go(session.user.role === "admin" ? "/admin" : "/dashboard");
      return () => { active = false; };
    }
    load().then((data) => {
      if (active) setState({ loading: false, error: "", data });
    }).catch((error) => {
      if (!active) return;
      if (error?.status === 401) {
        clearPortfolioSession();
        go(role === "admin" ? "/admin/login" : "/login");
        return;
      }
      setState({ loading: false, error: error instanceof Error ? error.message : "Could not load your dashboard.", data: null });
    });
    return () => { active = false; };
  }, [load, refresh, role]);
  return state;
}

function DashboardHeader({ user, admin = false }) {
  function signOut() {
    clearPortfolioSession();
    go(admin ? "/admin/login" : "/login");
  }
  return <div className="dashboard-welcome portal-welcome"><div><span className="pill pill-purple">{admin ? "ADMIN WORKSPACE" : "CLIENT WORKSPACE"}</span><h1>{admin ? "Portfolio service overview" : `Welcome, ${user?.name || "creator"}`}</h1><p>{admin ? "Manage client accounts and portfolio review requests." : "Your private dashboard and portfolio review activity."}</p></div><button className="button button-light" onClick={signOut}><LogOut size={14} /> Sign out</button></div>;
}

function LoadingPanel({ error, role }) {
  if (error) return <section className="portal-state portal-state--error"><CircleHelp size={22} /><h2>Dashboard could not load</h2><p>{error}</p><a className="button button-light" href={role === "admin" ? "/admin/login" : "/login"}>Return to sign in</a></section>;
  return <section className="portal-state" aria-live="polite"><span className="portal-spinner" /> Loading your secure dashboard…</section>;
}

function StatusBadge({ status }) {
  return <span className={`portal-status portal-status--${status}`}>{status}</span>;
}

export function ClientDashboard() {
  const load = useCallback(() => portfolioApi.clientDashboard(), []);
  const { loading, error, data } = usePortalData("client", load);
  if (loading || error || !data) return <PortalFrame><LoadingPanel error={error} role="client" /></PortalFrame>;
  return <PortalFrame>
    <DashboardHeader user={data.user} />
    <section className="dashboard-stats portal-stats">
      <article><span>Review requests</span><strong>{data.reviewRequests.length}</strong><small>Submitted by your account</small></article>
      <article><span>Awaiting response</span><strong>{data.reviewRequests.filter((item) => item.status === "requested").length}</strong><small>Requests with requested status</small></article>
      <article><span>Creator handle</span><strong className="portal-handle">@{data.user.handle}</strong><small>Your public-facing handle</small></article>
    </section>
    <section className="dashboard-panel portal-list-panel">
      <div className="section-heading"><div><span className="eyebrow-small">YOUR ACTIVITY</span><h2>Portfolio review requests</h2></div><a className="button button-purple" href="/services/portfolio-review">Request a review <ArrowRight size={13} /></a></div>
      {data.reviewRequests.length ? <div className="portal-request-list">{data.reviewRequests.map((item) => <article className="portal-request-card" key={item.id}>
        <div className="portal-request-copy"><div><strong>Portfolio review</strong><StatusBadge status={item.status} /></div><p>{item.goal}</p>{item.portfolioUrl && <a href={item.portfolioUrl} target="_blank" rel="noreferrer">{item.portfolioUrl} <ArrowUpRight size={12} /></a>}<small>Submitted {new Date(item.createdAt).toLocaleDateString()}</small></div>
      </article>)}</div> : <div className="portal-empty"><LayoutDashboard size={22} /><h3>Your next step starts here</h3><p>Request a portfolio review to get started. Your requests and their status will appear here.</p><a className="button button-dark" href="/services/portfolio-review">Request a portfolio review <ArrowRight size={13} /></a></div>}
    </section>
  </PortalFrame>;
}

export function AdminDashboard() {
  const load = useCallback(() => portfolioApi.adminDashboard(), []);
  const [refresh, setRefresh] = useState(0);
  const { loading, error, data } = usePortalData("admin", load, refresh);
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState("");

  async function updateStatus(id, status) {
    setActionError("");
    setBusyId(id);
    try {
      await portfolioApi.updateReviewRequest(id, status);
      setRefresh((value) => value + 1);
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : "Could not update this request.");
    } finally {
      setBusyId("");
    }
  }

  if (loading || error || !data) return <PortalFrame admin><LoadingPanel error={error} role="admin" /></PortalFrame>;
  return <PortalFrame admin>
    <DashboardHeader user={{ name: "Administrator" }} admin />
    <section className="dashboard-stats portal-stats">
      <article><span>Creator accounts</span><strong>{data.stats.clients}</strong><small>Registered client accounts</small></article>
      <article><span>All review requests</span><strong>{data.stats.totalRequests}</strong><small>Across every client</small></article>
      <article><span>Need attention</span><strong>{data.stats.requested}</strong><small>Awaiting a status update</small></article>
    </section>
    <section className="dashboard-panel portal-list-panel">
      <div className="section-heading"><div><span className="eyebrow-small">CLIENT WORKFLOW</span><h2>Portfolio review requests</h2></div><span className="resource-count">{data.reviewRequests.length} total</span></div>
      {actionError && <p className="portal-message portal-message--error" role="alert">{actionError}</p>}
      {data.reviewRequests.length ? <div className="portal-request-list">{data.reviewRequests.map((item) => <article className="portal-request-card" key={item.id}>
        <div className="portal-request-copy"><div><strong>{item.clientName}</strong><StatusBadge status={item.status} /></div><a href={`mailto:${item.clientEmail}`}>{item.clientEmail}</a><p>{item.goal}</p>{item.portfolioUrl && <a href={item.portfolioUrl} target="_blank" rel="noreferrer">{item.portfolioUrl} <ArrowUpRight size={12} /></a>}<small>Submitted {new Date(item.createdAt).toLocaleDateString()}</small></div>
        <div className="portal-request-actions">
          {item.status === "requested" && <><button disabled={busyId === item.id} onClick={() => updateStatus(item.id, "confirmed")}><Check size={13} /> Confirm</button><button className="is-muted" disabled={busyId === item.id} onClick={() => updateStatus(item.id, "declined")}>Decline</button></>}
          {item.status === "confirmed" && <button disabled={busyId === item.id} onClick={() => updateStatus(item.id, "completed")}><Check size={13} /> Complete</button>}
        </div>
      </article>)}</div> : <div className="portal-empty"><LayoutDashboard size={22} /><h3>No client requests yet</h3><p>New portfolio review requests will appear here.</p></div>}
    </section>
    <section className="dashboard-panel portal-list-panel"><div className="section-heading"><div><span className="eyebrow-small">CLIENT ACCOUNTS</span><h2>Registered creators</h2></div></div><div className="portal-client-list">{data.clients.map((client) => <article key={client.id}><span className="portal-client-avatar">{client.name.slice(0, 1).toUpperCase()}</span><span><strong>{client.name}</strong><small>@{client.handle} · {client.email}</small></span><small>Joined {new Date(client.createdAt).toLocaleDateString()}</small></article>)}</div></section>
  </PortalFrame>;
}

export function PortfolioReviewPage() {
  const session = getPortfolioSession();
  const [values, setValues] = useState({ goal: "", portfolioUrl: "" });
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setSubmitting(true);
    try {
      await portfolioApi.createReviewRequest(values);
      setSubmitted(true);
      setValues({ goal: "", portfolioUrl: "" });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not submit your review request.");
    } finally {
      setSubmitting(false);
    }
  }
  const client = session?.user?.role === "client";
  return <><header className="site-header"><div className="header-inner"><PortalBrand /><nav className="main-nav"><a href="/">Store</a><a href="/free-resources">Free resources</a><a href="/newsletters">Newsletter archive</a></nav><div className="header-actions"><a className="button button-light" href={client ? "/dashboard" : "/login"}>{client ? "My dashboard" : "Sign in"}</a></div></div></header>
    <main className="detail-shell"><a className="back-link" href="/creator/maya-chen"><ArrowLeft size={14} /> Maya’s profile</a><section className="service-hero"><span className="pill pill-purple">1:1 CREATOR SESSION</span><h1>Make your portfolio work harder.</h1><p>Get thoughtful, specific feedback on your portfolio from an independent designer and educator.</p><div className="service-price"><strong>$120</strong><span> · 45-minute video review</span></div></section>
      <section className="service-content"><div className="service-benefits"><h2>What we’ll work on</h2><ul className="benefit-list"><li><Check size={15} /> A clear story and stronger first impression</li><li><Check size={15} /> Case studies that explain your process</li><li><Check size={15} /> Practical next steps tailored to your goals</li></ul><div className="service-note"><ShieldCheck size={16} /><p><strong>Personal feedback, not a template.</strong><br />Requests are linked to your private account and reviewed by the service administrator.</p></div></div>
        <form className="service-form" onSubmit={submit}><h2>Request a session</h2><p>Submit a request for review. No appointment is booked or charged by this starter.</p>
          {!client ? <div className="portal-gate"><ShieldCheck size={18} /><div><strong>Sign in with a creator account to request a review.</strong><a href="/login">Creator sign in <ArrowRight size={12} /></a></div></div> : <>
            <label htmlFor="review-url">Portfolio URL (optional)</label><input id="review-url" name="portfolioUrl" type="url" autoComplete="url" value={values.portfolioUrl} onChange={(event) => setValues((current) => ({ ...current, portfolioUrl: event.target.value }))} placeholder="https://your-portfolio.example" />
            <label htmlFor="review-goal">What would you like feedback on?</label><textarea id="review-goal" name="goal" rows="4" minLength={10} maxLength={2000} value={values.goal} onChange={(event) => setValues((current) => ({ ...current, goal: event.target.value }))} placeholder="Share a little about your portfolio and goals." required />
            {message && <p className="portal-message portal-message--error" role="alert">{message}</p>}
            <button className="button button-purple" type="submit" disabled={submitting}>{submitting ? "Submitting…" : "Submit review request"} <ArrowRight size={14} /></button>
            {submitted && <p className="inline-notice" role="status">Your request is submitted. Track its status in your <a href="/dashboard">client dashboard</a>.</p>}
          </>}
        </form>
      </section><footer className="site-footer"><a href="/">CreatorHub home</a><a href="/docs/buyer-guide.pdf">Buyer guide</a></footer>
    </main>
  </>;
}
