import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Eye, RefreshCw, Search, ShieldAlert, ShieldCheck, X } from 'lucide-react'
import CustomSelect from '../components/CustomSelect'
import { adminApi } from '../services/api'
import CardzipLoader from '../components/CardzipLoader'

const formatNaira = (value) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 2 }).format(Number(value || 0))

const rangeOptions = [
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: 'month', label: 'This month' },
  { value: 'all', label: 'All time' },
]

const statusOptions = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed risk check' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'completed', label: 'Completed' },
]

const buildWithdrawalQuery = (page, filters) => {
  const query = new URLSearchParams({ page: String(page), limit: '20' })
  if (filters.status) query.set('status', filters.status)
  if (filters.search.trim()) query.set('search', filters.search.trim())
  if (filters.range === 'month') query.set('month', new Date().toISOString().slice(0, 7))
  if (filters.range === '30' || filters.range === '90') {
    const from = new Date()
    from.setDate(from.getDate() - Number(filters.range))
    query.set('from', from.toISOString())
  }
  return `?${query.toString()}`
}

export default function WithdrawalsApiPage() {
  const [rows, setRows] = useState([])
  const [pageInfo, setPageInfo] = useState({ page: 1, totalPages: 1, totalItems: 0 })
  const [filters, setFilters] = useState({ range: '30', status: '', search: '' })
  const [selected, setSelected] = useState(null)
  const [reason, setReason] = useState('')
  const [payoutReference, setPayoutReference] = useState('')
  const [withdrawalPasskey, setWithdrawalPasskey] = useState('')
  const [passkeyConfigured, setPasskeyConfigured] = useState(false)
  const [requiresCurrentPassword, setRequiresCurrentPassword] = useState(true)
  const [passkeyStatusLoading, setPasskeyStatusLoading] = useState(true)
  const [passkeySetupOpen, setPasskeySetupOpen] = useState(false)
  const [entryPasskeyRequired, setEntryPasskeyRequired] = useState(false)
  const [withdrawalAccessGranted, setWithdrawalAccessGranted] = useState(false)
  const [withdrawalAccessToken, setWithdrawalAccessToken] = useState('')
  const [entryPasskey, setEntryPasskey] = useState('')
  const [entryPasskeyError, setEntryPasskeyError] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPasskey, setNewPasskey] = useState('')
  const [confirmPasskey, setConfirmPasskey] = useState('')
  const [error, setError] = useState('')
  const [walletAudit, setWalletAudit] = useState(null)
  const [walletAuditError, setWalletAuditError] = useState('')
  const [walletAuditLoading, setWalletAuditLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const updateFilter = (key, value) => {
    setLoading(true)
    setFilters((current) => ({ ...current, [key]: value }))
  }

  const load = useCallback(async (page = 1) => {
    if (!withdrawalAccessGranted) return
    try {
      const result = await adminApi.withdrawals(buildWithdrawalQuery(page, filters), withdrawalAccessToken)
      setError('')
      setRows(result.data)
      setPageInfo(result.pagination)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [filters, withdrawalAccessGranted, withdrawalAccessToken])

  useEffect(() => {
    if (passkeyStatusLoading || !withdrawalAccessGranted) return
    let active = true
    adminApi.withdrawals(buildWithdrawalQuery(1, filters), withdrawalAccessToken)
      .then((result) => {
        if (!active) return
        setError('')
        setRows(result.data)
        setPageInfo(result.pagination)
      })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [filters, passkeyStatusLoading, withdrawalAccessGranted, withdrawalAccessToken])

  useEffect(() => {
    adminApi.withdrawalPasskeyStatus()
      .then((result) => {
        const configured = Boolean(result.data.configured)
        setRequiresCurrentPassword(Boolean(result.data.requiresCurrentPassword))
        setPasskeyConfigured(configured)
        if (!configured) setPasskeySetupOpen(true)
        else setEntryPasskeyRequired(true)
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setPasskeyStatusLoading(false))
  }, [])

  const savePasskey = async () => {
    if (newPasskey.length < 8 || newPasskey.length > 128) {
      setError('Choose a passkey between 8 and 128 characters.')
      return
    }
    if (newPasskey !== confirmPasskey) {
      setError('The passkey confirmation does not match.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await adminApi.setWithdrawalPasskey({
        ...(requiresCurrentPassword ? { currentPassword } : {}),
        passkey: newPasskey,
      })
      setPasskeyConfigured(true)
      setRequiresCurrentPassword(true)
      setPasskeySetupOpen(false)
      setEntryPasskeyRequired(true)
      setWithdrawalAccessGranted(false)
      setWithdrawalAccessToken('')
      setRows([])
      setPageInfo({ page: 1, totalPages: 1, totalItems: 0 })
      setCurrentPassword('')
      setNewPasskey('')
      setConfirmPasskey('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  const verifyEntryPasskey = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setEntryPasskeyError('')
    try {
      const result = await adminApi.verifyWithdrawalPasskey({ passkey: entryPasskey })
      if (!result.data.accessToken) throw new Error('Could not establish secure withdrawal access. Verify your passkey again.')
      setWithdrawalAccessToken(result.data.accessToken)
      setEntryPasskeyRequired(false)
      setWithdrawalAccessGranted(true)
      setLoading(true)
      setEntryPasskey('')
    } catch (requestError) {
      setEntryPasskeyError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  const submitReview = async (action) => {
    if (action === 'reject' && !reason.trim()) {
      setError('Enter a reason before rejecting this withdrawal.')
      return
    }
    if (action === 'complete' && !payoutReference.trim()) {
      setError('Enter the bank transfer reference before marking this request complete.')
      return
    }
    if (action === 'approve' && !withdrawalPasskey) {
      setError('Enter your withdrawal approval passkey.')
      return
    }
    if (action === 'approve' && !walletAudit?.consistent) {
      setError(walletAudit?.reason || 'The wallet ledger must be verified before approving this withdrawal.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await adminApi.reviewWithdrawal(selected._id, {
        action,
        reason,
        payoutReference,
        ...(action === 'approve' ? { withdrawalPasskey } : {}),
      }, withdrawalAccessToken)
      setSelected(null)
      setReason('')
      setPayoutReference('')
      setWithdrawalPasskey('')
      setWalletAudit(null)
      setLoading(true)
      await load(pageInfo.page)
    } catch (requestError) {
      setError(requestError.message)
      if (action === 'approve' && selected?._id) {
        try {
          const auditResult = await adminApi.withdrawalAudit(selected._id, withdrawalAccessToken)
          setWalletAudit(auditResult.data)
          setSelected((current) => current ? {
            ...current,
            riskStatus: auditResult.data.consistent ? 'clear' : 'failed',
            riskReason: auditResult.data.reason || '',
          } : current)
        } catch (auditError) {
          setWalletAuditError(auditError.message)
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  const openReview = async (row) => {
    setSelected(row)
    setReason('')
    setPayoutReference('')
    setWithdrawalPasskey('')
    setError('')
    setWalletAudit(null)
    setWalletAuditError('')
    setWalletAuditLoading(true)
    try {
      const result = await adminApi.withdrawalAudit(row._id, withdrawalAccessToken)
      setWalletAudit(result.data)
      setSelected({
        ...row,
        riskStatus: result.data.consistent ? 'clear' : 'failed',
        riskReason: result.data.reason || '',
      })
      setRows((currentRows) => currentRows.map((currentRow) => currentRow._id === row._id
        ? { ...currentRow, riskStatus: result.data.consistent ? 'clear' : 'failed', riskReason: result.data.reason || '' }
        : currentRow))
    } catch (requestError) {
      setWalletAuditError(requestError.message)
    } finally {
      setWalletAuditLoading(false)
    }
  }

  return (
    <section className="withdrawals-page">
      <header className="page-header withdrawal-page-header">
        <div><h1 className="page-title">Customer withdrawals</h1><p className="page-subtitle">Review payout requests, verify wallet history and securely record bank transfers.</p></div>
        <button type="button" className="withdrawal-passkey-button" disabled={passkeyStatusLoading} onClick={() => setPasskeySetupOpen(true)}>
          <ShieldCheck size={16} /> {passkeyConfigured ? 'Manage approval passkey' : 'Create approval passkey'}
        </button>
      </header>
      {error && !selected && !passkeySetupOpen && <p role="alert" className="form-error">{error}</p>}
      <div className="section-card withdrawal-list-card">
        <div className="withdrawal-toolbar">
          <div className="withdrawal-toolbar-heading">
            <div><span className="withdrawal-eyebrow">PAYOUT MANAGEMENT</span><h3>Withdrawal requests</h3></div>
            <span className="withdrawal-count">{pageInfo.totalItems} total</span>
          </div>
          <div className="withdrawal-filters">
            <label className="withdrawal-search">
              <Search size={16} aria-hidden="true" />
              <input aria-label="Search withdrawals" placeholder="Search reference, bank or customer" value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} />
            </label>
            <CustomSelect
              ariaLabel="Filter withdrawal date range"
              className="withdrawal-filter-select"
              value={filters.range}
              options={rangeOptions}
              onChange={(range) => updateFilter('range', range)}
            />
            <CustomSelect
              ariaLabel="Filter withdrawal status"
              className="withdrawal-filter-select"
              value={filters.status}
              options={statusOptions}
              onChange={(status) => updateFilter('status', status)}
            />
            <button type="button" className="withdrawal-refresh-button" disabled={loading} onClick={() => { setLoading(true); load(1) }}>
              <RefreshCw size={15} className={loading ? 'withdrawal-refresh-spinning' : ''} /> Refresh
            </button>
          </div>
        </div>
        {loading ? <div className="withdrawal-loading"><CardzipLoader compact label="Loading withdrawal requests" /></div> : (
          <div className="table-responsive">
            <table className="withdraw-table">
              <thead><tr><th>Reference / Date</th><th>Customer</th><th>Bank destination</th><th>Amount</th><th>Ledger check</th><th>Request status</th><th /></tr></thead>
              <tbody>{rows.map((row) => (
                <tr key={row._id}>
                  <td><strong className="font-mono withdrawal-reference">{row.reference}</strong><span className="withdrawal-date">{new Date(row.createdAt).toLocaleString()}</span></td>
                  <td><strong>{row.user?.name || 'Unknown customer'}</strong><span className="withdrawal-date">{row.user?.email || 'No email on file'}</span></td>
                  <td><strong>{row.bankName}</strong><span className="withdrawal-date">{row.accountName} · {row.accountNumber}</span></td>
                  <td className="font-bold withdrawal-amount">{formatNaira(row.amount)}</td>
                  <td><span className={`withdrawal-status-pill ${row.walletAudit?.consistent ? 'verified' : 'unverified'}`}>
                    {row.walletAudit?.consistent ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                    {row.walletAudit?.consistent ? 'Ledger matches' : 'Ledger mismatch'}
                  </span>{row.walletAudit?.reason && <span className="withdrawal-risk-reason">{row.walletAudit.reason}</span>}</td>
                  <td><span className={`withdrawal-status-pill request-${row.status}`}>{row.status}</span></td>
                  <td className="withdrawal-action-cell"><button type="button" className="withdrawal-review-button" onClick={() => { void openReview(row) }}>
                    <Eye size={15} /> {row.status === 'pending' || row.status === 'failed' ? 'Review' : row.status === 'approved' ? 'Record payout' : 'Details'}
                  </button></td>
                </tr>
              ))}</tbody>
            </table>
            {!rows.length && <div className="withdrawal-empty"><div className="withdrawal-empty-icon"><Search size={20} /></div><strong>No withdrawal requests found</strong><span>Try changing the status, date range or search term.</span></div>}
          </div>
        )}
        <div className="withdrawal-pagination">
          <span>Showing {rows.length ? (pageInfo.page - 1) * 20 + 1 : 0}–{Math.min(pageInfo.page * 20, pageInfo.totalItems)} of {pageInfo.totalItems}</span>
          <div><button type="button" disabled={pageInfo.page <= 1 || loading} onClick={() => { setLoading(true); load(pageInfo.page - 1) }}>Previous</button>
            <span>Page {pageInfo.page} of {Math.max(pageInfo.totalPages, 1)}</span>
            <button type="button" disabled={pageInfo.page >= pageInfo.totalPages || loading} onClick={() => { setLoading(true); load(pageInfo.page + 1) }}>Next</button></div>
        </div>
      </div>

      {entryPasskeyRequired && <div className="modal-backdrop withdrawal-entry-backdrop"><section className="modal-content withdrawal-modal-content" role="dialog" aria-modal="true" aria-labelledby="withdrawal-entry-title">
        <header className="modal-header withdrawal-modal-header"><div><span className="withdrawal-eyebrow">SECURE PAYOUT ACCESS</span><h3 id="withdrawal-entry-title">Verify approval passkey</h3></div></header>
        <form className="modal-body" onSubmit={verifyEntryPasskey}>
          <p className="withdrawal-passkey-help">Enter your withdrawal approval passkey to view and manage customer withdrawal requests.</p>
          <label className="withdrawal-form-field">Withdrawal approval passkey<input type="password" autoFocus autoComplete="current-password" value={entryPasskey} onChange={(event) => { setEntryPasskey(event.target.value); setEntryPasskeyError('') }} placeholder="Enter your approval passkey" /></label>
          {entryPasskeyError && <p className="withdrawal-form-error" role="alert">{entryPasskeyError}</p>}
          <div className="withdrawal-modal-actions"><button type="submit" className="btn-primary" disabled={submitting || !entryPasskey}>
            <ShieldCheck size={16} /> {submitting ? 'Verifying…' : 'Unlock withdrawals'}
          </button></div>
        </form>
      </section></div>}
      {selected && <div className="modal-backdrop"><section className="modal-content withdrawal-modal-content" role="dialog" aria-modal="true" aria-labelledby="withdrawal-dialog-title">
        <header className="modal-header withdrawal-modal-header"><div><span className="withdrawal-eyebrow">WITHDRAWAL REVIEW</span><h3 id="withdrawal-dialog-title">{selected.reference}</h3></div><button className="btn-close" type="button" onClick={() => setSelected(null)} aria-label="Close"><X size={17} /></button></header>
        <div className="modal-body">
          <div className="withdrawal-modal-summary">
            <div><span>Customer</span><strong>{selected.user?.name || 'Unknown customer'}</strong><small>{selected.user?.email || 'No email on file'}</small></div>
            <div><span>Requested amount</span><strong className="withdrawal-amount">{formatNaira(selected.amount)}</strong></div>
            <div><span>Bank</span><strong>{selected.bankName}</strong><small>{selected.accountName}</small></div>
            <div><span>Account number</span><strong className="font-mono">{selected.accountNumber}</strong></div>
            <div><span>Current request status</span><strong className={`withdrawal-status-pill request-${selected.status}`}>{selected.status}</strong></div>
          </div>
          <section className={`wallet-audit-panel ${walletAudit?.consistent ? 'consistent' : walletAudit ? 'inconsistent' : ''}`}>
            <div className="wallet-audit-heading">
              {walletAudit?.consistent ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
              <div><strong>{walletAuditLoading ? 'Checking wallet history…' : walletAudit?.consistent ? 'Ledger is consistent' : walletAudit ? 'Ledger mismatch' : 'Wallet balance verification'}</strong>
                <span>{walletAuditLoading ? 'Comparing recorded transactions with the current wallet balance.' : walletAudit?.consistent ? 'Current wallet and the latest ledger balance match.' : walletAudit?.reason || walletAuditError || selected.riskReason || 'Review the user balance history before approving this payout.'}</span></div>
            </div>
            {walletAudit && <div className="wallet-audit-values"><div><span>Current wallet</span><strong>{walletAudit.walletBalance == null ? 'Unavailable' : formatNaira(walletAudit.walletBalance)}</strong></div>
              <div><span>Latest ledger balance</span><strong>{walletAudit.ledgerBalance == null ? 'No ledger history' : formatNaira(walletAudit.ledgerBalance)}</strong></div>
              <div><span>History entries checked</span><strong>{walletAudit.transactionCount}</strong></div></div>}
            {walletAudit?.history?.length > 0 && <div className="wallet-audit-history">
              <strong>Recent balance history</strong>
              <div className="wallet-audit-history-scroll"><table><thead><tr><th>Transaction</th><th>Change</th><th>Before</th><th>After</th></tr></thead>
                <tbody>{walletAudit.history.map((entry, index) => <tr key={`${entry.createdAt}-${index}`}>
                  <td><strong>{entry.description || entry.type}</strong><span>{entry.createdAt ? new Date(entry.createdAt).toLocaleString() : entry.status}</span></td>
                  <td className={entry.type === 'credit' ? 'credit' : 'debit'}>{entry.type === 'credit' ? '+' : '−'}{formatNaira(entry.amount)}</td>
                  <td>{formatNaira(entry.balanceBefore)}</td><td>{formatNaira(entry.balanceAfter)}</td>
                </tr>)}</tbody></table></div>
            </div>}
            {walletAuditError && <span className="withdrawal-risk-reason">{walletAuditError}</span>}
          </section>
          {error && <p className="withdrawal-form-error" role="alert">{error}</p>}
          {selected.status === 'approved' && <label className="withdrawal-form-field">Bank payout reference<input value={payoutReference} onChange={(event) => setPayoutReference(event.target.value)} placeholder="Enter the bank transfer reference" /></label>}
          {selected.status === 'pending' && selected.riskStatus === 'clear' && <label className="withdrawal-form-field">Withdrawal approval passkey<input type="password" autoComplete="current-password" value={withdrawalPasskey} onChange={(event) => setWithdrawalPasskey(event.target.value)} placeholder="Enter your approval passkey" /></label>}
          {['pending', 'failed'].includes(selected.status) && <label className="withdrawal-form-field">Review or rejection reason<input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Required when rejecting this request" /></label>}
          <div className="withdrawal-modal-actions">
            {selected.status === 'pending' && selected.riskStatus === 'clear' && <button type="button" className="btn-primary" disabled={submitting || walletAuditLoading || !walletAudit?.consistent || !passkeyConfigured || !withdrawalPasskey} onClick={() => submitReview('approve')}><CheckCircle2 size={16} /> Approve payout request</button>}
            {!passkeyConfigured && selected.status === 'pending' && <button type="button" className="btn-secondary" onClick={() => setPasskeySetupOpen(true)}>Create approval passkey</button>}
            {selected.status === 'approved' && <button type="button" className="btn-primary" disabled={submitting} onClick={() => submitReview('complete')}><CheckCircle2 size={16} /> Record completed bank transfer</button>}
            {['pending', 'failed'].includes(selected.status) && <button type="button" className="btn-secondary withdrawal-reject-button" disabled={submitting} onClick={() => submitReview('reject')}>Reject and refund if reserved</button>}
          </div>
        </div>
      </section></div>}
      {passkeySetupOpen && <div className="modal-backdrop"><section className="modal-content withdrawal-modal-content" role="dialog" aria-modal="true" aria-labelledby="passkey-dialog-title">
        <header className="modal-header withdrawal-modal-header"><div><span className="withdrawal-eyebrow">SECURE PAYOUT APPROVAL</span><h3 id="passkey-dialog-title">{passkeyConfigured ? 'Change approval passkey' : 'Create approval passkey'}</h3></div>{passkeyConfigured && <button className="btn-close" type="button" onClick={() => setPasskeySetupOpen(false)} aria-label="Close"><X size={17} /></button>}</header>
        <div className="modal-body">
          <p className="withdrawal-passkey-help">{requiresCurrentPassword
            ? 'Confirm your administrator password to create or change the passkey used to approve payouts.'
            : 'As the initial superadmin setup, you can create the first approval passkey without an administrator password. Future passkey changes will require your administrator password.'}</p>
          {requiresCurrentPassword && <label className="withdrawal-form-field">Current administrator password<input type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="Enter your account password" /></label>}
          <label className="withdrawal-form-field">New approval passkey<input type="password" autoComplete="new-password" value={newPasskey} onChange={(event) => setNewPasskey(event.target.value)} placeholder="At least 8 characters" /></label>
          <label className="withdrawal-form-field">Confirm approval passkey<input type="password" autoComplete="new-password" value={confirmPasskey} onChange={(event) => setConfirmPasskey(event.target.value)} placeholder="Re-enter the new passkey" /></label>
          {error && <p className="withdrawal-form-error" role="alert">{error}</p>}
          <div className="withdrawal-modal-actions"><button type="button" className="btn-primary" disabled={submitting || (requiresCurrentPassword && !currentPassword) || newPasskey.length < 8 || !confirmPasskey} onClick={() => { void savePasskey() }}>
            <ShieldCheck size={16} /> {submitting ? 'Saving…' : 'Save approval passkey'}
          </button></div>
        </div>
      </section></div>}
    </section>
  )
}
