import { ArrowUpRight, BanknoteArrowUp, ChevronDown, ReceiptText, ShieldCheck, Wallet } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { billApi, userApi } from '../services/api'
import BillReceiptDialog from '../components/BillReceiptDialog'
import CardzipLoader from '../components/CardzipLoader'

const formatNaira = (amount) => `₦${Number(amount || 0).toLocaleString('en-NG')}`
const formatDate = (date) => date ? new Date(date).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

const dateRanges = [
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: 'month', label: 'This month' },
  { value: 'all', label: 'All time' },
]

function DateRangeSelect({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  const selectedRange = dateRanges.find((range) => range.value === value) || dateRanges[0]

  return (
    <div className="bill-history-range" ref={menuRef}>
      <button
        type="button"
        className="filter-select"
        aria-label="Filter by date"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selectedRange.label}</span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>
      {open && <div className="bill-history-range-menu" role="listbox" aria-label="Payment date range">
        {dateRanges.map((range) => <button
          type="button"
          key={range.value}
          role="option"
          aria-selected={value === range.value}
          className={`bill-history-range-option ${value === range.value ? 'selected' : ''}`}
          onClick={() => {
            onChange(range.value)
            setOpen(false)
          }}
        >{range.label}</button>)}
      </div>}
    </div>
  )
}

