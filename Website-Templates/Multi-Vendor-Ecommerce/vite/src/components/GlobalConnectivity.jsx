import { Wifi, ArrowUpRight } from 'lucide-react'


export default function GlobalConnectivity({ onExploreClick }) {
  return (
    <div className="connectivity-band">
      <section className="global-connectivity-container">
      {/* Left Column: Image with Floating Badge */}
      <div className="connectivity-image-wrapper">
        <img
          src="https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=1000"
          alt="Traveler connected in Lisbon"
          className="connectivity-img"
        />
        <div className="floating-location-badge">
          <Wifi size={14} className="wifi-icon" />
          <span>Connected in Lisbon · 5G</span>
        </div>
      </div>

      {/* Right Column: Copy & Badges */}
      <div className="connectivity-content">
        <span className="badge-uppercase">LOCAL FEEL. GLOBAL REACH.</span>
        <h2 className="connectivity-title">
          New country.<br />Same connection.
        </h2>
        <p className="connectivity-desc">
          Rent a virtual number to receive verification messages without sharing your personal number.
        </p>

        {/* Pill Tags */}
        <div className="pill-tags-row">
          <span className="info-pill">SMS rentals</span>
          <span className="info-pill">Private number</span>
        </div>

        {/* Primary Emerald Button */}
        <button className="btn-emerald-cta" onClick={onExploreClick}>
          <span>Explore virtual numbers</span>
          <ArrowUpRight size={18} />
        </button>
      </div>
      </section>
    </div>
  )
}