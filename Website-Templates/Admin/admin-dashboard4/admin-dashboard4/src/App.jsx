import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgePercent,
  Banknote,
  BarChart3,
  Bell,
  Boxes,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  CreditCard,
  Download,
  FileText,
  Filter,
  LayoutDashboard,
  LifeBuoy,
  List,
  LockKeyhole,
  Mail,
  Menu,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  Wallet,
  X,
  Zap,
} from 'lucide-react'
import './App.css'

const navigation = [
  {
    label: 'Main menu',
    links: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Orders', path: '/orders', icon: ShoppingBag, count: '128' },
      { label: 'Inventory', path: '/inventory', icon: Boxes },
      { label: 'Vendors', path: '/vendors', icon: Store },
      { label: 'Payouts', path: '/payouts', icon: Wallet },
      { label: 'Marketing', path: '/marketing', icon: BadgePercent },
      { label: 'Analytics', path: '/analytics', icon: BarChart3 },
      { label: 'Settings', path: '/settings', icon: Settings },
    ],
  },
  {
    label: 'Support',
    links: [
      { label: 'Help center', path: '/help', icon: LifeBuoy },
      { label: 'API docs', path: '/api-docs', icon: FileText },
    ],
  },
]

const startingProducts = [
  { id: 'PRD-8211', name: 'Sony WH-1000XM5 Black', detail: 'Sony · WH1000XM5/B', vendor: 'TechHub', category: 'Electronics', price: 398, stock: 42, status: 'In stock', emoji: '🎧', color: 'violet' },
  { id: 'PRD-8210', name: 'Nike Air Zoom Pegasus 40', detail: 'Nike · NK-PG40-BLK', vendor: 'UrbanKicks', category: 'Footwear', price: 149.99, stock: 4, status: 'Low stock', emoji: '👟', color: 'orange' },
  { id: 'PRD-8209', name: 'Dyson V15 Detect Absolute', detail: 'Dyson · V15-DA', vendor: 'HomePlus', category: 'Home', price: 749, stock: 0, status: 'Out of stock', emoji: '🧹', color: 'blue' },
  { id: 'PRD-8208', name: 'Le Creuset Round 5.5qt', detail: 'Le Creuset · LC-SS-55', vendor: 'HomePlus', category: 'Kitchen', price: 379.95, stock: 3, status: 'Low stock', emoji: '🍲', color: 'red' },
  { id: 'PRD-8207', name: 'Kindle Paperwhite 16GB', detail: 'Amazon · AZ-KP-16-B', vendor: 'TechHub', category: 'Electronics', price: 149.99, stock: 89, status: 'In stock', emoji: '📚', color: 'cyan' },
  { id: 'PRD-8206', name: 'Zara Wool Overcoat', detail: 'Zara · ZW-COAT-02', vendor: 'ModaLine', category: 'Fashion', price: 189, stock: 18, status: 'In stock', emoji: '🧥', color: 'pink' },
]

const orders = [
  { id: 'ORD-8211', customer: 'Maya Chen', product: 'Sony WH-1000XM5 Black', vendor: 'TechHub', date: 'Nov 1, 2026', amount: 398, status: 'Processing', emoji: '🎧' },
  { id: 'ORD-8210', customer: 'Sofia Rossi', product: 'Dyson V15 Detect', vendor: 'HomePlus', date: 'Nov 1, 2026', amount: 749, status: 'Shipped', emoji: '🧹' },
  { id: 'ORD-8209', customer: 'Nina Novak', product: 'Kindle Paperwhite 16GB', vendor: 'TechHub', date: 'Oct 31, 2026', amount: 149.99, status: 'Delivered', emoji: '📚' },
  { id: 'ORD-8208', customer: 'Emma Silva', product: 'Zara Wool Overcoat', vendor: 'ModaLine', date: 'Oct 31, 2026', amount: 189, status: 'Refunded', emoji: '🧥' },
  { id: 'ORD-8207', customer: 'Liam Carter', product: 'Nike Air Zoom Pegasus 40', vendor: 'UrbanKicks', date: 'Oct 30, 2026', amount: 149.99, status: 'Processing', emoji: '👟' },
  { id: 'ORD-8206', customer: 'Jonas Weber', product: 'Le Creuset Round 5.5qt', vendor: 'HomePlus', date: 'Oct 30, 2026', amount: 379.95, status: 'Shipped', emoji: '🍲' },
]

const vendors = [
  { id: 'techhub', name: 'TechHub Official', owner: 'Daniel Park', initials: 'TH', sales: 84210, rate: 12, payout: 74104, status: 'Ready', color: 'blue' },
  { id: 'urbankicks', name: 'UrbanKicks', owner: 'Priya Nair', initials: 'UK', sales: 52480, rate: 18, payout: 47232, status: 'Processing', color: 'amber' },
  { id: 'homeplus', name: 'HomePlus Living', owner: 'Marco Bianchi', initials: 'HP', sales: 47900, rate: 12, payout: 42152, status: 'Ready', color: 'green' },
  { id: 'brewlab', name: 'BrewLab Co.', owner: 'Jonas Weber', initials: 'BL', sales: 18340, rate: 8, payout: 16872, status: 'Paid', color: 'purple' },
  { id: 'modaline', name: 'ModaLine', owner: 'Sofia Rossi', initials: 'ML', sales: 22150, rate: 15, payout: 18827, status: 'Paid', color: 'pink' },
]

const statusClass = (status) => status.toLowerCase().replaceAll(' ', '-')
const money = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

