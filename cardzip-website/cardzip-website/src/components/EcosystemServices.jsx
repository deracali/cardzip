import { useState } from 'react'
import { CreditCard, Globe, Banknote, ShoppingBag, ArrowUpRight, ArrowRight, Store, Code2, UsersRound, Megaphone, Wallet } from 'lucide-react'


export default function EcosystemServices({ onNavigate, featureSettings }) {
  const [activeStep, setActiveStep] = useState(0)
  const cards = [
    {
      id: 'gift-cards',
      icon: CreditCard,
      title: 'Gift Cards',
      description: 'Check supported brands and follow a clear process to submit a card for review.',
      linkText: 'Explore gift cards',
      linkUrl: '/gift-cards',
    },
    {
      id: 'store',
      icon: ShoppingBag,
      title: 'Online Store',
      description: 'Browse the product catalog, review product details and complete your order online.',
      linkText: 'Shop products',
      linkUrl: '/shop',
    },
    {
      id: 'community',
      icon: UsersRound,
      title: 'Community Market',
      description: 'Discover local listings, or share your own offer with people browsing the marketplace.',
      linkText: 'Browse listings',
      linkUrl: '/community-market',
    },
    {
      id: 'business-shops',
      icon: Store,
      title: 'Business Shops',
      description: 'Explore seller storefronts and contact businesses about their products.',
      linkText: 'Find a shop',
      linkUrl: '/shops',
    },
    {
      id: 'digital-assets',
      icon: Code2,
      title: 'Websites & Apps',
      description: 'Explore digital products and templates, or learn how to submit a project for review.',
      linkText: 'Explore digital products',
      linkUrl: '/digital-assets',
    },
    {
      id: 'bills',
      icon: Banknote,
      title: 'Bills & Utilities',
      description: 'Access airtime, data, electricity, TV and other supported bill services.',
      linkText: 'View bill services',
      linkUrl: '/bills',
    },
    {
      id: 'virtual-numbers',
      icon: Globe,
      title: 'Virtual Numbers',
      description: 'Browse available numbers for receiving supported verification messages.',
      linkText: 'Explore numbers',
      linkUrl: '/virtual-numbers',
    },
    {
      id: 'wallet',
      icon: Wallet,
      title: 'Cardzip Wallet',
      description: 'Manage your balance, review wallet activity and access available withdrawal options.',
      linkText: 'Open your wallet',
      linkUrl: '/wallet',
    },
    {
      id: 'advertise',
      icon: Megaphone,
      title: 'Promote a Business',
      description: 'Explore Cardzip advertising placements designed to help businesses reach customers.',
      linkText: 'View advertising',
      linkUrl: '/advertise',
    },
  ].filter((card) => (
    (card.id !== 'bills' || featureSettings?.vtpassBillsEnabled !== false)
    && (card.id !== 'virtual-numbers' || featureSettings?.esimEnabled !== false)
  ))

  const steps = [
    {
      number: '01',
      title: 'Choose your card',
      headline: 'Choose your gift card.',
      description: 'Select from 30+ popular gift card brands, choose the country and card type, and enter the value you want to trade.',
      preview: 'iTunes · United States · $100',
      payout: '₦125,000',
      rate: '₦1,250/$',
    },
    {
      number: '02',
      title: 'Upload & confirm',
      headline: 'Upload your card details.',
      description: 'Add a clear photo or enter the card code, review your trade details, and confirm the exact payout before submitting.',
      preview: 'Card details · Secure review',
      payout: 'Ready to trade',
      rate: 'No hidden fees',
    },
    {
      number: '03',
      title: 'Get paid instantly',
      headline: 'Receive your payout.',
      description: 'Once your card is verified, your naira payout is sent straight to your Cardzip wallet so you can use or withdraw it.',
      preview: 'Trade verified · Wallet credited',
      payout: 'Wallet credited',
      rate: 'Usually under 60 seconds',
    },
  ]
  const step = steps[activeStep]

  return (
    <>
      {/* SECTION 1: THE CARDZIP ECOSYSTEM */}
      <section className="ecosystem-band">
        <div className="ecosystem-container ecosystem-section">
          <header className="ecosystem-header">
            <div className="header-left-col">
              <span className="badge-subtitle">EXPLORE CARDZIP</span>
              <h2 className="section-title">More of what you need, in one place.</h2>
            </div>
            <p className="header-right-desc">
              Trade, shop, pay bills, discover local businesses and explore digital products.
            </p>
          </header>

          <div className="home-platform-grid">
            {cards.map((card) => (
              <article className="home-platform-card" key={card.id}>
                <span className="home-platform-icon"><card.icon size={21} /></span>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <a
                  href={card.linkUrl}
                  onClick={(event) => {
                    event.preventDefault()
                    onNavigate?.(card.linkUrl)
                  }}
                >
                  <span>{card.linkText}</span>
                  <ArrowUpRight size={14} />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2: FROM GIFT CARD TO GOOD DAY */}
      <section className="how-it-works-band">
        <div className="ecosystem-container how-it-works-section">
          <header className="how-it-works-header">
            <h2 className="section-title">From gift card to good day.</h2>
            <span className="pill-tag">SIMPLE BY DESIGN</span>
          </header>

          {/* Steps Navigation Tabs */}
          <div className="steps-row">
            {steps.map((step, index) => (
              <button
                type="button"
                key={step.number}
                className={`step-tab ${activeStep === index ? 'active-step' : ''}`}
                aria-pressed={activeStep === index}
                onClick={() => setActiveStep(index)}
              >
                <span className="step-number">{step.number}</span>
                <span className="step-title">{step.title}</span>
              </button>
            ))}
          </div>

          {/* Step Detail Content & Calculator Card */}
          <div className="step-content-grid">
            <div className="step-info-col">
              <h3 className="step-headline">{step.headline}</h3>
              <p className="step-description">
                {step.description}
              </p>
              <button className="cta-outline-btn" onClick={() => onNavigate?.('/gift-cards')}>
                <span>{activeStep === 0 ? "Check today's rates" : 'Start your trade'}</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Right Dark Card Calculator Showcase */}
            <div className="calculator-preview-card">
              <div className="calc-top-info">
                {step.preview}
              </div>
              <div className="calc-payout-amount">
                {step.payout}
              </div>
              <div className="calc-sub-rate">
                <span className="highlight-rate">{step.rate}</span> - Transparent from the start.
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}