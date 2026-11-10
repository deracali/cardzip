import { useMemo, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import CardzipLoader from './CardzipLoader'

const categories = ['All', 'Airtime', 'Data', 'TV', 'Electricity', 'Education']
const formatNaira = (value) => `₦${Number(value || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`

export default function BillPaymentsControl({ bills = [], stats = {}, loading = false, onViewAll }) {
  const [activeCategory, setActiveCategory] = useState('All')
  const filteredBills = useMemo(() => bills.filter((bill) => (
    activeCategory === 'All' || String(bill.category || '').toLowerCase() === activeCategory.toLowerCase()
  )), [activeCategory, bills])

  return (
    <div className="card-container">
      <div className="card-header">
        <div className="title-row">
          <h3 className="card-title">Bill Payments</h3>
          <span className="badge-live">{Number(stats.total || 0).toLocaleString('en-NG')} in period</span>
          <button type="button" className="overview-inline-link" onClick={onViewAll}>View history <ArrowRight size={13} /></button>
        </div>
        <div className="tabs-row">
          {categories.map((category) => <button key={category} type="button" className={`tab-btn ${activeCategory === category ? 'active' : ''}`} onClick={() => setActiveCategory(category)}>{category}</button>)}
        </div>
      </div>

      <div className="service-list">
        {filteredBills.map((bill) => (
          <div key={bill._id} className="service-item">
            <div className="service-info">
              <span className="service-name">{bill.serviceName || bill.serviceID || bill.category}</span>
              <span className="service-subtext">{bill.packageName || bill.category} · {bill.user?.name || bill.user?.email || 'Customer'} · {bill.reference}</span>
            </div>
            <div className="overview-bill-result">
              <strong>{formatNaira(bill.amount)}</strong>
              <span className={`overview-history-status ${bill.status}`}>{bill.status}</span>
            </div>
          </div>
        ))}
        {!loading && filteredBills.length === 0 && <p className="overview-card-empty">No bill payments found for this category and period.</p>}
        {loading && bills.length === 0 && <p className="overview-card-empty"><CardzipLoader compact label="Loading bill payment history" /></p>}
      </div>

      <div className="batch-banner">
        <span className="batch-text">{formatNaira(stats.volume)} completed / processing volume · {Number(stats.failed || 0).toLocaleString('en-NG')} failed</span>
        <span className="overview-period-total">{Number(stats.completed || 0).toLocaleString('en-NG')} completed</span>
      </div>
    </div>
  )
}
