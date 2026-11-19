"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock3, Filter, Search } from "lucide-react";
import PageShell from "../components/PageShell";
import JobCard from "../components/JobCard";
import { jobs as sampleJobs } from "../data/marketplace";
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

export default function JobsPage({ initialQuery = "" }) {
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState("");
  const [liveJobs, setLiveJobs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest("/public/jobs", { token: "" }).then(({ jobs }) => {
      if (active) setLiveJobs(jobs.map(mapApiJob));
    }).catch((requestError) => {
      if (active) setError(`Live employer listings are unavailable: ${requestError.message}`);
    });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => [...liveJobs, ...sampleJobs].filter((job) =>
    `${job.title} ${job.company} ${job.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase()) &&
    (!type || job.type === type),
  ), [liveJobs, query, type]);

  return (
    <PageShell active="jobs">
      <main>
        <section className="page-banner"><div className="wrap"><span className="eyebrow">Global remote opportunities</span><h1>Find your next remote role.</h1><p>Work with great teams from wherever you do your best work.</p><form className="listing-search" onSubmit={(event) => event.preventDefault()}><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Job title, skill, or company" /><button className="button button-purple" type="submit">Search jobs</button></form></div></section>
        <section className="wrap listing-layout"><div>
          {error && <p className="api-notice api-notice-error" role="status">{error}</p>}
          <div className="listing-toolbar"><strong>{filtered.length} remote roles</strong><label><Filter size={14} /><select value={type} onChange={(event) => setType(event.target.value)}><option value="">All job types</option><option>Full-time</option><option>Contract</option><option>Part-time</option></select></label><span><Clock3 size={14} /> Updated today</span></div>
          <div className="job-list">{filtered.length ? filtered.map((job) => <JobCard key={job.id} job={job} />) : <div className="empty-card"><Search size={22} /><h2>No matching jobs yet</h2><p>Try a different title, skill, or job type.</p><button className="button button-outline" onClick={() => { setQuery(""); setType(""); }}>Clear filters</button></div>}</div>
        </div></section>
      </main>
    </PageShell>
  );
}
