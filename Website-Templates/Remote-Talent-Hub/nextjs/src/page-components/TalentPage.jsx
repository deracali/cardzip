import Link from "next/link";
import { BadgeCheck, MapPin } from "lucide-react";
import PageShell from "../components/PageShell";
import { talents } from "../data/marketplace";

export default function TalentPage() {
  return (
    <PageShell active="talent">
      <main>
        <section className="page-banner"><div className="wrap"><span className="eyebrow">A world of possibility</span><h1>Meet your next great teammate.</h1><p>Explore a global network of experienced, independent tech professionals.</p></div></section>
        <section className="wrap talent-listing"><div className="listing-toolbar"><strong>{talents.length} professionals</strong><span><BadgeCheck size={14} /> Profiles reviewed</span></div><div className="talent-grid">{talents.map((person) => <article className="talent-card" key={person.id}><div className={`talent-banner cover-${person.color}`} /><div className="talent-card-content"><span className={`logo-mark mark-${person.color}`}>{person.initials}</span><span className="verified"><BadgeCheck size={13} /> Verified profile</span><h2><Link href={`/talent/${person.id}`}>{person.name}</Link></h2><p>{person.title}</p><span className="talent-location"><MapPin size={13} /> {person.location}</span><div className="job-tags">{person.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="talent-card-bottom"><strong>{person.salary}</strong><Link className="button button-purple" href={`/talent/${person.id}`}>View profile</Link></div></div></article>)}</div></section>
      </main>
    </PageShell>
  );
}
