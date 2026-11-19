import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Check, CircleAlert, LogOut, Package, ShieldCheck, Store, Users } from 'lucide-react'
import { clearMarketplaceSession, marketplaceApi } from '../services/marketplaceApi'

function PortalFrame({ title, description, user, navigate, onLogout, children }) {
  return <main className="shell market-portal">
    <header className="market-portal-header">
      <div><span className="section-kicker">MARKETHUB PORTAL</span><h1>{title}</h1><p>{description}</p></div>
      <div className="market-portal-account"><span>{user?.name}<small>{user?.email}</small></span><button type="button" onClick={onLogout}><LogOut size={15} /> Sign out</button></div>
    </header>
    <button className="market-portal-back" type="button" onClick={() => navigate('/')}><ArrowLeft size={15} /> Back to marketplace</button>
    {children}
  </main>
}

function PortalMessage({ loading, error }) {
  if (loading) return <p className="market-portal-message" role="status">Loading your secure dashboard…</p>
  if (error) return <p className="market-portal-error" role="alert"><CircleAlert size={17} /> {error}</p>
  return null
}

function usePortalData(session, navigate, route, load) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const loadRef = useRef(load)
  const navigateRef = useRef(navigate)
  useEffect(() => {
    loadRef.current = load
    navigateRef.current = navigate
  }, [load, navigate])
  useEffect(() => {
    let active = true
    if (!session?.token) {
      navigateRef.current(`/login?redirect=${encodeURIComponent(route)}`)
      return () => { active = false }
    }
    loadRef.current().then((result) => {
      if (active) setData(result)
    }).catch((requestError) => {
      if (active) {
        setError(requestError.message || 'Could not load this dashboard.')
        if (requestError.status === 401) {
          clearMarketplaceSession()
          navigateRef.current(`/login?redirect=${encodeURIComponent(route)}`)
        }
      }
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [route, session?.token])
  return { data, setData, loading, error, setError }
}

export function ClientDashboard({ session, navigate, onLogout }) {
  const load = () => marketplaceApi.clientDashboard()
  const { data, loading, error } = usePortalData(session, navigate, '/dashboard', load)
  return <PortalFrame title="Your orders" description="Review payment and delivery updates." user={data?.user || session?.user} navigate={navigate} onLogout={onLogout}>
    <PortalMessage loading={loading} error={error} />
    {!loading && !error && <section className="market-portal-card">
      <div className="market-portal-card-heading"><h2>Order history</h2><span>{data?.orders?.length || 0} orders</span></div>
      {data?.orders?.length ? <div className="market-order-list">{data.orders.map((order) => <article className="market-order-row" key={order.id}>
        <div><strong>{order.orderNumber}</strong><small>{new Date(order.createdAt).toLocaleDateString()} · {order.items.length} items</small></div>
        <span className="market-status">{order.status}</span><b>${Number(order.total).toFixed(2)}</b>
        <small>{order.paymentStatus}</small>
      </article>)}</div> : <p className="market-empty-state">Your order history will appear here after you place an order.</p>}
      <button className="button button-orange" type="button" onClick={() => navigate('/search')}>Keep shopping</button>
    </section>}
  </PortalFrame>
}

export function VendorDashboard({ session, navigate, onLogout }) {
  const load = () => marketplaceApi.vendorDashboard()
  const { data, setData, loading, error, setError } = usePortalData(session, navigate, '/vendor/dashboard', load)
  const [form, setForm] = useState({ name: '', category: '', description: '', price: '', stock: '1', image: '' })
  const [saving, setSaving] = useState(false)

  const submitProduct = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const result = await marketplaceApi.createProduct({ ...form, price: Number(form.price), stock: Number(form.stock) })
      setData((current) => current ? { ...current, products: [result.product, ...current.products] } : current)
      setForm({ name: '', category: '', description: '', price: '', stock: '1', image: '' })
    } catch (requestError) {
      setError(requestError.message || 'Could not list this product.')
    } finally {
      setSaving(false)
    }
  }

  return <PortalFrame title="Seller studio" description="Manage your MarketHub listings and buyer orders." user={data?.user || session?.user} navigate={navigate} onLogout={onLogout}>
    <PortalMessage loading={loading} error={error} />
    {!loading && data?.user?.vendorStatus !== 'approved' && <section className="market-review-banner"><Store size={20} /><div><strong>Seller application {data?.user?.vendorStatus}</strong><p>An administrator must approve your shop before you can publish products.</p></div></section>}
    {!loading && !error && <div className="market-portal-grid">
      <section className="market-portal-card"><div className="market-portal-card-heading"><h2>Your products</h2><span>{data?.products?.length || 0} listings</span></div>
        {data?.products?.length ? <div className="market-product-list">{data.products.map((product) => <article className="market-product-row" key={product.id}><span className="market-product-thumb">{product.image ? <img src={product.image} alt="" /> : <Package size={18} />}</span><span><strong>{product.name}</strong><small>{product.category} · {product.stock} in stock</small></span><b>${Number(product.price).toFixed(2)}</b></article>)}</div> : <p className="market-empty-state">No product listings yet.</p>}
      </section>
      {data?.user?.vendorStatus === 'approved' && <section className="market-portal-card"><h2>List a product</h2><form className="market-product-form" onSubmit={submitProduct}>
        <label>Product name<input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required minLength={2} maxLength={120} /></label>
        <label>Category<input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} required maxLength={80} /></label>
        <label>Description<textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} required minLength={10} maxLength={1200} rows={3} /></label>
        <div className="market-form-pair"><label>Price (USD)<input type="number" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} required min="0.01" step="0.01" /></label><label>Stock<input type="number" value={form.stock} onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))} required min="0" max="100000" /></label></div>
        <label>Image URL (optional)<input type="url" value={form.image} onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))} placeholder="https://" /></label>
        <button className="button button-orange" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Publish listing'}</button>
      </form></section>}
      <section className="market-portal-card market-portal-wide"><div className="market-portal-card-heading"><h2>Orders containing your products</h2><span>{data?.orders?.length || 0} orders</span></div>
        {data?.orders?.length ? data.orders.map((order) => <article className="market-order-row" key={order.id}><div><strong>{order.orderNumber}</strong><small>{order.items.map((item) => `${item.productName} × ${item.quantity}`).join(', ')}</small></div><span className="market-status">{order.status}</span></article>) : <p className="market-empty-state">Buyer orders for your products will appear here.</p>}
      </section>
    </div>}
  </PortalFrame>
}

