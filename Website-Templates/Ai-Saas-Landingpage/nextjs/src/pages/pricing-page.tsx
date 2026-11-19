'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { Footer, SectionHeading } from '../components/Shared';
import { plans as previewPlans } from '../data/plans';
import { nexaraApi, type NexaraPlan } from '../services/nexara-api';

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);
  const [plans, setPlans] = useState<NexaraPlan[] | null>(null);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    nexaraApi.publicPlans()
      .then(({ data }) => { if (active) setPlans(data); })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Pricing plans could not be loaded.');
      })
      .finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, []);

  const visiblePlans = plans ?? (error ? previewPlans : []);
  return <><main className="page-main pricing-page"><SectionHeading eyebrow="SIMPLE, TRANSPARENT PRICING" title="The right plan for your next big idea." copy="Start free. Upgrade when you scale. No hidden fees, cancel anytime." />
    {error && <p className="cms-api-warning" role="status">Showing preview pricing because live plans could not be loaded: {error}</p>}
    <div className="billing-switch"><span className={!annual ? 'selected' : ''}>Monthly</span><button type="button" aria-label="Toggle annual billing" aria-pressed={annual} onClick={() => setAnnual(!annual)} className={annual ? 'switch is-on' : 'switch'}><i /></button><span className={annual ? 'selected' : ''}>Yearly <b>Save 25%</b></span></div>
    {!loaded ? <p className="cms-empty">Loading plans…</p> : visiblePlans.length ? <div className="pricing-grid">{visiblePlans.map((plan) => <article className={plan.popular ? 'price-card popular' : 'price-card'} key={plan.slug}>{plan.popular && <span className="popular-label"><Sparkles size={11} /> MOST POPULAR</span>}<span className="plan-name">{plan.name}</span><h3>${plan.price[annual ? 'annual' : 'monthly']}<small>{plan.price.monthly === 0 ? ' forever' : ' / month'}</small></h3><p>{plan.description}</p><a className={plan.popular ? 'button price-button' : 'button button-ghost price-button'} href={plan.slug === 'starter' ? '/signup' : `/checkout?plan=${encodeURIComponent(plan.slug)}&billing=${annual ? 'annual' : 'monthly'}`}>{plan.cta} <ArrowRight size={14} /></a><ul>{plan.features.map((feature) => <li key={feature}><Check size={14} /> {feature}</li>)}</ul></article>)}</div> : <div className="cms-empty-state"><h2>No plans are published yet.</h2><p>An administrator can add plans from the secure <a href="/admin">admin dashboard</a>.</p></div>}
    <p className="pricing-note">All plans include secure hosting, support, and a 14-day Pro trial. Prices shown in USD.</p><section className="compare-wrap"><h2>Compare features in detail</h2><div className="table-scroll"><table><thead><tr><th>Feature</th><th>Starter</th><th>Pro</th><th>Enterprise</th></tr></thead><tbody>{[['AI tasks / month', '1,000', '25,000', 'Unlimited'], ['Active AI agents', '3', '25', 'Unlimited'], ['Knowledge base docs', '100', '10,000', 'Unlimited'], ['Slack, Notion, GitHub integrations', 'Included', 'Included', 'Included'], ['Custom APIs & webhooks', '—', 'Included', 'Included'], ['SSO / SAML & SCIM', '—', '—', 'Included'], ['Dedicated success manager', '—', '—', 'Included']].map((row) => <tr key={row[0]}>{row.map((cell, i) => <td key={cell + i}>{i > 0 && cell === 'Included' ? <Check className="table-check" size={15} aria-label="Included" /> : cell}</td>)}</tr>)}</tbody></table></div></section><div className="sales-banner"><div><b>Need higher limits or on-prem?</b><p>Get a custom quote with volume discounts and security review.</p></div><a className="button button-small" href="/contact">Talk to sales <ArrowRight size={13} /></a></div></main><Footer /></>
}
