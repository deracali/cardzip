'use client';

import { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowRight, Check, LockKeyhole } from 'lucide-react';
import { Footer } from '../components/Shared';
import { plans as previewPlans } from '../data/plans';
import { getUserToken, nexaraApi, type NexaraPlan } from '../services/nexara-api';

type CheckoutPlan = NexaraPlan | (typeof previewPlans)[number];

export default function CheckoutPage() {
  const [selectedPlan, setSelectedPlan] = useState<CheckoutPlan | null>(null);
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const query = new URLSearchParams(window.location.search);
    const slug = query.get('plan') || 'pro';
    const requestedBilling = query.get('billing') === 'monthly' ? 'monthly' : 'annual';
    setBilling(requestedBilling);

    nexaraApi.publicPlans()
      .then(({ data }) => {
        if (!active) return;
        const plan = data.find((item) => item.slug === slug);
        if (!plan) {
          setError('This plan is not available. Choose a published plan from the pricing page.');
          return;
        }
        setSelectedPlan(plan);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        const previewPlan = previewPlans.find((item) => item.slug === slug);
        setSelectedPlan(previewPlan || null);
        setError(requestError instanceof Error ? `Live plan data is unavailable: ${requestError.message}` : 'Live plan data is unavailable.');
      });

    return () => { active = false; };
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPlan) return;
    setLoading(true);
    setError('');
    try {
      await nexaraApi.submitLead({
        type: 'checkout',
        name,
        email,
        company,
        plan: selectedPlan.slug,
        billing,
        message: `Requested the ${billing} ${selectedPlan.name} plan.`,
      }, getUserToken());
      setCompleted(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Your request could not be saved. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return <><main className="checkout-page"><div className="checkout-wrap"><div className="checkout-head"><a href="/pricing" className="back-link"><ArrowDownRight size={15} /> Back to pricing</a><span className="secure-label"><LockKeyhole size={13} /> Secure inquiry</span></div>{selectedPlan ? <div className="checkout-grid"><section className="checkout-form"><span className="eyebrow">YOUR PLAN</span><h1>Start your {selectedPlan.name} plan.</h1><p>Share your contact details and our team will follow up about your plan.</p><div className="checkout-plan"><div><b>{selectedPlan.name} {billing === 'annual' ? 'annual' : 'monthly'}</b><span>{billing === 'annual' ? 'Billed annually' : 'Billed monthly'} · Cancel anytime</span></div><b>${selectedPlan.price[billing]}<small> / month</small></b></div>{completed ? <div className="form-success"><Check size={20} /><div><b>Your plan inquiry is saved.</b><span>{getUserToken() ? 'Our reply will appear in your client dashboard.' : 'For dashboard replies, sign in before sending future inquiries. No payment was taken.'}</span></div></div> : <form onSubmit={submit}><p className="checkout-disclaimer">Already have an account? <a href="/login">Sign in first to track this inquiry in your client dashboard.</a></p><label>Your name<input required autoComplete="name" maxLength={120} value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Morgan" /></label><label>Work email<input required type="email" autoComplete="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" /></label><label>Company name<input required autoComplete="organization" maxLength={160} value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Your company" /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button form-submit" type="submit" disabled={loading}>{loading ? 'Sending…' : 'Request plan details'} <ArrowRight size={15} /></button><p className="checkout-disclaimer"><LockKeyhole size={13} /> This form sends an inquiry to the Nexara team. It does not collect card details or process a payment.</p></form>}</section><aside className="checkout-summary"><span className="eyebrow">WHAT'S INCLUDED</span><h2>{selectedPlan.name}</h2><ul>{selectedPlan.features.map((feature) => <li key={feature}><Check size={15} />{feature}</li>)}</ul><p>{selectedPlan.description}</p></aside></div> : <div className="cms-empty-state"><h1>Plan unavailable</h1><p>{error || 'Loading plan details…'}</p><a href="/pricing">Return to pricing</a></div>}{error && selectedPlan && <p className="cms-api-warning" role="status">{error}</p>}</div></main><Footer /></>
}
