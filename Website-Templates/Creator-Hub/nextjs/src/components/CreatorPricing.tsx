import { ArrowRight, Check, Sparkles } from 'lucide-react'

function CreatorPricing() {
  return (
    <section className="creator-section creator-pricing-section" id="pricing" aria-labelledby="pricing-title">
      <div className="creator-section-heading">
        <span className="creator-eyebrow">SIMPLE, CREATOR-FIRST PRICING</span>
        <h2 id="pricing-title">Start free. Grow when you’re ready.</h2>
        <p>Your audience is yours. No hidden fees, no awkward surprises.</p>
      </div>
      <div className="creator-pricing-grid">
        <article className="creator-plan-card">
          <span className="creator-plan-label">START HERE</span>
          <h3>Free</h3>
          <p>Everything you need to bring your corner of the internet together.</p>
          <a className="creator-button creator-button-outline" href="/signup">Create your free hub <ArrowRight size={15} /></a>
          <ul><li><Check size={15} /> Unlimited links</li><li><Check size={15} /> Newsletter signup</li><li><Check size={15} /> Digital storefront</li></ul>
        </article>
        <article className="creator-plan-card creator-plan-featured">
          <span className="creator-plan-label"><Sparkles size={13} /> FOR THE NEXT CHAPTER</span>
          <h3>Creator Pro <span>$12 / month</span></h3>
          <p>More ways to understand your audience and grow your business.</p>
          <a className="creator-button creator-button-primary" href="/signup">Try Pro free <ArrowRight size={15} /></a>
          <ul><li><Check size={15} /> Everything in Free</li><li><Check size={15} /> Custom domain</li><li><Check size={15} /> Advanced analytics</li></ul>
        </article>
      </div>
    </section>
  )
}

export default CreatorPricing
