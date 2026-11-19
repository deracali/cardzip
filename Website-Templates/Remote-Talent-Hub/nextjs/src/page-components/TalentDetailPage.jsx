import Link from "next/link";
import { ArrowRight, MapPin, ShieldCheck } from "lucide-react";
import PageShell from "../components/PageShell";
import { getTalent } from "../data/marketplace";

export default function TalentDetailPage({ id }) {
  const person = getTalent(id);
  if (!person) return <PageShell active="talent"><main className="wrap simple-page"><h1>Profile not found</h1><Link className="button button-purple" href="/talent">Browse talent</Link></main></PageShell>;
  return (
    <PageShell active="talent">
      <main className="wrap detail-page">
        <div className="breadcrumbs"><Link href="/">Home</Link><ArrowRight size={13} /><Link href="/talent">Browse talent</Link><ArrowRight size={13} /><span>{person.name}</span></div>
        <section className="profile-header"><div className={`profile-cover cover-${person.color}`} /><div className="profile-top"><span className={`logo-mark mark-${person.color}`}>{person.initials}</span><div className="profile-identity"><h1>{person.name}</h1><p>{person.title}</p><span><MapPin size={13} /> {person.location}</span></div><div className="profile-actions"><Link className="button button-outline" href="/contact">Message</Link><Link className="button button-purple" href="/post-job">Hire talent <ArrowRight size={14} /></Link></div></div></section>
        <div className="profile-content"><section className="info-panel"><h2>About {person.name.split(" ")[0]}</h2><p>{person.about}</p><h2>Skills &amp; stack</h2><div className="profile-skill-list">{person.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></section><aside className="info-panel"><h2>Availability</h2><p><ShieldCheck size={14} /> Open to opportunities</p><p>{person.experience} experience</p><strong className="profile-rate">{person.salary}</strong><Link href="/post-job" className="button button-purple full">Contact {person.name.split(" ")[0]}</Link></aside></div>
      </main>
    </PageShell>
  );
}
