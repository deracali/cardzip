import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import PageShell from "../components/PageShell";

const plans = [
  { id: "standard", name: "Standard Post", price: "$99", description: "Get noticed by qualified candidates and start building your team.", features: ["One job listing", "Standard marketplace visibility", "Candidate application management"] },
  { id: "featured", name: "Featured Post", price: "$249", description: "Top-of-feed placement and faster candidate discovery.", features: ["One featured listing", "Priority placement", "Candidate application management"], featured: true },
];

export default function PricingPage() {
  return <PageShell active="pricing"><main>
    <section className="page-banner"><div className="wrap"><span className="eyebrow">Simple, transparent pricing</span><h1>Find the right people, faster.</h1><p>Choose the visibility that fits your hiring goals.</p></div></section>
    <section className="wrap pricing-layout">{plans.map((plan) => <article className={`plan-card${plan.featured ? " plan-featured" : ""}`} key={plan.id}>{plan.featured && <span className="plan-badge"><Zap size={12} /> MOST POPULAR</span>}<span className="eyebrow">{plan.featured ? "Maximum visibility" : "Great for getting started"}</span><h2>{plan.name}</h2><p>{plan.description}</p><div className="plan-price">{plan.price}<small>/30 days</small></div><ul>{plan.features.map((feature) => <li key={feature}><CheckCircle2 size={15} /> {feature}</li>)}</ul><Link className={`button ${plan.featured ? "button-purple" : "button-outline"} full`} href={`/checkout?plan=${plan.id}`}>Choose {plan.name} <ArrowRight size={15} /></Link></article>)}</section>
    <div className="wrap pricing-note"><ShieldCheck size={16} /><span>Checkout is a preview only. No payment is collected and listings remain unpublished until payment processing is connected.</span></div>
  </main></PageShell>;
}
