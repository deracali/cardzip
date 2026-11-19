import Link from "next/link";
import { ArrowUpRight, Bookmark, Globe2 } from "lucide-react";

export default function JobCard({ job }) {
  return (
    <article className="job-card">
      <span className={`logo-mark mark-${job.color || "violet"}`}>{job.mark || job.company?.[0] || "R"}</span>
      <div className="job-info">
        <Link className="job-title" href={`/jobs/${job.id}`}>{job.title}</Link>
        <p className="job-company">{job.company} <span>·</span> {job.location}</p>
        <div className="job-tags"><span className="salary-tag">{job.salary}</span><span>{job.type}</span>{(job.tags || []).slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}</div>
        <p className="job-remote"><Globe2 size={12} /> Remote · recently posted</p>
      </div>
      <div className="job-card-actions">
        <span className="icon-button" aria-hidden="true"><Bookmark size={16} /></span>
        <Link className="button button-purple apply-small" href={`/jobs/${job.id}`}>View job <ArrowUpRight size={13} /></Link>
      </div>
    </article>
  );
}
