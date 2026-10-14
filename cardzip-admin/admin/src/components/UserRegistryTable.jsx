import { ArrowRight, Users } from 'lucide-react'
import CustomSelect from './CustomSelect'

const kycOptions = [
  { value: 'all', label: 'All KYC statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'not_submitted', label: 'Not submitted' },
]

const formatNaira = (value) => `₦${Number(value || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`
const kycLabel = (status) => ({
  approved: 'Verified',
  pending: 'Pending',
  rejected: 'Rejected',
  not_submitted: 'Not submitted',
}[status] || 'Not submitted')

export default function UserRegistryTable({
  users = [],
  totalUsers = 0,
  pendingKyc = 0,
  filters = { kyc: 'all', wallet: 'all' },
  onFiltersChange,
  loading = false,
  onManage,
  onViewUser,
}) {
  return (
    <div className="registry-card">
      <div className="registry-header">
        <div>
          <h3 className="registry-title">User Registry</h3>
          <span className="registry-subtitle">{Number(totalUsers).toLocaleString('en-NG')} users · {Number(pendingKyc).toLocaleString('en-NG')} KYC pending</span>
        </div>

        <div className="registry-actions">
          <CustomSelect
            ariaLabel="Filter users by KYC status"
            className="overview-registry-filter"
            value={filters.kyc}
            options={kycOptions}
            onChange={(kyc) => onFiltersChange?.((current) => ({ ...current, kyc }))}
          />
          <CustomSelect
            ariaLabel="Filter users by wallet balance"
            className="overview-registry-filter"
            value={filters.wallet}
            options={[
              { value: 'all', label: 'All wallets' },
              { value: 'funded', label: 'Funded wallets' },
              { value: 'empty', label: 'Zero balance' },
            ]}
            onChange={(wallet) => onFiltersChange?.((current) => ({ ...current, wallet }))}
          />
          <button type="button" className="btn-manage-user" onClick={onManage}>Manage User</button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="user-table">
          <thead><tr><th>USER</th><th>KYC</th><th>STATUS</th><th>WALLET</th><th className="text-right">ACTION</th></tr></thead>
          <tbody>
            {users.map((user) => {
              const kycStatus = user.kyc?.status || user.kyc || 'not_submitted'
              const label = kycLabel(kycStatus)
              return (
                <tr key={user._id}>
                  <td><div className="user-cell"><div className="avatar-pill">{user.initials || user.name?.slice(0, 2).toUpperCase() || <Users size={14} />}</div>
                    <div className="user-details"><span className="user-name">{user.name || 'Unknown user'}</span><span className="user-tag">{user.email || user.tag || user._id}</span></div></div></td>
                  <td><span className={`badge-kyc ${kycStatus}`}>{label}</span></td>
                  <td><span className="status-indicator-dot registered">• {user.status || 'Registered'}</span></td>
                  <td className="wallet-cell">{formatNaira(user.walletBalance)}</td>
                  <td className="text-right"><button type="button" className="btn-open-user" onClick={() => onViewUser?.(user._id)}>{'Open'} <ArrowRight size={13} /></button></td>
                </tr>
              )
            })}
            {!loading && users.length === 0 && <tr><td colSpan="5" className="overview-empty-cell">No customer records match these filters.</td></tr>}
            {loading && users.length === 0 && <tr><td colSpan="5" className="overview-empty-cell">Loading customer records…</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
