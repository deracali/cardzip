import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components/SiteShell";
import EventBrowser from "../components/EventBrowser";

export default function Page() {
  return <>
    <SiteHeader />
    <main>
      <section className="hero">
        <span className="eyebrow">LIVE MUSIC · FESTIVALS · IDEAS</span>
        <h1>Make room for a night worth remembering.</h1>
        <p>Discover the shows, festivals, and gatherings that bring your city to life.</p>
        <Link className="button button-primary" href="/events">Explore events</Link>
      </section>
      <section className="home-events"><div className="section-title"><div><span className="eyebrow">CURATED FOR YOU</span><h2>Find your next favorite</h2></div><Link href="/events">See all events →</Link></div><EventBrowser compact /></section>
    </main>
    <SiteFooter />
  </>;
}
