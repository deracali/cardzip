import Link from "next/link";
import { SiteFooter, SiteHeader } from "../../components/SiteShell";

export default function Page() {
  return <><SiteHeader /><main className="page-content"><span className="eyebrow">FOR ORGANIZERS</span><h1>Bring your next event to PulseLive</h1><p>Apply for an organizer account to propose events and manage booking activity. New organizer accounts require administrator approval before organizer tools are enabled.</p><Link className="button button-primary" href="/signup?accountType=organizer">Apply as an organizer</Link></main><SiteFooter /></>;
}
