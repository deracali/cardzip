import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Gift, ShieldCheck, Wallet, X } from 'lucide-react'
import { userApi } from '../services/api'
import { subscribeToGiftCardTradeChanges } from '../services/giftCardRealtime'
import CardzipLoader from '../components/CardzipLoader'

const formatDate = (date) => date ? new Date(date).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : '—'
const formatNaira = (amount) => amount === null || amount === undefined
  ? 'Awaiting review'
  : `₦${Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const getTradeHistoryQuery = (page, status, range) => {
  const query = new URLSearchParams({ page: String(page), limit: '20' })
  if (status) query.set('status', status)
  if (range === 'month') query.set('month', new Date().toISOString().slice(0, 7))
  if (range === '30' || range === '90') {
    const from = new Date()
    from.setDate(from.getDate() - Number(range))
    query.set('from', from.toISOString())
  }
  return `?${query.toString()}`
}
const toTradeHistoryEntry = (trade) => ({
  ...trade,
  id: String(trade._id),
  brand: trade.type,
  card: `${trade.amount} ${trade.currency || 'USD'}`,
  timestamp: formatDate(trade.createdAt),
  payout: formatNaira(trade.ngnAmount),
  status: String(trade.status || 'pending').toUpperCase(),
})

export default function TradeHistoryPage({ onNavigate }) {
  const [entries, setEntries] = useState([])
  const [selectedTrade, setSelectedTrade] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 })
  const [range, setRange] = useState('30')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const queryState = useRef({ page: pagination.page, range, status })
  queryState.current = { page: pagination.page, range, status }

  useEffect(() => {
    let active = true
    userApi.giftCardTrades(getTradeHistoryQuery(pagination.page, status, range))
      .then((result) => {
        if (!active) return
        setError('')
        setEntries(result.data.map(toTradeHistoryEntry))
        setPagination(result.pagination)
      })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [pagination.page, range, status])

  useEffect(() => {
    let active = true
    const refreshCurrentPage = () => {
      const { page, range: currentRange, status: currentStatus } = queryState.current
      userApi.giftCardTrades(getTradeHistoryQuery(page, currentStatus, currentRange))
        .then((result) => {
          if (!active) return
          setError('')
          setEntries(result.data.map(toTradeHistoryEntry))
          setPagination(result.pagination)
        })
        .catch((requestError) => { if (active) setError(requestError.message) })
    }
    const unsubscribe = subscribeToGiftCardTradeChanges((trade) => {
      const updatedEntry = toTradeHistoryEntry(trade)
      setSelectedTrade((current) => current?.id === updatedEntry.id ? { ...current, ...updatedEntry } : current)
      refreshCurrentPage()
    }, refreshCurrentPage)
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!selectedTrade) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setSelectedTrade(null)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [selectedTrade])

  const stats = [
    { label: 'Gift card trades', value: pagination.totalItems, icon: Gift, tone: 'green' },
    { label: 'Total paid out · current page', value: `₦${entries.filter((trade) => trade.status === 'SUCCESSFUL').reduce((sum, trade) => sum + Number(trade.ngnAmount || 0), 0).toLocaleString('en-NG')}`, icon: Wallet, tone: 'amber' },
    { label: 'Completed · current page', value: `${entries.filter((trade) => trade.status === 'SUCCESSFUL').length}/${entries.length}`, icon: ShieldCheck, tone: 'green' },
  ]

  return (
    <div className="page-wrapper">
      <div className="page-container">
        <div className="page-header-row reveal">
          <div>
            <div className="breadcrumb">Home / Gift Cards / Trade History</div>
            <h1 className="page-title">Your trade history</h1>
            <p className="page-subtitle">Review your gift card trades, payouts and their latest status.</p>
          </div>
          <button type="button" className="btn-secondary-pill" onClick={() => onNavigate?.('/gift-cards')}>
            <span>Trade a gift card</span>
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
              <button type="button" className={`tab ${!status ? 'active' : ''}`} onClick={() => { setPagination((current) => ({ ...current, page: 1 })); setStatus('') }}>All trades</button>
              <button type="button" className={`tab ${status === 'pending' ? 'active' : ''}`} onClick={() => { setPagination((current) => ({ ...current, page: 1 })); setStatus('pending') }}>Processing</button>
              <button type="button" className={`tab ${status === 'successful' ? 'active' : ''}`} onClick={() => { setPagination((current) => ({ ...current, page: 1 })); setStatus('successful') }}>Completed</button>
            </div>
            <select className="filter-select" aria-label="Filter trades by date" value={range} onChange={(event) => { setPagination((current) => ({ ...current, page: 1 })); setRange(event.target.value) }}>
              <option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="month">This month</option><option value="all">All time</option>
            </select>
          </div>

          {error && <p className="wallet-notice error" role="alert">{error}</p>}
          {loading && <p><CardzipLoader compact label="Loading trade history" /></p>}
          <table className="orders-table">
            <thead>
              <tr>
                <th>REFERENCE</th>
                <th>GIFT CARD</th>
                <th>DATE</th>
                <th>PAYOUT</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {!loading && entries.map((entry) => (
                <tr
                  key={entry.id}
                  className="trade-history-row"
                  tabIndex={0}
                  aria-label={`View details for ${entry.brand}`}
                  onClick={() => setSelectedTrade(entry)}
                  onKeyDown={(event) => {
                    if (event.target !== event.currentTarget) return
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setSelectedTrade(entry)
                    }
                  }}
                >
                  <td className="order-num">#{entry.id}</td>
                  <td>
                    <button type="button" className="trade-history-open" onClick={() => setSelectedTrade(entry)} aria-label={`View details for ${entry.brand}`}>
                      <span className="gift-card-history-brand">
                        {entry.cardLogo && <img src={entry.cardLogo} alt="" />}
                        <span className="item-title">{entry.brand}</span>
                      </span>
                      <span className="item-sub">{entry.card}</span>
                      <span className="trade-history-open-hint">View details</span>
                    </button>
                  </td>
                  <td className="date-txt">{entry.timestamp}</td>
                  <td className="price-txt">{entry.payout}</td>
                  <td>
                    <span className={`status-pill ${entry.status === 'VERIFYING' ? 'pending' : entry.status === 'REJECTED' ? 'failed' : entry.status.toLowerCase()}`}>
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && entries.length === 0 && <tr><td colSpan="5">No gift card trades found for this period.</td></tr>}
            </tbody>
          </table>
          <div className="pagination-controls">
            <button type="button" disabled={loading || pagination.page <= 1} onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))}>Previous</button>
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <button type="button" disabled={loading || pagination.page >= pagination.totalPages} onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))}>Next</button>
          </div>
        </div>
      </div>

      {selectedTrade && (
        <div className="payment-choice-backdrop trade-detail-backdrop" onClick={() => setSelectedTrade(null)}>
          <section
            className="payment-choice-dialog trade-detail-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="trade-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" className="bill-payment-close" aria-label="Close trade details" onClick={() => setSelectedTrade(null)}><X size={18} /></button>
            <div className="trade-detail-heading">
              {selectedTrade.cardLogo && <img src={selectedTrade.cardLogo} alt="" />}
              <div>
                <span className="trade-detail-reference">TRADE #{selectedTrade.id}</span>
                <h2 id="trade-detail-title">{selectedTrade.brand}</h2>
              </div>
              <span className={`status-pill ${selectedTrade.status.toLowerCase()}`}>{selectedTrade.status}</span>
            </div>
            <div className="trade-detail-payout">
              <span>Estimated payout</span>
              <strong>{formatNaira(selectedTrade.ngnAmount)}</strong>
            </div>
            <dl className="trade-detail-fields">
              <div><dt>Card amount</dt><dd>{selectedTrade.card}</dd></div>
              {selectedTrade.region && <div><dt>Region</dt><dd>{selectedTrade.region}</dd></div>}
              {selectedTrade.cardType && <div><dt>Card type</dt><dd>{selectedTrade.cardType}</dd></div>}
              {selectedTrade.exchangeRate !== null && selectedTrade.exchangeRate !== undefined && <div><dt>Exchange rate</dt><dd>₦{Number(selectedTrade.exchangeRate).toLocaleString('en-NG')} per {selectedTrade.currency}</dd></div>}
              <div><dt>Submitted</dt><dd>{formatDate(selectedTrade.createdAt)}</dd></div>
              <div><dt>Last updated</dt><dd>{formatDate(selectedTrade.statusUpdatedAt)}</dd></div>
              <div><dt>Status</dt><dd>{selectedTrade.status}</dd></div>
            </dl>
            {selectedTrade.status === 'FAILED' && (
              <div className="trade-detail-failure">
                <strong>Reason for failure</strong>
                <p>{selectedTrade.companyFeedback || 'No failure reason was provided.'}</p>
              </div>
            )}
            {selectedTrade.imageUrls?.length > 0 && (
              <div className="trade-detail-evidence">
                <strong>Submitted card images</strong>
                <div>
                  {selectedTrade.imageUrls.map((imageUrl, index) => (
                    <a key={`${imageUrl}-${index}`} href={imageUrl} target="_blank" rel="noreferrer" aria-label={`Open submitted card image ${index + 1}`}>
                      <img src={imageUrl} alt={`Submitted card ${index + 1}`} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      )}

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