function App() {
  const [path, setPath] = useState(window.location.pathname === '/' ? '/dashboard' : window.location.pathname)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState(startingProducts)
  const [notice, setNotice] = useState('')
  const [modal, setModal] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [orderView, setOrderView] = useState('Kanban')
  const [orderStatus, setOrderStatus] = useState('All orders')

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname === '/' ? '/dashboard' : window.location.pathname)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    const currentPage = navigation.flatMap((group) => group.links).find((link) => link.path === path)?.label
    document.title = `${path === '/checkout' ? 'Payment checkout' : currentPage || 'Dashboard'} | Nexus Market`
  }, [path])

  const navigate = (nextPath) => {
    if (!navigation.flatMap((group) => group.links).some((link) => link.path === nextPath) && nextPath !== '/checkout') return
    window.history.pushState({}, '', nextPath)
    setPath(nextPath)
    setMobileNavOpen(false)
    setNotice('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const visibleProducts = useMemo(
    () => products.filter((product) => `${product.name} ${product.vendor} ${product.category}`.toLowerCase().includes(search.toLowerCase())),
    [products, search],
  )
  const visibleOrders = useMemo(
    () => orders.filter((order) => {
      const matchesSearch = `${order.id} ${order.customer} ${order.product} ${order.vendor}`.toLowerCase().includes(search.toLowerCase())
      return matchesSearch && (orderStatus === 'All orders' || order.status === orderStatus)
    }),
    [search, orderStatus],
  )

  const goToCheckout = (vendor) => {
    setSelectedVendor(vendor)
    navigate('/checkout')
  }

  const addProduct = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const product = {
      id: `PRD-${Math.floor(8200 + Math.random() * 800)}`,
      name: formData.get('productName').trim(),
      detail: `${formData.get('vendor')} · New listing`,
      vendor: formData.get('vendor').trim(),
      category: formData.get('category'),
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
      status: Number(formData.get('stock')) > 5 ? 'In stock' : 'Low stock',
      emoji: '📦',
      color: 'violet',
    }
    setProducts((current) => [product, ...current])
    setModal('')
    setNotice(`${product.name} was added to inventory.`)
  }

  const updateProductStock = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const stock = Number(formData.get('stock'))
    setProducts((current) => current.map((product) => product.id === selectedProduct.id
      ? { ...product, stock, status: stock === 0 ? 'Out of stock' : stock <= 5 ? 'Low stock' : 'In stock' }
      : product))
    setSelectedProduct(null)
    setNotice('Inventory changes saved.')
  }

  const activePage = path === '/checkout' ? 'Payouts' : navigation.flatMap((group) => group.links).find((link) => link.path === path)?.label || 'Dashboard'

  return (
    <div className="app-shell">
      {mobileNavOpen && <button className="mobile-backdrop" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
      <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
        <a className="brand-lockup" href="/dashboard" onClick={(event) => { event.preventDefault(); navigate('/dashboard') }}>
          <span className="brand-icon"><ShoppingBag size={17} /></span>
          <span className="brand-copy"><strong>Nexus Market</strong><small>Seller Central</small></span>
          <span className="sidebar-collapse">‹</span>
        </a>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navigation.map((group) => (
            <section className="nav-group" key={group.label}>
              <p className="nav-heading">{group.label}</p>
              {group.links.map(({ label, path: linkPath, icon: Icon, count }) => (
                <a
                  className={`nav-link ${activePage === label ? 'nav-link-active' : ''}`}
                  href={linkPath}
                  key={label}
                  onClick={(event) => { event.preventDefault(); navigate(linkPath) }}
                >
                  <Icon size={15} strokeWidth={1.8} />
                  <span>{label}</span>
                  {count && <span className="nav-count">{count}</span>}
                </a>
              ))}
            </section>
          ))}
        </nav>
        <div className="season-card">
          <span className="season-title"><Zap size={13} /> Peak season</span>
          <p>Fulfill the 4.8K orders ready to ship.</p>
          <a href="/analytics" onClick={(event) => { event.preventDefault(); navigate('/analytics') }}>View insights <ArrowRight size={12} /></a>
        </div>
        <button className="account-card" onClick={() => navigate('/settings')}>
          <span className="avatar">AR</span>
          <span><strong>A. Rahman</strong><small>Marketplace admin</small></span>
          <ChevronDown size={14} />
        </button>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}><Menu size={19} /></button>
          <label className="global-search">
            <Search size={16} />
            <input aria-label="Search dashboard" placeholder="Quick search orders, SKUs, vendors..." value={search} onChange={(event) => setSearch(event.target.value)} />
            <kbd>⌘ K</kbd>
          </label>
          <button className="store-switch"><span className="store-mark">N</span><span>Nexus Global Store</span><ChevronDown size={13} /></button>
          <div className="topbar-actions">
            <button className="primary-button add-product-button" onClick={() => setModal('product')}><Plus size={15} /> Add product</button>
            <div className="notification-wrap">
              <button className="icon-button notification-button" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((open) => !open)}><Bell size={16} /><span /></button>
              {notificationsOpen && <div className="notification-popover"><strong>Notifications</strong><p><span className="notification-dot" /> 4 orders are ready to ship.</p><p><span className="notification-dot warning-dot" /> 2 items are running low.</p><button onClick={() => setNotificationsOpen(false)}>Dismiss</button></div>}
            </div>
            <button className="theme-button" aria-label="Theme is set to dark"><span>◐</span></button>
            <button className="profile-button" onClick={() => navigate('/settings')}><span className="avatar">AR</span><span><strong>A. Rahman</strong><small>Marketplace admin</small></span></button>
          </div>
        </header>

        <section className="page-content">
          {notice && <div className="notice-banner" role="status"><CheckCircle2 size={16} />{notice}<button aria-label="Dismiss message" onClick={() => setNotice('')}><X size={15} /></button></div>}
          {path === '/dashboard' || path === '/' ? (
            <DashboardPage navigate={navigate} products={products} onAdd={() => setModal('product')} orderView={orderView} setOrderView={setOrderView} />
          ) : path === '/orders' ? (
            <OrdersPage orders={visibleOrders} orderView={orderView} setOrderView={setOrderView} orderStatus={orderStatus} setOrderStatus={setOrderStatus} navigate={navigate} />
          ) : path === '/inventory' ? (
            <InventoryPage products={visibleProducts} allProducts={products} onAdd={() => setModal('product')} onSelect={setSelectedProduct} />
          ) : path === '/vendors' ? (
            <VendorsPage goToCheckout={goToCheckout} />
          ) : path === '/payouts' ? (
            <PayoutsPage goToCheckout={goToCheckout} />
          ) : path === '/checkout' ? (
            <CheckoutPage vendor={selectedVendor} navigate={navigate} onNotice={setNotice} />
          ) : path === '/marketing' ? (
            <MarketingPage onNotice={setNotice} />
          ) : path === '/analytics' ? (
            <AnalyticsPage />
          ) : path === '/settings' ? (
            <SettingsPage onNotice={setNotice} />
          ) : path === '/help' ? (
            <HelpPage onNotice={setNotice} />
          ) : path === '/api-docs' ? (
            <ApiDocsPage onNotice={setNotice} />
          ) : (
            <DashboardPage navigate={navigate} products={products} onAdd={() => setModal('product')} orderView={orderView} setOrderView={setOrderView} />
          )}
        </section>
      </main>

      {modal === 'product' && <Modal title="Add a product" onClose={() => setModal('')}><form className="form-grid" onSubmit={addProduct}><label>Product name<input name="productName" placeholder="e.g. Studio headphones" required /></label><label>Vendor<input name="vendor" placeholder="Vendor name" required /></label><label>Category<select name="category"><option>Electronics</option><option>Footwear</option><option>Home</option><option>Kitchen</option><option>Fashion</option></select></label><div className="form-pair"><label>Price (USD)<input name="price" type="number" min="0.01" step="0.01" required /></label><label>Stock<input name="stock" type="number" min="0" step="1" defaultValue="10" required /></label></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModal('')}>Cancel</button><button type="submit" className="primary-button"><Plus size={15} /> Add product</button></div></form></Modal>}
      {selectedProduct && <Modal title="Edit inventory" onClose={() => setSelectedProduct(null)}><form className="form-grid" onSubmit={updateProductStock}><div className="selected-product"><span className={`product-emoji ${selectedProduct.color}`}>{selectedProduct.emoji}</span><span><strong>{selectedProduct.name}</strong><small>{selectedProduct.id} · {selectedProduct.vendor}</small></span></div><label>Available stock<input name="stock" type="number" min="0" step="1" defaultValue={selectedProduct.stock} required /></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setSelectedProduct(null)}>Cancel</button><button type="submit" className="primary-button">Save changes</button></div></form></Modal>}
    </div>
  )
}

