import { useCallback, useEffect, useState } from 'react'
import { Flag, RotateCcw, ShieldAlert, XCircle } from 'lucide-react'
import { adminApi } from '../services/api'
import CardzipLoader from '../components/CardzipLoader'

const reportStatuses = [
  { value: 'open', label: 'Open' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
  { value: 'all', label: 'All reports' },
]

const reportReasonLabels = {
  scam: 'Fraud or scam',
  counterfeit: 'Counterfeit or stolen goods',
  misleading: 'Misleading information',
  prohibited: 'Prohibited or unsafe item',
  impersonation: 'Impersonation',
  other: 'Other concern',
}

const targetTypeLabels = {
  store_product: 'Cardzip store product',
  shop: 'Shop or business',
  shop_product: 'Business store product',
  community_listing: 'Community listing',
}

const formatDate = (value) => value ? new Date(value).toLocaleString('en-NG') : '—'
const getTargetTitle = (target) => target?.businessName || target?.name || target?.title || 'Unavailable target'

export default function MarketplaceReportsPage() {
  const [reports, setReports] = useState([])
  const [statusFilter, setStatusFilter] = useState('open')
  const [reasonDrafts, setReasonDrafts] = useState({})
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 })
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadReports = useCallback(async () => {
    const params = new URLSearchParams({ status: statusFilter, page: String(pagination.page), limit: '100' })
    try {
      const result = await adminApi.reports(`?${params.toString()}`)
      setReports(Array.isArray(result.data) ? result.data : [])
      setPagination((current) => ({ ...current, ...(result.pagination || {}) }))
      setError('')
    } catch (requestError) {
      setError(requestError.message || 'Could not load marketplace reports.')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, statusFilter])

  useEffect(() => {
    const initialLoad = window.setTimeout(() => { void loadReports() }, 0)
    const interval = window.setInterval(() => { void loadReports() }, 30000)
    return () => {
      window.clearTimeout(initialLoad)
      window.clearInterval(interval)
    }
  }, [loadReports])

  const updateReport = async (report, action) => {
    if (savingId) return
    const reason = String(reasonDrafts[report._id] || '').trim()
    if (action === 'suspend' && reason.length < 10) {
      setError('Enter a suspension reason of at least 10 characters so the owner understands the decision.')
      return
    }
    setSavingId(report._id)
    setError('')
    setNotice('')
    try {
      const result = await adminApi.updateReport(report._id, { action, ...(action === 'suspend' ? { reason } : {}) })
      setReports((current) => current.map((item) => item._id === report._id
        ? { ...item, ...result.data, reporter: item.reporter, target: result.data.target || item.target }
        : item))
      setReasonDrafts((current) => ({ ...current, [report._id]: '' }))
      setNotice(action === 'suspend'
        ? 'The listing is hidden and the owner has been notified with the suspension reason.'
        : action === 'restore'
          ? 'The listing has been reactivated.'
          : 'The report has been dismissed.')
    } catch (requestError) {
      setError(requestError.message || 'Could not update this report.')
    } finally {
      setSavingId('')
    }
  }

  return (
    <section className="marketplace-reports-page">
      <header className="marketplace-reports-header">
        <div>
          <span className="marketplace-reports-kicker"><ShieldAlert size={15} /> MARKETPLACE SAFETY</span>
          <h1 className="page-title">Marketplace Reports</h1>
          <p className="page-subtitle">Review reports for Cardzip products, businesses, and community listings.</p>
        </div>
        <label>
          Report status
          <select
            value={statusFilter}
            onChange={(event) => {
              setLoading(true)
              setPagination((current) => ({ ...current, page: 1 }))
              setStatusFilter(event.target.value)
            }}
          >
            {reportStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
          </select>
        </label>
      </header>

      {error && <p className="marketplace-reports-alert error" role="alert">{error}</p>}
      {notice && <p className="marketplace-reports-alert success" role="status">{notice}</p>}

      <div className="section-card marketplace-reports-list">
        <div className="marketplace-reports-list-heading">
          <div><h2>Reported listings</h2><p>{pagination.totalItems} reports</p></div>
          <Flag size={18} aria-hidden="true" />
        </div>
        {loading ? <p className="marketplace-reports-empty" role="status"><CardzipLoader compact label="Loading reports" /></p>
          : reports.length === 0 ? <p className="marketplace-reports-empty">No reports in this view.</p>
            : reports.map((report) => {
              const target = report.target || {}
              const isSuspended = target.moderationStatus === 'suspended'
              const reportReason = reportReasonLabels[report.reason] || report.reason || 'Unspecified concern'
              return (
                <article className="marketplace-report-card" key={report._id}>
                  <header className="marketplace-report-card-header">
                    <div className="marketplace-report-target">
                      <span>{targetTypeLabels[report.targetType] || 'Marketplace listing'}</span>
                      <h3>{getTargetTitle(target)}</h3>
                      <small>Reported by {report.reporter?.name || 'Customer'}{report.reporter?.email ? ` · ${report.reporter.email}` : ''} · {formatDate(report.createdAt)}</small>
                    </div>
                    <span className={`marketplace-report-status ${report.status}`}>{report.status}</span>
                  </header>
                  <div className="marketplace-report-reason"><strong>Report reason: {reportReason}</strong>{report.details && <p>{report.details}</p>}</div>
                  {isSuspended && <p className="marketplace-report-suspension"><strong>Suspension reason:</strong> {target.moderationReason || 'No reason recorded.'}</p>}
                  {!isSuspended && report.status === 'open' && (
                    <div className="marketplace-report-actions">
                      <label htmlFor={`report-reason-${report._id}`}>Reason shown to the owner when suspending</label>
                      <textarea
                        id={`report-reason-${report._id}`}
                        value={reasonDrafts[report._id] || ''}
                        onChange={(event) => setReasonDrafts((current) => ({ ...current, [report._id]: event.target.value }))}
                        rows={3}
                        maxLength={1000}
                        placeholder="Explain what rule was violated and what the owner needs to address."
                      />
                      <div>
                        <button type="button" className="marketplace-report-suspend" disabled={savingId === report._id} onClick={() => void updateReport(report, 'suspend')}>
                          <ShieldAlert size={14} /> {savingId === report._id ? 'Saving…' : 'Suspend / remove'}
                        </button>
                        <button type="button" className="marketplace-report-dismiss" disabled={savingId === report._id} onClick={() => void updateReport(report, 'dismiss')}>
                          <XCircle size={14} /> Dismiss report
                        </button>
                      </div>
                    </div>
                  )}
                  {isSuspended && (
                    <button type="button" className="marketplace-report-restore" disabled={savingId === report._id} onClick={() => void updateReport(report, 'restore')}>
                      <RotateCcw size={14} /> {savingId === report._id ? 'Restoring…' : 'Reactivate listing'}
                    </button>
                  )}
                </article>
              )
            })}
        {!loading && pagination.totalPages > 1 && (
          <div className="marketplace-reports-pagination">
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <div>
              <button type="button" disabled={pagination.page <= 1} onClick={() => { setLoading(true); setPagination((current) => ({ ...current, page: current.page - 1 })) }}>Previous</button>
              <button type="button" disabled={pagination.page >= pagination.totalPages} onClick={() => { setLoading(true); setPagination((current) => ({ ...current, page: current.page + 1 })) }}>Next</button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
