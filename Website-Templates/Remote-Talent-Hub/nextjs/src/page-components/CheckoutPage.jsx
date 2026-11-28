"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, ShieldCheck } from "lucide-react";
import PageShell from "../components/PageShell";
import { apiRequest, getToken } from "../services/api";

const plans = {
  standard: { name: "Standard Post", baseAmount: 99, description: "Standard marketplace visibility for one job listing." },
  featured: { name: "Featured Post", baseAmount: 249, description: "Priority placement for one job listing." },
};

function formatNaira(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CheckoutPage({
  planId = "featured",
  jobTitle = "New remote job",
  jobId = "",
  paymentReference = "",
}) {
  const plan = plans[planId] || plans.featured;
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState("");
  const [paymentState, setPaymentState] = useState(paymentReference ? "verifying" : "");
  const [busy, setBusy] = useState(false);
  const [authorizationUrl, setAuthorizationUrl] = useState("");

  useEffect(() => {
    if (!jobId) return undefined;
    let active = true;
    apiRequest(`/payments/quote?plan=${encodeURIComponent(planId)}`, { token: "" }).then((result) => {
      if (active) setQuote(result);
    }).catch((requestError) => {
      if (active) setError(requestError.message);
    });
    return () => { active = false; };
  }, [jobId, planId]);

  useEffect(() => {
    if (!paymentReference) return undefined;
    let active = true;
    if (!getToken()) {
      setPaymentState("failed");
      setError("Sign in as the employer who created this listing to verify its payment.");
      return () => { active = false; };
    }
    apiRequest(`/payments/paystack/verify?reference=${encodeURIComponent(paymentReference)}`).then(() => {
      if (active) {
        setPaymentState("paid");
        setError("");
      }
    }).catch((requestError) => {
      if (active) {
        setPaymentState("failed");
        setError(requestError.message);
      }
    });
    return () => { active = false; };
  }, [paymentReference]);

  async function beginPayment() {
    setError("");
    if (!getToken()) {
      window.location.assign(`/login?role=employer&next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    setBusy(true);
    try {
      const result = await apiRequest("/payments/paystack/initialize", {
        method: "POST",
        body: { jobId, plan: planId },
      });
      setQuote((current) => current ? { ...current, amount: result.amount } : current);
      setAuthorizationUrl(result.authorizationUrl);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  function continueToPaystack() {
    if (authorizationUrl) window.location.assign(authorizationUrl);
  }

  const total = quote ? formatNaira(quote.amount) : "Loading live NGN quote...";
  return <PageShell active="pricing"><main>
    <section className="page-banner checkout-banner"><div className="wrap"><span className="eyebrow">{paymentState === "paid" ? "Payment confirmed" : "Secure checkout"}</span><h1>{paymentState === "paid" ? "Your payment is confirmed." : "Review your order."}</h1><p>{paymentState === "paid" ? "The listing payment is recorded. It will be published after administrator approval." : "Paystack securely processes this NGN payment."}</p></div></section>
    <section className="wrap checkout-layout">
      <div className="checkout-form">
        <div className="checkout-step-title"><span>1</span><div><h2>{jobId ? "Job listing" : "Create your listing"}</h2><p>{jobId ? `Confirm the listing selected for ${plan.name}.` : "A listing is needed before a plan can be purchased."}</p></div></div>
        <div className="checkout-terms"><ShieldCheck size={15} /> Payment is confirmed server-side with Paystack before your listing is marked paid.</div>
        {error && <p className="api-notice api-notice-error" role="alert">{error} {paymentState === "failed" && <Link href={`/login?role=employer&next=${encodeURIComponent(`/checkout?plan=${planId}&job=${jobTitle}&jobId=${jobId}`)}`}>Sign in to verify</Link>}</p>}
        {paymentState === "paid" ? <div className="api-notice" role="status">Payment verified successfully. <Link href="/dashboard/jobs">Return to your job listings</Link></div> :
          jobId ? <button className="button button-purple full" type="button" onClick={authorizationUrl ? continueToPaystack : beginPayment} disabled={busy || paymentState === "verifying"}>{paymentState === "verifying" ? "Verifying payment..." : busy ? "Preparing secure checkout..." : authorizationUrl ? `Continue to Paystack · ${total}` : "Prepare secure Paystack checkout"} <ArrowRight size={14} /></button> :
            <Link className="button button-purple full" href={`/post-job?plan=${planId}`}>Create a job listing <ArrowRight size={14} /></Link>}
        <Link className="checkout-back" href={jobId ? "/dashboard/jobs" : "/pricing"}><ArrowLeft size={14} /> {jobId ? "Back to job listings" : "Back to plans"}</Link>
      </div>
      <aside className="order-summary"><span className="eyebrow">ORDER SUMMARY</span><h2>{plan.name}</h2><p>{plan.description}</p><div className="summary-job"><span className="logo-mark"><BriefcaseBusiness size={16} /></span><span><small>Job listing</small><strong>{jobTitle}</strong></span></div><div className="summary-line"><span>Listing plan</span><strong>{plan.name}</strong></div><div className="summary-line"><span>Duration</span><strong>30 days</strong></div><div className="summary-line summary-total"><span>Total</span><strong>{total}</strong></div>{quote && <p className="summary-small">Converted from ${quote.baseAmount} USD at the current exchange rate. The server recalculates the total before payment.</p>}<p className="summary-small">Listing ID: {jobId || "Not submitted yet"}</p></aside>
    </section>
  </main></PageShell>;
}