function PageHeading({ eyebrow, title, description, actions }) {
  return <div className="page-heading"><div><div className="breadcrumb">{eyebrow || 'Nexus Market'} <ChevronRight size={12} /> <span>{title}</span></div><h1>{title}</h1>{description && <p>{description}</p>}</div>{actions && <div className="heading-actions">{actions}</div>}</div>
}

function MetricCard({ label, value, note, icon: Icon, tone = 'violet', trend }) {
  return <article className="metric-card"><div className={`metric-icon ${tone}`}><Icon size={16} /></div><div className="metric-copy"><span>{label}</span><strong>{value}</strong><small className={trend === 'down' ? 'trend-down' : ''}>{trend === 'down' ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}{note}</small></div></article>
}

function DashboardPage({ navigate, products, onAdd, orderView, setOrderView }) {
  const columns = [
    { name: 'Processing', count: 24, color: 'orange' },
    { name: 'Shipped', count: 18, color: 'blue' },
    { name: 'Delivered', count: 46, color: 'green' },
    { name: 'Refunded', count: 6, color: 'pink' },
  ]
  const displayOrders = [
    { ...orders[0], product: 'Sony WH-1000XM5 Black', amount: 398, carrier: 'TechHub' },
    { ...orders[1], product: 'Dyson V15 Detect', amount: 749, carrier: 'HomePlus' },
    { ...orders[2], product: 'Kindle Paperwhite 16GB', amount: 149.99, carrier: 'TechHub' },
    { ...orders[3], product: 'Zara Wool Overcoat', amount: 189, carrier: 'ModaLine' },
    { ...orders[4], product: 'Nike Air Zoom Pegasus', amount: 149.99, carrier: 'UrbanKicks' },
    { ...orders[5], product: 'Le Creuset Dutch Oven', amount: 379.95, carrier: 'HomePlus' },
  ]
  return <>
    <PageHeading title="Marketplace overview" description="Saturday, Nov 1 — 128 open orders · 5 vendors pending payout" actions={<><span className="live-status"><span /> All systems live</span><button className="secondary-button compact"><Clock3 size={13} /> Last 30 days</button></>} />
    <div className="section-tabs" role="navigation" aria-label="Marketplace sections">
      <a className="section-tab active" href="/orders" onClick={(event) => { event.preventDefault(); navigate('/orders') }}><ShoppingBag size={14} /> Orders</a>
      <a className="section-tab" href="/inventory" onClick={(event) => { event.preventDefault(); navigate('/inventory') }}><Boxes size={14} /> Inventory</a>
      <a className="section-tab" href="/payouts" onClick={(event) => { event.preventDefault(); navigate('/payouts') }}><Wallet size={14} /> Payouts</a>
    </div>
    <div className="pipeline-heading"><div><strong>Order fulfillment pipeline</strong><span>Drag cards to update status</span></div><button className="text-button" onClick={() => navigate('/orders')}><List size={14} /> View all orders</button></div>
    <div className="toolbar"><div className="view-switch"><button className={orderView === 'Kanban' ? 'selected' : ''} onClick={() => setOrderView('Kanban')}><LayoutDashboard size={13} /> Kanban</button><button className={orderView === 'Table' ? 'selected' : ''} onClick={() => setOrderView('Table')}><List size={13} /> Table</button></div><button className="filter-button"><Filter size={13} /> All vendors <ChevronDown size={12} /></button><button className="filter-button"><Clock3 size={13} /> Nov 1 – Nov 30, 2026</button><button className="secondary-button compact toolbar-export" onClick={() => navigate('/orders')}><Download size={13} /> Export</button></div>
    {orderView === 'Kanban' ? <div className="kanban-board">{columns.map((column, columnIndex) => {
      const cards = displayOrders.filter((_, index) => index % columns.length === columnIndex).slice(0, 2)
      return <section className="kanban-column" key={column.name}><div className={`column-heading ${column.color}`}><span className="column-dot" />{column.name}<span className="column-count">{column.count}</span><span className="column-line" /></div>{cards.map((order) => <OrderCard key={order.id} order={order} />)}<button className="add-card" onClick={() => navigate('/orders')}><Plus size={12} /> Add card</button></section>
    })}</div> : <div className="table-card"><OrderTable orders={displayOrders} /></div>}
    <section className="overview-lower"><div className="lower-card"><div className="card-title-row"><div><h2>Inventory snapshot</h2><p>Stock that needs your attention</p></div><button className="text-link" onClick={() => navigate('/inventory')}>View inventory <ArrowRight size={13} /></button></div><div className="snapshot-row"><span className="snapshot-symbol orange"><Package size={15} /></span><span><strong>Low stock items</strong><small>{products.filter((product) => product.stock > 0 && product.stock <= 5).length} products need a restock</small></span><strong className="snapshot-number">112</strong></div><div className="snapshot-row"><span className="snapshot-symbol pink"><Boxes size={15} /></span><span><strong>Out of stock</strong><small>Review unavailable products</small></span><strong className="snapshot-number">37</strong></div></div><div className="lower-card payout-preview"><div className="card-title-row"><div><h2>Vendor payouts</h2><p>Next transfer batch · Nov 3</p></div><span className="status-pill ready">5 pending</span></div><strong className="payout-amount">$62,510<span>.00</span></strong><div className="payout-progress"><span /></div><button className="secondary-button full-width" onClick={() => navigate('/payouts')}>Review payouts <ArrowRight size={14} /></button></div></section>
    <button className="floating-add" onClick={onAdd}><Plus size={15} /> Quick add product</button>
  </>
}

