import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Clock3, Search } from 'lucide-react'
import { adminApi } from '../services/api'

const formatNaira = (amount, currency = 'NGN') => new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: currency || 'NGN',
  maximumFractionDigits: 0,
}).format(Number(amount || 0))

const formatStatus = (status) => String(status || 'pending')
  .replaceAll('_', ' ')
  .replace(/\b\w/g, (character) => character.toUpperCase())

const getDeliveryResult = (bill) => (
  bill.token ||
  bill.failureReason ||
  bill.providerReference ||
  'No delivery details returned'
)

export default function BillPaymentsPage() {
  const [bills, setBills] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const timeout = window.setTimeout(() => {
      const query = new URLSearchParams({ page: String(page), limit: '10' })
      if (activeTab === 'failed') query.set('status', 'failed')
      if (search.trim()) query.set('search', search.trim())

      setLoading(true)
      setError('')
      adminApi.billPaymentHistory(`?${query.toString()}`)
        .then((result) => {
          if (!active) return
          setBills(result.data || [])
          setPagination(result.pagination || { page, totalPages: 1, totalItems: 0 })
        })
        .catch((requestError) => {
          if (active) setError(requestError.message)
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }, search ? 300 : 0)

    return () => {
      active = false
      window.clearTimeout(timeout)
    }
  }, [activeTab, page, search])

  const changeTab = (tab) => {
    setActiveTab(tab)
    setPage(1)
  }

  return (
    <div className="bills-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bill Payments</h1>
          <p className="page-subtitle">Review bill payment history and provider delivery results.</p>
        </div>
      </div>

      <div className="section-card bills-history-card">
        <div className="card-header bills-history-header">
          <div className="tabs-wrapper" role="tablist" aria-label="Bill payment status">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'all'}
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => changeTab('all')}
            >
              All Transactions
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'failed'}
              className={`tab-btn ${activeTab === 'failed' ? 'active' : ''}`}
              onClick={() => changeTab('failed')}
            >
              Failed / Retries
            </button>
          </div>

          <label className="search-box-sm bills-history-search">
            <Search size={14} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search meter, phone, customer or reference..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
            />
          </label>
        </div>

        {error && <p className="wallet-notice error" role="alert">{error}</p>}
        {loading && <p className="bills-history-message" role="status">Loading bill payment history…</p>}

        <div className="table-responsive">
          <table className="bills-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Service</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Token / Result</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {!loading && bills.map((bill) => (
                <tr key={bill.id}>
                  <td className="font-mono">{bill.reference}</td>
                  <td>
                    <span className="font-bold">{bill.serviceName}</span>
                    <span className="bills-category">{bill.category}</span>
                  </td>
                  <td>
                    <span>{bill.customerName || bill.user?.name || 'Customer unavailable'}</span>
                    <span className="bills-customer-detail">{bill.phone || bill.user?.email || '—'}</span>
                  </td>
                  <td className="font-bold">{formatNaira(bill.amount, bill.currency)}</td>
                  <td>
                    <span className={`badge-bill-status ${bill.status || 'pending'}`}>
                      {bill.status === 'completed' && <CheckCircle2 size={12} aria-hidden="true" />}
                      {bill.status === 'failed' && <AlertTriangle size={12} aria-hidden="true" />}
                      {['pending', 'processing'].includes(bill.status) && <Clock3 size={12} aria-hidden="true" />}
                      {formatStatus(bill.status)}
                    </span>
                  </td>
                  <td className="bills-result" title={getDeliveryResult(bill)}>{getDeliveryResult(bill)}</td>
                  <td className="text-muted">{bill.createdAt ? new Date(bill.createdAt).toLocaleString() : 'Date unavailable'}</td>
                </tr>
              ))}
              {!loading && bills.length === 0 && (
                <tr>
                  <td colSpan="7" className="bills-history-empty">
                    {search
                      ? 'No bill payments match your search.'
                      : activeTab === 'failed'
                        ? 'There are no failed bill payments.'
                        : 'No bill payments have been recorded yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bills-pagination">
          <span>
            Page {pagination.page || page} of {Math.max(1, pagination.totalPages || 1)}
            {' · '}{Number(pagination.totalItems || 0).toLocaleString()} payments
          </span>
          <div className="pagination-controls">
            <button
              className="btn-page"
              type="button"
              disabled={loading || page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </button>
            <button
              className="btn-page"
              type="button"
              disabled={loading || page >= Math.max(1, pagination.totalPages || 1)}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
