import Link from "next/link";
import { ArrowRight, Bike, Check, Clock3, MapPin } from "lucide-react";
import { imageUrl } from "../lib/menu";
import { FoodFooter, FoodHeader } from "./FoodShell";

const steps = [
  { number: "01", title: "Choose your meal", detail: "Explore neighborhood menus and add your favorites to the cart." },
  { number: "02", title: "Set delivery details", detail: "Add your address and delivery instructions at checkout." },
  { number: "03", title: "Follow your order", detail: "Check the sample delivery status on the tracking page." },
];

export default function DeliveryGuide() {
  return (
    <>
      <FoodHeader />
      <main className="food-main info-page">
        <section className="info-hero">
          <div className="info-hero-copy">
            <span className="promo-pill"><Bike size={13} /> DELIVERY THAT FITS YOUR DAY</span>
            <h1>Good food, right to your door.</h1>
            <p>Browse neighborhood favorites, place a demo order, and follow each step from kitchen to doorstep.</p>
            <div className="info-actions">
              <Link className="button red-button" href="/">Browse the menu <ArrowRight size={14} /></Link>
              <Link className="button outline-button" href="/track">Track a delivery</Link>
            </div>
          </div>
          <img src={imageUrl("photo-1526367790999-0150786686a2", 1000)} alt="A courier delivering a restaurant meal" />
        </section>
        <section className="info-section">
          <div className="section-title-row"><div><span className="reservation-kicker">SIMPLE FROM START TO FINISH</span><h2>How delivery works</h2></div></div>
          <div className="info-card-grid">
            {steps.map((step) => (
              <article className="info-card" key={step.number}>
                <span>{step.number}</span><h3>{step.title}</h3><p>{step.detail}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="info-callout">
          <div>
            <span className="reservation-kicker"><MapPin size={12} /> GREENWICH VILLAGE</span>
            <h2>Fresh meals around the neighborhood</h2>
            <p>Sample delivery times are usually 25–35 minutes. Availability and timing on this preview site are for demonstration.</p>
          </div>
          <Link className="button red-button" href="/restaurant">Start an order <ArrowRight size={14} /></Link>
        </section>
        <section className="delivery-promise"><Check size={16} /><span><strong>Easy to follow.</strong> Use the tracking page for a sample order journey.</span><Link href="/track">Track order <Clock3 size={13} /></Link></section>
      </main>
      <FoodFooter />
    </>
  );
}