function OrderCard({ order }) {
  return <article className="order-card"><div className="order-card-top"><span className="order-id">{order.id}</span><button aria-label={`More actions for ${order.id}`}><MoreHorizontal size={15} /></button></div><div className="order-product"><span className="product-emoji small-emoji">{order.emoji}</span><span><strong>{order.product}</strong><small>{order.customer} · 1 pc</small></span></div><div className="order-card-bottom"><strong>{money(order.amount)}</strong><span className="vendor-tag">{order.carrier}</span></div><div className="order-card-meta"><span><Truck size={11} /> {order.status === 'Shipped' ? 'UPS' : order.status === 'Delivered' ? 'FedEx' : 'DHL'}</span><span>1 pc · #1</span></div></article>
}

function OrdersPage({ orders: filteredOrders, orderView, setOrderView, orderStatus, setOrderStatus, navigate }) {
  return <>
    <PageHeading title="Orders" description="Track fulfillment, update order status, and keep every customer informed." actions={<button className="primary-button" onClick={() => navigate('/checkout')}><CreditCard size={14} /> New checkout</button>} />
    <div className="metric-grid three-metrics"><MetricCard label="Open orders" value="128" note="12% vs last month" icon={ShoppingBag} /><MetricCard label="Awaiting shipment" value="24" note="4 need attention" icon={Package} tone="orange" /><MetricCard label="Fulfilled this month" value="1,284" note="8.4% vs last month" icon={CheckCircle2} tone="green" /></div>
    <div className="toolbar page-toolbar"><div className="view-switch"><button className={orderView === 'Kanban' ? 'selected' : ''} onClick={() => setOrderView('Kanban')}><LayoutDashboard size={13} /> Kanban</button><button className={orderView === 'Table' ? 'selected' : ''} onClick={() => setOrderView('Table')}><List size={13} /> Table</button></div><select className="filter-select" value={orderStatus} onChange={(event) => setOrderStatus(event.target.value)}><option>All orders</option>{['Processing', 'Shipped', 'Delivered', 'Refunded'].map((status) => <option key={status}>{status}</option>)}</select><button className="filter-button"><Clock3 size={13} /> Last 30 days</button><button className="secondary-button compact toolbar-export"><Download size={13} /> Export</button></div>
    {orderView === 'Table' ? <div className="table-card"><OrderTable orders={filteredOrders} /></div> : <div className="order-list-grid">{filteredOrders.map((order) => <article className="order-list-card" key={order.id}><OrderCard order={{ ...order, carrier: order.vendor }} /><div className="order-list-detail"><span>Customer</span><strong>{order.customer}</strong><span>Ordered</span><strong>{order.date}</strong><button className="text-link" onClick={() => navigate('/checkout')}>View payment <ArrowRight size={13} /></button></div></article>)}</div>}
  </>
}

function OrderTable({ orders: rows }) {
  return <div className="table-scroll"><table><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>PRODUCT</th><th>DATE</th><th>TOTAL</th><th>STATUS</th><th /></tr></thead><tbody>{rows.map((order) => <tr key={order.id}><td className="mono">{order.id}</td><td>{order.customer}</td><td><span className="inline-product">{order.emoji} {order.product}</span></td><td>{order.date}</td><td className="strong-cell">{money(order.amount)}</td><td><span className={`status-pill ${statusClass(order.status)}`}>{order.status}</span></td><td><button className="row-action" aria-label={`More actions for ${order.id}`}><MoreHorizontal size={16} /></button></td></tr>)}</tbody></table>{rows.length === 0 && <div className="empty-state">No orders match your search.</div>}</div>
}

