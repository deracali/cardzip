import { ArrowDownLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import CardzipLoader from './CardzipLoader'

const formatNaira = (value) => `₦${Number(value || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`

export default function TransactionLogsFeed({ transactions = [], loading = false, onViewAll }) {
  return (
    <div className="tx-card">
      <div className="tx-header">
        <h3 className="tx-title">Recent Wallet Activity</h3>
        <button type="button" className="overview-inline-link" onClick={onViewAll}>View wallet history <ArrowRight size={13} /></button>
      </div>

      <div className="tx-grid">
        {transactions.map((transaction) => {
          const isCredit = transaction.type === 'credit'
          const status = transaction.status === 'completed' ? 'Completed' : transaction.status
          return (
            <div key={transaction._id} className="tx-item">
              <div className="tx-item-header"><span className="tx-id">{transaction.referenceId || transaction._id}</span><span className={`badge-tx-status ${status}`}>{status}</span></div>
              <div className="tx-details"><span className="tx-name">{transaction.description || transaction.referenceType || transaction.type}<small>{transaction.user?.name || transaction.user?.email || 'Customer'} · {transaction.createdAt ? new Date(transaction.createdAt).toLocaleString() : ''}</small></span>
                <span className={`tx-amount ${isCredit ? 'credit' : 'debit'}`}>{isCredit ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}{formatNaira(transaction.amount)}</span></div>
            </div>
          )
        })}
        {!loading && transactions.length === 0 && <p className="overview-card-empty">No wallet transactions in this period.</p>}
        {loading && transactions.length === 0 && <p className="overview-card-empty"><CardzipLoader compact label="Loading wallet history" /></p>}
      </div>

      <div className="tx-footer">Wallet transaction activity fetched from the backend for the selected period.</div>
    </div>
  )
}
