import { useEffect, useState } from 'react'
import { CheckCircle2, Clock, Download, Filter, Search, XCircle } from 'lucide-react'
import { adminApi } from '../services/api'
import CardzipLoader from '../components/CardzipLoader'
import CustomSelect from '../components/CustomSelect'

const kycLabels = {
  not_submitted: 'Not submitted',
  pending: 'Pending',
  approved: 'Verified',
  rejected: 'Rejected',
}

const naira = (amount) => `₦${Number(amount || 0).toLocaleString('en-NG')}`
const kycFilterOptions = [
  { value: '', label: 'KYC: All' },
  { value: 'not_submitted', label: 'Not submitted' },
  { value: 'approved', label: 'Verified' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
]
const registrationDateOptions = [
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: 'month', label: 'This month' },
  { value: 'all', label: 'All time' },
]

function exportUsers(users) {
  const columns = ['Name', 'Email', 'KYC status', 'Wallet balance', 'Joined']
  const rows = users.map((user) => [
    user.name,
    user.email,
    kycLabels[user.kyc?.status] || 'Not submitted',
    naira(user.walletBalance),
    new Date(user.createdAt).toLocaleDateString(),
  ])
  const csv = [columns, ...rows]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
    .join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'cardzip-users.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export default function UsersPage({ onViewUser }) {
  const [users, setUsers] = useState([])
  const [summary, setSummary] = useState({ total: 0, pendingKyc: 0, walletHolders: 0 })
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 })
  const [searchTerm, setSearchTerm] = useState('')
  const [kycFilter, setKycFilter] = useState('')
  const [range, setRange] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const query = new URLSearchParams({ page: String(pagination.page), limit: '20' })
    if (searchTerm.trim()) query.set('search', searchTerm.trim())
    if (kycFilter) query.set('kycStatus', kycFilter)
    if (range === 'month') query.set('month', new Date().toISOString().slice(0, 7))
    if (range === '30' || range === '90') {
      const from = new Date()
      from.setDate(from.getDate() - Number(range))
      query.set('from', from.toISOString())
    }
    adminApi.users(`?${query}`)
      .then((result) => {
        if (!active) return
        setUsers(result.data)
        setSummary(result.summary)
        setPagination(result.pagination)
      })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [pagination.page, searchTerm, kycFilter, range])

  const changeFilter = (setter, value) => {
    setLoading(true)
    setError('')
    setPagination((current) => ({ ...current, page: 1 }))
    setter(value)
  }

  return (
    <div className="users-page-container">
      <div className="users-header">
        <div>
          <h1 className="users-title">User Registry</h1>
          <p className="users-subtitle">Manage customer profiles, KYC status and wallet balances.</p>
        </div>
        <button className="btn-secondary" type="button" disabled={!users.length} onClick={() => exportUsers(users)}>
          <Download size={15} /> Export current page
        </button>
      </div>

      <div className="users-metrics-grid">
        <div className="metric-card"><span className="metric-label">Matching users</span><span className="metric-value">{summary.total.toLocaleString()}</span><span className="metric-sub">For current filters</span></div>
        <div className="metric-card"><span className="metric-label">Pending KYC</span><span className="metric-value text-amber">{summary.pendingKyc.toLocaleString()}</span><span className="metric-sub">Requires review</span></div>
        <div className="metric-card"><span className="metric-label">Wallet holders</span><span className="metric-value">{summary.walletHolders.toLocaleString()}</span><span className="metric-sub">Balance above zero</span></div>
      </div>

      <div className="users-toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="search"
            placeholder="Search by name, referral code or email..."
            value={searchTerm}
            onChange={(event) => changeFilter(setSearchTerm, event.target.value)}
          />
        </div>
        <div className="filter-group">
          <div className="user-filter-select has-filter-icon">
            <Filter size={14} className="filter-icon" />
            <CustomSelect
              className="user-filter-select-control"
              ariaLabel="Filter users by KYC status"
              value={kycFilter}
              options={kycFilterOptions}
              onChange={(value) => changeFilter(setKycFilter, value)}
            />
          </div>
          <div className="user-filter-select">
            <CustomSelect
              className="user-filter-select-control"
              ariaLabel="Filter users by registration date"
              value={range}
              options={registrationDateOptions}
              onChange={(value) => changeFilter(setRange, value)}
            />
          </div>
        </div>
      </div>

      <div className="users-table-card">
        {error && <p className="wallet-notice error" role="alert">{error}</p>}
        {loading && <CardzipLoader label="Loading users…" />}
        <div className="table-responsive">
          <table className="users-table">
            <thead><tr><th>User Details</th><th>KYC Status</th><th>Wallet Balance</th><th>Joined Date</th><th className="text-right">Actions</th></tr></thead>
            <tbody>
              {!loading && users.map((user) => {
                const status = user.kyc?.status || 'not_submitted'
                return (
                  <tr key={user._id}>
                    <td><div className="user-info-cell"><div className="user-avatar">{user.name.split(' ').map((name) => name[0]).join('').slice(0, 2)}</div><div className="user-meta"><span className="user-name">{user.name}</span><span className="user-tag">{user.referralCode || 'No referral code'} · {user.email}</span></div></div></td>
                    <td><span className={`badge-kyc ${status}`}>{status === 'approved' ? <CheckCircle2 size={12} /> : status === 'pending' ? <Clock size={12} /> : status === 'rejected' ? <XCircle size={12} /> : null}{kycLabels[status] || status}</span></td>
                    <td className="wallet-balance">{naira(user.walletBalance)}</td>
                    <td className="joined-date">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="text-right"><button type="button" className="btn-open-user" onClick={() => onViewUser?.(user._id)}>Open →</button></td>
                  </tr>
                )
              })}
              {!loading && users.length === 0 && <tr><td colSpan="5">No users found for these filters.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="table-pagination">
          <span className="pagination-info">Page {pagination.page} of {pagination.totalPages} · {pagination.totalItems} users</span>
          <div className="pagination-controls">
            <button type="button" className="btn-page" disabled={loading || pagination.page <= 1} onClick={() => { setLoading(true); setPagination((current) => ({ ...current, page: current.page - 1 })) }}>Previous</button>
            <button type="button" className="btn-page" disabled={loading || pagination.page >= pagination.totalPages} onClick={() => { setLoading(true); setPagination((current) => ({ ...current, page: current.page + 1 })) }}>Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}
