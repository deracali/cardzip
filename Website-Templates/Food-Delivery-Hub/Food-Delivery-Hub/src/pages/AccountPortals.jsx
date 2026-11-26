import { useEffect, useState } from 'react'
import {
  ArrowUpRight,
  Bike,
  CircleDollarSign,
  Clock3,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  PackageCheck,
  Settings,
  ShoppingBag,
  ShieldCheck,
  Users,
  Utensils,
  X,
} from 'lucide-react'
import {
  clearFoodSession,
  getAdminDashboard,
  getClientDashboard,
  getFoodSession,
  updateDemoOrder,
} from '../services/demoStore'

const orderStatuses = ['Received', 'Preparing', 'On the way', 'Delivered', 'Cancelled']
const clientNavigation = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'orders', label: 'My orders', icon: ShoppingBag },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'favorites', label: 'Favorites', icon: Heart },
  { id: 'account', label: 'Account', icon: Settings },
]
const adminNavigation = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'menu', label: 'Menu preview', icon: Utensils },
  { id: 'settings', label: 'Settings', icon: Settings },
]

function dollars(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0)
}

function dateLabel(value) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function DashboardSidebar({ role, user, activeView, onNavigate, onLogout, open, onClose }) {
  const isAdmin = role === 'admin'
  const navigation = isAdmin ? adminNavigation : clientNavigation
  return (
    <>
      {open && <button className="portal-overlay" type="button" aria-label="Close dashboard menu" onClick={onClose} />}
      <aside className={`portal-sidebar${open ? ' is-open' : ''}`}>
        <div className="portal-brand">
          <span className="portal-brand-mark"><Utensils size={17} /></span>
          <span><strong>Sizzle<span>&</span>Smile</strong><small>{isAdmin ? 'ADMIN WORKSPACE' : 'YOUR ACCOUNT'}</small></span>
          <button className="portal-close" type="button" aria-label="Close dashboard menu" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="portal-workspace-label">WORKSPACE</div>
        <nav className="portal-nav" aria-label={`${isAdmin ? 'Admin' : 'User'} dashboard`}>
          {navigation.map(({ id, label, icon: Icon }) => (
            <button type="button" key={id} className={activeView === id ? 'active' : ''} onClick={() => onNavigate(id)}>
              <Icon size={17} /><span>{label}</span>{activeView === id && <span className="portal-nav-indicator" />}
            </button>
          ))}
        </nav>
        <div className="portal-sidebar-bottom">
          <a className="portal-help-link" href="/delivery"><Bike size={16} /><span><strong>Need a hand?</strong><small>View delivery help</small></span><ArrowUpRight size={14} /></a>
          <div className="portal-profile">
            <span className="portal-avatar">{user?.name?.slice(0, 1).toUpperCase() || (isAdmin ? 'A' : 'U')}</span>
            <span className="portal-profile-copy"><strong>{user?.name || (isAdmin ? 'Demo admin' : 'Guest')}</strong><small>{user?.email || 'Local demo account'}</small></span>
            <button type="button" aria-label="Sign out" title="Sign out" onClick={onLogout}><LogOut size={16} /></button>
          </div>
        </div>
      </aside>
    </>
  )
}

function DashboardHeader({ user, onMenuClick }) {
  return (
    <header className="portal-topbar">
      <button className="portal-menu-button" type="button" aria-label="Open dashboard menu" onClick={onMenuClick}><Menu size={19} /></button>
      <div className="portal-breadcrumb">Sizzle&Smile <span>/</span> Dashboard</div>
      <div className="portal-topbar-user"><span className="portal-online-dot" /> Demo preview <span className="portal-avatar small">{user?.name?.slice(0, 1).toUpperCase() || 'U'}</span></div>
    </header>
  )
}

function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="portal-page-heading">
      <div><span className="portal-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>
      {action}
    </div>
  )
}

function MetricCard({ label, value, detail, icon: Icon, tone }) {
  return (
    <article className={`portal-metric ${tone || ''}`}>
      <span className="portal-metric-icon"><Icon size={18} /></span>
      <small>{label}</small><strong>{value}</strong><span className="portal-metric-detail">{detail}</span>
    </article>
  )
}

