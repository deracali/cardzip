import { SiteFooter, SiteHeader } from "../../components/SiteShell";
import EventBrowser from "../../components/EventBrowser";

export default function Page() {
  return <><SiteHeader /><main className="page-content"><span className="eyebrow">PULSELIVE DISCOVERY</span><h1>Explore events</h1><p>Search upcoming experiences by title, city, or category.</p><EventBrowser /></main><SiteFooter /></>;
}
