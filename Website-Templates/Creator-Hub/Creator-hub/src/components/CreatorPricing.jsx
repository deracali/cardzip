import { ArrowRight, Check, Sparkles } from 'lucide-react'

function CreatorPricing() {
  return (
    <section className="creator-section creator-pricing-section" id="pricing" aria-labelledby="pricing-title">
      <div className="creator-section-heading">
        <span className="creator-eyebrow">SIMPLE, CREATOR-FIRST PRICING</span>
        <h2 id="pricing-title">Start free. Grow when you’re ready.</h2>
        <p>Start with the essentials. Upgrade options depend on the platform’s configured plan.</p>
      </div>
      <div className="creator-pricing-grid">
        <article className="creator-plan-card">
          <span className="creator-plan-label">START HERE</span>
          <h3>Free</h3>
          <p>Everything you need to bring your corner of the internet together.</p>
          <a className="creator-button creator-button-outline" href="/signup">Create your free hub <ArrowRight size={15} /></a>
          <ul><li><Check size={15} /> Creator profile and links</li><li><Check size={15} /> Newsletter sign-up</li><li><Check size={15} /> Product listings</li></ul>
        </article>
        <article className="creator-plan-card creator-plan-featured">
          <span className="creator-plan-label"><Sparkles size={13} /> FOR THE NEXT CHAPTER</span>
          <h3>Creator Pro <span>Monthly plan</span></h3>
          <p>Creator Pro is a recurring plan configured by the platform operator. Confirm its included features before upgrading.</p>
          <a className="creator-button creator-button-primary" href="/signup">Explore creator tools <ArrowRight size={15} /></a>
          <small>The Vite edition is a preview; sign-up and Paystack checkout run in the connected Next.js edition.</small>
          <ul><li><Check size={15} /> Monthly Paystack plan</li><li><Check size={15} /> Server-verified checkout</li><li><Check size={15} /> Plan status in your workspace</li></ul>
        </article>
      </div>
    </section>
  )
}

export default CreatorPricing
