import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Image, MessageSquare, RefreshCw } from 'lucide-react'
import { adminApi } from '../services/api'
import CardzipLoader from '../components/CardzipLoader'
import './WhatsAppInboxPage.css'

export default function WhatsAppInboxPage() {
  const [messages, setMessages] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const result = await adminApi.whatsAppInbox(`?page=${pagination.page}&limit=20`)
        if (!active) return
        setError('')
        setMessages(result.data || [])
        setPagination(result.pagination || { page: pagination.page, totalPages: 1, totalItems: 0 })
      } catch (requestError) {
        if (active) setError(requestError.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [pagination.page, refreshKey])

  return (
    <section className="whatsapp-inbox-page">
      <header className="whatsapp-inbox-header">
        <div><p className="whatsapp-inbox-eyebrow">CUSTOMER MESSAGES</p><h1>WhatsApp Inbox</h1><p>Messages received through the official WhatsApp Cloud API webhook.</p></div>
        <button type="button" onClick={() => { setLoading(true); setRefreshKey((current) => current + 1) }} disabled={loading}><RefreshCw size={15} /> Refresh</button>
      </header>
      {error && <p className="whatsapp-inbox-error" role="alert">{error}</p>}
      {loading ? <CardzipLoader label="Loading WhatsApp messages…" /> : messages.length === 0 ? (
        <div className="whatsapp-inbox-empty"><MessageSquare size={25} /><h2>No messages received</h2><p>New WhatsApp text and image messages will appear here.</p></div>
      ) : (
        <div className="whatsapp-message-list">
          {messages.map((message) => (
            <article className="whatsapp-message-card" key={message._id}>
              <header><div><h2>{message.senderName || message.waId}</h2><p>+{message.waId} · {new Date(message.timestamp).toLocaleString()}</p></div><span>{message.type}</span></header>
              {message.text && <p className="whatsapp-message-text">{message.text}</p>}
              {message.media?.map((media) => (
                <div className="whatsapp-media-item" key={media.providerMediaId}>
                  {media.url ? <a href={media.url} target="_blank" rel="noreferrer"><img src={media.url} alt={media.filename || 'WhatsApp image attachment'} /><span><Image size={14} /> Open attachment</span></a> : <p><Image size={14} /> Image attachment {media.status === 'pending' ? 'is being saved' : 'could not be downloaded'}.</p>}
                </div>
              ))}
            </article>
          ))}
        </div>
      )}
      <footer className="whatsapp-inbox-pagination">
        <span>Page {pagination.page} of {pagination.totalPages} · {pagination.totalItems} messages</span>
        <div>
          <button type="button" disabled={loading || pagination.page <= 1} onClick={() => { setLoading(true); setPagination((current) => ({ ...current, page: current.page - 1 })) }}><ChevronLeft size={16} /> Previous</button>
          <button type="button" disabled={loading || pagination.page >= pagination.totalPages} onClick={() => { setLoading(true); setPagination((current) => ({ ...current, page: current.page + 1 })) }}>Next <ChevronRight size={16} /></button>
        </div>
      </footer>
    </section>
  )
}
