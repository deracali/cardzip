import { ArrowRight, Check, Sparkles } from 'lucide-react'
import { enrollmentPlans } from '../data/learningData'
import { LearningFooter, LearningHeader } from './LearningLandingPage'
import './LearningExtraPages.css'

function LearningPricingPage() {
  return (
    <div className="learning-site extra-site">
      <LearningHeader />
      <main className="extra-page pricing-page">
        <section className="extra-page-intro pricing-intro">
          <span className="section-kicker">Simple plans, meaningful progress</span>
          <h1>Choose how you want to grow.</h1>
          <p>Start free, or unlock a library of expert-led courses with Skillora Plus.</p>
        </section>
        <div className="pricing-grid">
          {enrollmentPlans.map((plan) => (
            <article className={`pricing-card${plan.featured ? ' is-featured' : ''}`} key={plan.id}>
              {plan.featured && <span className="plan-badge"><Sparkles size={12} /> MOST POPULAR</span>}
              <span className="pricing-plan-name">{plan.name}</span>
              <p className="pricing-description">{plan.description}</p>
              <div className="pricing-amount"><strong>${plan.price}</strong><span>/{plan.cadence}</span></div>
              <a className={plan.featured ? 'button button-primary' : 'button button-outline'} href={plan.price ? `/checkout?plan=${plan.id}` : '/signup'}>
                {plan.price ? 'Choose plan' : 'Create free account'} <ArrowRight size={14} />
              </a>
              <div className="pricing-divider" />
              <strong className="pricing-includes">What’s included</strong>
              <ul>{plan.features.map((feature) => <li key={feature}><Check size={15} /> {feature}</li>)}</ul>
            </article>
          ))}
        </div>
        <p className="pricing-footnote">All memberships are demo plans. No payment is processed from this site.</p>
      </main>
      <LearningFooter />
    </div>
  )
}

export default LearningPricingPage