function InventoryPage({ products: rows, allProducts, onAdd, onSelect }) {
  const lowStock = allProducts.filter((product) => product.stock > 0 && product.stock <= 5).length
  const outOfStock = allProducts.filter((product) => product.stock === 0).length
  return <>
    <PageHeading title="Inventory & variant management" description="Keep product availability, pricing, and vendor stock in sync." actions={<button className="text-link">Manage categories <ArrowRight size={13} /></button>} />
    <div className="metric-grid"><MetricCard label="Total products" value="4,280" note="+124 this week" icon={Package} /><MetricCard label="Out of stock" value={String(outOfStock || 37)} note="Needs restock now" icon={Boxes} tone="pink" trend="down" /><MetricCard label="Low stock (≤5)" value={String(lowStock || 112)} note="Reorder suggested" icon={Activity} tone="orange" trend="down" /><MetricCard label="Active categories" value="48" note="Across 6 vendors" icon={Store} tone="green" /></div>
    <div className="inventory-layout"><section className="table-card inventory-table-card"><div className="table-card-heading"><div><strong>Products</strong><span>Showing {rows.length} of 4,280 products</span></div><div className="table-heading-actions"><button className="filter-button"><Filter size={13} /> Filters</button><button className="icon-button"><MoreHorizontal size={17} /></button></div></div><div className="table-scroll"><table><thead><tr><th>IMAGE</th><th>PRODUCT & SKU</th><th>VENDOR</th><th>CATEGORY</th><th>STOCK LEVEL</th><th>PRICE</th><th /></tr></thead><tbody>{rows.map((product) => <tr key={product.id}><td><span className={`product-emoji ${product.color}`}>{product.emoji}</span></td><td><strong className="product-name-cell">{product.name}</strong><small className="sku-cell">{product.detail}</small></td><td>{product.vendor}</td><td><span className="category-chip">{product.category}</span></td><td><span className="stock-value"><span className={`stock-bar ${product.stock <= 5 ? 'stock-low' : ''}`}><i style={{ width: `${Math.min(product.stock * 2, 100)}%` }} /></span><strong>{product.stock}</strong><span className={`stock-label ${statusClass(product.status)}`}>{product.status === 'In stock' ? '' : product.status}</span></span></td><td className="strong-cell">{money(product.price)}</td><td><button className="row-action" aria-label={`Edit ${product.name}`} onClick={() => onSelect(product)}><ChevronRight size={15} /></button></td></tr>)}</tbody></table>{rows.length === 0 && <div className="empty-state">No products match your search.</div>}</div><div className="table-footer"><span>Showing {rows.length} products</span><div className="pagination"><button disabled aria-label="Previous page"><ChevronRight className="rotate-left" size={14} /></button><button className="current-page">1</button><button>2</button><button>3</button><button aria-label="Next page"><ChevronRight size={14} /></button></div></div></section><aside className="variant-panel"><div className="panel-heading"><span><strong>Variant preview</strong><small>Choose a product to edit stock.</small></span><span className="panel-dots">···</span></div><div className="variant-placeholder"><span className="product-emoji orange">👟</span><strong>Nike Air Zoom Pegasus 40</strong><small>NK-PG40-BLK</small><span className="category-chip">Footwear</span></div><span className="form-label">AVAILABLE SIZES</span><div className="size-options">{['40', '41', '42', '43', '44'].map((size, index) => <button className={index === 2 ? 'selected' : ''} key={size}>{size}</button>)}</div><span className="form-label">COLOR</span><div className="color-options"><i className="white-dot" /><i className="red-dot" /><i className="blue-dot" /><i className="gold-dot" /></div><label className="variant-label">BULK PRICE UPDATE<input defaultValue="+ 5%" /></label><button className="primary-button full-width" onClick={() => onSelect(allProducts[1])}>Edit selected product</button><div className="panel-footnote"><ShieldCheck size={13} /> Changes are saved to the product listing.</div></aside></div>
    <button className="floating-add" onClick={onAdd}><Plus size={15} /> Add product</button>
  </>
}

function VendorsPage({ goToCheckout }) {
  return <>
    <PageHeading title="Vendors" description="Manage seller accounts, commission rates, and payment readiness." actions={<button className="primary-button"><Plus size={15} /> Invite vendor</button>} />
    <div className="metric-grid three-metrics"><MetricCard label="Active vendors" value="48" note="5 awaiting payout" icon={Store} /><MetricCard label="Sales this month" value="$248,930" note="15.2% vs last month" icon={Banknote} tone="green" /><MetricCard label="Average commission" value="12.4%" note="Across active stores" icon={BadgePercent} tone="blue" /></div>
    <div className="vendor-cards">{vendors.map((vendor) => <article className="vendor-card" key={vendor.id}><div className="vendor-card-top"><span className={`vendor-avatar ${vendor.color}`}>{vendor.initials}</span><span className={`status-pill ${statusClass(vendor.status)}`}>{vendor.status}</span><button className="row-action"><MoreHorizontal size={16} /></button></div><h2>{vendor.name}</h2><p>{vendor.owner} · Verified seller</p><div className="vendor-stats"><span><small>Sales volume</small><strong>{money(vendor.sales)}</strong></span><span><small>Commission</small><strong>{vendor.rate}%</strong></span><span><small>Net payout</small><strong className="green-text">{money(vendor.payout)}</strong></span></div><button className="secondary-button full-width" onClick={() => goToCheckout(vendor)}>{vendor.status === 'Ready' ? 'Process payout' : 'View payout'} <ArrowRight size={14} /></button></article>)}</div>
  </>
}

