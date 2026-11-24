import { SiteFooter, SiteHeader } from "../../components/SiteShell";
import ImageWithFallback from "../../components/ImageWithFallback";
import { starterSessions, starterSpeakers } from "../../lib/eventData";

export default function Page() {
  return <><SiteHeader /><main className="page-content"><span className="eyebrow">PULSELIVE PROGRAM</span><h1>Schedule & speakers</h1><p>Plan your day around conversations, performances, and hands-on sessions.</p><div className="schedule-list">{starterSessions.map((session) => <article key={session.title}><time>{session.time}</time><div><small>{session.track}</small><h2>{session.title}</h2><p>{session.speaker}</p></div></article>)}</div><section className="speaker-grid" aria-label="Featured speakers">{starterSpeakers.map((speaker) => <article className="speaker-card" key={speaker.name}><ImageWithFallback src={speaker.image} alt={speaker.name} /><h2>{speaker.name}</h2><p>{speaker.role}</p></article>)}</section></main><SiteFooter /></>;
}
