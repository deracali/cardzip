import { useEffect, useState } from 'react'
import { RefreshCw, Search } from 'lucide-react'
import { adminApi } from '../services/api'
import CardzipLoader from '../components/CardzipLoader'

const statuses = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
]

const formatNaira = (amount) => `₦${Number(amount || 0).toLocaleString('en-NG', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`

const formatDate = (value) => value ? new Date(value).toLocaleString() : '—'

export default function EsimPage() {
  const [transactions, setTransactions] = useState([])
  const [stats, setStats] = useState({ total: 0, pending: 0, processing: 0, completed: 0, failed: 0 })
  const [status, setStatus] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const query = new URLSearchParams({ page: String(page), limit: '20' })
    if (status) query.set('status', status)
    if (search) query.set('search', search)
    adminApi.virtualNumberTransactions(`?${query.toString()}`)
      .then((result) => {
        if (!active) return
        setTransactions(Array.isArray(result.data) ? result.data : [])
        setStats((current) => ({ ...current, ...result.stats }))
        setTotalPages(Math.max(1, Number(result.pagination?.totalPages) || 1))
        setError('')
      })
      .catch((requestError) => {
        if (!active) return
        setTransactions([])
        setError(requestError.message || 'Could not load virtual-number purchases.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [page, refreshKey, search, status])

  const applySearch = (event) => {
    event.preventDefault()
    const nextSearch = searchInput.trim()
    setLoading(true)
    setPage(1)
    setSearch(nextSearch)
    if (nextSearch === search && page === 1) setRefreshKey((key) => key + 1)
  }

  const selectStatus = (nextStatus) => {
    setLoading(true)
    setPage(1)
    setStatus(nextStatus)
    if (nextStatus === status && page === 1) setRefreshKey((key) => key + 1)
  }

  const statItems = [
    ['Total purchases', stats.total],
    ['Pending', stats.pending],
    ['Processing', stats.processing],
    ['Completed', stats.completed],
    ['Failed', stats.failed],
  ]

  return (
    <div className="virtual-admin-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Virtual Number Purchases</h1>
          <p className="page-subtitle">Wallet and Paystack rental attempts, payment outcomes and provider fulfillment.</p>
        </div>
        <button
          className="btn-secondary virtual-admin-refresh"
          type="button"
          disabled={loading}
          onClick={() => {
            setLoading(true)
            setRefreshKey((key) => key + 1)
          }}
        >
          <RefreshCw size={15} className={loading ? 'virtual-admin-spin' : ''} />
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </header>

      <div className="virtual-admin-stats">
        {statItems.map(([label, value]) => (
          <article className="virtual-admin-stat" key={label}>
            <span>{label}</span>
            <strong>{loading ? '—' : Number(value || 0).toLocaleString()}</strong>
          </article>
        ))}
      </div>

      <section className="section-card virtual-admin-history">
        <div className="virtual-admin-toolbar">
          <div className="virtual-admin-filters" role="group" aria-label="Filter virtual-number purchases">
            {statuses.map((option) => (
              <button
                key={option.value || 'all'}
                type="button"
                className={`filter-pill ${status === option.value ? 'active' : ''}`}
                aria-pressed={status === option.value}
                onClick={() => selectStatus(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <form className="virtual-admin-search" onSubmit={applySearch}>
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search customer, service or reference"
              aria-label="Search virtual-number purchases"
            />
            <button type="submit">Search</button>
          </form>
        </div>

        {error && <div className="virtual-admin-error" role="alert">{error}</div>}
        <div className="table-responsive">
          <table className="virtual-admin-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer</th>
                <th>Service / Area</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Rental</th>
                <th>Refund</th>
                <th>Date</th>
                <th>Failure reason</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="10" className="virtual-admin-empty"><CardzipLoader compact label="Loading virtual-number transactions" /></td></tr>
              ) : transactions.length ? transactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td className="virtual-admin-reference">{transaction.reference}</td>
                  <td>
                    <strong>{transaction.user?.name || 'Unknown user'}</strong>
                    <small>{transaction.user?.email || '—'}</small>
                  </td>
                  <td>{transaction.appName}{transaction.area ? <small>{transaction.area} · {transaction.duration || `${transaction.time} months`}</small> : null}</td>
                  <td>{formatNaira(transaction.amount)}</td>
                  <td className="virtual-admin-capitalize">
                    {transaction.paymentMethod}
                    <small>{transaction.paymentStatus || '—'}</small>
                  </td>
                  <td><span className={`virtual-admin-status ${transaction.status}`}>{transaction.status}</span></td>
                  <td>
                    {transaction.phoneNumber || transaction.rentalId || '—'}
                    <small>{transaction.fulfillmentStatus || '—'}</small>
                  </td>
                  <td className={`virtual-admin-capitalize virtual-admin-refund ${transaction.refundStatus || ''}`}>{transaction.refundStatus || '—'}</td>
                  <td>{formatDate(transaction.createdAt)}</td>
                  <td className="virtual-admin-failure">{transaction.failureReason || '—'}</td>
                </tr>
              )) : (
                <tr><td colSpan="10" className="virtual-admin-empty">{error ? 'Could not load virtual-number purchases.' : 'No matching virtual-number purchases.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="virtual-admin-pagination">
          <span>Page {page} of {totalPages}</span>
          <div>
            <button type="button" disabled={page <= 1 || loading} onClick={() => { setLoading(true); setPage((current) => current - 1) }}>Previous</button>
            <button type="button" disabled={page >= totalPages || loading} onClick={() => { setLoading(true); setPage((current) => current + 1) }}>Next</button>
          </div>
        </footer>
      </section>
    </div>
  )
}