export function AdminDashboard({ session, navigate, onLogout }) {
  const load = () => marketplaceApi.adminDashboard()
  const { data, setData, loading, error, setError } = usePortalData(session, navigate, '/admin', load)
  const [updating, setUpdating] = useState('')

  const updateVendor = async (vendorId, status) => {
    setUpdating(vendorId)
    setError('')
    try {
      const result = await marketplaceApi.updateVendorStatus(vendorId, status)
      setData((current) => current ? { ...current, vendors: current.vendors.map((vendor) => vendor.id === vendorId ? { ...vendor, vendorStatus: result.vendor.vendorStatus } : vendor), metrics: { ...current.metrics, pendingVendors: Math.max(0, current.metrics.pendingVendors - 1) } } : current)
    } catch (requestError) {
      setError(requestError.message || 'Could not update this vendor.')
    } finally {
      setUpdating('')
    }
  }

  const updateOrder = async (orderId, status) => {
    setUpdating(orderId)
    setError('')
    try {
      const result = await marketplaceApi.updateOrderStatus(orderId, status)
      setData((current) => current ? { ...current, orders: current.orders.map((order) => order.id === orderId ? result.order : order) } : current)
    } catch (requestError) {
      setError(requestError.message || 'Could not update this order.')
    } finally {
      setUpdating('')
    }
  }

  const metrics = data?.metrics
  return <PortalFrame title="Marketplace administration" description="Review seller applications and monitor orders." user={data?.user || session?.user} navigate={navigate} onLogout={onLogout}>
    <PortalMessage loading={loading} error={error} />
    {!loading && !error && <div className="market-admin-content">
      <div className="market-metric-grid">
        {[
          [Users, 'Customers', metrics?.customers],
          [Store, 'Vendors', metrics?.vendors],
          [Package, 'Products', metrics?.products],
          [ShieldCheck, 'Orders', metrics?.orders],
        ].map(([Icon, label, value]) => <article className="market-metric-card" key={label}><Icon size={19} /><span>{label}</span><strong>{value ?? 0}</strong></article>)}
      </div>
      <section className="market-portal-card"><div className="market-portal-card-heading"><h2>Seller applications</h2><span>{metrics?.pendingVendors || 0} pending</span></div>
        {data.vendors.filter((vendor) => vendor.vendorStatus === 'pending').length ? data.vendors.filter((vendor) => vendor.vendorStatus === 'pending').map((vendor) => <article className="market-order-row" key={vendor.id}><div><strong>{vendor.name}</strong><small>{vendor.email}</small></div><span className="market-status">Pending</span><button className="market-approve-button" type="button" disabled={updating === vendor.id} onClick={() => updateVendor(vendor.id, 'approved')}>{updating === vendor.id ? 'Saving…' : <><Check size={15} /> Approve</>}</button><button className="market-reject-button" type="button" disabled={updating === vendor.id} onClick={() => updateVendor(vendor.id, 'rejected')}>Reject</button></article>) : <p className="market-empty-state">There are no pending seller applications.</p>}
      </section>
      <section className="market-portal-card"><div className="market-portal-card-heading"><h2>Recent orders</h2><span>{data.orders.length} total</span></div>
        {data.orders.length ? <div className="market-order-list">{data.orders.map((order) => <article className="market-order-row" key={order.id}><div><strong>{order.orderNumber}</strong><small>{order.customerName} · {order.items.length} items · {order.paymentStatus}{order.paymentProvider ? ` via ${order.paymentProvider}` : ''}</small></div><span className="market-status">{order.status}</span><b>${Number(order.total).toFixed(2)}</b><select aria-label={`Update status for ${order.orderNumber}`} value={order.status} disabled={updating === order.id} onChange={(event) => updateOrder(order.id, event.target.value)}>{['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Inventory review', 'Payment failed', 'Payment expired'].map((status) => <option key={status}>{status}</option>)}</select></article>)}</div> : <p className="market-empty-state">Orders will appear here when a customer checks out.</p>}
      </section>
    </div>}
  </PortalFrame>
}
