import { useEffect, useState } from "react";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, ShieldCheck } from "lucide-react";
import { apiRequest, clearToken, getToken, saveToken } from "../services/api.js";

function goTo(path, navigate) {
  if (navigate) navigate(path);
  else window.location.assign(path);
}

function ApiNotice({ children, error = false }) {
  return <p className={`api-notice${error ? " api-notice-error" : ""}`} role={error ? "alert" : "status"}>{children}</p>;
}

function AccountFrame({ children }) {
  return <>
    <header className="site-header"><div className="top-nav wrap">
      <a className="brand" href="/" aria-label="Remote.ly home"><span className="brand-icon"><img src="/favicon.svg" alt="" /></span><strong>Remote<span>.ly</span></strong></a>
      <nav className="nav-links account-nav" aria-label="Account navigation"><a href="/jobs">Find Jobs</a><a href="/talent">Browse Talent</a><a href="/dashboard">Dashboard</a></nav>
    </div></header>
    {children}
    <footer className="site-footer"><div className="wrap footer-bottom"><span>© {new Date().getFullYear()} Remote.ly. All rights reserved.</span><a href="/privacy">Privacy</a></div></footer>
  </>;
}

export function ConnectedAuthPage({ signup = false, defaultRole = "candidate", admin = false, redirectTo = "", navigate }) {
  const [role, setRole] = useState(admin ? "admin" : defaultRole);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setNotice("");
    setError("");
    const form = new FormData(event.currentTarget);
    const body = {
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
      role,
    };
    if (signup) {
      body.name = String(form.get("name") || "");
      body.primaryRole = String(form.get("primaryRole") || "");
    }

    setBusy(true);
    try {
      const result = await apiRequest(signup ? "/auth/signup" : "/auth/login", {
        method: "POST",
        body,
        token: "",
      });
      saveToken(result.token);
      setNotice(signup ? "Your account has been created." : "You are signed in.");
      goTo(admin ? "/admin" : redirectTo || "/dashboard", navigate);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return <main className="auth-page">
    <section className="auth-promo">
      <a className="brand brand-inverse" href="/" aria-label="Remote.ly home"><span className="brand-icon"><img src="/favicon.svg" alt="" /></span><strong>Remote<span>.ly</span></strong></a>
      <div className="auth-photo" role="img" aria-label="A calm home office set up for remote work" />
      <span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
      <h1>{admin ? "Remote.ly operations" : signup ? "Join our global talent network" : "Welcome back to Remote.ly"}</h1>
      <p>{admin ? "Review accounts, applications, and job listings from one protected workspace." : "Find meaningful remote work or connect your team with exceptional talent."}</p>
    </section>
    <section className="auth-card">
      <a className="auth-home" href="/"><ArrowRight size={14} /> Back to Remote.ly</a>
      <a className="brand" href="/"><span className="brand-icon"><img src="/favicon.svg" alt="" /></span><strong>Remote<span>.ly</span></strong></a>
      <h2>{admin ? "Administrator sign in" : signup ? "Create your account" : "Sign in"}</h2>
      <p className="auth-subtitle">{admin ? "Admin accounts are provisioned by the API owner." : signup ? "Choose how you will use the talent marketplace." : "Access your candidate or employer workspace."}</p>
      {!admin && <div className="role-switch" role="group" aria-label="Account type">
        <button type="button" className={role === "candidate" ? "selected" : ""} onClick={() => setRole("candidate")}>Candidate</button>
        <button type="button" className={role === "employer" ? "selected" : ""} onClick={() => setRole("employer")}>Employer</button>
      </div>}
      <form onSubmit={submit}>
        {signup && <>
          <label className="field-label">Full name<input name="name" autoComplete="name" placeholder="Alexandra Okafor" minLength={2} required /></label>
          <label className="field-label">{role === "candidate" ? "Primary role" : "Hiring role"}<input name="primaryRole" placeholder={role === "candidate" ? "Full-Stack Engineer" : "Hiring Manager"} /></label>
        </>}
        <label className="field-label">Work email<input name="email" type="email" autoComplete="email" placeholder="alex@example.com" required /></label>
        <label className="field-label">Password<input name="password" type="password" autoComplete={signup ? "new-password" : "current-password"} minLength={signup ? 8 : undefined} required /></label>
        {error && <ApiNotice error>{error}</ApiNotice>}
        {notice && <ApiNotice>{notice}</ApiNotice>}
        <button className="button button-purple full auth-submit" type="submit" disabled={busy}>
          {busy ? "Please wait..." : admin ? "Sign in as administrator" : signup ? "Create account" : "Sign in"}
          <ArrowRight size={15} />
        </button>
      </form>
      {admin ? <p className="auth-switch">Admin registration is disabled. <a href="/login">Client sign in</a></p> :
        <p className="auth-switch">{signup ? "Already registered?" : "Don't have an account?"} <a href={signup ? `/login?role=${role}` : `/signup?role=${role}`}>{signup ? "Sign in" : "Sign up"}</a></p>}
      <p className="auth-security"><ShieldCheck size={13} /> Access is checked by the Remote.ly API.</p>
    </section>
  </main>;
}

export function ConnectedApplyPage({ jobId, jobTitle, navigate }) {
  const [resolvedJobTitle, setResolvedJobTitle] = useState(jobTitle);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (jobTitle !== jobId.replaceAll("-", " ")) return undefined;
    let active = true;
    apiRequest(`/public/jobs/${encodeURIComponent(jobId)}`, { token: "" }).then(({ job }) => {
      if (active) setResolvedJobTitle(job.title);
    }).catch((requestError) => {
      if (active) setError(requestError.message);
    });
    return () => { active = false; };
  }, [jobId, jobTitle]);

  async function submit(event) {
    event.preventDefault();
    setNotice("");
    setError("");
    if (!getToken()) {
      goTo(`/login?role=candidate&next=${encodeURIComponent(`/apply/${jobId}`)}`, navigate);
      return;
    }
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await apiRequest("/client/applications", {
        method: "POST",
        body: {
          jobId,
          jobTitle: resolvedJobTitle,
          message: String(form.get("message") || ""),
          portfolioUrl: String(form.get("portfolioUrl") || ""),
        },
      });
      setNotice("Your application has been submitted to the Remote.ly API.");
      event.currentTarget.reset();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return <AccountFrame><main className="wrap simple-page"><div className="form-card">
    <a className="text-link" href={`/jobs/${jobId}`}>Back to {resolvedJobTitle}</a>
    <span className="eyebrow">APPLICATION</span>
    <h1>Apply for {resolvedJobTitle}</h1>
    <p>Sign in as a candidate to securely submit and track your application.</p>
    <form onSubmit={submit}>
      <label className="field-label">Why are you a good fit?<textarea name="message" rows="5" minLength={20} placeholder="Share a little about your experience." required /></label>
      <label className="field-label">Portfolio or LinkedIn URL<input name="portfolioUrl" type="url" placeholder="https://" /></label>
      {error && <ApiNotice error>{error} <a href="/login?role=candidate">Sign in</a></ApiNotice>}
      {notice && <ApiNotice>{notice} <a href="/dashboard">View your dashboard</a></ApiNotice>}
      <button className="button button-purple full" type="submit" disabled={busy}>{busy ? "Submitting..." : "Submit application"} <ArrowRight size={15} /></button>
    </form>
  </div></main></AccountFrame>;
}

