import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness, ShieldCheck } from "lucide-react";
import PageShell from "../components/PageShell";

const plans = {
  standard: { name: "Standard Post", price: "$99", description: "Standard marketplace visibility for one job listing." },
  featured: { name: "Featured Post", price: "$249", description: "Priority placement for one job listing." },
};

export default function CheckoutPage({ planId = "featured", jobTitle = "New remote job", jobId = "" }) {
  const plan = plans[planId] || plans.featured;
  return <PageShell active="pricing"><main>
    <section className="page-banner checkout-banner"><div className="wrap"><span className="eyebrow">Checkout preview</span><h1>Review your order.</h1><p>No payment details are collected on this demo.</p></div></section>
    <section className="wrap checkout-layout">
      <div className="checkout-form"><div className="checkout-step-title"><span>1</span><div><h2>Payment integration required</h2><p>Connect and verify a payment provider before activating paid listings.</p></div></div><div className="checkout-terms"><ShieldCheck size={15} /> This preview does not charge a payment method or mark the listing as paid.</div><Link className="button button-purple full" href={jobId ? "/dashboard" : "/post-job"}>{jobId ? "View employer dashboard" : "Continue to job details"}</Link><Link className="checkout-back" href="/pricing"><ArrowLeft size={14} /> Back to plans</Link></div>
      <aside className="order-summary"><span className="eyebrow">ORDER SUMMARY</span><h2>{plan.name}</h2><p>{plan.description}</p><div className="summary-job"><span className="logo-mark"><BriefcaseBusiness size={16} /></span><span><small>Job listing</small><strong>{jobTitle}</strong></span></div><div className="summary-line"><span>Listing plan</span><strong>{plan.name}</strong></div><div className="summary-line"><span>Duration</span><strong>30 days</strong></div><div className="summary-line summary-total"><span>Preview total</span><strong>{plan.price} <small>USD</small></strong></div><p className="summary-small">Listing ID: {jobId || "Not submitted yet"}</p></aside>
    </section>
  </main></PageShell>;
}
