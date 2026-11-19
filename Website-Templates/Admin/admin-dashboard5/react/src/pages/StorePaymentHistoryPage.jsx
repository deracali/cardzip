import { ArrowUpRight, CreditCard, PackageCheck, ShoppingBag, Wallet } from 'lucide-react'

export default function StorePaymentHistoryPage({ onNavigate }) {
  const stats = [
    { label: 'Store orders', value: '86', icon: ShoppingBag, tone: 'green' },
    { label: 'This month', value: '₦1.42M', icon: Wallet, tone: 'amber' },
    { label: 'Settled', value: '97.6%', icon: PackageCheck, tone: 'green' },
  ]

  const entries = [
    { id: '#ORD-98241', item: 'Soundcore Q20i + Oraimo Charger', channel: 'Cardzip wallet', timestamp: 'Oct 9, 2026 · 12:23', amount: '₦53,000', status: 'PAID' },
    { id: '#ORD-98188', item: 'Anker PowerCore 20K', channel: 'Card • Mastercard', timestamp: 'Oct 5, 2026 · 14:09', amount: '₦34,500', status: 'PAID' },
    { id: '#ORD-98072', item: 'Logitech Pebble Keys 2', channel: 'Cardzip wallet', timestamp: 'Sep 29, 2026 · 10:50', amount: '₦38,500', status: 'PAID' },
    { id: '#ORD-97964', item: 'JBL Go 4', channel: 'Bank transfer', timestamp: 'Sep 18, 2026 · 09:16', amount: '₦52,000', status: 'REFUNDED' },
    { id: '#ORD-97891', item: 'Oraimo Watch 5', channel: 'Card • Visa', timestamp: 'Sep 10, 2026 · 16:41', amount: '₦67,000', status: 'PAID' },
  ]

  return (
    <div className="page-wrapper">
      <div className="page-container">
        <div className="page-header-row reveal">
          <div>
            <div className="breadcrumb">Home / Store / Payment History</div>
            <h1 className="page-title">Store payment history</h1>
            <p className="page-subtitle">Follow every checkout, refund and payout across your Cardzip shop orders.</p>
          </div>
          <button className="btn-secondary-pill" onClick={() => onNavigate?.('/shop')}>
            <span>Continue shopping</span>
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
              <button className="tab active">All transactions</button>
              <button className="tab">Paid</button>
              <button className="tab">Refunds</button>
            </div>
            <select className="filter-select">
              <option>Last 90 days</option>
            </select>
          </div>

          <table className="orders-table">
            <thead>
              <tr>
                <th>ORDER</th>
                <th>ITEM</th>
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
                    <span className="item-title">{entry.item}</span>
                    <span className="item-sub">{entry.channel}</span>
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
            <h3>Top spending category</h3>
            <p>Audio and accessories lead your recent store spend. Most amount paid from your Cardzip wallet and cards.</p>
            <div className="steps-tracker">
              <div className="step-node active"><span>✓ Payment captured</span><span className="time-sub">Last order · 2 hrs ago</span></div>
              <div className="step-node active"><span>✓ Seller notified</span><span className="time-sub">Confirmed</span></div>
              <div className="step-node"><span>Next payout</span><span className="time-sub">Oct 12 · 08:00</span></div>
            </div>
          </div>

          <div className="tracker-right-dark reveal">
            <CreditCard size={18} className="green-txt" />
            <h4>Payment methods</h4>
            <p>Wallet balance: ₦45,200 · Saved card: **** 2456 · Bank transfer ready.</p>
            <a href="#payment-methods">Manage payment methods →</a>
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