export function ClientDashboardPage({ navigate }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyApplication, setBusyApplication] = useState("");

  useEffect(() => {
    let active = true;
    const token = getToken();
    if (!token) {
      goTo("/login", navigate);
      return () => { active = false; };
    }
    apiRequest("/client/dashboard", { token }).then((result) => {
      if (active) setData(result);
    }).catch((requestError) => {
      if (active) setError(requestError.message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [navigate]);

  async function updateApplication(applicationId, status) {
    setError("");
    setBusyApplication(applicationId);
    try {
      const result = await apiRequest(`/client/applications/${encodeURIComponent(applicationId)}`, {
        method: "PATCH",
        body: { status },
      });
      setData((current) => ({
        ...current,
        applications: current.applications.map((application) =>
          application.id === applicationId ? result.application : application,
        ),
      }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyApplication("");
    }
  }

  if (loading) return <AccountFrame><main className="wrap simple-page"><p>Loading your protected dashboard...</p></main></AccountFrame>;
  if (error) return <AccountFrame><main className="wrap simple-page"><ApiNotice error>{error}</ApiNotice><a className="button button-purple" href="/login">Sign in again <ArrowRight size={14} /></a></main></AccountFrame>;
  if (!data) return null;

  const employer = data.user.role === "employer";
  const records = employer ? data.jobs : data.applications;
  return <AccountFrame><main className="wrap account-page">
    <div className="account-heading"><div><span className="eyebrow">{employer ? "EMPLOYER WORKSPACE" : "CANDIDATE WORKSPACE"}</span><h1>Welcome, {data.user.name}</h1><p>{employer ? "Manage your listings and review their moderation status." : "Track the applications you have submitted."}</p></div><button className="button button-outline" onClick={() => { clearToken(); goTo("/login", navigate); }}>Sign out</button></div>
    <section className="account-summary"><article><BriefcaseBusiness /><strong>{records.length}</strong><span>{employer ? "Job listings" : "Applications"}</span></article><article><CheckCircle2 /><strong>{records.filter((item) => item.status === "approved" || item.status === "submitted").length}</strong><span>{employer ? "Approved or in review" : "Submitted"}</span></article></section>
    <section className="info-panel account-panel"><div className="section-title-row"><div><h2>{employer ? "Your job listings" : "Your applications"}</h2><p>Only records linked to your account are returned by the API.</p></div>{employer && <a className="button button-purple" href="/post-job">Post a job <ArrowRight size={14} /></a>}</div>
      {records.length === 0 ? <p className="empty-account">{employer ? "You have not posted a job yet." : "You have not submitted an application yet."}</p> :
        <div className="account-record-list">{records.map((item) => <article key={item.id} className="account-record"><div><strong>{employer ? item.title : item.jobTitle}</strong><small>{employer ? `${item.category} · ${item.location}` : new Date(item.createdAt).toLocaleDateString()}</small>{employer && item.paymentStatus !== "paid" && <small>Payment integration is required before this listing can appear publicly.</small>}</div><span className={`status-pill status-${item.status}`}>{item.status.replaceAll("_", " ")}</span></article>)}</div>}
    </section>
    {employer && <section className="info-panel account-panel"><h2>Applications for your listings</h2>{data.applications.length === 0 ? <p className="empty-account">Applications for your approved listings will appear here.</p> : <div className="account-record-list">{data.applications.map((application) => <article key={application.id} className="account-record account-record-admin"><div><strong>{application.candidateName} · {application.jobTitle}</strong><small>{application.candidateEmail} · {new Date(application.createdAt).toLocaleDateString()}</small><span className={`status-pill status-${application.status}`}>{application.status}</span></div><div className="admin-actions"><button className="button button-outline" disabled={busyApplication === application.id} onClick={() => updateApplication(application.id, "rejected")}>Reject</button><button className="button button-purple" disabled={busyApplication === application.id} onClick={() => updateApplication(application.id, "shortlisted")}>{busyApplication === application.id ? "Saving..." : "Shortlist"}</button></div></article>)}</div>}</section>}
  </main></AccountFrame>;
}

export function AdminDashboardPage({ navigate }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyJob, setBusyJob] = useState("");

  useEffect(() => {
    let active = true;
    const token = getToken();
    if (!token) {
      goTo("/admin/login", navigate);
      return () => { active = false; };
    }
    apiRequest("/admin/dashboard", { token }).then((result) => {
      if (active) setData(result);
    }).catch((requestError) => {
      if (active) setError(requestError.message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [navigate]);

  async function reviewJob(jobId, status) {
    setError("");
    setBusyJob(jobId);
    try {
      const result = await apiRequest(`/admin/jobs/${encodeURIComponent(jobId)}`, {
        method: "PATCH",
        body: { status },
      });
      setData((current) => ({
        ...current,
        jobs: current.jobs.map((job) => job.id === jobId ? result.job : job),
      }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyJob("");
    }
  }

  if (loading) return <AccountFrame><main className="wrap simple-page"><p>Loading the protected admin workspace...</p></main></AccountFrame>;
  if (error && !data) return <AccountFrame><main className="wrap simple-page"><ApiNotice error>{error}</ApiNotice><a className="button button-purple" href="/admin/login">Admin sign in <ArrowRight size={14} /></a></main></AccountFrame>;
  if (!data) return null;

  return <AccountFrame><main className="wrap account-page">
    <div className="account-heading"><div><span className="eyebrow">ADMINISTRATION</span><h1>Operations dashboard</h1><p>Review user accounts, candidate applications, and employer listings.</p></div><button className="button button-outline" onClick={() => { clearToken(); goTo("/admin/login", navigate); }}>Sign out</button></div>
    {error && <ApiNotice error>{error}</ApiNotice>}
    <section className="account-summary"><article><strong>{data.users.length}</strong><span>Accounts</span></article><article><strong>{data.jobs.length}</strong><span>Job listings</span></article><article><strong>{data.applications.length}</strong><span>Applications</span></article></section>
    <section className="info-panel account-panel"><h2>Job listing review</h2>{data.jobs.length === 0 ? <p className="empty-account">No listings have been submitted.</p> : <div className="account-record-list">{data.jobs.map((job) => <article key={job.id} className="account-record account-record-admin"><div><strong>{job.title}</strong><small>{job.employerName} · {job.category} · {job.location}</small><span className={`status-pill status-${job.status}`}>{job.status.replaceAll("_", " ")}</span></div><div className="admin-actions"><button className="button button-outline" disabled={busyJob === job.id} onClick={() => reviewJob(job.id, "rejected")}>Reject</button><button className="button button-purple" disabled={busyJob === job.id} onClick={() => reviewJob(job.id, "approved")}>{busyJob === job.id ? "Saving..." : "Approve"}</button></div></article>)}</div>}</section>
    <section className="info-panel account-panel"><h2>Candidate applications</h2>{data.applications.length === 0 ? <p className="empty-account">No applications have been submitted.</p> : <div className="account-record-list">{data.applications.map((application) => <article key={application.id} className="account-record"><div><strong>{application.jobTitle}</strong><small>{application.candidateName} · {new Date(application.createdAt).toLocaleDateString()}</small></div><span className={`status-pill status-${application.status}`}>{application.status}</span></article>)}</div>}</section>
    <section className="info-panel account-panel"><h2>Registered accounts</h2><div className="account-record-list">{data.users.map((user) => <article key={user.id} className="account-record"><div><strong>{user.name}</strong><small>{user.email}</small></div><span className="status-pill">{user.role}</span></article>)}</div></section>
  </main></AccountFrame>;
}
