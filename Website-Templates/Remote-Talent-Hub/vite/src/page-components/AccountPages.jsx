import { useEffect, useState } from "react";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, ShieldCheck, Users } from "lucide-react";
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
      <p className="auth-subtitle">{admin ? "Use the local demo administrator account documented in the Vite README." : signup ? "Choose how you will use the talent marketplace." : "Access your candidate or employer workspace."}</p>
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
      <p className="auth-security"><ShieldCheck size={13} /> Vite demo accounts and records stay in this browser.</p>
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
      setNotice("Your application has been saved to this browser's local demo workspace.");
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
    <p>Sign in as a candidate to save and track your application in this browser's local demo workspace.</p>
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
  return <AccountFrame><div className="workspace-layout">
    <aside className="workspace-sidebar">
      <a className="workspace-sidebar-brand" href="/"><BriefcaseBusiness size={22} /><span>Remote Talent<small>{employer ? "Employer workspace" : "Candidate workspace"}</small></span></a>
      <span className="workspace-nav-label">WORKSPACE</span>
      <nav aria-label="Client dashboard">
        <a className="is-active" href="/dashboard"><BriefcaseBusiness size={17} /> Overview</a>
        {employer ? <><a href="/post-job"><CheckCircle2 size={17} /> Post a job</a><a href="/talent"><ShieldCheck size={17} /> Browse talent</a><a href="/dashboard#applications"><CheckCircle2 size={17} /> Applications</a></> : <><a href="/jobs"><BriefcaseBusiness size={17} /> Find jobs</a><a href="/dashboard#applications"><CheckCircle2 size={17} /> My applications</a><a href="/talent"><ShieldCheck size={17} /> Browse talent</a></>}
      </nav>
      <div className="workspace-sidebar-footer"><a href="/">Back to marketplace <ArrowRight size={14} /></a><span><i /> Secure workspace</span></div>
    </aside>
    <main className="wrap account-page client-workspace">
      <div className="account-heading"><div><span className="eyebrow">{employer ? "EMPLOYER WORKSPACE" : "CANDIDATE WORKSPACE"}</span><h1>Welcome, {data.user.name}</h1><p>{employer ? "Manage your listings and review their moderation status." : "Track the applications you have submitted."}</p></div><button className="button button-outline" onClick={() => { clearToken(); goTo("/login", navigate); }}>Sign out</button></div>
      <section className="account-summary"><article><BriefcaseBusiness /><strong>{records.length}</strong><span>{employer ? "Job listings" : "Applications"}</span></article><article><CheckCircle2 /><strong>{records.filter((item) => item.status === "approved" || item.status === "submitted").length}</strong><span>{employer ? "Approved or in review" : "Submitted"}</span></article></section>
      <section className="info-panel account-panel" id={employer ? "listings" : "applications"}><div className="section-title-row"><div><h2>{employer ? "Your job listings" : "Your applications"}</h2><p>Your records are saved to this browser's local demo workspace.</p></div>{employer && <a className="button button-purple" href="/post-job">Post a job <ArrowRight size={14} /></a>}</div>
        {records.length === 0 ? <p className="empty-account">{employer ? "You have not posted a job yet." : "You have not submitted an application yet."}</p> :
          <div className="account-record-list">{records.map((item) => <article key={item.id} className="account-record"><div><strong>{employer ? item.title : item.jobTitle}</strong><small>{employer ? `${item.category} · ${item.location}` : new Date(item.createdAt).toLocaleDateString()}</small>{employer && item.paymentStatus === "demo" && <small>Local demo listing; no payment was collected.</small>}</div><span className={`status-pill status-${item.status}`}>{item.status.replaceAll("_", " ")}</span></article>)}</div>}
      </section>
      {employer && <section className="info-panel account-panel" id="applications"><h2>Applications for your listings</h2>{data.applications.length === 0 ? <p className="empty-account">Applications for your approved listings will appear here.</p> : <div className="account-record-list">{data.applications.map((application) => <article key={application.id} className="account-record account-record-admin"><div><strong>{application.candidateName} · {application.jobTitle}</strong><small>{application.candidateEmail} · {new Date(application.createdAt).toLocaleDateString()}</small><span className={`status-pill status-${application.status}`}>{application.status}</span></div><div className="admin-actions"><button className="button button-outline" disabled={busyApplication === application.id} onClick={() => updateApplication(application.id, "rejected")}>Reject</button><button className="button button-purple" disabled={busyApplication === application.id} onClick={() => updateApplication(application.id, "shortlisted")}>{busyApplication === application.id ? "Saving..." : "Shortlist"}</button></div></article>)}</div>}</section>}
    </main>
  </div></AccountFrame>;
}

