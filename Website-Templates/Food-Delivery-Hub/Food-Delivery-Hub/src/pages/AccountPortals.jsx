import { useEffect, useState } from 'react'
import { ArrowLeft, LogOut, MapPin, ShieldCheck, ShoppingBag, Users } from 'lucide-react'
import { clearFoodSession, foodApi, getFoodSession } from '../services/foodApi'

const orderStatuses = ['Received', 'Preparing', 'On the way', 'Delivered', 'Cancelled']

function dollars(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0)
}

function dateLabel(value) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function leavePortal() {
  clearFoodSession()
  window.location.replace('/')
}

function PortalHeader({ title, user }) {
  return (
    <header className="account-header">
      <a className="food-logo" href="/" aria-label="Sizzle and Smile home">
        <span><ShoppingBag size={15} /></span><strong>Sizzle<span>&</span>Smile</strong>
      </a>
      <div className="account-header-user">
        <span>{title}</span>
        <b>{user?.name}</b>
        <button type="button" onClick={leavePortal}><LogOut size={14} /> Sign out</button>
      </div>
    </header>
  )
}

function PortalState({ loading, error }) {
  if (loading) return <p className="account-state" role="status">Loading your secure dashboard…</p>
  if (error) return <p className="account-alert" role="alert">{error}</p>
  return null
}