function PayoutsPage({ goToCheckout }) {
  return <>
    <PageHeading title="Vendor commission payouts" description="Commission settlement · Oct 16 – Oct 31" actions={<button className="secondary-button"><Download size={14} /> Export report</button>} />
    <div className="metric-grid"><MetricCard label="Gross revenue" value="$248,930" note="+15.2% vs last cycle" icon={Banknote} /><MetricCard label="Commission earned (12%)" value="$29,871" note="Platform fees collected" icon={BadgePercent} tone="blue" /><MetricCard label="Payouts disbursed" value="$186,420" note="32 transfers completed" icon={Zap} tone="green" /><MetricCard label="Pending balance" value="$62,510" note="5 vendors awaiting" icon={Clock3} tone="orange" /></div>
    <div className="table-card payout-table"><div className="table-scroll"><table><thead><tr><th>VENDOR STORE</th><th>SALES VOLUME</th><th>RATE</th><th>NET PAYOUT</th><th>STATUS</th><th /></tr></thead><tbody>{vendors.map((vendor) => <tr key={vendor.id}><td><span className={`vendor-avatar small-avatar ${vendor.color}`}>{vendor.initials}</span><span className="vendor-name-cell"><strong>{vendor.name}</strong><small>{vendor.owner}</small></span></td><td className="strong-cell">{money(vendor.sales)}</td><td>{vendor.rate}%</td><td className="strong-cell green-text">{money(vendor.payout)}</td><td><span className={`status-pill ${statusClass(vendor.status)}`}>{vendor.status}</span></td><td><button className={vendor.status === 'Ready' ? 'primary-button compact' : 'secondary-button compact'} onClick={() => goToCheckout(vendor)}>{vendor.status === 'Ready' ? 'Process payout' : vendor.status === 'Paid' ? 'View receipt' : 'Review payout'}</button></td></tr>)}</tbody></table></div><div className="transfer-confirmation"><span className="snapshot-symbol violet"><LockKeyhole size={15} /></span><span><strong>Confirm bank transfer — TechHub Official · $74,104.00</strong><small>•••• 6582 · ACH transfer · 3–5 business days</small></span><button className="text-button cancel-transfer">Cancel</button><button className="primary-button transfer-button" onClick={() => goToCheckout(vendors[0])}><Check size={15} /> Confirm transfer</button></div></div>
  </>
}

function CheckoutPage({ vendor, navigate, onNotice }) {
  const [paymentMethod, setPaymentMethod] = useState('bank')
  const [complete, setComplete] = useState(false)
  const [reference, setReference] = useState('')
  const recipient = vendor || { name: 'Marketplace order · #ORD-8211', owner: 'Maya Chen', payout: 398, initials: 'NX', color: 'violet' }
  const finishCheckout = (event) => {
    event.preventDefault()
    setReference(`NEX-${Math.floor(100000 + Math.random() * 899999)}`)
    setComplete(true)
    onNotice('')
  }
  if (complete) return <div className="checkout-success"><span className="success-icon"><Check size={26} /></span><span className="eyebrow-label">DEMO CHECKOUT COMPLETE</span><h1>Transfer confirmed</h1><p>{money(recipient.payout)} is marked as a demo transfer for <strong>{recipient.name}</strong>.</p><div className="success-reference"><span>Reference</span><strong>{reference}</strong></div><div className="demo-warning"><ShieldCheck size={16} /> No real payment was processed. Connect a payment provider to enable live transfers.</div><button className="primary-button" onClick={() => navigate('/payouts')}>Back to payouts <ArrowRight size={15} /></button></div>
  return <div className="checkout-page"><PageHeading eyebrow="Payouts" title="Payment checkout" description="Review the transfer details before confirming." actions={<button className="secondary-button" onClick={() => navigate('/payouts')}><ChevronRight className="rotate-left" size={14} /> Back to payouts</button>} /><div className="checkout-grid"><form className="checkout-form" onSubmit={finishCheckout}><div className="checkout-section"><div className="checkout-section-title"><span className="checkout-step">1</span><span><strong>Payment method</strong><small>Choose how this transfer should be recorded.</small></span></div><label className={`payment-option ${paymentMethod === 'bank' ? 'payment-selected' : ''}`}><input type="radio" name="payment-method" value="bank" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} /><span className="payment-option-icon"><Banknote size={18} /></span><span><strong>Bank transfer (ACH)</strong><small>•••• 6582 · 3–5 business days</small></span><span className="radio-dot" /></label><label className={`payment-option ${paymentMethod === 'card' ? 'payment-selected' : ''}`}><input type="radio" name="payment-method" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} /><span className="payment-option-icon"><CreditCard size={18} /></span><span><strong>Card processor</strong><small>Requires a configured payment provider</small></span><span className="radio-dot" /></label></div><div className="checkout-section"><div className="checkout-section-title"><span className="checkout-step">2</span><span><strong>Transfer details</strong><small>Verify the recipient and payout amount.</small></span></div><label className="checkout-field">Recipient<input value={recipient.name} readOnly /></label><label className="checkout-field">Reference note<input defaultValue={`Marketplace settlement · ${recipient.owner || 'Vendor payout'}`} /></label></div><div className="demo-warning"><ShieldCheck size={15} /> Demo mode: confirming records a local UI state only. It does not charge a card or move funds.</div><button className="primary-button checkout-submit" type="submit"><LockKeyhole size={15} /> Confirm demo transfer <ArrowRight size={15} /></button></form><aside className="checkout-summary"><span className="summary-eyebrow">TRANSFER SUMMARY</span><div className="summary-recipient"><span className={`vendor-avatar ${recipient.color}`}>{recipient.initials}</span><span><strong>{recipient.name}</strong><small>{recipient.owner || 'Marketplace checkout'}</small></span></div><div className="summary-line"><span>Gross sales</span><strong>{money(recipient.sales || recipient.payout)}</strong></div>{vendor && <div className="summary-line"><span>Commission ({vendor.rate}%)</span><strong>−{money(vendor.sales - vendor.payout)}</strong></div>}<div className="summary-line"><span>Transfer fee</span><strong>$0.00</strong></div><div className="summary-total"><span>Total transfer</span><strong>{money(recipient.payout)}</strong></div><div className="summary-secure"><ShieldCheck size={14} /> Encrypted payment details</div><div className="checkout-lock"><LockKeyhole size={13} /> Payments powered by your configured provider</div></aside></div></div>
}

