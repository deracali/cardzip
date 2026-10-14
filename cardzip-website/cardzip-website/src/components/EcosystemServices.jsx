import { useState } from 'react'
import { CreditCard, Globe, Banknote, ShoppingBag, ArrowUpRight, ArrowRight } from 'lucide-react'


export default function EcosystemServices({ onNavigate }) {
  const [activeStep, setActiveStep] = useState(0)
  const cards = [
    {
      id: 'gift-cards',
      icon: <CreditCard className="card-icon" size={22} />,
      title: 'Gift Cards',
      description: 'Unlock the value in your cards. Get great rates and instant naira payouts.',
      linkText: 'Trade your cards',
      linkUrl: '#trade'
    },
    {
      id: 'virtual-numbers',
      icon: <Globe className="card-icon" size={22} />,
      title: 'Virtual Numbers',
      description: 'Rent a number to receive verification codes while keeping your personal number private.',
      linkText: 'Explore numbers',
      linkUrl: '/virtual-numbers'
    },
    {
      id: 'bills',
      icon: <Banknote className="card-icon" size={22} />,
      title: 'Bills',
      description: 'Airtime, data, electricity and more. Everyday payments, simplified.',
      linkText: 'Pay a bill',
      linkUrl: '#bills'
    },
    {
      id: 'shop',
      icon: <ShoppingBag className="card-icon" size={22} />,
      title: 'Shop',
      description: 'Discover tech and essentials. Trusted products, delivered to you.',
      linkText: 'Explore the store',
      linkUrl: '#shop'
    }
  ]

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
              <span className="badge-subtitle">THE CARDZIP ECOSYSTEM</span>
              <h2 className="section-title">One place. More possibilities.</h2>
            </div>
            <p className="header-right-desc">
              A smarter way to move value, wherever life takes you.
            </p>
          </header>

          {/* 4 Dark Feature Cards Grid */}
          <div className="feature-cards-grid">
            {cards.map((card) => (
              <div className="feature-card" key={card.id}>
                <div className="feature-icon-wrapper">{card.icon}</div>
                <h3 className="feature-card-title">{card.title}</h3>
                <p className="feature-card-desc">{card.description}</p>
                <a
                  href={card.linkUrl}
                  className="feature-card-link"
                  onClick={(event) => {
                    event.preventDefault()
                    onNavigate?.(`/${card.id}`)
                  }}
                >
                  <span>{card.linkText}</span>
                  <ArrowUpRight size={14} />
                </a>
              </div>
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