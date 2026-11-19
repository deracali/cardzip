import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Code2, Globe2, Heart, MapPin, Search, Sparkles, Zap } from "lucide-react";
import PageShell from "../components/PageShell";
import JobCard from "../components/JobCard";
import { categories, jobs } from "../data/marketplace";

const icons = [Code2, Sparkles, BriefcaseBusiness, Zap, Globe2, Heart];

export default function HomePage() {
  return (
    <PageShell active="jobs">
      <main>
        <section className="hero-section">
          <div className="wrap hero-content">
            <span className="hero-eyebrow"><span /> THE WORLD IS YOUR WORKPLACE</span>
            <h1>Find your next remote tech job<br />or hire top global talent</h1>
            <p>Explore remote opportunities and meet exceptional professionals, wherever they call home.</p>
            <form className="hero-search" action="/jobs">
              <label><Search size={16} /><span><small>Job title / skill</small><input name="q" placeholder="React, Product Design..." /></span></label>
              <label><MapPin size={16} /><span><small>Location</small><select name="location"><option value="">Worldwide / Remote</option><option>Americas</option><option>Europe</option><option>Africa</option><option>Asia Pacific</option></select></span></label>
              <label><BriefcaseBusiness size={16} /><span><small>Job type</small><select name="type"><option value="">All types</option><option>Full-time</option><option>Contract</option><option>Part-time</option></select></span></label>
              <button className="button button-purple" type="submit"><Search size={15} /> Search jobs</button>
            </form>
            <div className="popular-searches"><span>Popular:</span>{["React", "Python", "UX Designer", "AI Engineer"].map((term) => <Link href={`/jobs?q=${encodeURIComponent(term)}`} key={term}>{term}</Link>)}</div>
          </div>
        </section>
        <section className="wrap category-section">
          <div className="section-title-row"><div><h2>Browse by category</h2><p>Find the work that fits your next move.</p></div><Link className="text-link" href="/jobs">View all jobs <ArrowRight size={14} /></Link></div>
          <div className="category-grid">{categories.map((category, index) => {
            const Icon = icons[index];
            return <Link className="category-card" href={`/jobs?q=${encodeURIComponent(category)}`} key={category}><span className={`logo-mark mark-${["violet", "orange", "green", "magenta", "gold", "blue"][index]}`}><Icon size={18} /></span><strong>{category}</strong><small>Remote opportunities</small><span>Explore roles <ArrowRight size={12} /></span></Link>;
          })}</div>
        </section>
        <section className="jobs-section"><div className="wrap">
          <div className="section-title-row"><div><h2>Featured remote jobs</h2><p>Explore opportunities from global teams.</p></div><Link className="text-link" href="/jobs">See all jobs <ArrowRight size={14} /></Link></div>
          <div className="job-list">{jobs.slice(0, 3).map((job) => <JobCard key={job.id} job={job} />)}</div>
        </div></section>
        <section className="wrap talent-callout"><div><span className="eyebrow">For global teams</span><h2>Great people are everywhere.</h2><p>Meet skilled professionals ready to build what is next.</p></div><Link className="button button-dark" href="/talent">Browse top talent <ArrowRight size={15} /></Link></section>
      </main>
    </PageShell>
  );
}
