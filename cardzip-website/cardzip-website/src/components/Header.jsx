import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, Bell, CheckCheck, Menu, Wallet, X } from 'lucide-react'
import { getUserToken, userApi } from '../services/api'


export default function Header({ currentTab = 'home', onSelectTab, onOpenDashboard, onOpenWallet }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [walletBalance, setWalletBalance] = useState(null)
  const [walletError, setWalletError] = useState('')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [notificationsError, setNotificationsError] = useState('')
  const [updatingNotificationId, setUpdatingNotificationId] = useState('')
  const [selectedNotification, setSelectedNotification] = useState(null)

  const loadNotifications = useCallback(async () => {
    if (!getUserToken()) return
    setNotificationsLoading(true)
    setNotificationsError('')
    try {
      const result = await userApi.notifications()
      setNotifications(result.data || [])
      setUnreadNotifications(result.unreadCount || 0)
    } catch (error) {
      setNotificationsError(error.message || 'Could not load notifications.')
    } finally {
      setNotificationsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!getUserToken()) return undefined
    let active = true
    let latestRequest = 0
    const refreshWalletBalance = () => {
      if (document.visibilityState !== 'visible') return
      const requestId = ++latestRequest
      userApi.wallet()
        .then((result) => {
          if (!active || requestId !== latestRequest) return
          setWalletBalance(Number(result.data.balance))
          setWalletError('')
        })
        .catch((error) => {
          if (active && requestId === latestRequest) setWalletError(error.message)
        })
    }
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshWalletBalance()
    }
    window.addEventListener('cardzip-wallet-changed', refreshWalletBalance)
    window.addEventListener('focus', refreshWalletBalance)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    const refreshInterval = window.setInterval(refreshWalletBalance, 5000)
    refreshWalletBalance()
    return () => {
      active = false
      window.clearInterval(refreshInterval)
      window.removeEventListener('cardzip-wallet-changed', refreshWalletBalance)
      window.removeEventListener('focus', refreshWalletBalance)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  useEffect(() => {
    if (!getUserToken()) return undefined
    const initialLoad = window.setTimeout(() => { void loadNotifications() }, 0)
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') void loadNotifications()
    }, 30000)
    const refreshOnFocus = () => { void loadNotifications() }
    window.addEventListener('focus', refreshOnFocus)
    return () => {
      window.clearTimeout(initialLoad)
      window.clearInterval(interval)
      window.removeEventListener('focus', refreshOnFocus)
    }
  }, [loadNotifications])

  const markNotificationRead = async (notification) => {
    if (!notification?._id || notification.readAt || updatingNotificationId) return
    setUpdatingNotificationId(notification._id)
    setNotificationsError('')
    try {
      const result = await userApi.markNotificationRead(notification._id)
      const updated = result.data
      setNotifications((current) => current.map((item) => item._id === updated._id ? updated : item))
      setUnreadNotifications((count) => Math.max(0, count - 1))
    } catch (error) {
      setNotificationsError(error.message || 'Could not mark notification as read.')
    } finally {
      setUpdatingNotificationId('')
    }
  }

  const openNotification = (notification) => {
    setSelectedNotification(notification)
    void markNotificationRead(notification)
  }

  const markAllNotificationsRead = async () => {
    if (!unreadNotifications || updatingNotificationId) return
    setUpdatingNotificationId('all')
    setNotificationsError('')
    try {
      await userApi.markAllNotificationsRead()
      const readAt = new Date().toISOString()
      setNotifications((current) => current.map((item) => ({ ...item, readAt: item.readAt || readAt })))
      setUnreadNotifications(0)
    } catch (error) {
      setNotificationsError(error.message || 'Could not mark notifications as read.')
    } finally {
      setUpdatingNotificationId('')
    }
  }

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'gift-cards', label: 'Gift Cards' },
    { id: 'esim', label: 'Virtual Numbers' },
    { id: 'shop', label: 'Shop' },
    { id: 'bills', label: 'Bills' },
    { id: 'wallet', label: 'Wallet' },
  ]

  const selectTab = (tab) => {
    onSelectTab?.(tab)
    setIsMenuOpen(false)
  }

  return (
    <header className={`cardzip-header ${isMenuOpen ? 'menu-open' : ''}`}>
      {/* Left: Brand Logo */}
      <div 
        className="header-brand" 
        onClick={() => selectTab('home')}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') selectTab('home')
        }}
      >
        <span className="brand-icon-box">
          <img src="/cardzip-logo.jpg" alt="" />
        </span>
        <span className="brand-title">Cardzip</span>
      </div>

      {/* Center: Navigation Links */}
      <nav className={`header-nav ${isMenuOpen ? 'open' : ''}`} aria-label="Main navigation">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-btn ${currentTab === item.id ? 'active' : ''}`}
            onClick={() => selectTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Right: Exchange Rate, Wallet & Dashboard CTA */}
      <div className="header-actions">
        <button
          type="button"
          className="mobile-nav-toggle"
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        {getUserToken() && <button
          type="button"
          className="header-notifications-btn"
          onClick={() => { setNotificationsOpen(true); void loadNotifications() }}
          aria-label={`Notifications${unreadNotifications ? `, ${unreadNotifications} unread` : ''}`}
          aria-haspopup="dialog"
          aria-expanded={notificationsOpen}
        >
          <Bell size={19} />
          <span>Notifications</span>
          {unreadNotifications > 0 && <span className="header-notification-badge">{unreadNotifications > 99 ? '99+' : unreadNotifications}</span>}
        </button>}

        {/* Separator Line */}
        {getUserToken() && <div className="header-divider" />}

        {/* User Wallet Balance */}
        <button type="button" className="wallet-balance" onClick={onOpenWallet} aria-label="Open wallet" title={walletError || undefined}>
          <Wallet size={16} className="wallet-icon" />
          <span className="balance-amount">
            {walletBalance === null ? (walletError ? 'Unavailable' : getUserToken() ? 'Loading…' : 'Sign in') : `₦${walletBalance.toLocaleString('en-NG')}`}
          </span>
        </button>

        {/* Action Button */}
        {getUserToken() && <button
          className="dashboard-btn" 
          onClick={onOpenDashboard}
        >
          Dashboard
        </button>}
      </div>
      {notificationsOpen && createPortal(<div className="site-notification-backdrop" onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setNotificationsOpen(false)
          setSelectedNotification(null)
        }
      }}>
        <section className="site-notification-modal" role="dialog" aria-modal="true" aria-labelledby="site-notifications-title">
          <header className="site-notification-header">
            <div className="site-notification-heading">
              {selectedNotification && <button type="button" className="site-notification-back" onClick={() => setSelectedNotification(null)} aria-label="Back to notifications"><ArrowLeft size={17} /></button>}
              <div>
                <h2 id="site-notifications-title">{selectedNotification ? selectedNotification.title : 'Notifications'}</h2>
                <span>{selectedNotification ? 'Notification details' : `${unreadNotifications} unread`}</span>
              </div>
            </div>
            <div className="site-notification-actions">
              {!selectedNotification && <button type="button" className="site-mark-all-button" disabled={!unreadNotifications || updatingNotificationId !== ''} onClick={() => { void markAllNotificationsRead() }}>
                <CheckCheck size={15} /> {updatingNotificationId === 'all' ? 'Saving…' : 'Mark all read'}
              </button>}
              <button type="button" className="site-notification-close" onClick={() => { setNotificationsOpen(false); setSelectedNotification(null) }} aria-label="Close notifications"><X size={19} /></button>
            </div>
          </header>
          {notificationsError && <p className="site-notification-error" role="alert">{notificationsError}</p>}
          {selectedNotification ? (() => {
            const notification = notifications.find((item) => item._id === selectedNotification._id) || selectedNotification
            return <article className="site-notification-detail">
              <span className="site-notification-detail-category">{notification.category?.replaceAll('_', ' ') || 'Account update'}</span>
              <p>{notification.message}</p>
              {notification.reference && <div><strong>Reference</strong><span>{notification.reference}</span></div>}
              <time dateTime={notification.occurredAt}>{new Date(notification.occurredAt).toLocaleString()}</time>
            </article>
          })()
            : notificationsLoading && notifications.length === 0 ? <p className="site-notification-empty">Loading notifications…</p>
            : notifications.length === 0 ? <p className="site-notification-empty">No notifications yet.</p>
              : <div className="site-notification-list">{notifications.map((notification) => (
                <button
                  key={notification._id}
                  type="button"
                  className={`site-notification-item ${notification.readAt ? '' : 'unread'}`}
                  disabled={updatingNotificationId !== ''}
                  onClick={() => openNotification(notification)}
                >
                  <span className="site-notification-item-title">{notification.title}</span>
                  <span className="site-notification-item-message">{notification.message}</span>
                  <span className="site-notification-item-date">{new Date(notification.occurredAt).toLocaleString()}</span>
                  <span className="site-notification-mark-read">{notification.readAt ? 'View details' : updatingNotificationId === notification._id ? 'Opening…' : 'View details'}</span>
                </button>
              ))}</div>}
        </section>
      </div>, document.body)}
    </header>
  )
}