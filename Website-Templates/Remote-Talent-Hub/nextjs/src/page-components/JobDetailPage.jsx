"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Globe2, ShieldCheck } from "lucide-react";
import PageShell from "../components/PageShell";
import { apiRequest } from "../services/api";

function mapApiJob(job) {
  return {
    ...job,
    company: job.employerName,
    mark: (job.employerName || "R").slice(0, 1).toUpperCase(),
    color: "violet",
    salary: `${job.currency} ${Number(job.minSalary).toLocaleString()}–${Number(job.maxSalary).toLocaleString()}`,
    tags: job.skills || [],
  };
}

export default function JobDetailPage({ id, initialJob }) {
  const [job, setJob] = useState(initialJob || null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialJob) return undefined;
    let active = true;
    apiRequest(`/public/jobs/${encodeURIComponent(id)}`, { token: "" }).then(({ job: record }) => {
      if (active) setJob(mapApiJob(record));
    }).catch((requestError) => {
      if (active) setError(requestError.message);
    });
    return () => { active = false; };
  }, [id, initialJob]);

  if (!job) return <PageShell active="jobs"><main className="wrap simple-page">{error || "Loading job details..."}</main></PageShell>;
  return (
    <PageShell active="jobs">
      <main className="wrap detail-page">
        <div className="breadcrumbs"><Link href="/">Home</Link><ArrowRight size={13} /><Link href="/jobs">Find jobs</Link><ArrowRight size={13} /><span>{job.company}</span></div>
        <div className="job-detail-layout">
          <article>
            <section className="job-detail-header"><div className="company-cover cover-violet" /><span className="logo-mark mark-violet">{job.mark}</span><div className="detail-job-heading"><h1>{job.title}</h1><p>{job.company} · {job.location}</p><div className="job-tags"><span className="salary-tag">{job.salary}</span><span>{job.type}</span>{job.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div></div></section>
            <div className="detail-content"><h2>Role overview</h2><p>{job.description}</p><h3>What we are looking for</h3><ul><li>Relevant experience and a thoughtful portfolio of work.</li><li>Clear written communication and a collaborative approach.</li><li>Comfort working asynchronously across time zones.</li></ul></div>
          </article>
          <aside className="apply-card"><span className="eyebrow">Ready for your next move?</span><h2>Apply for this role</h2><p>Introduce yourself to the {job.company} team.</p><Link className="button button-purple full" href={`/apply/${job.id}`}>Apply now <ArrowRight size={15} /></Link><p className="privacy-hint"><ShieldCheck size={14} /> Your profile is shared only with this employer.</p><hr /><p><Globe2 size={13} /> Remote-first team</p></aside>
        </div>
      </main>
    </PageShell>
  );
}