export function ClientDashboard({ apiBaseUrl }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const session = getFoodSession()
    if (!session?.token) {
      window.location.replace('/login?next=%2Fdashboard')
      return () => { active = false }
    }
    if (session.user.role !== 'client') {
      window.location.replace('/admin')
      return () => { active = false }
    }
    foodApi.clientDashboard(apiBaseUrl).then((result) => {
      if (active) setData(result)
    }).catch((requestError) => {
      if (!active) return
      if (requestError.status === 401) {
        clearFoodSession()
        window.location.replace('/login?next=%2Fdashboard')
      } else if (requestError.status === 403) {
        window.location.replace('/admin')
      } else {
        setError(requestError.message)
      }
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [apiBaseUrl])

  return (
    <main className="account-page">
      <PortalHeader title="My account" user={data?.user} />
      <section className="account-content">
        <a className="account-back" href="/"><ArrowLeft size={14} /> Back to the menu</a>
        <span className="account-kicker">YOUR SIZZLE&SMILE ACCOUNT</span>
        <h1>{data?.user ? `Welcome, ${data.user.name}.` : 'Your orders, all in one place.'}</h1>
        <p>Review your recent orders and delivery details.</p>
        <PortalState loading={loading} error={error} />
        {!loading && !error && data && (
          <section className="account-card">
            <div className="account-card-heading">
              <div><small>ORDER HISTORY · {data.orders.length}</small><h2>Recent orders</h2></div>
              <ShoppingBag size={18} />
            </div>
            {data.orders.length ? data.orders.map((order) => (
              <article className="account-order" key={order.id}>
                <div className="account-order-main">
                  <strong>{order.items.map((item) => `${item.quantity}× ${item.name}`).join(', ')}</strong>
                  <span><MapPin size={13} /> {order.address}</span>
                  <small>{order.id} · {dateLabel(order.createdAt)}</small>
                </div>
                <div className="account-order-side">
                  <b>{dollars(order.total)}</b>
                  <span className="account-status">{order.status}</span>
                </div>
              </article>
            )) : (
              <div className="account-empty">
                <ShoppingBag size={22} />
                <strong>No orders yet</strong>
                <span>Your completed demo orders will appear here.</span>
                <a className="button red-button" href="/">Explore the menu</a>
              </div>
            )}
          </section>
        )}
      </section>
    </main>
  )
}

export function AdminDashboard({ apiBaseUrl }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyOrderId, setBusyOrderId] = useState('')
  const session = getFoodSession()

  useEffect(() => {
    let active = true
    const currentSession = getFoodSession()
    if (!currentSession?.token) {
      window.location.replace('/admin/login?next=%2Fadmin')
      return () => { active = false }
    }
    if (currentSession.user.role !== 'admin') {
      window.location.replace('/dashboard')
      return () => { active = false }
    }
    foodApi.adminDashboard(apiBaseUrl).then((result) => {
      if (active) setData(result)
    }).catch((requestError) => {
      if (!active) return
      if (requestError.status === 401) {
        clearFoodSession()
        window.location.replace('/admin/login?next=%2Fadmin')
      } else if (requestError.status === 403) {
        window.location.replace('/dashboard')
      } else {
        setError(requestError.message)
      }
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [apiBaseUrl])

  async function updateStatus(orderId, status) {
    setBusyOrderId(orderId)
    setError('')
    try {
      const { order } = await foodApi.updateOrder(apiBaseUrl, orderId, status)
      setData((current) => ({
        ...current,
        recentOrders: current.recentOrders.map((item) => item.id === order.id ? order : item),
      }))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyOrderId('')
    }
  }

  const metrics = data?.metrics
  return (
    <main className="account-page account-admin">
      <PortalHeader title="Admin workspace" user={session?.user} />
      <section className="account-content">
        <a className="account-back" href="/"><ArrowLeft size={14} /> Back to the storefront</a>
        <span className="account-kicker"><ShieldCheck size={13} /> ADMINISTRATOR ACCESS</span>
        <h1>Operations dashboard</h1>
        <p>Manage orders and review registered customer accounts.</p>
        <PortalState loading={loading} error={error} />
        {!loading && !error && data && (
          <>
            <div className="account-metrics">
              <article><small>CLIENTS</small><strong>{metrics.clients}</strong><Users size={17} /></article>
              <article><small>ALL ORDERS</small><strong>{metrics.orders}</strong><ShoppingBag size={17} /></article>
              <article><small>OPEN ORDERS</small><strong>{metrics.openOrders}</strong><span>Not yet delivered</span></article>
              <article><small>DELIVERED SALES</small><strong>{dollars(metrics.deliveredSales)}</strong><span>Demo totals only</span></article>
            </div>
            <section className="account-card">
              <div className="account-card-heading"><div><small>ORDER MANAGEMENT · {data.recentOrders.length}</small><h2>Recent orders</h2></div><ShoppingBag size={18} /></div>
              {data.recentOrders.length ? data.recentOrders.map((order) => (
                <article className="account-order" key={order.id}>
                  <div className="account-order-main">
                    <strong>{order.clientName} · {order.items.map((item) => `${item.quantity}× ${item.name}`).join(', ')}</strong>
                    <span><MapPin size={13} /> {order.address} · {order.phone}</span>
                    <small>{order.id} · {dateLabel(order.createdAt)}</small>
                  </div>
                  <div className="account-order-side">
                    <b>{dollars(order.total)}</b>
                    <select aria-label={`Update order status for ${order.id}`} disabled={busyOrderId === order.id} value={order.status} onChange={(event) => updateStatus(order.id, event.target.value)}>
                      {orderStatuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </div>
                </article>
              )) : <div className="account-empty"><ShoppingBag size={22} /><strong>No orders yet</strong><span>New customer orders will appear here.</span></div>}
            </section>
            <section className="account-card">
              <div className="account-card-heading"><div><small>CUSTOMER ACCOUNTS · {data.clients.length}</small><h2>Clients</h2></div><Users size={18} /></div>
              {data.clients.length ? data.clients.map((client) => (
                <article className="account-client" key={client.id}>
                  <span className="account-avatar">{client.name.slice(0, 1).toUpperCase()}</span>
                  <span><strong>{client.name}</strong><small>{client.email}{client.phone ? ` · ${client.phone}` : ''}</small></span>
                </article>
              )) : <div className="account-empty"><Users size={22} /><strong>No client accounts yet</strong></div>}
            </section>
          </>
        )}
      </section>
    </main>
  )
}
