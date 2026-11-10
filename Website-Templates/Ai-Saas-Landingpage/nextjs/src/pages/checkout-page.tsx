'use client';

import { useState } from 'react'
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  CircleHelp,
  Database,
  FileText,
  Fingerprint,
  GitBranch,
  Layers3,
  LockKeyhole,
  Menu,
  MessageSquareText,
  Play,
  Plug,
  Radio,
  ShieldCheck,
  Sparkles,
  Workflow,
  X,
  Zap,
} from 'lucide-react'
import { Logo, Footer, DashboardPreview, SectionHeading, FeatureCards, FAQSection } from '../components/Shared';
import { plans } from '../data/plans';

export default function CheckoutPage() {
  const [completed, setCompleted] = useState(false)
  const params = new URLSearchParams(window.location.search)
  const selectedPlan = plans.find((plan) => plan.slug === params.get('plan')) || plans[1]
  const billing = params.get('billing') === 'monthly' ? 'monthly' : 'annual'
  const amount = selectedPlan.price[billing]
  return <><main className="checkout-page"><div className="checkout-wrap"><div className="checkout-head"><a href="/pricing" className="back-link"><ArrowDownRight size={15} /> Back to pricing</a><span className="secure-label"><LockKeyhole size={13} /> Secure checkout</span></div><div className="checkout-grid"><section className="checkout-form"><span className="eyebrow">YOUR PLAN</span><h1>Start your {selectedPlan.name} plan.</h1><p>One last step before your team can get to work.</p><div className="checkout-plan"><div><b>{selectedPlan.name} {billing === 'annual' ? 'annual' : 'monthly'}</b><span>{billing === 'annual' ? 'Billed annually' : 'Billed monthly'} · Cancel anytime</span></div><b>${amount}<small> / month</small></b></div>{completed ? <div className="form-success"><Check size={20} /><div><b>Checkout preview complete.</b><span>No payment was taken. Connect a server-side Stripe Checkout session to accept real payments.</span></div></div> : <form onSubmit={(event) => { event.preventDefault(); setCompleted(true) }}><label>Work email<input required type="email" autoComplete="email" placeholder="you@company.com" /></label><label>Company name<input required autoComplete="organization" placeholder="Your company" /></label><button className="button form-submit" type="submit">Continue to payment <ArrowRight size={15} /></button><p className="checkout-disclaimer"><LockKeyhole size={13} /> Demo checkout only. No card details are collected and no payment is processed.</p></form>}</section><aside className="checkout-summary"><span className="eyebrow">WHAT'S INCLUDED</span><h2>More time for great work.</h2><ul>{selectedPlan.features.map((feature) => <li key={feature}><Check size={15} />{feature}</li>)}</ul><div className="summary-total"><span>Due today</span><b>$0.00</b></div><p>Your 14-day trial begins today. You won't be charged in this demo.</p></aside></div></div></main><Footer /></>
}
