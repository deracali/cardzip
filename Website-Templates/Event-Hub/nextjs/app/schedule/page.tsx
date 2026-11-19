import { SiteFooter, SiteHeader } from "../../components/SiteShell";

const sessions = [
  ["09:00 AM", "MAIN STAGE", "Opening Keynote: The Live Era", "Maya Chen · PulseLive"],
  ["10:15 AM", "STUDIO A", "Designing for Real-World Audiences", "James Park · Northstar"],
  ["11:30 AM", "MAIN STAGE", "Creative Teams That Break Boundaries", "Amara Okafor · FutureForm"],
  ["01:30 PM", "STUDIO B", "From First Note to Festival Set", "DJ Kairo · Independent artist"],
];

export default function Page() {
  return <><SiteHeader /><main className="page-content"><span className="eyebrow">PULSELIVE PROGRAM</span><h1>Schedule & speakers</h1><p>Plan your day around conversations, performances, and hands-on sessions.</p><div className="schedule-list">{sessions.map(([time, track, title, speaker]) => <article key={title}><time>{time}</time><div><small>{track}</small><h2>{title}</h2><p>{speaker}</p></div></article>)}</div></main><SiteFooter /></>;
}
