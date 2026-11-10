import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowUp, X } from 'lucide-react'
import { userApi } from '../services/api'
import CardzipLoader from './CardzipLoader'
import './CommunityChatDialog.css'

export default function CommunityChatDialog({ conversationId, listingTitle, user, title = 'Chat with seller', onClose }) {
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const messageListRef = useRef(null)

  const loadMessages = useCallback(async () => {
    try {
      const result = await userApi.communityConversationMessages(conversationId)
      const nextMessages = Array.isArray(result.data?.messages) ? result.data.messages : []
      setMessages(nextMessages)
      await userApi.markCommunityConversationRead(conversationId)
      if (nextMessages.length === 0) {
        setDraft((current) => current || `Hi, I'm interested in ${listingTitle}. Is it still available?`)
      }
      setError('')
    } catch (requestError) {
      setError(requestError.message || 'Could not load this chat.')
    } finally {
      setLoading(false)
    }
  }, [conversationId, listingTitle])

  useEffect(() => {
    const initialTimer = window.setTimeout(() => { void loadMessages() }, 0)
    const refreshTimer = window.setInterval(() => { void loadMessages() }, 5000)
    return () => {
      window.clearTimeout(initialTimer)
      window.clearInterval(refreshTimer)
    }
  }, [loadMessages])

  useEffect(() => {
    messageListRef.current?.scrollTo({ top: messageListRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  const sendMessage = async (event) => {
    event.preventDefault()
    const body = draft.trim()
    if (!body || sending) return
    setSending(true)
    setError('')
    try {
      const result = await userApi.sendCommunityMessage(conversationId, body)
      setMessages((current) => [...current, result.data])
      setDraft('')
    } catch (requestError) {
      setError(requestError.message || 'Could not send your message.')
    } finally {
      setSending(false)
    }
  }

  const userId = String(user?._id || user?.id || '')

  return createPortal(
    <div className="community-chat-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="community-chat-dialog" role="dialog" aria-modal="true" aria-labelledby="community-chat-title">
        <header className="community-chat-header">
          <div><h2 id="community-chat-title">{title}</h2><p>{listingTitle}</p></div>
          <button type="button" aria-label="Close chat" onClick={onClose}><X size={19} /></button>
        </header>
        <div className="community-chat-messages" ref={messageListRef} aria-live="polite">
          {loading ? <p className="community-chat-state"><CardzipLoader compact label="Loading messages" /></p>
            : messages.length === 0 ? <p className="community-chat-state">Say hello and ask about this listing.</p>
              : messages.map((message) => {
                const mine = String(message.sender?._id || message.sender) === userId
                return <article className={`community-chat-message${mine ? ' is-mine' : ''}`} key={message._id}>
                  <p>{message.body}</p><time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</time>
                </article>
              })}
        </div>
        {error && <p className="community-chat-error" role="alert">{error}</p>}
        <form className="community-chat-composer" onSubmit={(event) => void sendMessage(event)}>
          <textarea value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={2000} rows={1} placeholder="Write a message…" aria-label="Write a message" />
          <button type="submit" disabled={!draft.trim() || sending} aria-label="Send message">{sending ? <CardzipLoader compact label="Sending message" /> : <ArrowUp size={18} />}</button>
        </form>
      </section>
    </div>,
    document.body,
  )
}