function MarketingPage({ onNotice }) {
  return <>
    <PageHeading title="Marketing" description="Create campaigns and reach customers across your marketplace." actions={<button className="primary-button" onClick={() => onNotice('Campaign draft created. Add your audience and schedule before publishing.')}><Plus size={15} /> Create campaign</button>} />
    <div className="metric-grid three-metrics"><MetricCard label="Campaign revenue" value="$18,420" note="18.6% vs last month" icon={Banknote} /><MetricCard label="Active campaigns" value="4" note="Across 3 channels" icon={Zap} tone="blue" /><MetricCard label="Average conversion" value="4.8%" note="+0.6% this month" icon={Activity} tone="green" /></div>
    <div className="marketing-feature"><div className="feature-icon"><BadgePercent size={21} /></div><div><span className="eyebrow-label">CAMPAIGN SPOTLIGHT</span><h2>Peak season is around the corner</h2><p>Reach shoppers with a curated offer and track every conversion from one place.</p><button className="primary-button" onClick={() => onNotice('Peak Season campaign draft created.')}>Start a campaign <ArrowRight size={14} /></button></div><div className="feature-spark">✳</div></div>
    <section className="content-card"><div className="card-title-row"><div><h2>Recent campaigns</h2><p>Your active promotions at a glance.</p></div><button className="secondary-button compact"><Filter size={13} /> Filter</button></div><div className="campaign-row"><span className="campaign-mark violet"><Zap size={15} /></span><span><strong>October tech essentials</strong><small>Email · Oct 20 – Nov 5</small></span><span className="status-pill ready">Active</span><strong>$8,240</strong></div><div className="campaign-row"><span className="campaign-mark orange"><BadgePercent size={15} /></span><span><strong>Autumn home refresh</strong><small>Discount · Oct 15 – Nov 15</small></span><span className="status-pill shipped">Active</span><strong>$5,910</strong></div><div className="campaign-row"><span className="campaign-mark blue"><Mail size={15} /></span><span><strong>New seller welcome</strong><small>Email · Ongoing</small></span><span className="status-pill paid">Scheduled</span><strong>$2,180</strong></div></section>
  </>
}

function AnalyticsPage() {
  const bars = [40, 58, 46, 75, 52, 66, 82, 59, 91, 70, 100, 78, 64, 87]
  return <>
    <PageHeading title="Analytics" description="Understand sales, marketplace activity, and vendor performance." actions={<button className="secondary-button"><Clock3 size={13} /> Last 30 days <ChevronDown size={13} /></button>} />
    <div className="metric-grid"><MetricCard label="Total revenue" value="$248,930" note="15.2% vs last month" icon={Banknote} /><MetricCard label="Orders" value="1,284" note="8.4% vs last month" icon={ShoppingBag} tone="blue" /><MetricCard label="Avg. order value" value="$193.87" note="6.1% vs last month" icon={Activity} tone="green" /><MetricCard label="Refund rate" value="1.8%" note="0.4% vs last month" icon={ArrowDownRight} tone="orange" trend="down" /></div>
    <div className="analytics-layout"><section className="content-card revenue-chart"><div className="card-title-row"><div><h2>Revenue over time</h2><p>Daily sales performance · USD</p></div><span className="chart-legend"><i /> This month</span></div><div className="chart-total">$248,930 <small><ArrowUpRight size={13} /> 15.2%</small></div><div className="bar-chart" aria-label="Revenue bar chart">{bars.map((bar, index) => <div className="chart-bar-wrap" key={`${bar}-${index}`}><i style={{ height: `${bar}%` }} /><span>{['Oct 1', '', 'Oct 7', '', 'Oct 14', '', 'Oct 21', '', 'Oct 28', '', 'Nov 1', '', 'Nov 7', ''][index]}</span></div>)}</div></section><section className="content-card source-card"><div className="card-title-row"><div><h2>Sales by channel</h2><p>Where orders come from</p></div></div><div className="donut-wrap"><div className="donut"><span><strong>1,284</strong><small>orders</small></span></div></div><div className="source-list"><span><i className="source-purple" /> Marketplace <strong>62%</strong></span><span><i className="source-blue" /> Direct store <strong>24%</strong></span><span><i className="source-green" /> Partner referrals <strong>14%</strong></span></div></section></div>
  </>
}

