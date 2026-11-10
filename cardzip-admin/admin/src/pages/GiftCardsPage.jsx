import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDownLeft, Check, ChevronDown, Download, Search } from 'lucide-react'
import { adminApi } from '../services/api'
import { subscribeToGiftCardTradeChanges } from '../services/giftCardRealtime'
import CardzipLoader from '../components/CardzipLoader'

const formatNaira = (amount) => new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 2,
}).format(Number(amount || 0))

const formatDate = (date) => date ? new Date(date).toLocaleString() : '—'

const getHighestRate = (rates) => rates
  .slice()
  .sort((left, right) => Number(right.type.rate) - Number(left.type.rate))[0] || null

const dateRangeOptions = [
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: 'month', label: 'This month' },
  { value: 'all', label: 'All time' },
]

function exportTrades(trades) {
  const columns = ['Reference', 'Customer', 'Card', 'Amount', 'Payout', 'Status', 'Date']
  const rows = trades.map((trade) => [
    trade._id,
    trade.user?.name || trade.user?.email || 'Unknown user',
    trade.type,
    `${trade.amount} ${trade.currency}`,
    formatNaira(trade.ngnAmount),
    trade.status,
    formatDate(trade.createdAt),
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

function exportRates(rates) {
  const rows = [['Gift Card', 'Region', 'Currency', 'Rate (NGN per unit)', 'Demand']]
  rates.forEach(({ card, type }) => rows.push([
    card.name,
    type.country,
    type.currency,
    type.rate,
    card.popular ? 'Hot' : 'Normal',
  ]))
  const csv = rows
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
    .join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'cardzip-gift-card-rates.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export default function GiftCardsPage() {
  const [trades, setTrades] = useState([])
  const [catalog, setCatalog] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 })
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [range, setRange] = useState('30')
  const [dateFilterOpen, setDateFilterOpen] = useState(false)
  const dateFilterRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [error, setError] = useState('')
  const [catalogError, setCatalogError] = useState('')
  const [tradeRefreshKey, setTradeRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    const loadCatalog = async () => {
      try {
        const firstPage = await adminApi.giftCardCatalog('?page=1&limit=50')
        const cards = firstPage.data || []
        const totalPages = firstPage.pagination?.totalPages || 1
        for (let page = 2; page <= totalPages; page += 1) {
          const result = await adminApi.giftCardCatalog(`?page=${page}&limit=50`)
          cards.push(...(result.data || []))
        }
        if (active) setCatalog(cards)
      } catch (requestError) {
        if (active) setCatalogError(requestError.message)
      } finally {
        if (active) setCatalogLoading(false)
      }
    }
    loadCatalog()
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    const timeout = window.setTimeout(() => {
      const query = new URLSearchParams({ page: String(pagination.page), limit: '20' })
      if (search.trim()) query.set('search', search.trim())
      if (selectedStatus) query.set('status', selectedStatus)
      if (range === 'month') query.set('month', new Date().toISOString().slice(0, 7))
      if (range === '30' || range === '90') {
        const from = new Date()
        from.setDate(from.getDate() - Number(range))
        query.set('from', from.toISOString())
      }
      setLoading(true)
      setError('')
      adminApi.giftCardTrades(`?${query.toString()}`)
        .then((result) => {
          if (!active) return
          setTrades(result.data || [])
          setPagination(result.pagination)
        })
        .catch((requestError) => { if (active) setError(requestError.message) })
        .finally(() => { if (active) setLoading(false) })
    }, search ? 300 : 0)

    return () => {
      active = false
      window.clearTimeout(timeout)
    }
  }, [pagination.page, search, selectedStatus, range, tradeRefreshKey])

  useEffect(() => subscribeToGiftCardTradeChanges(
    () => setTradeRefreshKey((current) => current + 1),
    () => setTradeRefreshKey((current) => current + 1),
  ), [])

  useEffect(() => {
    if (!dateFilterOpen) return undefined
    const closeOnOutsideClick = (event) => {
      if (!dateFilterRef.current?.contains(event.target)) setDateFilterOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setDateFilterOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [dateFilterOpen])

  const availableRates = useMemo(() => catalog.flatMap((card) => (
    (card.types || [])
      .filter((type) => Number.isFinite(Number(type.rate)) && Number(type.rate) > 0)
      .map((type) => ({ card, type }))
  )), [catalog])
  const usdRates = availableRates.filter(({ type }) => String(type.currency).toUpperCase() === 'USD')
  const rates = [
    { key: 'hot', label: 'Hot', result: getHighestRate(usdRates.filter(({ card }) => card.popular)) },
    { key: 'normal', label: 'Normal', result: getHighestRate(usdRates.filter(({ card }) => !card.popular)) },
    { key: 'highest', label: 'Highest', result: getHighestRate(usdRates) },
  ]

  const changeFilter = (setter, value) => {
    setPagination((current) => ({ ...current, page: 1 }))
    setter(value)
  }

  return (
    <div className="giftcards-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gift Card Exchange</h1>
          <p className="page-subtitle">Rate highlights compare USD entries; the full rates table retains each catalog currency.</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" type="button" disabled={!availableRates.length} onClick={() => exportRates(availableRates)}>
            <Download size={15} /> Rates Table
          </button>
          <button className="btn-secondary" type="button" disabled={!trades.length} onClick={() => exportTrades(trades)}>
            <Download size={15} /> Export history
          </button>
        </div>
      </div>

      <div className="rates-grid">
        {rates.map(({ key, label, result }) => (
          <div className="rate-card" key={key}>
            <div className="rate-header">
              <span className="brand-name">{result ? `${result.card.name} · ${result.type.country}` : label}</span>
              <span className="rate-tag">{label}</span>
            </div>
            <div className="rate-val">
              {result ? <>{formatNaira(result.type.rate)} <span className="rate-sub">/ USD</span></> : catalogLoading ? <CardzipLoader compact label="Loading exchange rate" /> : 'No USD rate available'}
            </div>
            {catalogError && !result && <small className="text-muted">{catalogError}</small>}
          </div>
        ))}
      </div>

      <section className="section-card">
        <div className="card-header giftcards-history-header">
          <div>
            <h3>Gift Card Trade History</h3>
            <span className="text-muted">{pagination.totalItems.toLocaleString()} matching trades</span>
          </div>
          <div className="giftcards-history-controls">
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
                <Search size={14} aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search reference, customer or card..."
                  value={search}
                  onChange={(event) => changeFilter(setSearch, event.target.value)}
                />
              </label>
              <div className="giftcards-date-filter" ref={dateFilterRef}>
                <button
                  type="button"
                  className="giftcards-date-filter-trigger"
                  aria-label="Filter trades by date"
                  aria-haspopup="listbox"
                  aria-expanded={dateFilterOpen}
                  aria-controls="giftcards-date-filter-options"
                  onClick={() => setDateFilterOpen((open) => !open)}
                >
                  <span>{dateRangeOptions.find((option) => option.value === range)?.label || 'Select date range'}</span>
                  <ChevronDown size={15} aria-hidden="true" />
                </button>
                {dateFilterOpen && <div className="giftcards-date-filter-menu" id="giftcards-date-filter-options" role="listbox" aria-label="Date range options">
                  {dateRangeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={range === option.value}
                      className={`giftcards-date-filter-option ${range === option.value ? 'selected' : ''}`}
                      onClick={() => {
                        changeFilter(setRange, option.value)
                        setDateFilterOpen(false)
                      }}
                    >
                      <span>{option.label}</span>
                      {range === option.value && <Check size={15} aria-hidden="true" />}
                    </button>
                  ))}
                </div>}
              </div>
            </div>
          </div>
        </div>

        {error && <p className="wallet-notice error" role="alert">{error}</p>}
        {loading && <p><CardzipLoader compact label="Loading gift card trades" /></p>}
        <div className="table-responsive">
          <table className="gc-table">
            <thead>
              <tr>
                <th>Trade Ref</th>
                <th>Brand / Region</th>
                <th>Face Value</th>
                <th>Naira Payout</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Date / Time</th>
              </tr>
            </thead>
            <tbody>
              {!loading && trades.map((trade) => (
                <tr key={trade._id}>
                  <td className="font-mono">{trade._id}</td>
                  <td>
                    <div className="trade-history-type">
                      {trade.cardLogo ? <img className="gift-card-trade-logo" src={trade.cardLogo} alt="" /> : <ArrowDownLeft size={14} className="icon-inflow" />}
                      <span>{trade.type}</span>
                    </div>
                  </td>
                  <td className="font-bold">{Number(trade.amount).toLocaleString()} {trade.currency}</td>
                  <td className="font-bold text-emerald">{trade.ngnAmount !== null && trade.ngnAmount !== undefined ? formatNaira(trade.ngnAmount) : '—'}</td>
                  <td className="text-muted">{trade.user?.name || trade.user?.email || 'Unknown user'}</td>
                  <td><span className={`gc-badge ${trade.status}`}>{trade.status}</span></td>
                  <td className="text-muted">{formatDate(trade.createdAt)}</td>
                </tr>
              ))}
              {!loading && trades.length === 0 && <tr><td colSpan="7" className="trade-history-empty">No trades match these filters.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="trade-history-footer">
          <span>Page {pagination.page} of {pagination.totalPages} · {pagination.totalItems} trades</span>
          <div className="pagination-controls">
            <button className="btn-page giftcards-page-button" type="button" aria-label="Previous page" disabled={loading || pagination.page <= 1} onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))}>Previous</button>
            <button className="btn-page giftcards-page-button" type="button" aria-label="Next page" disabled={loading || pagination.page >= pagination.totalPages} onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))}>Next</button>
          </div>
        </div>
      </section>
    </div>
  )
}