const adminSections = {
  overview: { title: "Operations overview", description: "A local demo view of marketplace activity and moderation." },
  jobs: { title: "Job listings", description: "Post platform listings and review employer submissions." },
  applications: { title: "Applications", description: "Review candidate applications across the marketplace." },
  accounts: { title: "Accounts", description: "View registered candidates, employers, and administrators." },
};

export function AdminDashboardPage({ navigate, section = "overview" }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyJob, setBusyJob] = useState("");
  const [busyApplication, setBusyApplication] = useState("");
  const [creating, setCreating] = useState(false);
  const activeSection = adminSections[section] ? section : "overview";

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

  async function createJob(event) {
    event.preventDefault();
    setError("");
    setCreating(true);
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form).entries());
    try {
      const result = await apiRequest("/admin/jobs", { method: "POST", body });
      setData((current) => ({ ...current, jobs: [result.job, ...current.jobs] }));
      form.reset();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setCreating(false);
    }
  }

  async function updateApplication(id, status) {
    setError("");
    setBusyApplication(id);
    try {
      const result = await apiRequest(`/admin/applications/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: { status },
      });
      setData((current) => ({
        ...current,
        applications: current.applications.map((application) => application.id === id ? result.application : application),
      }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyApplication("");
    }
  }

  const navigation = [
    { key: "overview", label: "Overview", href: "/admin", icon: ShieldCheck },
    { key: "jobs", label: "Job listings", href: "/admin/jobs", icon: BriefcaseBusiness },
    { key: "applications", label: "Applications", href: "/admin/applications", icon: CheckCircle2 },
    { key: "accounts", label: "Accounts", href: "/admin/accounts", icon: Users },
  ];

  return <div className="remote-admin-layout">
    <aside className="remote-admin-sidebar">
      <a className="remote-admin-brand" href="/admin"><span className="brand-icon"><ShieldCheck size={19} /></span><span>Remote.ly<small>ADMIN CONSOLE</small></span></a>
      <span className="workspace-nav-label">WORKSPACE</span>
      <nav aria-label="Administrator pages">
        {navigation.map(({ key, label, href, icon: Icon }) => <a className={activeSection === key ? "is-active" : ""} href={href} key={key}><Icon size={17} /> {label}</a>)}
      </nav>
      <div className="remote-admin-sidebar-footer"><span><i /> Local demo workspace</span></div>
    </aside>
    <main className="remote-admin-content">
      <header className="remote-admin-topbar"><span>Administration <b>/</b> {adminSections[activeSection].title}</span><button className="button button-outline" onClick={() => { clearToken(); goTo("/admin/login", navigate); }}>Sign out</button></header>
      <div className="account-heading"><div><span className="eyebrow">ADMINISTRATION</span><h1>{adminSections[activeSection].title}</h1><p>{adminSections[activeSection].description}</p></div></div>
      {error && <ApiNotice error>{error}</ApiNotice>}
      {loading && <section className="info-panel"><p>Loading local demo data...</p></section>}
      {error && !data && <section className="info-panel"><a className="button button-purple" href="/admin/login">Admin sign in <ArrowRight size={14} /></a></section>}
      {data && activeSection === "overview" && <>
        <section className="account-summary admin-summary">
          <article><Users /><strong>{data.users.length}</strong><span>Registered accounts</span></article>
          <article><BriefcaseBusiness /><strong>{data.jobs.length}</strong><span>Job listings</span></article>
          <article><CheckCircle2 /><strong>{data.applications.length}</strong><span>Applications</span></article>
        </section>
        <section className="remote-admin-shortcuts">
          <a href="/admin/jobs"><BriefcaseBusiness /><span><strong>Manage job listings</strong><small>Post a platform job or review employer submissions.</small></span><ArrowRight /></a>
          <a href="/admin/applications"><CheckCircle2 /><span><strong>Review applications</strong><small>Inspect and update candidate application statuses.</small></span><ArrowRight /></a>
          <a href="/admin/accounts"><Users /><span><strong>Browse accounts</strong><small>View all registered user roles and contact details.</small></span><ArrowRight /></a>
        </section>
      </>}
      {data && activeSection === "jobs" && <>
        <form className="info-panel remote-admin-job-form" onSubmit={createJob}>
          <div className="section-title-row"><div><h2>Post a platform job</h2><p>New admin listings enter review and are clearly marked as local demo data.</p></div></div>
          <div className="remote-admin-job-fields">
            <label className="field-label">Company<input name="employerName" minLength={2} required /></label>
            <label className="field-label">Job title<input name="title" minLength={2} required /></label>
            <label className="field-label">Category<input name="category" minLength={2} required /></label>
            <label className="field-label">Employment type<input name="type" placeholder="Full-time" required /></label>
            <label className="field-label">Work mode<input name="workMode" placeholder="Remote" required /></label>
            <label className="field-label">Location<input name="location" placeholder="Worldwide" required /></label>
            <label className="field-label">Currency<input name="currency" defaultValue="USD" minLength={3} maxLength={3} required /></label>
            <label className="field-label">Minimum salary<input name="minSalary" type="number" min="0" required /></label>
            <label className="field-label">Maximum salary<input name="maxSalary" type="number" min="0" required /></label>
            <label className="field-label">Plan<select name="plan" defaultValue="standard"><option value="standard">Standard</option><option value="featured">Featured</option></select></label>
            <label className="field-label remote-admin-job-wide">Skills<input name="skills" placeholder="React, TypeScript, Accessibility" /></label>
            <label className="field-label remote-admin-job-wide">Description<textarea name="description" rows={4} minLength={30} required /></label>
          </div>
          <button className="button button-purple" type="submit" disabled={creating}>{creating ? "Posting..." : "Post job for review"} <ArrowRight size={14} /></button>
        </form>
        <section className="info-panel account-panel"><h2>Job listings</h2>{data.jobs.length === 0 ? <p className="empty-account">No job listings have been submitted.</p> : <div className="account-record-list">{data.jobs.map((job) => <article key={job.id} className="account-record account-record-admin"><div><strong>{job.title}</strong><small>{job.employerName} · {job.category} · {job.location}</small><span className={`status-pill status-${job.status}`}>{job.status.replaceAll("_", " ")}</span>{job.paymentStatus === "demo" && <small>Local demo listing; no payment was collected.</small>}</div><div className="admin-actions"><button className="button button-outline" disabled={busyJob === job.id} onClick={() => reviewJob(job.id, "rejected")}>Reject</button><button className="button button-purple" disabled={busyJob === job.id} onClick={() => reviewJob(job.id, "approved")}>{busyJob === job.id ? "Saving..." : "Approve"}</button></div></article>)}</div>}</section>
      </>}
      {data && activeSection === "applications" && <section className="info-panel account-panel"><h2>Candidate applications</h2>{data.applications.length === 0 ? <p className="empty-account">No applications have been submitted.</p> : <div className="account-record-list">{data.applications.map((application) => <article key={application.id} className="account-record account-record-admin"><div><strong>{application.jobTitle}</strong><small>{application.candidateName} · {application.candidateEmail} · {new Date(application.createdAt).toLocaleDateString()}</small><span className={`status-pill status-${application.status}`}>{application.status}</span></div><div className="admin-actions"><button className="button button-outline" disabled={busyApplication === application.id} onClick={() => updateApplication(application.id, "rejected")}>Reject</button><button className="button button-purple" disabled={busyApplication === application.id} onClick={() => updateApplication(application.id, "reviewed")}>{busyApplication === application.id ? "Saving..." : "Mark reviewed"}</button></div></article>)}</div>}</section>}
      {data && activeSection === "accounts" && <section className="info-panel account-panel"><h2>Registered accounts</h2>{data.users.length === 0 ? <p className="empty-account">No accounts have been registered.</p> : <div className="account-record-list">{data.users.map((user) => <article key={user.id} className="account-record"><div><strong>{user.name}</strong><small>{user.email}</small></div><span className="status-pill">{user.role}</span></article>)}</div>}</section>}
    </main>
  </div>;
}
