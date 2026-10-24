import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Download,
  MapPin,
  MessageSquare,
  Package,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  Truck,
  XCircle,
} from 'lucide-react'
import { userApi } from '../services/api'
import { formatNaira } from '../utils/currency'

const formatDate = (value) => value ? new Date(value).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : '—'
const statusText = (status) => ({
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}[status] || status || 'Unknown')

export default function TrackReceiptPage({ orderId, onNavigate }) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloadError, setDownloadError] = useState('')
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    let active = true
    userApi.storeOrder(decodeURIComponent(orderId))
      .then((result) => {
        if (active) setOrder(result.data)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [orderId])

  const downloadReceipt = async () => {
    if (order?.paymentStatus !== 'paid') {
      setDownloadError('A receipt is available after payment is confirmed.')
      return
    }
    setDownloading(true)
    setDownloadError('')
    try {
      const { jsPDF } = await import('jspdf')
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
      const left = 20
      const right = 190
      let y = 24
      const paid = order.paymentStatus === 'paid'
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(20)
      pdf.setTextColor(4, 120, 87)
      pdf.text('Cardzip', left, y)
      pdf.setFontSize(9)
      pdf.setTextColor(100, 116, 139)
      pdf.text('E-COMMERCE RECEIPT', left, y + 7)
      pdf.setFontSize(10)
      pdf.setTextColor(paid ? 4 : 180, paid ? 120 : 83, paid ? 87 : 9)
      pdf.text(`PAYMENT ${String(order.paymentStatus || 'unknown').toUpperCase()}`, right, y, { align: 'right' })
      y += 21
      pdf.setDrawColor(226, 232, 240)
      pdf.line(left, y, right, y)
      y += 12
      pdf.setFontSize(12)
      pdf.setTextColor(15, 23, 42)
      pdf.text(`Order ${order.orderNumber}`, left, y)
      y += 7
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(9)
      pdf.setTextColor(100, 116, 139)
      pdf.text(`Placed ${formatDate(order.createdAt)}`, left, y)
      pdf.text(`Order status: ${statusText(order.status)}`, right, y, { align: 'right' })
      y += 12

      const addRow = (label, value, bold = false) => {
        const lines = pdf.splitTextToSize(String(value || '—'), right - left - 62)
        const height = Math.max(9, lines.length * 5 + 4)
        if (y + height > 275) {
          pdf.addPage()
          y = 20
        }
        pdf.setDrawColor(237, 241, 244)
        pdf.line(left, y + height, right, y + height)
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(9)
        pdf.setTextColor(100, 116, 139)
        pdf.text(label, left + 2, y + 6)
        pdf.setFont('helvetica', bold ? 'bold' : 'normal')
        pdf.setTextColor(15, 23, 42)
        pdf.text(lines, right - 2, y + 6, { align: 'right' })
        y += height
      }

      addRow('Payment method', order.paymentMethod === 'paystack' ? 'Paystack' : 'Cardzip wallet')
      addRow('Subtotal', formatNaira(order.subtotal, { minimumFractionDigits: 2 }))
      addRow('Delivery', formatNaira(order.shippingFee, { minimumFractionDigits: 2 }))
      addRow('Total paid', formatNaira(order.total, { minimumFractionDigits: 2 }), true)
      y += 5
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(10)
      pdf.setTextColor(15, 23, 42)
      pdf.text('ITEMS', left, y)
      y += 7
      for (const item of order.items || []) {
        addRow(`${item.name} × ${item.quantity}`, formatNaira(item.price * item.quantity, { minimumFractionDigits: 2 }))
      }
      const address = order.shippingAddress
      if (address) {
        y += 5
        addRow('Delivery recipient', address.name)
        addRow('Phone', address.phone)
        addRow('Delivery address', `${address.address}, ${address.state}`)
      }
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(8)
      pdf.setTextColor(100, 116, 139)
      pdf.text('Thank you for shopping with Cardzip. Keep this receipt for your records.', 105, Math.min(y + 12, 285), { align: 'center' })
      const safeNumber = String(order.orderNumber || '').replace(/[^a-z0-9_-]/gi, '')
      pdf.save(`cardzip-order-receipt-${safeNumber || 'order'}.pdf`)
    } catch (downloadFailure) {
      console.error('E-commerce receipt PDF could not be generated:', downloadFailure)
      setDownloadError('Could not generate your PDF receipt. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return <main className="page-wrapper"><div className="page-container product-details-loading" role="status"><span className="session-spinner" aria-hidden="true" />Loading order…</div></main>
  }

  if (error || !order) {
    return (
      <div className="page-wrapper">
        <div className="page-container track-not-found">
          <div className="breadcrumb">Home / Shop / Order tracking</div>
          <Package size={32} className="green-txt" />
          <h1 className="page-title">{error ? 'Could not load this order.' : 'We couldn’t find that order.'}</h1>
          <p className="page-subtitle">{error || 'Check the order reference and try again, or return to your order history.'}</p>
          <button type="button" className="btn-emerald-submit" onClick={() => onNavigate?.('/orders')}><ArrowLeft size={15} /> Back to order history</button>
        </div>
      </div>
    )
  }

  const status = order.status
  const statusIcon = status === 'delivered' ? <PackageCheck size={15} /> : status === 'cancelled' ? <XCircle size={15} /> : status === 'shipped' ? <Truck size={15} /> : <Clock3 size={15} />
  const address = order.shippingAddress

  return (
    <div className="page-wrapper track-receipt-page">
      <div className="page-container">
        <div className="track-page-topline reveal">
          <div>
            <div className="breadcrumb">Home / Shop / Order History / {order.orderNumber}</div>
            <button type="button" className="track-back-link" onClick={() => onNavigate?.('/orders')}><ArrowLeft size={14} /> Back to all orders</button>
          </div>
          <button type="button" className="track-print-button" onClick={downloadReceipt} disabled={downloading || order.paymentStatus !== 'paid'}>
            <Download size={15} /> {downloading ? 'Preparing PDF…' : order.paymentStatus === 'paid' ? 'Download PDF receipt' : 'Receipt available after payment'}
          </button>
        </div>

        <header className="track-order-hero reveal">
          <div className="track-order-hero-main">
            <span className={`track-order-status ${status === 'delivered' ? 'delivered' : status === 'cancelled' ? 'cancelled' : 'transit'}`}>
              {statusIcon}{statusText(status).toUpperCase()}
            </span>
            <h1>{status === 'delivered' ? 'Your order has arrived.' : status === 'cancelled' ? 'This order was cancelled.' : status === 'shipped' ? 'Your order has shipped.' : 'Your order is being prepared.'}</h1>
            <p>{order.courierService ? `Courier: ${order.courierService}.` : 'Delivery tracking details will appear here once the order is dispatched.'}{order.estimatedDelivery ? ` Estimated delivery: ${formatDate(order.estimatedDelivery)}.` : ''}</p>
          </div>
          <div className="track-order-reference">
            <span>ORDER NUMBER</span><strong>{order.orderNumber}</strong><small>Placed {formatDate(order.createdAt)}</small>
          </div>
        </header>

        <div className="track-receipt-layout">
          <div className="track-main-column">
            <section className="track-card track-progress-card reveal">
              <div className="track-section-header"><div><h2>Order status</h2><p>Latest fulfilment status recorded for your order.</p></div></div>
              <div className="track-number-row"><span>Current status</span><strong>{statusText(status)}</strong></div>
              {status === 'cancelled' && <div className="track-cancellation-reason"><strong>Cancellation reason</strong><p>{order.cancellationReason || 'No reason was provided. Contact support if you need help.'}</p></div>}
              {order.courierService && <div className="track-number-row"><span>Courier service</span><strong>{order.courierService}</strong></div>}
              {order.trackingNumber && <div className="track-number-row"><span>Tracking number</span><strong>{order.trackingNumber}</strong></div>}
              {order.estimatedDelivery && <div className="track-number-row"><span>Estimated delivery</span><strong>{formatDate(order.estimatedDelivery)}</strong></div>}
              {order.trackingUrl && <a className="track-courier-link" href={order.trackingUrl} target="_blank" rel="noreferrer">Track with {order.courierService || 'courier'} ↗</a>}
              <ol className="track-timeline">
                <li className="track-timeline-step complete">
                  <span className="track-timeline-icon"><CheckCircle2 size={16} /></span>
                  <span className="track-timeline-copy"><span className="track-timeline-title">Order placed</span><span className="track-timeline-detail">Order received by Cardzip</span></span>
                  <time>{formatDate(order.createdAt)}</time>
                </li>
                <li className={`track-timeline-step ${status === 'shipped' || status === 'delivered' ? 'complete' : ''}`}>
                  <span className="track-timeline-icon"><Truck size={16} /></span>
                  <span className="track-timeline-copy"><span className="track-timeline-title">Shipped</span><span className="track-timeline-detail">{status === 'shipped' || status === 'delivered' ? `${order.courierService || 'Courier'}${order.trackingNumber ? ` · ${order.trackingNumber}` : ''}` : 'Awaiting dispatch'}</span></span>
                  <time>—</time>
                </li>
                <li className={`track-timeline-step ${status === 'delivered' ? 'complete' : ''}`}>
                  <span className="track-timeline-icon"><PackageCheck size={16} /></span>
                  <span className="track-timeline-copy"><span className="track-timeline-title">Delivered</span><span className="track-timeline-detail">{status === 'delivered' ? 'Order marked as delivered' : 'Not yet delivered'}</span></span>
                  <time>—</time>
                </li>
                {status === 'cancelled' && <li className="track-timeline-step complete"><span className="track-timeline-icon"><XCircle size={16} /></span><span className="track-timeline-copy"><span className="track-timeline-title">Cancelled</span><span className="track-timeline-detail">Order marked as cancelled</span></span><time>—</time></li>}
              </ol>
            </section>

            <section className="track-card track-products-card reveal">
              <div className="track-section-header"><div><h2>Items in this order</h2><p>{(order.items || []).length} product line(s)</p></div></div>
              <div className="track-order-items">
                {(order.items || []).map((item) => (
                  <div className="track-order-item" key={item._id || item.product?._id || item.name}>
                    <div className="track-product-thumb">{item.image || item.product?.image ? <img src={item.image || item.product.image} alt="" /> : <Package size={20} />}</div>
                    <span className="track-product-copy"><strong>{item.name}</strong><small>Qty {item.quantity}</small></span>
                    <strong className="track-product-price">{formatNaira(item.price * item.quantity, { minimumFractionDigits: 2 })}</strong>
                  </div>
                ))}
              </div>
            </section>

            {address && <section className="track-address-card reveal"><MapPin size={18} /><div><strong>Delivery address</strong><p>{address.name}<br />{address.phone}<br />{address.address}, {address.state}</p></div></section>}
          </div>

          <aside className="track-side-column">
            <section className="track-card track-receipt-card reveal">
              <div className="track-receipt-heading"><ReceiptText size={18} /><div><h2>Payment receipt</h2><p>Order {order.orderNumber}</p></div></div>
              <div className={`track-receipt-status ${order.paymentStatus}`}><ShieldCheck size={15} /><span>Payment {String(order.paymentStatus || 'unknown').toLowerCase()}</span></div>
              <div className="track-receipt-lines">
                <div><span>Subtotal</span><strong>{formatNaira(order.subtotal, { minimumFractionDigits: 2 })}</strong></div>
                <div><span>Delivery</span><strong>{formatNaira(order.shippingFee, { minimumFractionDigits: 2 })}</strong></div>
                <div className="track-receipt-total"><span>{order.paymentStatus === 'paid' ? 'Total paid' : 'Order total'}</span><strong>{formatNaira(order.total, { minimumFractionDigits: 2 })}</strong></div>
              </div>
              <div className="track-payment-method"><span>Paid with</span><strong>{order.paymentMethod === 'paystack' ? 'Paystack' : 'Cardzip wallet'}</strong></div>
              {downloadError && <p className="wallet-notice error" role="alert">{downloadError}</p>}
              <button type="button" className="track-download-receipt" onClick={downloadReceipt} disabled={downloading || order.paymentStatus !== 'paid'}><Download size={15} /> {downloading ? 'Preparing PDF…' : order.paymentStatus === 'paid' ? 'Download PDF receipt' : 'Receipt available after payment'}</button>
            </section>

            <section className="track-help-card reveal"><MessageSquare size={18} /><h3>Need a hand?</h3><p>Our support team can help with delivery, returns or questions about this order.</p><a href={`mailto:support@cardzip.ng?subject=Help%20with%20${encodeURIComponent(order.orderNumber)}`}>Contact support <span>→</span></a></section>
          </aside>
        </div>
      </div>
      <footer className="simple-footer"><span>© 2026 Cardzip. All rights reserved.</span><div className="footer-right"><a href="#privacy">Privacy policy</a><a href="#terms">Terms of service</a></div></footer>
    </div>
  )
}
