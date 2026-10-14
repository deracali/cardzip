import React, { useState } from 'react'
import {
  ArrowUpRight,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  Eye,
  X,
  AlertCircle
} from 'lucide-react'


const initialWithdrawals = [
  {
    id: 'WTH-8819',
    user: 'Adaeze Okonkwo',
    bankName: 'GTBank',
    accountNumber: '0123456789',
    accountName: 'Adaeze Grace Okonkwo',
    amount: '₦500,000.00',
    requestedAt: '10 mins ago',
    status: 'Pending'
  },
  {
    id: 'WTH-8818',
    user: 'Tunde Bakare',
    bankName: 'Access Bank',
    accountNumber: '2091823019',
    accountName: 'Tunde Bakare',
    amount: '₦120,000.00',
    requestedAt: '25 mins ago',
    status: 'Pending'
  },
  {
    id: 'WTH-8817',
    user: 'Chiamaka Eze',
    bankName: 'Kuda Bank',
    accountNumber: '2019283019',
    accountName: 'Chiamaka Eze',
    amount: '₦45,000.00',
    requestedAt: '2 hours ago',
    status: 'Approved'
  },
  {
    id: 'WTH-8816',
    user: 'Paloma Bello',
    bankName: 'Zenith Bank',
    accountNumber: '1100293019',
    accountName: 'Paloma Bello',
    amount: '₦1,200,000.00',
    requestedAt: '5 hours ago',
    status: 'Rejected'
  }
]

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState(initialWithdrawals)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const handleApprove = (id) => {
    setWithdrawals(
      withdrawals.map((w) => (w.id === id ? { ...w, status: 'Approved' } : w))
    )
    setSelectedRequest(null)
  }

  const handleReject = (id) => {
    setWithdrawals(
      withdrawals.map((w) => (w.id === id ? { ...w, status: 'Rejected' } : w))
    )
    setSelectedRequest(null)
    setRejectReason('')
  }

  return (
    <div className="withdrawals-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer Withdrawal Requests</h1>
          <p className="page-subtitle">
            Review user payout requests, verify bank account names, and authorize bank transfers.
          </p>
        </div>
      </div>

      <div className="section-card">
        <div className="card-header flex-between">
          <h3>Payout Requests</h3>
        </div>

        <div className="table-responsive">
          <table className="withdraw-table">
            <thead>
              <tr>
                <th>Ref ID</th>
                <th>Customer</th>
                <th>Destination Bank</th>
                <th>Account Number</th>
                <th>Payout Amount</th>
                <th>Requested</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr key={w.id}>
                  <td className="font-mono">{w.id}</td>
                  <td className="font-bold">{w.user}</td>
                  <td>
                    <div className="font-bold">{w.bankName}</div>
                    <div className="text-muted" style={{ fontSize: '11px' }}>
                      {w.accountName}
                    </div>
                  </td>
                  <td className="font-mono">{w.accountNumber}</td>
                  <td className="font-bold text-rose">{w.amount}</td>
                  <td className="text-muted">{w.requestedAt}</td>
                  <td>
                    <span className={`badge-pill ${w.status.toLowerCase()}`}>
                      {w.status === 'Approved' && <CheckCircle2 size={12} />}
                      {w.status === 'Pending' && <Clock size={12} />}
                      {w.status === 'Rejected' && <XCircle size={12} />}
                      {w.status}
                    </span>
                  </td>
                  <td className="text-right">
                    {w.status === 'Pending' ? (
                      <button className="btn-review" onClick={() => setSelectedRequest(w)}>
                        <Eye size={13} /> Process
                      </button>
                    ) : (
                      <span className="text-muted" style={{ fontSize: '12px' }}>
                        Processed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Process Payout #{selectedRequest.id}</h3>
              <button className="btn-close" onClick={() => setSelectedRequest(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="payout-details-box">
                <div className="detail-row">
                  <span>Customer:</span>
                  <strong>{selectedRequest.user}</strong>
                </div>
                <div className="detail-row">
                  <span>Bank:</span>
                  <strong>{selectedRequest.bankName}</strong>
                </div>
                <div className="detail-row">
                  <span>Account Number:</span>
                  <strong className="font-mono">{selectedRequest.accountNumber}</strong>
                </div>
                <div className="detail-row">
                  <span>Account Name:</span>
                  <strong>{selectedRequest.accountName}</strong>
                </div>
                <div className="detail-row total">
                  <span>Withdrawal Amount:</span>
                  <strong className="text-rose">{selectedRequest.amount}</strong>
                </div>
              </div>

              <div className="decline-box">
                <label>Reason for rejection (if declining):</label>
                <input
                  type="text"
                  placeholder="e.g. Account name mismatch, Unverified KYC..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>

              <div className="modal-actions-stacked">
                <button
                  className="btn-approve"
                  onClick={() => handleApprove(selectedRequest.id)}
                >
                  <CheckCircle2 size={16} /> Authorize & Transfer Payout
                </button>
                <button
                  className="btn-decline"
                  onClick={() => handleReject(selectedRequest.id)}
                >
                  <XCircle size={16} /> Reject Withdrawal Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}