function OrderList({ orders, admin = false, onStatusChange, busyOrderId }) {
  if (!orders.length) {
    return <div className="portal-empty"><ShoppingBag size={24} /><strong>No orders yet</strong><span>Demo orders placed from this browser will appear here.</span></div>
  }
  return (
    <div className="portal-order-list">
      {orders.map((order) => (
        <article className="portal-order-row" key={order.id}>
          <span className="portal-order-icon"><ShoppingBag size={17} /></span>
          <div className="portal-order-main">
            <strong>{admin ? order.clientName : order.items.map((item) => `${item.quantity}× ${item.name}`).join(', ')}</strong>
            <span>{admin ? `${order.address} · ${order.phone}` : order.address}</span>
            <small>{order.id} · {dateLabel(order.createdAt)}</small>
          </div>
          <strong className="portal-order-total">{dollars(order.total)}</strong>
          {admin ? (
            <select aria-label={`Update order status for ${order.id}`} disabled={busyOrderId === order.id} value={order.status} onChange={(event) => onStatusChange(order.id, event.target.value)}>
              {orderStatuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          ) : <span className={`portal-status ${order.status.toLowerCase().replaceAll(' ', '-')}`}>{order.status}</span>}
        </article>
      ))}
    </div>
  )
}

function ClientOverview({ data, onNavigate }) {
  const activeOrders = data.orders.filter((order) => !['Delivered', 'Cancelled'].includes(order.status))
  const delivered = data.orders.filter((order) => order.status === 'Delivered').length
  const spent = data.orders.reduce((sum, order) => sum + order.total, 0)
  return (
    <>
      <PageHeading eyebrow="CUSTOMER DASHBOARD" title={`Welcome back, ${data.user.name.split(' ')[0]}`} description="Your meals and delivery updates, all in one place." action={<a className="portal-primary-button" href="/">Explore menu <ArrowUpRight size={15} /></a>} />
      <div className="portal-metric-grid">
        <MetricCard label="Total orders" value={data.orders.length} detail="Since you joined" icon={ShoppingBag} />
        <MetricCard label="On the way" value={activeOrders.length} detail="Orders in progress" icon={Bike} tone="warm" />
        <MetricCard label="Delivered" value={delivered} detail="Meals enjoyed" icon={PackageCheck} tone="green" />
        <MetricCard label="Order total" value={dollars(spent)} detail="Demo order value" icon={CircleDollarSign} tone="blue" />
      </div>
      <section className="portal-panel">
        <div className="portal-panel-heading"><div><h2>Recent orders</h2><p>Your latest activity</p></div><button type="button" className="portal-text-button" onClick={() => onNavigate('orders')}>View all <ArrowUpRight size={14} /></button></div>
        <OrderList orders={data.orders.slice(0, 4)} />
      </section>
    </>
  )
}

function ClientView({ view, data, onNavigate }) {
  if (view === 'overview') return <ClientOverview data={data} onNavigate={onNavigate} />
  if (view === 'orders') return <><PageHeading eyebrow="ORDER HISTORY" title="My orders" description="Review order details and delivery progress." /><section className="portal-panel"><OrderList orders={data.orders} /></section></>
  if (view === 'addresses') {
    const addresses = [...new Set(data.orders.map((order) => order.address).filter(Boolean))]
    return <><PageHeading eyebrow="DELIVERY DETAILS" title="Saved addresses" description="Addresses used for your demo orders on this device." /><section className="portal-panel"><div className="portal-panel-heading"><div><h2>Your addresses</h2><p>Saved from recent checkouts</p></div><MapPin size={18} /></div>{addresses.length ? addresses.map((address) => <article className="portal-simple-row" key={address}><MapPin size={17} /><span><strong>{address}</strong><small>Delivery address</small></span></article>) : <div className="portal-empty"><MapPin size={23} /><strong>No saved addresses</strong><span>Your checkout addresses will appear here.</span></div>}</section></>
  }
  if (view === 'favorites') return <><PageHeading eyebrow="YOUR PICKS" title="Favorites" description="Your saved dishes will be ready when you are." /><section className="portal-panel"><div className="portal-empty"><Heart size={24} /><strong>No saved favorites yet</strong><span>Browse the menu and come back to this page to see your picks.</span><a className="portal-primary-button" href="/">Explore the menu <ArrowUpRight size={14} /></a></div></section></>
  return <><PageHeading eyebrow="ACCOUNT SETTINGS" title="Your account" description="Your profile details for this local demo session." /><section className="portal-panel portal-account-card"><span className="portal-avatar large">{data.user.name.slice(0, 1).toUpperCase()}</span><div><h2>{data.user.name}</h2><p>{data.user.email}</p>{data.user.phone && <p>{data.user.phone}</p>}</div><span className="portal-status">Customer</span></section></>
}

export function ClientDashboard() {
  const [session] = useState(getFoodSession)
  const [data] = useState(() => session?.user.role === 'client' ? getClientDashboard(session.user) : null)
  const [activeView, setActiveView] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!session?.token) {
      window.location.replace('/login?next=%2Fdashboard')
      return
    }
    if (session.user.role !== 'client') {
      window.location.replace('/admin')
    }
  }, [session])

  if (!data) return <main className="portal-loading">Opening your dashboard…</main>
  return (
    <div className="portal-shell">
      <DashboardSidebar role="client" user={data.user} activeView={activeView} onNavigate={(view) => { setActiveView(view); setSidebarOpen(false) }} onLogout={() => { clearFoodSession(); window.location.replace('/') }} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="portal-workspace"><DashboardHeader user={data.user} onMenuClick={() => setSidebarOpen(true)} /><main className="portal-main">
        <div className="portal-demo-note"><ShieldCheck size={14} /> Local demo dashboard · data is stored in this browser only</div>
        <ClientView view={activeView} data={data} onNavigate={setActiveView} />
      </main></div>
    </div>
  )
}

