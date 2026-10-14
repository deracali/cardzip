import { ArrowUpRight, ShieldCheck, Music, Globe, CheckCircle2 } from 'lucide-react'
import { shopProducts } from '../data/shopProducts'
import { billServices, giftCardBrands } from '../data/serviceCatalog'


export default function HeroSection({ onStartTrading, onExploreUtilities }) {
  const metrics = [
    { value: shopProducts.length, label: 'Products in the store' },
    { value: billServices.length, label: 'Bill services available' },
    { value: giftCardBrands.length, label: 'Gift card brands listed' },
  ]

  const rates = [
    { name: 'iTunes', rate: '₦1,250/$' },
    { name: 'Steam', rate: '₦1,300/$' },
    { name: 'Amazon', rate: '₦1,180/$' },
    { name: 'Google Play', rate: '₦1,200/$' },
  ]

  return (
    <div className="hero-wrapper">
      {/* Main Hero Card Container */}
      <section className="hero-card">
        {/* Left Column: Copy & Actions */}
        <div className="hero-content">
          <div className="hero-pill-badge">
            ONE WALLET. ENDLESS POSSIBILITIES.
          </div>

          <h1 className="hero-headline">
            Your world. <br />
            Connected by <br />
            <span className="emerald-accent">possibility.</span>
          </h1>

          <p className="hero-subtext">
            Turn gift cards into cash. Connect across borders. Shop your
            favorites. Make everyday payments effortless.
          </p>

          {/* Action Buttons */}
          <div className="hero-actions">
            <button className="btn-emerald" onClick={onStartTrading}>
              <span>Start Trading</span>
              <ArrowUpRight size={18} />
            </button>

            <button className="btn-outline" onClick={onExploreUtilities}>
              Explore Utilities
            </button>
          </div>

          {/* Bottom Trust Sub-strip */}
          <div className="hero-trust-bar">
            <ShieldCheck size={14} className="trust-icon" />
            <span>Secure transactions • Instant payouts • 24/7 support</span>
          </div>
        </div>

        {/* Right Column: Layered Visual Graphic Elements */}
        <div className="hero-visual-container">
          {/* Top Purple iTunes Gift Card */}
          <div className="visual-card card-purple">
            <div className="card-top-row">
              <Music size={22} className="card-symbol" />
              <span className="card-brand-label">iTunes</span>
            </div>
            <div className="card-bottom-row">
              <span className="card-type-tag">GIFT CARD</span>
              <span className="card-price-value">$100</span>
            </div>
          </div>

          {/* Virtual number card */}
          <div className="visual-card card-esim">
            <div className="card-header-row">
              <span className="esim-tag">VIRTUAL NUMBER</span>
            </div>
            <div className="esim-content">
              <Globe size={40} className="esim-globe-bg" />
              <h2 className="esim-data-val">SMS</h2>
              <p className="esim-subtext">A separate number for verification.</p>
            </div>
          </div>

          {/* Bottom Floating Light Payout Card */}
          <div className="visual-card card-payout">
            <div className="payout-header">
              <CheckCircle2 size={16} className="check-icon" />
              <span className="payout-status">Payout received</span>
            </div>
            <div className="payout-amount">+ ₦125,000</div>
            <div className="payout-time">iTunes • Wallet credited in 42 seconds</div>
          </div>
        </div>
      </section>

      {/* Live Rates Ticker Strip */}
      <div className="rates-ticker-strip">
        <div className="ticker-badge">
          <span className="pulse-dot"></span>
          <span>LIVE RATES</span>
        </div>

        <div className="ticker-items font-mono">
          {rates.map((item, index) => (
            <div key={index} className="ticker-item">
              <span className="item-name">{item.name}</span>
              <span className="item-rate">{item.rate}</span>
              <ArrowUpRight size={12} className="ticker-arrow" />
            </div>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="hero-metrics-grid" aria-label="Available Cardzip services">
        {metrics.map((metric) => (
          <div className="metric-box" key={metric.label}>
            <h3 className="metric-val">{metric.value}</h3>
            <p className="metric-lbl">{metric.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}