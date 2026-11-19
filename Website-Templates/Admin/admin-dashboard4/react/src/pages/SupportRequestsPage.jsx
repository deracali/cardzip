import { useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle2, Clock3, LifeBuoy, Send } from 'lucide-react'
import { supportApi } from '../services/api'

const formatDate = (value) => value ? new Date(value).toLocaleString('en-NG', { timeZone: 'Africa/Lagos' }) : '—'

const statusLabel = (status) => ({
  open: 'Open',
  assigned: 'Assigned',
  in_progress: 'In progress',
  resolved: 'Resolved',
}[status] || status)

export default function SupportRequestsPage({ onNavigate }) {
  const [requests, setRequests] = useState([])
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [replyDrafts, setReplyDrafts] = useState({})
  const [replySubmitting, setReplySubmitting] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadRequests = async () => {
    try {
      const result = await supportApi.requests('?page=1&limit=50')
      setRequests(Array.isArray(result.data) ? result.data : [])
      setError('')
    } catch (requestError) {
      setError(requestError.message || 'Could not load your support requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    supportApi.requests('?page=1&limit=50')
      .then((result) => {
        if (!mounted) return
        setRequests(Array.isArray(result.data) ? result.data : [])
        setError('')
      })
      .catch((requestError) => {
        if (mounted) setError(requestError.message || 'Could not load your support requests.')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    const refreshInterval = window.setInterval(() => {
      supportApi.requests('?page=1&limit=50')
        .then((result) => setRequests(Array.isArray(result.data) ? result.data : []))
        .catch((requestError) => setError(requestError.message || 'Could not refresh your support messages.'))
    }, 2000)
    return () => window.clearInterval(refreshInterval)
  }, [])

  const submitRequest = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setNotice('')
    try {
      await supportApi.createRequest({ subject, description })
      setSubject('')
      setDescription('')
      setNotice('Your request has been sent. Our team will reply here.')
      await loadRequests()
    } catch (requestError) {
      setError(requestError.message || 'Could not submit your request.')
    } finally {
      setSubmitting(false)
    }
  }

  const sendReply = async (request) => {
    const message = String(replyDrafts[request._id] || '').trim()
    if (!message || replySubmitting === request._id) return
    setReplySubmitting(request._id)
    setError('')
    try {
      const result = await supportApi.reply(request._id, { message })
      setRequests((current) => current.map((item) => item._id === request._id ? result.data : item))
      setReplyDrafts((current) => ({ ...current, [request._id]: '' }))
    } catch (requestError) {
      setError(requestError.message || 'Could not send your reply.')
    } finally {
      setReplySubmitting('')
    }
  }

  return (
    <div className="page-container support-page">
      <div className="support-back-row">
        <button type="button" className="support-back-button" onClick={() => onNavigate?.('/')}>
          <ArrowLeft size={16} /> Back to home
        </button>
      </div>
      <header className="support-page-header">
        <span className="support-kicker"><LifeBuoy size={15} /> CARDZIP SUPPORT</span>
        <h1 className="page-title">How can we help?</h1>
        <p className="page-subtitle">Send us a message and follow every reply from your support history.</p>
      </header>

      {error && <p className="support-alert error" role="alert">{error}</p>}
      {notice && <p className="support-alert success" role="status"><CheckCircle2 size={16} />{notice}</p>}

      <div className="support-layout">
        <section className="support-compose-card">
          <h2>Start a support request</h2>
          <p>Include the order, payment, or service details we need to help you.</p>
          <form onSubmit={submitRequest}>
            <label>
              Subject
              <input value={subject} onChange={(event) => setSubject(event.target.value)} required minLength={4} maxLength={120} placeholder="What do you need help with?" />
            </label>
            <label>
              Describe the issue
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} required minLength={10} maxLength={4000} rows={6} placeholder="Share the details so our team can investigate." />
            </label>
            <button type="submit" className="btn-emerald-submit" disabled={submitting}>
              <span>{submitting ? 'Sending request…' : 'Send request'}</span><Send size={16} />
            </button>
          </form>
        </section>

        <section className="support-history-card">
          <div className="support-history-heading">
            <div><h2>Your requests</h2><p>Replies and status updates appear here.</p></div>
            <span>{requests.length}</span>
          </div>
          {loading ? <p className="support-empty" role="status">Loading support history…</p> : requests.length === 0 ? (
            <p className="support-empty">You have not sent a support request yet.</p>
          ) : (
            <div className="support-request-list">
              {requests.map((request) => (
                <article className="support-request" key={request._id}>
                  <header>
                    <div><h3>{request.subject}</h3><span>Opened {formatDate(request.createdAt)}</span></div>
                    <span className={`support-status ${request.status}`}><Clock3 size={13} />{statusLabel(request.status)}</span>
                  </header>
                  <p className="support-request-description">{request.description}</p>
                  {request.messages?.length > 0 && (
                    <div className="support-conversation">
                      {request.messages.map((message) => (
                        <div className={`support-message ${message.senderRole}`} key={message._id}>
                          <strong>{message.senderRole === 'user' ? 'You' : 'Cardzip support'}</strong>
                          <p>{message.message}</p>
                          <small>{formatDate(message.createdAt)}</small>
                        </div>
                      ))}
                    </div>
                  )}
                  <form className="support-reply-form" onSubmit={(event) => { event.preventDefault(); void sendReply(request) }}>
                    <label htmlFor={`support-reply-${request._id}`}>Add a message</label>
                    <textarea
                      id={`support-reply-${request._id}`}
                      value={replyDrafts[request._id] || ''}
                      onChange={(event) => setReplyDrafts((current) => ({ ...current, [request._id]: event.target.value }))}
                      rows={2}
                      maxLength={4000}
                      placeholder="Reply to this request"
                    />
                    <button type="submit" className="btn-secondary" disabled={replySubmitting === request._id || !String(replyDrafts[request._id] || '').trim()}>
                      <Send size={14} /> {replySubmitting === request._id ? 'Sending…' : 'Send reply'}
                    </button>
                  </form>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
