import { useCallback, useEffect, useMemo, useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { getUserToken, userApi } from '../services/api'
import CardzipLoader from './CardzipLoader'
import CommunityChatDialog from './CommunityChatDialog'
import './CommunitySellerInbox.css'

const getId = (participant) => String(participant?._id || participant || '')

const formatMessageDate = (date) => date
  ? new Date(date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  : ''

export default function CommunitySellerInbox({ user, listingId, placement = 'page' }) {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [activeConversation, setActiveConversation] = useState(null)
  const userId = String(user?._id || user?.id || '')

  const loadConversations = useCallback(async () => {
    if (!getUserToken() || !userId) {
      setConversations([])
      setLoading(false)
      return
    }
    try {
      const result = await userApi.myCommunityConversations()
      const rows = Array.isArray(result.data) ? result.data : []
      setConversations(rows.filter((conversation) => {
        const isSellerConversation = getId(conversation.seller) === userId
        const matchesListing = !listingId || getId(conversation.listing) === String(listingId)
        return isSellerConversation && matchesListing
      }))
      setError('')
    } catch (requestError) {
      setError(requestError.message || 'Could not load your seller chats.')
    } finally {
      setLoading(false)
    }
  }, [listingId, userId])

  useEffect(() => {
    const initialTimer = window.setTimeout(() => { void loadConversations() }, 0)
    const timer = window.setInterval(() => { void loadConversations() }, 15000)
    return () => {
      window.clearTimeout(initialTimer)
      window.clearInterval(timer)
    }
  }, [loadConversations])

  const unreadCount = useMemo(
    () => conversations.reduce((total, conversation) => total + (Number(conversation.unreadCount) || 0), 0),
    [conversations],
  )

  if (!getUserToken()) return null

  const openConversation = (conversation) => {
    setOpen(false)
    setActiveConversation({
      conversationId: conversation._id,
      listingTitle: conversation.listing?.title || 'Community listing',
      title: `Chat with ${conversation.buyer?.name || 'buyer'}`,
    })
  }

  return (
    <section className={`community-seller-inbox community-seller-inbox--${placement}`} aria-label="Seller chat inbox">
      <button
        className="community-seller-inbox-toggle"
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <MessageCircle size={17} />
        <span>{placement === 'header' ? 'Chats' : listingId ? 'Chat buyer' : 'Seller chats'}</span>
        <span className="community-seller-inbox-count" aria-label={`${conversations.length} chats`}>
          {conversations.length}
        </span>
        {unreadCount > 0 && <span className="community-seller-inbox-unread" aria-label={`${unreadCount} unread messages`}>{unreadCount}</span>}
      </button>
      {open && (
        <div className="community-seller-inbox-panel">
          <header>
            <div><h2>{listingId ? 'Chats with buyers' : 'Your seller chats'}</h2><p>{conversations.length} conversations · {unreadCount} unread</p></div>
            <button type="button" aria-label="Close seller chats" onClick={() => setOpen(false)}><X size={17} /></button>
          </header>
          {error ? <p className="community-seller-inbox-error" role="alert">{error}</p>
            : loading ? <p className="community-seller-inbox-state"><CardzipLoader compact label="Loading chats" /></p>
              : conversations.length === 0 ? <p className="community-seller-inbox-state">Buyer conversations about your community listings will appear here.</p>
                : <div className="community-seller-inbox-list">
                  {conversations.map((conversation) => (
                    <button className="community-seller-chat-row" type="button" key={conversation._id} onClick={() => openConversation(conversation)}>
                      <span className="community-seller-chat-icon"><MessageCircle size={16} /></span>
                      <span className="community-seller-chat-copy">
                        <strong>{conversation.buyer?.name || 'Buyer'} · {conversation.listing?.title || 'Community listing'}</strong>
                        <span>{conversation.lastMessage || 'Conversation started'}</span>
                        <small>{formatMessageDate(conversation.lastMessageAt)}</small>
                      </span>
                      {conversation.unreadCount > 0 && <span className="community-seller-chat-unread">{conversation.unreadCount}</span>}
                    </button>
                  ))}
                </div>}
        </div>
      )}
      {activeConversation && (
        <CommunityChatDialog
          conversationId={activeConversation.conversationId}
          listingTitle={activeConversation.listingTitle}
          title={activeConversation.title}
          user={user}
          onClose={() => {
            setActiveConversation(null)
            void loadConversations()
          }}
        />
      )}
    </section>
  )
}
