import { useEffect, useRef, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock,
  ChevronDown,
  CreditCard,
  Gift,
  Receipt,
  Search,
  ShoppingBag,
  Wallet,
  XCircle,
} from 'lucide-react'
import { adminApi } from '../services/api'
import CardzipLoader from '../components/CardzipLoader'

const emptyStats = {
  totalUserWalletBalance: 0,
  todayInflow: 0,
  todayOutflow: 0,
  pendingPayoutTotal: 0,
  pendingPayoutCount: 0,
  companyBalance: null,
  companyProfit: null,
}

const formatNaira = (value) => `₦${Number(value || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const getTransactionType = (transaction) => {
  const descriptions = {
    paystack: 'Wallet Deposit',
    gift_card_trade: 'Gift Card Trade',
    store_order: 'E-Commerce Order',
    bill_payment: 'Bill Payment',
    withdrawal: 'Withdrawal',
    withdrawal_refund: 'Withdrawal Refund',
    referral_reward: 'Referral Reward',
  }
  return descriptions[transaction.referenceType] || transaction.description || transaction.type
}

const getSourceIcon = (transaction) => {
  if (transaction.type === 'credit') {
    if (transaction.referenceType === 'gift_card_trade') return <Gift className="icon-inflow" size={14} />
    return <ArrowDownLeft className="icon-inflow" size={14} />
  }
  if (transaction.referenceType === 'store_order') return <ShoppingBag className="icon-outflow" size={14} />
  if (transaction.referenceType === 'bill_payment') return <Receipt className="icon-outflow" size={14} />
  if (transaction.type === 'withdrawal') return <ArrowUpRight className="icon-outflow" size={14} />
  return <CreditCard size={14} />
}

export default function AdminWalletPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [page, setPage] = useState(1)
  const [walletData, setWalletData] = useState({ stats: emptyStats, transactions: [], pagination: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [typeMenuOpen, setTypeMenuOpen] = useState(false)
  const typeMenuRef = useRef(null)
  const transactionTypes = [
    { value: 'all', label: 'All transaction types' },
    { value: 'credit', label: 'Credits' },
    { value: 'debit', label: 'Debits' },
    { value: 'withdrawal', label: 'Withdrawals' },
  ]

  useEffect(() => {
    if (!typeMenuOpen) return undefined
    const closeOnOutsideClick = (event) => {
      if (!typeMenuRef.current?.contains(event.target)) setTypeMenuOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setTypeMenuOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [typeMenuOpen])

  useEffect(() => {
    let active = true
    const query = new URLSearchParams({ page: String(page), limit: '20' })
    if (searchTerm.trim()) query.set('search', searchTerm.trim())
    if (selectedCategory !== 'all') query.set('category', selectedCategory)
    if (selectedType !== 'all') query.set('type', selectedType)

    adminApi.walletDashboard(`?${query.toString()}`)
      .then((result) => {
        if (active) setWalletData(result.data)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [page, searchTerm, selectedCategory, selectedType])

  const updateFilter = (setter, value, currentValue) => {
    if (value === currentValue) return
    setLoading(true)
    setError('')
    setter(value)
    setPage(1)
  }
  const changePage = (nextPage) => {
    setLoading(true)
    setError('')
    setPage(nextPage)
  }

  const stats = walletData.stats || emptyStats
  const pagination = walletData.pagination
  const transactions = walletData.transactions || []

  return (
    <div className="admin-wallet-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Master Wallet &amp; Financial Monitor</h1>
          <p className="page-subtitle">Live wallet ledger, customer balances, inflows, and payouts.</p>
        </div>
      </div>

      <div className="wallet-metrics-grid">
        <div className="metric-card primary">
          <div className="metric-header"><span>Total User Wallet Balances</span><Wallet size={18} /></div>
          <div className="metric-value">{formatNaira(stats.totalUserWalletBalance)}</div>
          <div className="metric-sub">Current customer wallet liability</div>
        </div>
        <div className="metric-card">
          <div className="metric-header text-emerald"><span>Today Inflow</span><ArrowDownLeft size={18} /></div>
          <div className="metric-value">{formatNaira(stats.todayInflow)}</div>
          <div className="metric-sub">Completed wallet credits today</div>
        </div>
        <div className="metric-card">
          <div className="metric-header text-rose"><span>Today Outflow</span><ArrowUpRight size={18} /></div>
          <div className="metric-value">{formatNaira(stats.todayOutflow)}</div>
          <div className="metric-sub">Completed wallet debits and payouts today</div>
        </div>
        <div className="metric-card">
          <div className="metric-header text-amber"><span>Pending Payouts</span><Clock size={18} /></div>
          <div className="metric-value">{formatNaira(stats.pendingPayoutTotal)}</div>
          <div className="metric-sub">{stats.pendingPayoutCount} pending or approved requests</div>
        </div>
        <div className="metric-card">
          <div className="metric-header"><span>Company / Admin Balance</span><Building2 size={18} /></div>
          <div className="metric-value">{stats.companyBalance == null ? 'Not tracked' : formatNaira(stats.companyBalance)}</div>
          <div className="metric-sub">Accrued company earnings from completed sales</div>
        </div>
        <div className="metric-card">
          <div className="metric-header text-emerald"><span>Company Profit</span><Building2 size={18} /></div>
          <div className="metric-value">{stats.companyProfit == null ? 'Not tracked' : formatNaira(stats.companyProfit)}</div>
          <div className="metric-sub">3% of completed bills · 5% of e-commerce subtotals</div>
        </div>
      </div>

      <div className="section-card">
        <div className="card-header flex-between flex-wrap gap-12">
          <div className="filter-group">
            <div className="pill-filters">
              {[['all', 'All'], ['inflow', 'Inflow'], ['outflow', 'Outflow']].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`filter-pill ${selectedCategory === value ? 'active' : ''}`}
                  onClick={() => updateFilter(setSelectedCategory, value, selectedCategory)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="wallet-type-select" ref={typeMenuRef}>
              <button
                type="button"
                className="wallet-type-select-trigger"
                aria-label="Filter by transaction type"
                aria-haspopup="listbox"
                aria-expanded={typeMenuOpen}
                onClick={() => setTypeMenuOpen((open) => !open)}
              >
                <span>{transactionTypes.find((option) => option.value === selectedType)?.label}</span>
                <ChevronDown size={15} aria-hidden="true" />
              </button>
              {typeMenuOpen && <div className="wallet-type-select-menu" role="listbox" aria-label="Transaction type">
                {transactionTypes.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={selectedType === option.value}
                    className={`wallet-type-select-option ${selectedType === option.value ? 'selected' : ''}`}
                    onClick={() => {
                      updateFilter(setSelectedType, option.value, selectedType)
                      setTypeMenuOpen(false)
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>}
            </div>
          </div>
          <div className="search-box-sm">
            <Search size={14} />
            <input
              type="search"
              placeholder="Search user, reference or description"
              value={searchTerm}
              onChange={(event) => updateFilter(setSearchTerm, event.target.value, searchTerm)}
            />
          </div>
        </div>

        {error && <div className="admin-inline-error" role="alert">{error}</div>}
        <div className="table-responsive">
          <table className="admin-ledger-table">
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>User / Customer</th>
                <th>Type</th>
                <th>Details</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date / Time</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => {
                const isInflow = transaction.type === 'credit'
                const status = transaction.status === 'completed' ? 'Successful' : transaction.status
                const statusLabel = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'
                const statusClass = status === 'Successful' ? 'successful' : String(status).toLowerCase()
                const date = transaction.createdAt ? new Date(transaction.createdAt) : null
                return (
                  <tr key={transaction._id}>
                    <td className="font-mono">{transaction.referenceId || transaction._id}</td>
                    <td className="font-bold">{transaction.user?.name || transaction.user?.email || 'Unknown user'}</td>
                    <td><span className="type-tag">{getSourceIcon(transaction)} {getTransactionType(transaction)}</span></td>
                    <td className="text-muted">{transaction.description || transaction.referenceType || '—'}</td>
                    <td className={`font-bold ${isInflow ? 'text-emerald' : 'text-slate'}`}>
                      {isInflow ? '+' : '−'}{formatNaira(transaction.amount)}
                    </td>
                    <td>
                      <span className={`status-pill ${statusClass}`}>
                        {status === 'Successful' && <CheckCircle2 size={12} />}
                        {status === 'pending' && <Clock size={12} />}
                        {status === 'failed' && <XCircle size={12} />}
                        {statusLabel}
                      </span>
                    </td>
                    <td className="text-muted">{date && !Number.isNaN(date.getTime()) ? date.toLocaleString() : '—'}</td>
                  </tr>
                )
              })}
              {!loading && !error && transactions.length === 0 && (
                <tr><td colSpan="7" className="wallet-empty-state">No wallet transactions match these filters.</td></tr>
              )}
              {loading && (
                <tr><td colSpan="7" className="wallet-empty-state"><CardzipLoader compact label="Loading wallet history" /></td></tr>
              )}
            </tbody>
          </table>
        </div>
        {pagination && (
          <div className="wallet-pagination">
            <span>Showing {transactions.length} of {pagination.totalItems} transactions</span>
            <div>
              <button type="button" className="btn-secondary" disabled={!pagination.hasPreviousPage || loading} onClick={() => changePage(page - 1)}>Previous</button>
              <span>Page {pagination.page} of {Math.max(pagination.totalPages, 1)}</span>
              <button type="button" className="btn-secondary" disabled={!pagination.hasNextPage || loading} onClick={() => changePage(page + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
