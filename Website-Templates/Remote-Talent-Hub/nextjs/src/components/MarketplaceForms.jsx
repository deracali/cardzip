"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import PageShell from "./PageShell";
import { apiRequest, getToken } from "../services/api";

export function JobApplicationForm({ id, initialJobTitle }) {
  const router = useRouter();
  const [jobTitle, setJobTitle] = useState(initialJobTitle || id.replaceAll("-", " "));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (initialJobTitle) return undefined;
    let active = true;
    apiRequest(`/public/jobs/${encodeURIComponent(id)}`, { token: "" }).then(({ job }) => {
      if (active) setJobTitle(job.title);
    }).catch((requestError) => {
      if (active) setError(requestError.message);
    });
    return () => { active = false; };
  }, [id, initialJobTitle]);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!getToken()) {
      router.push(`/login?role=candidate&next=${encodeURIComponent(`/apply/${id}`)}`);
      return;
    }
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await apiRequest("/client/applications", {
        method: "POST",
        body: {
          jobId: id,
          jobTitle,
          message: String(form.get("message") || ""),
          portfolioUrl: String(form.get("portfolioUrl") || ""),
        },
      });
      setNotice("Your application has been submitted.");
      event.currentTarget.reset();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return <PageShell><main className="wrap simple-page"><div className="form-card">
    <Link className="text-link" href={`/jobs/${id}`}>Back to job details</Link>
    <span className="eyebrow">APPLICATION</span><h1>Apply for {jobTitle}</h1>
    <p>Sign in as a candidate to securely submit and track your application.</p>
    <form onSubmit={submit}>
      <label className="field-label">Why are you a good fit?<textarea name="message" rows="5" minLength={20} placeholder="Share a little about your experience." required /></label>
      <label className="field-label">Portfolio or LinkedIn URL<input name="portfolioUrl" type="url" placeholder="https://" /></label>
      {error && <p className="api-notice api-notice-error" role="alert">{error} <Link href="/login?role=candidate">Sign in</Link></p>}
      {notice && <p className="api-notice" role="status">{notice} <Link href="/dashboard">View your dashboard</Link></p>}
      <button className="button button-purple full" type="submit" disabled={busy}>{busy ? "Submitting..." : "Submit application"} <ArrowRight size={15} /></button>
    </form>
  </div></main></PageShell>;
}

export function EmployerJobForm({ initialPlan = "standard" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState(["standard", "featured"].includes(initialPlan) ? initialPlan : "standard");
  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState("");

  useEffect(() => {
    let active = true;
    setQuote(null);
    setQuoteError("");
    apiRequest(`/payments/quote?plan=${plan}`, { token: "" }).then((result) => {
      if (active) setQuote(result);
    }).catch((requestError) => {
      if (active) setQuoteError(requestError.message);
    });
    return () => { active = false; };
  }, [plan]);

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!getToken()) {
      router.push("/login?role=employer&next=%2Fpost-job");
      return;
    }
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    body.plan = plan;
    setBusy(true);
    try {
      const { job } = await apiRequest("/client/jobs", { method: "POST", body });
      router.push(`/checkout?plan=${plan}&job=${encodeURIComponent(job.title)}&jobId=${encodeURIComponent(job.id)}`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return <PageShell active="post"><main className="post-page"><div className="wrap post-wrap">
    <div className="post-heading"><div><Link className="breadcrumbs-link" href="/"><ArrowRight size={14} /> Home</Link><h1>Post a new job</h1><p>Reach remote professionals and manage candidates in your employer workspace.</p></div></div>
    <div className="post-layout"><form className="post-form" onSubmit={submit}>
      <section className="form-section"><h2><span>1.</span> Job details</h2><label className="field-label">Job title<input name="title" minLength={2} placeholder="Senior Full-Stack Engineer" required /></label><label className="field-label">Category<select name="category">{["Software Engineering", "UX/UI Design", "Product Management", "AI & Data", "Marketing", "Customer Success"].map((item) => <option key={item}>{item}</option>)}</select></label><div className="field-row"><label className="field-label">Employment type<select name="type"><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Freelance</option></select></label><label className="field-label">Work type<select name="workMode"><option>Remote</option><option>Hybrid</option><option>On-site</option></select></label></div><label className="field-label">Skills &amp; tags<input name="skills" placeholder="React, TypeScript, Node.js" /></label><label className="field-label">Job description<textarea name="description" rows="7" minLength={30} placeholder="Describe the role, your team, and what success looks like." required /></label></section>
      <section className="form-section"><h2><span>2.</span> Compensation &amp; location</h2><div className="field-row"><label className="field-label">Currency<select name="currency"><option>USD</option><option>EUR</option><option>GBP</option><option>CAD</option></select></label><label className="field-label">Location<input name="location" defaultValue="Worldwide / Remote" minLength={2} required /></label></div><div className="field-row"><label className="field-label">Minimum annual salary<input name="minSalary" type="number" min="0" defaultValue="120000" required /></label><label className="field-label">Maximum annual salary<input name="maxSalary" type="number" min="0" defaultValue="180000" required /></label></div><label className="field-label">Screening questions<textarea name="questions" rows="4" placeholder="Optional questions for applicants" /></label></section>
      <section className="form-section"><h2><span>3.</span> Choose a plan</h2><div className="inline-plans">{[{ id: "standard", name: "Standard Post" }, { id: "featured", name: "Featured Post" }].map((item) => <label className={`inline-plan${plan === item.id ? " selected" : ""}`} key={item.id}><input type="radio" name="plan-choice" checked={plan === item.id} onChange={() => setPlan(item.id)} /><span><strong>{item.name}</strong><small>30-day listing · NGN price at live exchange rate</small></span><b>{quote?.plan === item.id ? new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(quote.amount) : "Loading..."}</b></label>)}</div>{quoteError && <p className="api-notice api-notice-error" role="alert">{quoteError}</p>}</section>
      {error && <p className="api-notice api-notice-error" role="alert">{error}</p>}
      <div className="form-actions"><Link className="button button-outline" href="/dashboard">Cancel</Link><button className="button button-purple" type="submit" disabled={busy}>{busy ? "Submitting..." : "Continue to checkout"} <ArrowRight size={14} /></button></div>
    </form><aside className="job-preview-sidebar"><span className="eyebrow">EMPLOYER WORKFLOW</span><h2>Moderated listing</h2><p>Your listing is saved to your employer account and reviewed by an administrator. A listing is published only after payment and approval.</p><p><ShieldCheck size={14} /> Only your account can manage this submission.</p></aside></div>
  </div></main></PageShell>;
}
