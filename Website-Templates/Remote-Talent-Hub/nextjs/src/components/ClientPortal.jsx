"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, ShieldCheck } from "lucide-react";
import PageShell from "./PageShell";
import { apiRequest, clearToken, getToken } from "../services/api";

export default function ClientPortal({ section = "overview" }) {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    let active = true;
    const token = getToken();
    if (!token) {
      router.replace("/login");
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
  }, [router]);

  async function updateApplication(id, status) {
    setError("");
    setBusyId(id);
    try {
      const result = await apiRequest(`/client/applications/${encodeURIComponent(id)}`, {
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
      setBusyId("");
    }
  }

  function signOut() {
    clearToken();
    router.replace("/login");
  }

  if (loading) return <PageShell><main className="wrap simple-page">Loading your protected dashboard...</main></PageShell>;
  if (error && !data) return <PageShell><main className="wrap simple-page"><p className="api-notice api-notice-error" role="alert">{error}</p><Link className="button button-purple" href="/login">Sign in again <ArrowRight size={14} /></Link></main></PageShell>;
  if (!data) return null;

  const employer = data.user.role === "employer";
  const activeSection = ["overview", "jobs", "applications", "profile"].includes(section)
    && (section !== "jobs" || employer) ? section : "overview";
  const pageTitles = {
    overview: "Dashboard overview",
    jobs: "Your job listings",
    applications: employer ? "Applications" : "My applications",
    profile: "Profile",
  };
  const pageDescriptions = {
    overview: employer ? "Manage your listings and review applicants." : "Keep track of your remote job search.",
    jobs: "Review listing status and complete payments for unpaid listings.",
    applications: employer ? "Review applicants for your job listings." : "Track each application you have submitted.",
    profile: "Your account details for the Remote.ly marketplace.",
  };
  return (
    <PageShell>
      <div className="workspace-layout">
        <aside className="workspace-sidebar">
          <Link className="workspace-sidebar-brand" href="/"><BriefcaseBusiness size={22} /><span>Remote Talent<small>{employer ? "Employer workspace" : "Candidate workspace"}</small></span></Link>
          <span className="workspace-nav-label">WORKSPACE</span>
          <nav aria-label="Client dashboard">
            <Link className={activeSection === "overview" ? "is-active" : ""} href="/dashboard"><BriefcaseBusiness size={17} /> Overview</Link>
            {employer ? <><Link className={activeSection === "jobs" ? "is-active" : ""} href="/dashboard/jobs"><BriefcaseBusiness size={17} /> Job listings</Link><Link className={activeSection === "applications" ? "is-active" : ""} href="/dashboard/applications"><CheckCircle2 size={17} /> Applications</Link><Link href="/post-job"><CheckCircle2 size={17} /> Post a job</Link><Link href="/talent"><ShieldCheck size={17} /> Browse talent</Link></> : <><Link className={activeSection === "applications" ? "is-active" : ""} href="/dashboard/applications"><CheckCircle2 size={17} /> My applications</Link><Link href="/jobs"><BriefcaseBusiness size={17} /> Find jobs</Link></>}
            <Link className={activeSection === "profile" ? "is-active" : ""} href="/dashboard/profile"><ShieldCheck size={17} /> Profile</Link>
          </nav>
          <div className="workspace-sidebar-footer"><Link href="/"><ArrowRight size={14} /> Back to marketplace</Link><span><i /> Secure workspace</span></div>
        </aside>
        <main className="wrap account-page client-workspace">
          <div className="account-heading"><div><span className="eyebrow">{employer ? "EMPLOYER WORKSPACE" : "CANDIDATE WORKSPACE"}</span><h1>{pageTitles[activeSection]}</h1><p>{pageDescriptions[activeSection]}</p></div><button className="button button-outline" onClick={signOut}>Sign out</button></div>
          {error && <p className="api-notice api-notice-error" role="alert">{error}</p>}
          {activeSection === "overview" && <>
            <section className="account-summary">
              <article><BriefcaseBusiness /><strong>{employer ? data.jobs.length : data.applications.length}</strong><span>{employer ? "Job listings" : "Applications"}</span></article>
              <article><CheckCircle2 /><strong>{employer ? data.applications.length : data.applications.filter((application) => application.status === "submitted").length}</strong><span>{employer ? "Applications" : "Submitted"}</span></article>
              {employer && <article><ShieldCheck /><strong>{data.applications.filter((application) => application.status === "submitted").length}</strong><span>New applications</span></article>}
            </section>
            <section className="remote-admin-shortcuts">
              <Link href={employer ? "/dashboard/jobs" : "/dashboard/applications"}><BriefcaseBusiness /><span><strong>{employer ? "Manage job listings" : "Track applications"}</strong><small>{employer ? "Check review status and manage your open roles." : "See the latest status of every application."}</small></span><ArrowRight /></Link>
              {employer && <Link href="/dashboard/applications"><CheckCircle2 /><span><strong>Review candidates</strong><small>Shortlist or decline applicants for your roles.</small></span><ArrowRight /></Link>}
              <Link href={employer ? "/post-job" : "/jobs"}><ArrowRight /><span><strong>{employer ? "Post another job" : "Find your next role"}</strong><small>{employer ? "Create a new remote job listing." : "Browse remote opportunities."}</small></span><ArrowRight /></Link>
            </section>
          </>}
          {activeSection === "jobs" && employer && <section className="info-panel account-panel"><div className="section-title-row"><div><h2>Your job listings</h2><p>Only listings linked to your account are shown.</p></div><Link className="button button-purple" href="/post-job">Post a job <ArrowRight size={14} /></Link></div>
            {data.jobs.length === 0 ? <p className="empty-account">You have not posted a job yet.</p> : <div className="account-record-list">{data.jobs.map((job) => <article key={job.id} className="account-record account-record-admin"><div><strong>{job.title}</strong><small>{job.category} · {job.location}</small><small>Payment: {job.paymentStatus || "unpaid"}</small></div><div className="admin-actions">{job.paymentStatus !== "paid" && <Link className="button button-purple" href={`/checkout?plan=${encodeURIComponent(job.plan)}&job=${encodeURIComponent(job.title)}&jobId=${encodeURIComponent(job.id)}`}>Pay now <ArrowRight size={14} /></Link>}<span className={`status-pill status-${job.status}`}>{job.status.replaceAll("_", " ")}</span></div></article>)}</div>}
          </section>}
          {activeSection === "applications" && <section className="info-panel account-panel"><h2>{employer ? "Applications for your listings" : "Your applications"}</h2>
            {data.applications.length === 0 ? <p className="empty-account">{employer ? "Applications for your listings will appear here." : "You have not submitted an application yet."}</p> : <div className="account-record-list">{data.applications.map((application) => <article key={application.id} className="account-record account-record-admin"><div><strong>{employer ? `${application.candidateName} · ${application.jobTitle}` : application.jobTitle}</strong><small>{employer ? `${application.candidateEmail} · ${new Date(application.createdAt).toLocaleDateString()}` : new Date(application.createdAt).toLocaleDateString()}</small>{employer && <span className={`status-pill status-${application.status}`}>{application.status}</span>}</div>{employer && <div className="admin-actions"><button className="button button-outline" disabled={busyId === application.id} onClick={() => updateApplication(application.id, "rejected")}>Reject</button><button className="button button-purple" disabled={busyId === application.id} onClick={() => updateApplication(application.id, "shortlisted")}>{busyId === application.id ? "Saving..." : "Shortlist"}</button></div>}{!employer && <span className={`status-pill status-${application.status}`}>{application.status}</span>}</article>)}</div>}
          </section>}
          {activeSection === "profile" && <section className="info-panel account-panel"><h2>Account details</h2><div className="account-record-list"><article className="account-record"><div><strong>Name</strong><small>{data.user.name}</small></div></article><article className="account-record"><div><strong>Email</strong><small>{data.user.email}</small></div></article><article className="account-record"><div><strong>Account type</strong><small>{employer ? "Employer" : "Candidate"}{data.user.primaryRole ? ` · ${data.user.primaryRole}` : ""}</small></div></article><article className="account-record"><div><strong>Member since</strong><small>{data.user.createdAt ? new Date(data.user.createdAt).toLocaleDateString() : "—"}</small></div></article></div></section>}
        </main>
      </div>
    </PageShell>
  );
}
