import { Apple, Play, CreditCard, Globe, Banknote } from 'lucide-react'


export default function AppDownloadFooter({ onNavigate }) {
  return (
    <footer className="footer-wrapper">
      {/* 1. LIGHT APP DOWNLOAD BANNER CARD */}
      <div className="app-download-card-light">
        <div className="app-card-left">
          <span className="pill-badge-green">CARDZIP, ON THE GO</span>
          <h2 className="app-title-dark">
            Big possibilities.<br />Right in your pocket.
          </h2>
          <p className="app-subtext-dark">
            Trade, connect and pay from anywhere. Download the Cardzip app and take your everyday digital economy with you.
          </p>

          <div className="store-buttons-row">
            <button className="btn-store-dark">
              <span>App Store</span>
              <Apple size={16} />
            </button>
            <button className="btn-store-dark">
              <span>Google Play</span>
              <Play size={14} fill="currentColor" />
            </button>
          </div>
        </div>

        {/* Right Phone Mockup Overflowing Upwards */}
        <div className="phone-mockup-container">
          <div className="phone-screen-card">
            <div className="phone-top-bar">
              <span className="phone-time">9:41</span>
              <div className="phone-notch"></div>
            </div>
            
            <div className="phone-greeting">Hey, Tobi 👋</div>

            {/* Wallet Card Inside Phone */}
            <div className="phone-wallet-card">
              <span className="wallet-label">Your wallet balance</span>
              <div className="wallet-balance">₦45,200</div>
              <div className="wallet-actions">
                <span className="action-green">+ Add money</span>
                <span className="action-green">↗ Withdraw</span>
              </div>
            </div>

            {/* Quick Action Icons Row */}
            <div className="phone-quick-actions">
              <div className="quick-icon-btn"><CreditCard size={18} /></div>
              <div className="quick-icon-btn"><Globe size={18} /></div>
              <div className="quick-icon-btn"><Banknote size={18} /></div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DARK FOOTER NAVIGATION */}
      <div className="footer-dark-content">
        <div className="footer-links-grid">
          <div className="brand-col">
            <div className="brand-logo">
              <div className="logo-box">⚡</div>
              <span>cardzip</span>
            </div>
            <p className="brand-tagline">
              Your everyday digital economy. Trade, connect, shop and pay — all in one place.
            </p>
          </div>

          <div className="links-col">
            <h4>Explore</h4>
            <a href="#gift-cards">Gift cards</a>
            <a href="/virtual-numbers">Virtual numbers</a>
            <a href="#shop">Shop</a>
            <a href="#bills">Bills & WAEC</a>
          </div>

          <div className="links-col">
            <h4>Cardzip</h4>
            <a href="#about">About us</a>
            <a href="/support" onClick={(event) => { event.preventDefault(); onNavigate?.('/support') }}>Help center</a>
            <a href="/support" onClick={(event) => { event.preventDefault(); onNavigate?.('/support') }}>Contact us</a>
            <a href="#careers">Careers</a>
          </div>

          <div className="links-col">
            <h4>Stay connected</h4>
            <a href="#instagram">Instagram ↗</a>
            <a href="#twitter">X / Twitter ↗</a>
            <a href="mailto:support@cardzip.com">support@cardzip.com</a>
            <span className="support-time">24/7 customer support</span>
          </div>
        </div>

        {/* 3. SUB FOOTER */}
        <div className="sub-footer-row">
          <span>© 2026 Cardzip. All rights reserved.</span>
          <div className="sub-footer-right">
            <a href="#privacy">Privacy policy</a>
            <a href="#terms">Terms of service</a>
            <div className="status-indicator">
              <span className="green-dot"></span>
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}