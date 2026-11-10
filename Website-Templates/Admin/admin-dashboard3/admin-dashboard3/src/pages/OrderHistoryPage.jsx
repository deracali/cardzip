import { useEffect, useState } from 'react'
import { ArrowUpRight, CheckCircle2, Package, Truck } from 'lucide-react'
import { userApi } from '../services/api'
import { formatNaira } from '../utils/currency'

const formatDate = (value) => value ? new Date(value).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : '—'
const statusLabel = (status) => ({
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}[status] || status || 'Unknown')

export default function OrderHistoryPage({ onNavigate }) {
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({ totalOrders: 0, inProgress: 0, delivered: 0 })
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const changePage = (nextPage) => {
    setLoading(true)
    setError('')
    setPage(nextPage)
  }

  useEffect(() => {
    let active = true
    userApi.storeOrders(`?page=${page}&limit=10`)
      .then((result) => {
        if (!active) return
        setOrders(Array.isArray(result.data) ? result.data : [])
        setStats(result.stats || { totalOrders: 0, inProgress: 0, delivered: 0 })
        setPagination(result.pagination || null)
        setError('')
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [page])

  return (
    <div className="page-wrapper">
      <div className="page-container">
        <div className="page-header-row">
          <div>
            <div className="breadcrumb">Home / Shop / Order History</div>
            <h1 className="page-title">Every order, all in one place.</h1>
            <p className="page-subtitle">Track your orders and download receipts for completed purchases.</p>
          </div>
          <button type="button" className="btn-secondary-pill" onClick={() => onNavigate?.('/shop')}>
            <span>Continue shopping</span><ArrowUpRight size={14} />
          </button>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <Package size={20} className="green-txt" />
            <div><span className="stat-label">Total orders</span><h2 className="stat-val">{stats.totalOrders}</h2></div>
          </div>
          <div className="stat-card">
            <Truck size={20} className="orange-txt" />
            <div><span className="stat-label">In progress</span><h2 className="stat-val">{stats.inProgress}</h2></div>
          </div>
          <div className="stat-card">
            <CheckCircle2 size={20} className="green-txt" />
            <div><span className="stat-label">Delivered</span><h2 className="stat-val">{stats.delivered}</h2></div>
          </div>
        </div>

        {error && <p className="wallet-notice error" role="alert">{error}</p>}
        <div className="orders-table-card">
          <div className="table-top-bar">
            <div className="tabs-list"><span className="tab active">Your orders ({stats.totalOrders})</span></div>
          </div>
          <div className="table-responsive">
            <table className="orders-table">
              <thead>
                <tr><th>ORDER NUMBER</th><th>ITEMS</th><th>DATE</th><th>TOTAL</th><th>STATUS</th><th>ACTION</th></tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const summary = (order.items || []).map((item) => `${item.name} × ${item.quantity}`).join(', ')
                  return (
                    <tr key={order._id}>
                      <td className="order-num">{order.orderNumber}</td>
                      <td><span className="item-title">{summary || 'Order items'}</span><span className="item-sub">{order.paymentMethod === 'paystack' ? 'Paystack' : 'Cardzip wallet'}</span></td>
                      <td className="date-txt">{formatDate(order.createdAt)}</td>
                      <td className="price-txt">{formatNaira(order.total)}</td>
                      <td>
                        <span className={`status-pill ${String(order.status || '').toLowerCase()}`}>{statusLabel(order.status)}</span>
                        {order.courierService && <span className="order-courier-summary">{order.courierService}{order.trackingNumber ? ` · ${order.trackingNumber}` : ''}</span>}
                        {order.estimatedDelivery && <span className="order-courier-summary">Est. {new Date(order.estimatedDelivery).toLocaleDateString('en-NG')}</span>}
                      </td>
                      <td><button type="button" className="btn-action" onClick={() => onNavigate?.(`/orders/${encodeURIComponent(order.orderNumber)}`)}>Track / receipt ↗</button></td>
                    </tr>
                  )
                })}
                {!loading && !error && orders.length === 0 && <tr><td colSpan="6" className="wallet-empty-state">You have not placed any orders yet.</td></tr>}
                {loading && <tr><td colSpan="6" className="wallet-empty-state">Loading your order history…</td></tr>}
              </tbody>
            </table>
          </div>
          {pagination && (
            <div className="table-footer-pagination order-history-pagination">
              <span>Showing {orders.length} of {pagination.totalItems} orders</span>
              <div className="pagi-btns">
                <button type="button" className="pagi-btn" disabled={!pagination.hasPreviousPage || loading} onClick={() => changePage(page - 1)}>Previous</button>
                <span>Page {pagination.page} of {Math.max(pagination.totalPages, 1)}</span>
                <button type="button" className="pagi-btn" disabled={!pagination.hasNextPage || loading} onClick={() => changePage(page + 1)}>Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <footer className="simple-footer">
        <span>© 2026 Cardzip. All rights reserved.</span>
        <div className="footer-right"><a href="#privacy">Privacy policy</a><a href="#terms">Terms of service</a></div>
      </footer>
    </div>
  )
}