function AdminView({ view, data, session, onNavigate, onStatusChange, busyOrderId }) {
  if (view === 'overview') {
    return (
      <>
        <PageHeading eyebrow="ADMIN WORKSPACE" title="Operations overview" description="A clear view of today's sample orders and customers." action={<span className="portal-live-badge"><span /> Demo data</span>} />
        <div className="portal-metric-grid">
          <MetricCard label="Customers" value={data.metrics.clients} detail="Local demo accounts" icon={Users} />
          <MetricCard label="All orders" value={data.metrics.orders} detail="Orders on this device" icon={ShoppingBag} />
          <MetricCard label="Open orders" value={data.metrics.openOrders} detail="Awaiting completion" icon={Clock3} tone="warm" />
          <MetricCard label="Delivered sales" value={dollars(data.metrics.deliveredSales)} detail="Demo totals only" icon={CircleDollarSign} tone="green" />
        </div>
        <section className="portal-panel"><div className="portal-panel-heading"><div><h2>Latest orders</h2><p>Most recent activity</p></div><button type="button" className="portal-text-button" onClick={() => onNavigate('orders')}>Manage orders <ArrowUpRight size={14} /></button></div><OrderList orders={data.recentOrders.slice(0, 5)} admin onStatusChange={onStatusChange} busyOrderId={busyOrderId} /></section>
      </>
    )
  }
  if (view === 'orders') return <><PageHeading eyebrow="ORDER MANAGEMENT" title="Orders" description="Update fulfillment status for local demo orders." /><section className="portal-panel"><OrderList orders={data.recentOrders} admin onStatusChange={onStatusChange} busyOrderId={busyOrderId} /></section></>
  if (view === 'customers') return <><PageHeading eyebrow="CUSTOMER DIRECTORY" title="Customers" description={`${data.clients.length} client accounts in this browser demo.`} /><section className="portal-panel">{data.clients.length ? data.clients.map((client) => <article className="portal-simple-row" key={client.id}><span className="portal-avatar">{client.name.slice(0, 1).toUpperCase()}</span><span><strong>{client.name}</strong><small>{client.email}{client.phone ? ` · ${client.phone}` : ''}</small></span></article>) : <div className="portal-empty"><Users size={24} /><strong>No customers yet</strong><span>Demo accounts created on this device will appear here.</span></div>}</section></>
  if (view === 'menu') return <><PageHeading eyebrow="MENU" title="Menu preview" description="Menu management is available in the API-backed Next.js version." /><section className="portal-panel"><div className="portal-empty"><Utensils size={24} /><strong>Menu catalog preview</strong><span>Browse and order from the storefront. Vite does not connect to a backend.</span><a className="portal-primary-button" href="/">Open storefront <ArrowUpRight size={14} /></a></div></section></>
  return <><PageHeading eyebrow="WORKSPACE SETTINGS" title="Settings" description="Local demo administrator profile." /><section className="portal-panel portal-account-card"><span className="portal-avatar large">{session?.user?.name?.slice(0, 1).toUpperCase() || 'A'}</span><div><h2>{session?.user?.name}</h2><p>{session?.user?.email}</p><p>Administrator · Browser-only preview</p></div></section></>
}

export function AdminDashboard() {
  const [session] = useState(getFoodSession)
  const [data, setData] = useState(() => session?.user.role === 'admin' ? getAdminDashboard() : null)
  const [error, setError] = useState('')
  const [busyOrderId, setBusyOrderId] = useState('')
  const [activeView, setActiveView] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!session?.token) {
      window.location.replace('/admin/login?next=%2Fadmin')
      return
    }
    if (session.user.role !== 'admin') {
      window.location.replace('/dashboard')
    }
  }, [session])

  function updateStatus(orderId, status) {
    setBusyOrderId(orderId)
    setError('')
    try {
      updateDemoOrder(orderId, status)
      setData(getAdminDashboard())
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyOrderId('')
    }
  }

  if (!data) return <main className="portal-loading">Opening the admin workspace…</main>
  return (
    <div className="portal-shell portal-admin-shell">
      <DashboardSidebar role="admin" user={session?.user} activeView={activeView} onNavigate={(view) => { setActiveView(view); setSidebarOpen(false) }} onLogout={() => { clearFoodSession(); window.location.replace('/') }} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="portal-workspace"><DashboardHeader user={session?.user} onMenuClick={() => setSidebarOpen(true)} /><main className="portal-main">
        <div className="portal-demo-note"><ShieldCheck size={14} /> Local demo workspace · not connected to the backend API</div>
        {error && <p className="account-alert" role="alert">{error}</p>}
        <AdminView view={activeView} data={data} session={session} onNavigate={setActiveView} onStatusChange={updateStatus} busyOrderId={busyOrderId} />
      </main></div>
    </div>
  )
}
