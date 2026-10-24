import { useEffect, useMemo, useState } from 'react'
import { ArrowDownLeft, Download, Search } from 'lucide-react'
import { adminApi } from '../services/api'

const formatNaira = (amount) => new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
}).format(Number(amount || 0))

function exportTrades(trades) {
  const columns = ['Reference', 'Customer', 'Card', 'Amount', 'Payout', 'Status', 'Date']
  const rows = trades.map((trade) => [
    trade._id,
    trade.user?.name || trade.user?.email || 'Unknown user',
    trade.type,
    `${trade.amount} ${trade.currency}`,
    formatNaira(trade.ngnAmount),
    trade.status,
    new Date(trade.createdAt).toLocaleString(),
  ])
  const csv = [columns, ...rows]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
    .join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'cardzip-gift-card-trades.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export default function TradeHistoryPage() {
  const [trades, setTrades] = useState([])
  const [summary, setSummary] = useState({ total: 0, successful: 0, pending: 0 })
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 })
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [range, setRange] = useState('30')
  const [completedRequest, setCompletedRequest] = useState({ key: '', error: '' })
  const queryString = useMemo(() => {
    const query = new URLSearchParams({ page: String(pagination.page), limit: '20' })
    if (search.trim()) query.set('search', search.trim())
    if (selectedStatus) query.set('status', selectedStatus)
    if (range === 'month') query.set('month', new Date().toISOString().slice(0, 7))
    if (range === '30' || range === '90') {
      const from = new Date()
      from.setDate(from.getDate() - Number(range))
      query.set('from', from.toISOString())
    }
    return query.toString()
  }, [pagination.page, range, search, selectedStatus])
  const loading = completedRequest.key !== queryString
  const error = completedRequest.key === queryString ? completedRequest.error : ''

  useEffect(() => {
    let active = true
    adminApi.giftCardTrades(`?${queryString}`)
      .then((result) => {
        if (!active) return
        setTrades(result.data)
        setSummary(result.summary)
        setPagination(result.pagination)
      })
      .catch((requestError) => {
        if (active) setCompletedRequest({ key: queryString, error: requestError.message })
      })
      .finally(() => {
        if (active) setCompletedRequest((current) => (
          current.key === queryString ? current : { key: queryString, error: '' }
        ))
      })
    return () => { active = false }
  }, [queryString])

  const changeFilter = (setter, value) => {
    setPagination((current) => ({ ...current, page: 1 }))
    setter(value)
  }

  return (
    <div className="trade-history-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gift Card Trade History</h1>
          <p className="page-subtitle">Review submitted customer trades, payouts and their processing status.</p>
        </div>
        <button type="button" className="btn-secondary" disabled={!trades.length} onClick={() => exportTrades(trades)}>
          <Download size={15} /> Export current page
        </button>
      </div>

      <div className="trade-history-metrics">
        <div className="trade-history-metric"><span>Total trades</span><strong>{summary.total.toLocaleString()}</strong><small>Matching date and search filters</small></div>
        <div className="trade-history-metric"><span>Successful</span><strong>{summary.successful.toLocaleString()}</strong><small>Completed trades</small></div>
        <div className="trade-history-metric"><span>Pending review</span><strong>{summary.pending.toLocaleString()}</strong><small>Awaiting processing</small></div>
      </div>

      <section className="section-card trade-history-card">
        <div className="trade-history-toolbar">
          <div className="trade-history-filters" aria-label="Filter trades by status">
            {[['', 'All'], ['successful', 'Successful'], ['pending', 'Pending'], ['failed', 'Failed']].map(([value, label]) => (
              <button
                key={label}
                type="button"
                className={`filter-pill ${selectedStatus === value ? 'active' : ''}`}
                aria-pressed={selectedStatus === value}
                onClick={() => changeFilter(setSelectedStatus, value)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="trade-history-controls">
            <label className="search-box-sm trade-history-search">
              <Search size={14} />
              <input type="search" placeholder="Search reference, customer or card..." value={search} onChange={(event) => changeFilter(setSearch, event.target.value)} />
            </label>
            <select className="type-select" aria-label="Filter trades by date" value={range} onChange={(event) => changeFilter(setRange, event.target.value)}>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="month">This month</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>

        {error && <p className="wallet-notice error" role="alert">{error}</p>}
        {loading && <p role="status">Loading gift card trades…</p>}
        <div className="table-responsive">
          <table className="trade-history-table">
            <thead><tr><th>Reference</th><th>Customer</th><th>Gift Card</th><th>Card Value</th><th>Payout</th><th>Status</th><th>Date / Time</th></tr></thead>
            <tbody>
              {!loading && trades.map((trade) => (
                <tr key={trade._id}>
                  <td className="font-mono">{trade._id}</td>
                  <td className="font-bold">{trade.user?.name || trade.user?.email || 'Unknown user'}</td>
                  <td>
                    <div className="trade-history-type">
                      {trade.cardLogo ? <img className="gift-card-trade-logo" src={trade.cardLogo} alt="" /> : <ArrowDownLeft size={14} className="icon-inflow" />}
                      <span>{trade.type}</span>
                    </div>
                    <div className="text-muted trade-history-source">{trade.paymentMethod || 'Gift card trade'}</div>
                  </td>
                  <td>{Number(trade.amount).toLocaleString()} {trade.currency}</td>
                  <td className="font-bold text-emerald">{trade.ngnAmount ? formatNaira(trade.ngnAmount) : '—'}</td>
                  <td><span className={`status-pill ${trade.status}`}>{trade.status}</span></td>
                  <td className="text-muted">{new Date(trade.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {!loading && trades.length === 0 && <tr><td colSpan="7" className="trade-history-empty">No trades match these filters.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="trade-history-footer">
          <span>Page {pagination.page} of {pagination.totalPages} · {pagination.totalItems} trades</span>
          <div className="pagination-controls">
            <button type="button" disabled={loading || pagination.page <= 1} onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))}>Previous</button>
            <button type="button" disabled={loading || pagination.page >= pagination.totalPages} onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))}>Next</button>
          </div>
        </div>
      </section>
    </div>
  )
}
