import { ArrowRight, ShieldAlert } from 'lucide-react'

const formatNaira = (value) => `₦${Number(value || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`

export default function WithdrawalRequestsCard({ withdrawals = [], count = 0, loading = false, onViewAll }) {
  return (
    <div className="withdrawals-card">
      <div className="withdrawals-header">
        <div className="withdrawals-title-group">
          <h3 className="withdrawals-title">Withdrawal Requests</h3>
          <span className="badge-pending-count">{Number(count).toLocaleString('en-NG')} pending</span>
        </div>
        <button type="button" className="btn-view-all" onClick={onViewAll}>View all <ArrowRight size={13} /></button>
      </div>

      <div className="requests-list">
        {withdrawals.map((request) => (
          <div key={request._id} className="request-item">
            <div className="request-info">
              <div className="amount-row"><span className="request-amount">{formatNaira(request.amount)}</span><span className="dot-separator">•</span><span className="request-tag">{request.reference}</span></div>
              <span className="request-bank">{request.bankName} · {request.user?.name || request.user?.email || 'Customer'}</span>
            </div>
            <div className="request-actions">
              {request.riskStatus !== 'clear' && <span className="status-badge gray"><ShieldAlert size={12} /> Review</span>}
              <span className="status-badge amber">{request.status}</span>
            </div>
          </div>
        ))}
        {!loading && withdrawals.length === 0 && <p className="overview-card-empty">No pending withdrawal requests.</p>}
        {loading && withdrawals.length === 0 && <p className="overview-card-empty">Loading withdrawal requests…</p>}
      </div>
    </div>
  )
}
