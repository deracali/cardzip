import { useCallback, useEffect, useState } from 'react'
import { LifeBuoy, Send } from 'lucide-react'
import { adminApi } from '../services/api'
import CardzipLoader from '../components/CardzipLoader'

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
]

const statusLabel = (status) => statusOptions.find((option) => option.value === status)?.label || status
const formatDate = (value) => value ? new Date(value).toLocaleString('en-NG') : '—'

export default function SupportInboxPage() {
  const [requests, setRequests] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [replyDrafts, setReplyDrafts] = useState({})
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [savingId, setSavingId] = useState('')

  const loadRequests = useCallback(async () => {
    const params = new URLSearchParams({ page: String(pagination.page), limit: '100' })
    if (statusFilter) params.set('status', statusFilter)
    try {
      const result = await adminApi.supportRequests(`?${params.toString()}`)
      setRequests(Array.isArray(result.data) ? result.data : [])
      setPagination((current) => ({ ...current, ...(result.pagination || {}) }))
      setError('')
    } catch (requestError) {
      setError(requestError.message || 'Could not load support requests.')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, statusFilter])

  useEffect(() => {
    const initialLoad = window.setTimeout(() => { void loadRequests() }, 0)
    const interval = window.setInterval(() => { void loadRequests() }, 30000)
    return () => {
      window.clearTimeout(initialLoad)
      window.clearInterval(interval)
    }
  }, [loadRequests])

  const updateStatus = async (request, status) => {
    if (status === request.status || savingId) return
    setSavingId(request._id)
    setError('')
    setNotice('')
    try {
      const result = await adminApi.updateSupportRequest(request._id, { status })
      setRequests((current) => current.map((item) => item._id === request._id
        ? { ...item, ...result.data, user: item.user }
        : item))
      setNotice(`Request status updated to ${statusLabel(status)}.`)
    } catch (requestError) {
      setError(requestError.message || 'Could not update the request status.')
    } finally {
      setSavingId('')
    }
  }

  const sendReply = async (event, request) => {
    event.preventDefault()
    const message = String(replyDrafts[request._id] || '').trim()
    if (!message || savingId) return
    setSavingId(request._id)
    setError('')
    setNotice('')
    try {
      const result = await adminApi.updateSupportRequest(request._id, { message, status: 'in_progress' })
      setRequests((current) => current.map((item) => item._id === request._id
        ? { ...item, ...result.data, user: item.user }
        : item))
      setReplyDrafts((current) => ({ ...current, [request._id]: '' }))
      setNotice('Your reply was sent to the customer.')
    } catch (requestError) {
      setError(requestError.message || 'Could not send your reply.')
    } finally {
      setSavingId('')
    }
  }

  return (
    <section className="support-inbox-page">
      <header className="support-inbox-header">
        <div>
          <span className="support-inbox-kicker"><LifeBuoy size={15} /> CUSTOMER CARE</span>
          <h1 className="page-title">Support Inbox</h1>
          <p className="page-subtitle">Review customer requests, update their status, and reply directly.</p>
        </div>
        <label className="support-inbox-filter">
          Filter requests
          <select
            value={statusFilter}
            onChange={(event) => {
              setLoading(true)
              setPagination((current) => ({ ...current, page: 1 }))
              setStatusFilter(event.target.value)
            }}
          >
            <option value="">All statuses</option>
            {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      </header>

      {error && <p className="support-inbox-alert error" role="alert">{error}</p>}
      {notice && <p className="support-inbox-alert success" role="status">{notice}</p>}

      <div className="section-card support-inbox-list">
        <div className="support-inbox-list-heading">
          <div><h2>Customer requests</h2><p>{pagination.totalItems} total requests</p></div>
        </div>
        {loading ? <p className="support-inbox-empty" role="status"><CardzipLoader compact label="Loading support requests" /></p>
          : requests.length === 0 ? <p className="support-inbox-empty">No support requests found.</p>
            : requests.map((request) => (
              <article className="support-inbox-request" key={request._id}>
                <header className="support-inbox-request-header">
                  <div className="support-inbox-request-title">
                    <h3>{request.subject}</h3>
                    <span>{request.user?.name || 'Customer'}{request.user?.email ? ` · ${request.user.email}` : ''} · Opened {formatDate(request.createdAt)}</span>
                  </div>
                  <label className={`support-inbox-status ${request.status}`}>
                    Status
                    <select
                      value={request.status}
                      disabled={savingId === request._id}
                      aria-label={`Status for ${request.subject}`}
                      onChange={(event) => { void updateStatus(request, event.target.value) }}
                    >
                      {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </label>
                </header>
                <p className="support-inbox-description">{request.description}</p>
                {request.messages?.length > 0 && (
                  <div className="support-inbox-conversation" aria-label="Conversation">
                    {request.messages.map((message) => (
                      <article className={`support-inbox-message ${message.senderRole}`} key={message._id}>
                        <strong>{message.senderRole === 'user' ? 'Customer' : message.senderRole === 'staff' ? 'Cardzip staff' : 'Cardzip admin'}</strong>
                        <p>{message.message}</p>
                        <time dateTime={message.createdAt}>{formatDate(message.createdAt)}</time>
                      </article>
                    ))}
                  </div>
                )}
                <form className="support-inbox-reply" onSubmit={(event) => void sendReply(event, request)}>
                  <label htmlFor={`support-inbox-reply-${request._id}`}>Reply to customer</label>
                  <textarea
                    id={`support-inbox-reply-${request._id}`}
                    value={replyDrafts[request._id] || ''}
                    onChange={(event) => setReplyDrafts((current) => ({ ...current, [request._id]: event.target.value }))}
                    rows={3}
                    maxLength={4000}
                    placeholder="Write a helpful response"
                  />
                  <button type="submit" disabled={savingId === request._id || !String(replyDrafts[request._id] || '').trim()}>
                    <Send size={14} /> {savingId === request._id ? 'Sending…' : 'Send reply'}
                  </button>
                </form>
              </article>
            ))}
        {!loading && pagination.totalPages > 1 && (
          <div className="support-inbox-pagination">
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