function SettingsPage({ onNotice }) {
  const [section, setSection] = useState('Store profile')
  const sections = ['Store profile', 'Notifications', 'Payments', 'Team access']
  return <>
    <PageHeading title="Settings" description="Manage your marketplace profile and account preferences." />
    <div className="settings-layout">
      <nav className="settings-nav" aria-label="Settings sections">
        {sections.map((item) => <button className={section === item ? 'active' : ''} aria-pressed={section === item} key={item} onClick={() => setSection(item)}>{item}</button>)}
      </nav>
      <section className="content-card settings-card">
        {section === 'Store profile' && <>
          <span className="eyebrow-label">STORE PROFILE</span><h2>Marketplace details</h2><p>These details are shown across your seller workspace.</p>
          <form className="settings-form" onSubmit={(event) => { event.preventDefault(); onNotice('Store settings saved.') }}>
            <label>Store name<input defaultValue="Nexus Global Store" /></label>
            <label>Support email<input type="email" defaultValue="support@nexusmarket.example" /></label>
            <label>Store description<textarea defaultValue="A curated marketplace for everyday essentials from trusted independent sellers." rows="3" /></label>
            <button className="primary-button" type="submit">Save changes</button>
          </form>
        </>}
        {section === 'Notifications' && <>
          <span className="eyebrow-label">NOTIFICATIONS</span><h2>Notification preferences</h2><p>Choose which marketplace updates you receive.</p>
          <div className="settings-form">
            <div className="setting-toggle"><span><strong>Order notifications</strong><small>Email me when new orders need attention.</small></span><input type="checkbox" defaultChecked aria-label="Order notifications" /></div>
            <div className="setting-toggle"><span><strong>Low stock alerts</strong><small>Get notified when products need a restock.</small></span><input type="checkbox" defaultChecked aria-label="Low stock alerts" /></div>
            <button className="primary-button" onClick={() => onNotice('Notification preferences saved.')}>Save preferences</button>
          </div>
        </>}
        {section === 'Payments' && <>
          <span className="eyebrow-label">PAYMENTS</span><h2>Payment provider</h2><p>Live payments and bank transfers require a server-side provider integration.</p>
          <div className="docs-callout"><ShieldCheck size={17} /><span><strong>No provider connected</strong><small>Checkout currently runs in demo mode and does not move real funds.</small></span></div>
          <button className="primary-button" onClick={() => onNotice('Configure provider credentials in your secure server environment before enabling live payments.')}>View setup requirements</button>
        </>}
        {section === 'Team access' && <>
          <span className="eyebrow-label">TEAM ACCESS</span><h2>Workspace members</h2><p>Review people with access to this seller workspace.</p>
          <div className="campaign-row"><span className="avatar">AR</span><span><strong>A. Rahman</strong><small>Marketplace admin · You</small></span><span className="status-pill ready">Admin</span></div>
          <div className="campaign-row"><span className="avatar">DP</span><span><strong>Daniel Park</strong><small>Vendor account manager</small></span><span className="status-pill shipped">Member</span></div>
          <button className="secondary-button" onClick={() => onNotice('Team invitations are ready to connect to your account service.')}><Plus size={14} /> Invite member</button>
        </>}
      </section>
    </div>
  </>
}

function HelpPage({ onNotice }) {
  return <>
    <PageHeading title="Help center" description="Find answers or get in touch with the marketplace support team." actions={<button className="primary-button" onClick={() => onNotice('Support request started. Our team will follow up by email.')}><CircleHelp size={15} /> Contact support</button>} />
    <div className="help-grid">{[{ icon: ShoppingBag, title: 'Orders & fulfillment', text: 'Manage shipments, cancellations, and customer updates.' }, { icon: Boxes, title: 'Inventory & products', text: 'Keep listings accurate and prevent stockouts.' }, { icon: Wallet, title: 'Payouts & billing', text: 'Understand settlements, fees, and transfer schedules.' }, { icon: Settings, title: 'Account settings', text: 'Update store details and team permissions.' }].map(({ icon: Icon, title, text }) => <button className="help-topic" key={title} onClick={() => onNotice(`${title}: Open the related section from the navigation menu.`)}><span className="help-topic-icon"><Icon size={18} /></span><strong>{title}</strong><p>{text}</p><span className="text-link">Explore guide <ArrowRight size={13} /></span></button>)}</div>
    <section className="content-card faq-card"><div className="card-title-row"><div><h2>Frequently asked questions</h2><p>Quick answers to common seller questions.</p></div></div>{[{ q: 'When are vendor payouts processed?', a: 'Payouts are prepared twice a month. Ready transfers appear in the Payouts section for review.' }, { q: 'How do I update product availability?', a: 'Open Inventory, select a product, update its stock count, and save your changes.' }, { q: 'Can I connect a payment provider?', a: 'Yes. Configure your payment gateway credentials in the secure server environment before enabling live checkout.' }].map(({ q, a }) => <details className="faq-item" key={q}><summary>{q}<ChevronDown size={15} /></summary><p>{a}</p></details>)}</section>
  </>
}

function ApiDocsPage({ onNotice }) {
  return <>
    <PageHeading title="API documentation" description="Connect your storefront and services to the Nexus Market API." actions={<span className="live-status"><span /> API status: operational</span>} />
    <div className="docs-layout"><nav className="docs-nav"><span className="eyebrow-label">GETTING STARTED</span><a className="active" href="#overview">Overview</a><a href="#authentication">Authentication</a><a href="#orders">Orders</a><a href="#inventory">Inventory</a><a href="#webhooks">Webhooks</a></nav><section className="content-card docs-content"><span className="eyebrow-label">GETTING STARTED</span><h2 id="overview">Marketplace API</h2><p>Use the API to connect order workflows, product inventory, and vendor settlement tools. Keep your API keys on your server and never expose them in browser code.</p><div className="docs-callout"><ShieldCheck size={17} /><span><strong>Keep credentials secure</strong><small>API keys and payment-provider secrets belong in server-side environment variables.</small></span></div><h3 id="authentication">Authentication</h3><p>Send your server-side API key using the Authorization header. The sample below uses a placeholder key.</p><pre><code>{`curl https://api.nexusmarket.example/v1/orders \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Accept: application/json"`}</code><button onClick={() => onNotice('Example shown with a placeholder key. Copy it from your secure documentation workspace.')}>Copy example</button></pre><h3 id="orders">Orders</h3><p>Use these resources to read marketplace data from your server.</p><div className="endpoint-row"><span className="method-chip get">GET</span><code>/v1/orders</code><span>List marketplace orders</span></div><div className="endpoint-row"><span className="method-chip get">GET</span><code>/v1/products</code><span>Read product catalog</span></div><h3 id="inventory">Inventory</h3><div className="endpoint-row"><span className="method-chip get">GET</span><code>/v1/inventory</code><span>Read current stock levels</span></div><h3 id="webhooks">Webhooks</h3><div className="endpoint-row"><span className="method-chip post">POST</span><code>/v1/webhooks</code><span>Register an event endpoint</span></div><button className="text-link" onClick={() => onNotice('Full API reference is available to authorized marketplace developers.')}>Request developer access <ArrowRight size={13} /></button></section></div>
  </>
}

function Modal({ title, onClose, children }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><h2 id="modal-title">{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={17} /></button></div>{children}</section></div>
}

export default App
