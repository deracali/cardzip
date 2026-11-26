import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import PriceEstimator from "../../components/PriceEstimator";

export default function Page() {
  return <><SiteHeader /><main className="info-page"><header className="info-hero"><span className="eyebrow">UPFRONT, STRAIGHTFORWARD PRICING</span><h1>Know what to expect before you book.</h1><p>Choose your repair and visit timing to see a transparent starting estimate. Your technician confirms the flat rate before work begins.</p></header><PriceEstimator /><footer className="site-footer"><Link className="brand" href="/">FixFlow Pro</Link><span>Estimates are not confirmed appointment prices.</span></footer></main></>;
}
