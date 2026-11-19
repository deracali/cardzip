import { ArrowUpRight, Globe2, Plane, ShieldCheck, Smartphone } from 'lucide-react'

export default function EsimHistoryPage({ onNavigate }) {
  const stats = [
    { label: 'eSIMs bought', value: '24', icon: Globe2, tone: 'green' },
    { label: 'Active now', value: '7', icon: Smartphone, tone: 'amber' },
    { label: 'Coverage', value: '190+', icon: Plane, tone: 'green' },
  ]

  const entries = [
    { id: 'ESIM-1048', country: 'United States', plan: '5 GB · 30 days', timestamp: 'Oct 9, 2026 · 09:10', amount: '₦12,500', status: 'ACTIVE' },
    { id: 'ESIM-1042', country: 'United Kingdom', plan: '3 GB · 14 days', timestamp: 'Oct 4, 2026 · 18:06', amount: '₦8,200', status: 'USED' },
    { id: 'ESIM-1029', country: 'United Arab Emirates', plan: '10 GB · 30 days', timestamp: 'Sep 29, 2026 · 12:45', amount: '₦21,000', status: 'ACTIVE' },
    { id: 'ESIM-1015', country: 'France', plan: '1 GB · 7 days', timestamp: 'Sep 17, 2026 · 16:25', amount: '₦4,500', status: 'EXPIRED' },
    { id: 'ESIM-1004', country: 'South Africa', plan: '5 GB · 30 days', timestamp: 'Sep 08, 2026 · 09:36', amount: '₦10,600', status: 'USED' },
  ]

  return (
    <div className="page-wrapper">
      <div className="page-container">
        <div className="page-header-row reveal">
          <div>
            <div className="breadcrumb">Home / eSIM & Numbers / History</div>
            <h1 className="page-title">Your eSIM history</h1>
            <p className="page-subtitle">Revisit your travel data plans, activation details and QR delivery records.</p>
          </div>
          <button className="btn-secondary-pill" onClick={() => onNavigate?.('/esim')}>
            <span>Buy another eSIM</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="stats-row">
          {stats.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className={`stat-card reveal stat-card--${tone}`}>
              <Icon size={20} className="green-txt" />
              <div>
                <span className="stat-label">{label}</span>
                <h2 className="stat-val">{value}</h2>
              </div>
            </div>
          ))}
        </div>

        <div className="orders-table-card reveal">
          <div className="table-top-bar">
            <div className="tabs-list">
              <button className="tab active">All eSIMs</button>
              <button className="tab">Active</button>
              <button className="tab">Expired</button>
            </div>
            <select className="filter-select">
              <option>All time</option>
            </select>
          </div>

          <table className="orders-table">
            <thead>
              <tr>
                <th>REFERENCE</th>
                <th>DESTINATION</th>
                <th>DATE</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="order-num">{entry.id}</td>
                  <td>
                    <span className="item-title">{entry.country}</span>
                    <span className="item-sub">{entry.plan}</span>
                  </td>
                  <td className="date-txt">{entry.timestamp}</td>
                  <td className="price-txt">{entry.amount}</td>
                  <td>
                    <span className={`status-pill ${entry.status.toLowerCase()}`}>{entry.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="selected-order-tracker">
          <div className="tracker-left reveal">
            <h3>Latest activation</h3>
            <p>United States eSIM is active and ready for your next trip. QR code was delivered immediately after checkout.</p>
            <div className="steps-tracker">
              <div className="step-node active"><span>✓ Plan assigned</span><span className="time-sub">Today · 09:10</span></div>
              <div className="step-node active"><span>✓ QR delivered</span><span className="time-sub">Today · 09:12</span></div>
              <div className="step-node"><span>Next renewal</span><span className="time-sub">Nov 08 · 09:10</span></div>
            </div>
          </div>

          <div className="tracker-right-dark reveal">
            <ShieldCheck size={18} className="green-txt" />
            <h4>Travel-ready assurance</h4>
            <p>All eSIMs are encrypted and activated only on your device. You can reinstall anytime with your saved profile.</p>
            <a href="#guide">View installation guide →</a>
          </div>
        </div>
      </div>

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
