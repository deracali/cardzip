import { useEffect, useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Building2, RefreshCw, Search, Wallet } from 'lucide-react'
import { adminApi } from '../services/api'
import CardzipLoader from '../components/CardzipLoader'

const emptyTreasury = {
  userWallet: { totalBalance: 0, usersWithBalance: 0, totalUsers: 0 },
  companyWallet: { balance: null, profit: null },
  userTransactions: [],
  companyTransactions: [],
}

const formatNaira = (value) => `₦${Number(value || 0).toLocaleString('en-NG', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`

const formatDate = (value) => value ? new Date(value).toLocaleString() : '—'

const describeCompanyTransaction = (transaction) => {
  const source = transaction.referenceType === 'store_order' ? 'E-commerce order' : 'Bill payment'
  return `${source} profit`
}

export default function TreasuryPage() {
  const [treasury, setTreasury] = useState(emptyTreasury)
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    adminApi.treasury()
      .then((result) => {
        if (active) {
          setTreasury({ ...emptyTreasury, ...result.data })
          setError('')
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Could not load treasury data.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [refreshKey])

  const normalizedSearch = searchTerm.trim().toLowerCase()
  const userTransactions = useMemo(() => treasury.userTransactions.filter((transaction) => (
    !normalizedSearch || [
      transaction.referenceId,
      transaction.description,
      transaction.referenceType,
      transaction.user?.name,
      transaction.user?.email,
    ].some((value) => String(value || '').toLowerCase().includes(normalizedSearch))
  )), [normalizedSearch, treasury.userTransactions])
  const companyTransactions = useMemo(() => treasury.companyTransactions.filter((transaction) => (
    !normalizedSearch || [
      transaction.referenceId,
      transaction.referenceType,
    ].some((value) => String(value || '').toLowerCase().includes(normalizedSearch))
  )), [normalizedSearch, treasury.companyTransactions])

  return (
    <div className="treasury-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Treasury &amp; Wallets</h1>
          <p className="page-subtitle">Live company and customer wallet balances with their transaction histories.</p>
        </div>
        <button
          className="btn-secondary treasury-refresh"
          type="button"
          onClick={() => {
            setLoading(true)
            setRefreshKey((key) => key + 1)
          }}
          disabled={loading}
        >
          <RefreshCw size={15} className={loading ? 'treasury-spinning' : ''} />
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && <div className="treasury-error" role="alert">{error}</div>}

      <section className="treasury-wallet-grid" aria-label="Wallet balances">
        <article className="treasury-wallet-card treasury-user-wallet">
          <div className="treasury-wallet-icon"><Wallet size={20} /></div>
          <div className="treasury-wallet-label">Total User Wallets</div>
          <strong>{formatNaira(treasury.userWallet.totalBalance)}</strong>
          <span>{Number(treasury.userWallet.usersWithBalance || 0).toLocaleString()} funded users · {Number(treasury.userWallet.totalUsers || 0).toLocaleString()} total users</span>
        </article>
        <article className="treasury-wallet-card treasury-company-wallet">
          <div className="treasury-wallet-icon"><Building2 size={20} /></div>
          <div className="treasury-wallet-label">Company Wallet</div>
          <strong>{treasury.companyWallet.balance == null ? 'Not tracked' : formatNaira(treasury.companyWallet.balance)}</strong>
          <span>{treasury.companyWallet.profit == null ? 'Company account is not configured' : `${formatNaira(treasury.companyWallet.profit)} total recorded profit`}</span>
        </article>
      </section>

      <div className="treasury-history-toolbar">
        <div>
          <h2>Transaction histories</h2>
          <p>Latest recorded activity for customer wallets and company earnings.</p>
        </div>
        <label className="treasury-search">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search reference, customer or transaction"
            aria-label="Search treasury transactions"
          />
        </label>
      </div>

      <section className="section-card treasury-history-card">
        <div className="card-header">
          <h3>User Wallet Transactions</h3>
          <span className="treasury-count">{userTransactions.length} records</span>
        </div>
        <div className="table-responsive">
          <table className="treasury-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer</th>
                <th>Transaction</th>
                <th>Amount</th>
                <th>Balance After</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="treasury-empty"><CardzipLoader compact label="Loading user wallet transactions" /></td></tr>
              ) : userTransactions.length ? userTransactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td className="font-mono">{transaction.referenceId || '—'}</td>
                  <td>
                    <span className="treasury-customer-name">{transaction.user?.name || 'Unknown user'}</span>
                    <small>{transaction.user?.email || '—'}</small>
                  </td>
                  <td>
                    <span className="movement-type">
                      {transaction.type === 'credit'
                        ? <ArrowDownLeft size={13} className="text-green" />
                        : <ArrowUpRight size={13} className="text-blue" />}
                      {transaction.description || transaction.referenceType || transaction.type}
                    </span>
                  </td>
                  <td className="font-bold">{formatNaira(transaction.amount)}</td>
                  <td>{formatNaira(transaction.balanceAfter)}</td>
                  <td><span className={`status-pill ${(transaction.status || 'unknown').toLowerCase()}`}>{transaction.status || 'Unknown'}</span></td>
                  <td className="text-muted">{formatDate(transaction.createdAt)}</td>
                </tr>
              )) : (
                <tr><td colSpan="7" className="treasury-empty">{error ? 'User wallet history is unavailable.' : 'No matching user wallet transactions.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section-card treasury-history-card">
        <div className="card-header">
          <h3>Company Wallet Transactions</h3>
          <span className="treasury-count">{companyTransactions.length} records</span>
        </div>
        <div className="table-responsive">
          <table className="treasury-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Source</th>
                <th>Basis Amount</th>
                <th>Profit Rate</th>
                <th>Profit Added</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="treasury-empty"><CardzipLoader compact label="Loading company wallet transactions" /></td></tr>
              ) : companyTransactions.length ? companyTransactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td className="font-mono">{transaction.referenceId}</td>
                  <td>{describeCompanyTransaction(transaction)}</td>
                  <td>{formatNaira(transaction.basisAmount)}</td>
                  <td>{Number(transaction.profitRate || 0) * 100}%</td>
                  <td className="font-bold text-green">{formatNaira(transaction.profitAmount)}</td>
                  <td className="text-muted">{formatDate(transaction.createdAt)}</td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="treasury-empty">{error ? 'Company wallet history is unavailable.' : 'No matching company wallet transactions.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
