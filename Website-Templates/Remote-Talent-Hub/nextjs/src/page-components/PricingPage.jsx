"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import PageShell from "../components/PageShell";
import { apiRequest } from "../services/api";

const plans = [
  { id: "standard", name: "Standard Post", description: "Get noticed by qualified candidates and start building your team.", features: ["One job listing", "Standard marketplace visibility", "Candidate application management"] },
  { id: "featured", name: "Featured Post", description: "Top-of-feed placement and faster candidate discovery.", features: ["One featured listing", "Priority placement", "Candidate application management"], featured: true },
];

export default function PricingPage() {
  const [quotes, setQuotes] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all(plans.map(async (plan) => {
      const quote = await apiRequest(`/payments/quote?plan=${plan.id}`, { token: "" });
      return [plan.id, quote];
    })).then((results) => {
      if (active) setQuotes(Object.fromEntries(results));
    }).catch((requestError) => {
      if (active) setError(requestError.message);
    });
    return () => { active = false; };
  }, []);

  return <PageShell active="pricing"><main>
    <section className="page-banner"><div className="wrap"><span className="eyebrow">Simple, transparent pricing</span><h1>Find the right people, faster.</h1><p>Choose the visibility that fits your hiring goals.</p></div></section>
    {error && <p className="wrap api-notice api-notice-error" role="alert">{error}</p>}
    <section className="wrap pricing-layout">{plans.map((plan) => {
      const quote = quotes[plan.id];
      const price = quote
        ? new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(quote.amount)
        : error ? "Quote unavailable" : "Loading live quote...";
      return <article className={`plan-card${plan.featured ? " plan-featured" : ""}`} key={plan.id}>{plan.featured && <span className="plan-badge"><Zap size={12} /> MOST POPULAR</span>}<span className="eyebrow">{plan.featured ? "Maximum visibility" : "Great for getting started"}</span><h2>{plan.name}</h2><p>{plan.description}</p><div className="plan-price">{price}<small>/30 days</small></div>{quote && <p className="pricing-rate-note">Converted from ${quote.baseAmount} USD at the current exchange rate.</p>}<ul>{plan.features.map((feature) => <li key={feature}><CheckCircle2 size={15} /> {feature}</li>)}</ul><Link className={`button ${plan.featured ? "button-purple" : "button-outline"} full`} href={`/post-job?plan=${plan.id}`}>Choose {plan.name} <ArrowRight size={15} /></Link></article>;
    })}</section>
    <div className="wrap pricing-note"><ShieldCheck size={16} /><span>Prices are converted to NGN using a live USD exchange rate. Final amount is recalculated by the server before payment.</span></div>
  </main></PageShell>;
}
