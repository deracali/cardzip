import Link from "next/link";
import { FoodFooter, FoodHeader } from "./FoodShell";

export default function TrackingDemo() {
  return <><FoodHeader /><main className="tracking-page"><span className="food-kicker">DELIVERY TRACKING PREVIEW</span><h1>Track a demo order</h1><p>This screen is illustrative only; it is not connected to a courier or live GPS.</p><section className="tracking-card"><strong>Order FD-9842</strong><h2>Arriving in 18 minutes</h2><p>Forno Antico · Delivery status preview</p><div className="tracking-steps"><span>Order received</span><span>Preparing</span><span>On the way</span></div></section><Link href="/dashboard">View your order history →</Link></main><FoodFooter /></>;
}