export default function BillHistoryPage({ onNavigate }) {
  const [entries, setEntries] = useState([])
  const [balance, setBalance] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [dateRange, setDateRange] = useState('30')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, totalItems: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedReceipt, setSelectedReceipt] = useState(null)

  useEffect(() => {
    let mounted = true
    userApi.wallet()
      .then((wallet) => {
        if (!mounted) return
        setBalance(wallet.data)
      })
      .catch((requestError) => { if (mounted) setError(requestError.message) })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true
    const params = new URLSearchParams({ page: String(page), limit: '20', range: dateRange })
    if (categoryFilter) params.set('category', categoryFilter === 'Airtime & data' ? 'Airtime & data' : categoryFilter)

    billApi.history(`?${params.toString()}`)
      .then((response) => {
        if (!mounted) return
        setError('')
        setEntries(Array.isArray(response.data) ? response.data : [])
        setPagination(response.pagination || { page, limit: 20, totalItems: 0, totalPages: 1 })
      })
      .catch((requestError) => { if (mounted) setError(requestError.message) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [categoryFilter, dateRange, page])

  const currentMonthEntries = entries.filter((entry) => {
    const date = new Date(entry.createdAt)
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  })
  const completedCount = entries.filter((entry) => entry.status === 'completed').length
  const settledCount = entries.filter((entry) => ['completed', 'failed'].includes(entry.status)).length
  const stats = [
    { label: 'Bill payments', value: loading ? <CardzipLoader compact label="Loading bill count" /> : String(pagination.totalItems), icon: ReceiptText, tone: 'green' },
    { label: 'This month', value: formatNaira(currentMonthEntries.filter((entry) => entry.status === 'completed').reduce((sum, entry) => sum + entry.amount, 0)), icon: BanknoteArrowUp, tone: 'amber' },
    { label: 'Success rate', value: settledCount ? `${((completedCount / settledCount) * 100).toFixed(1)}%` : '—', icon: ShieldCheck, tone: 'green' },
  ]

  return (
    <div className="page-wrapper">
      <div className="page-container">
        <div className="page-header-row reveal">
          <div>
            <div className="breadcrumb">Home / Bills / Payment History</div>
            <h1 className="page-title">Bill payment history</h1>
            <p className="page-subtitle">Track every utility, airtime and subscription payment in one clean timeline.</p>
          </div>
          <button className="btn-secondary-pill" onClick={() => onNavigate?.('/bills')}>
            <span>Back to bills</span>
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

        <div className="orders-table-card bill-history-card reveal">
          <div className="table-top-bar bill-history-toolbar">
            <div className="tabs-list bill-history-tabs">
              {[['', 'All bills'], ['Electricity', 'Electricity'], ['Airtime & data', 'Airtime & data'], ['Data', 'Data'], ['Pay TV', 'Pay TV'], ['WAEC PINs', 'WAEC']].map(([value, label]) => <button type="button" key={label} className={`tab ${categoryFilter === value ? 'active' : ''}`} aria-pressed={categoryFilter === value} onClick={() => { if (categoryFilter !== value) { setLoading(true); setError(''); setPage(1); setCategoryFilter(value) } }}>{label}</button>)}
            </div>
            <DateRangeSelect value={dateRange} onChange={(value) => { if (dateRange !== value) { setLoading(true); setError(''); setPage(1); setDateRange(value) } }} />
          </div>

          <table className="orders-table">
            <thead>
              <tr>
                <th>REFERENCE</th>
                <th>SERVICE</th>
                <th>DATE</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {!loading && entries.map((entry) => (
                <tr
                  key={entry.reference}
                  className="bill-history-row"
                  role="button"
                  tabIndex={0}
                  aria-label={`Open receipt for ${entry.serviceName}, ${entry.status}`}
                  onClick={() => setSelectedReceipt(entry)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setSelectedReceipt(entry)
                    }
                  }}
                >
                  <td className="order-num">{entry.reference}</td>
                  <td>
                    <span className="item-title">{entry.serviceName}</span>
                    <span className="item-sub">{entry.category}</span>
                  </td>
                  <td className="date-txt">{formatDate(entry.createdAt)}</td>
                  <td className="price-txt">{formatNaira(entry.amount)}</td>
                  <td>
                    <span className={`status-pill ${entry.status === 'completed' ? 'successful' : entry.status}`}>{entry.status === 'completed' ? 'SUCCESSFUL' : entry.status.toUpperCase()}</span>
                  </td>
                </tr>
              ))}
              {!loading && entries.length === 0 && <tr><td colSpan="5" className="date-txt">No bill payments found.</td></tr>}
              {loading && <tr><td colSpan="5" className="date-txt"><CardzipLoader compact label="Loading bill history" /></td></tr>}
            </tbody>
          </table>
          {error && <p className="wallet-notice error" role="alert">{error}</p>}
          <div className="bill-history-pagination">
            <span>{pagination.totalItems} payments · Page {pagination.page} of {Math.max(1, pagination.totalPages)}</span>
            <div>
              <button type="button" disabled={loading || page <= 1} onClick={() => { setLoading(true); setError(''); setPage((current) => current - 1) }}>Previous</button>
              <button type="button" disabled={loading || page >= pagination.totalPages} onClick={() => { setLoading(true); setError(''); setPage((current) => current + 1) }}>Next</button>
            </div>
          </div>
        </div>

        <div className="selected-order-tracker">
          <div className="tracker-left reveal">
            <h3>Latest bill payment</h3>
            <p>{entries[0] ? `${entries[0].category} · ${entries[0].serviceName}` : loading ? <CardzipLoader compact label="Loading payment history" /> : 'No bill payments yet.'}</p>
            <div className="steps-tracker">
              {entries[0] && <>
                <div className="step-node active"><span>{entries[0].status === 'completed' ? '✓ Payment successful' : entries[0].status.toUpperCase()}</span><span className="time-sub">{formatDate(entries[0].createdAt)}</span></div>
                <div className="step-node active"><span>Reference</span><span className="time-sub">{entries[0].reference}</span></div>
                <div className="step-node"><span>Amount</span><span className="time-sub">{formatNaira(entries[0].amount)}</span></div>
              </>}
            </div>
          </div>

          <div className="tracker-right-dark reveal">
            <Wallet size={18} className="green-txt" />
            <h4>Wallet status</h4>
            <p>{balance ? `${formatNaira(balance.balance)} available.` : 'Wallet balance unavailable.'}</p>
            <button type="button" className="wallet-text-link" onClick={() => onNavigate?.('/balance-history')}>View balance history <ArrowUpRight size={14} /></button>
          </div>
        </div>
      </div>

      {selectedReceipt && <BillReceiptDialog
        bill={selectedReceipt}
        status={selectedReceipt.status}
        message={selectedReceipt.failureReason}
        onClose={() => setSelectedReceipt(null)}
      />}

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
