import { useState } from 'react'
import { ArrowUpRight, Search, ChevronDown, CheckCircle2 } from 'lucide-react'
import { esimDestinations } from '../data/serviceCatalog'

export default function GlobalEsimPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('esim')
  const [selectedCountry, setSelectedCountry] = useState('United States')
  const [selectedPlan, setSelectedPlan] = useState('5GB')

  const plans = [
    { id: '1GB', data: '1 GB', validity: '7 days', price: '₦4,500' },
    { id: '5GB', data: '5 GB', validity: '30 days', price: '₦12,500' },
    { id: '10GB', data: '10 GB', validity: '30 days', price: '₦21,000' }
  ]

  return (
    <div className="page-wrapper">
      <div className="page-container">
        {/* Header Navigation */}
        <div className="page-header-row">
          <div>
            <div className="breadcrumb">Home / eSIM & Numbers</div>
            <h1 className="page-title">Connected, wherever you go.</h1>
            <p className="page-subtitle">Instant travel data and virtual numbers. Your next connection starts here.</p>
          </div>
          <button className="btn-secondary-pill" onClick={() => onNavigate?.('/esim-history')}>
            <span>My connections</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="nav-tabs-row">
          <button className={`nav-tab ${activeTab === 'esim' ? 'active' : ''}`} onClick={() => setActiveTab('esim')}>
            <span>🌐 Global eSIM</span>
          </button>
          <button className={`nav-tab ${activeTab === 'numbers' ? 'active' : ''}`} onClick={() => setActiveTab('numbers')}>
            <span>📱 Virtual Numbers</span>
          </button>
        </div>

        {/* Dark Hero Announcement Banner */}
        <div className="esim-hero-banner">
          <div className="banner-text-col">
            <span className="pill-badge-green">NO ROAMING. NO LIMITS.</span>
            <h2 className="banner-title">Land. Switch on. Explore.</h2>
            <p className="banner-desc">Local and regional data plans in 190+ countries. Install in minutes, activate when you arrive.</p>
          </div>
          <div className="banner-image-col">
            <img src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=800" alt="City skyline" />
          </div>
        </div>

        {/* Search & Main Layout Grid */}
        <div className="esim-content-grid">
          {/* Left Column: Countries Browser */}
          <div className="countries-col">
            <div className="search-bar-row">
              <div className="search-input-wrapper">
                <Search size={16} className="search-icon" />
                <input type="text" placeholder="Search a country or region" />
              </div>
              <button className="filter-dropdown">
                <span>Regional plans</span>
                <ChevronDown size={14} />
              </button>
            </div>

            <div className="section-subtitle-row">
              <h3 className="section-label">Popular destinations</h3>
              <span className="count-label">Showing {esimDestinations.length} featured destinations</span>
            </div>

            <div className="destinations-grid">
              {esimDestinations.map((d) => {
                const isSelected = selectedCountry === d.name
                return (
                  <div
                    key={d.name}
                    className={`destination-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedCountry(d.name)}
                  >
                    <div className="dest-top">
                      <span className="flag-icon">{d.flag}</span>
                      {isSelected && <CheckCircle2 size={16} className="dest-check" />}
                    </div>
                    <h4 className="dest-name">{d.name}</h4>
                    <p className="dest-net">{d.network}</p>
                    <div className="dest-price-row">
                      <span className="price-label">From</span>
                      <span className="price-val">{d.price}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Check Compatibility Banner */}
            <div className="compatibility-box">
              <span>📱</span>
              <div>
                <strong>Check your phone before you fly</strong>
                <p>Your device must be unlocked and eSIM-compatible. <a href="#guide">View supported devices and installation guides ↗</a></p>
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Panel */}
          <div className="checkout-sidebar">
            <div className="sidebar-card">
              <h3 className="sidebar-title">{selectedCountry}</h3>
              <p className="sidebar-sub">Local data eSIM · Fast, reliable coverage</p>

              <div className="badges-row">
                <span className="mini-pill">5G ready</span>
                <span className="mini-pill">Data only</span>
                <span className="mini-pill">No expiry before activation</span>
              </div>

              <label className="field-label">Choose your data plan</label>
              <div className="plans-list">
                {plans.map((p) => {
                  const isSel = selectedPlan === p.id
                  return (
                    <div
                      key={p.id}
                      className={`plan-option-card ${isSel ? 'selected' : ''}`}
                      onClick={() => setSelectedPlan(p.id)}
                    >
                      <div className="radio-circle">{isSel && <div className="radio-inner" />}</div>
                      <div className="plan-details">
                        <span className="plan-data">{p.data}</span>
                        <span className="plan-validity">{p.validity}</span>
                      </div>
                      <span className="plan-price">{p.price}</span>
                    </div>
                  )
                })}
              </div>

              <div className="summary-list">
                <div className="summary-row"><span>Coverage</span><strong>{selectedCountry}</strong></div>
                <div className="summary-row"><span>Network</span><strong>AT&T / T-Mobile</strong></div>
                <div className="summary-row"><span>Activation</span><strong>On first connection</strong></div>
                <div className="summary-row total-row">
                  <span>Total</span>
                  <strong className="total-amount">₦12,500</strong>
                </div>
              </div>

              <button className="btn-emerald-submit">
                <span>Buy eSIM</span>
                <ArrowUpRight size={16} />
              </button>

              <span className="disclaimer-text">QR code delivered instantly. Pay securely with your Cardzip wallet or card.</span>
            </div>
          </div>
        </div>

        {/* 3 Steps Strip */}
        <div className="three-steps-bar">
          <div className="step-box"><span>01</span> Choose a destination</div>
          <div className="step-box"><span>02</span> Scan your eSIM QR code</div>
          <div className="step-box"><span>03</span> Connect when you arrive</div>
        </div>
      </div>

      {/* Footer */}
      <footer className="simple-footer">
        <span>© 2026 Cardzip. All rights reserved.</span>
        <div className="footer-right">
          <a href="#privacy">Privacy policy</a>
          <a href="#terms">Terms of service</a>
          <span className="green-dot-status">● All systems operational</span>
        </div>
      </footer>
    </div>
  )
}