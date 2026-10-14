import { useState } from 'react'
import { ArrowLeft, MapPin, Save } from 'lucide-react'
import CustomSelect from '../components/CustomSelect'
import { adminApi } from '../services/api'

export default function EcommerceOrderDetailsPage({ onBack, order }) {
  const [orderState, setOrderState] = useState(order || null)
  const [form, setForm] = useState(() => ({
    status: order?.status || 'processing',
    cancellationReason: order?.cancellationReason || '',
    courierService: order?.courierService || '',
    trackingNumber: order?.trackingNumber || '',
    trackingUrl: order?.trackingUrl || '',
    estimatedDelivery: order?.estimatedDelivery ? new Date(order.estimatedDelivery).toISOString().slice(0, 10) : '',
  }))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    setError('')
    setNotice('')
  }

  const updateStatus = (status) => {
    setForm((current) => ({ ...current, status }))
    setError('')
    setNotice('')
  }

  const saveOrder = async (event) => {
    event.preventDefault()
    if (form.status === 'cancelled' && !form.cancellationReason.trim()) {
      setError('Enter a cancellation reason before cancelling this order.')
      return
    }
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const result = await adminApi.updateStoreOrder(orderState._id, {
        ...form,
        estimatedDelivery: form.estimatedDelivery || '',
      })
      setOrderState(result.data)
      setForm({
        status: result.data.status,
        cancellationReason: result.data.cancellationReason || '',
        courierService: result.data.courierService || '',
        trackingNumber: result.data.trackingNumber || '',
        trackingUrl: result.data.trackingUrl || '',
        estimatedDelivery: result.data.estimatedDelivery ? new Date(result.data.estimatedDelivery).toISOString().slice(0, 10) : '',
      })
      setNotice('Order status and delivery details were saved.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  const currentOrder = orderState || order

  return (
    <div className="order-details-page">
      <div className="page-header">
        <div className="header-left">
          {onBack && (
            <button className="btn-back" onClick={onBack}>
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <div>
            <h1 className="page-title">Order #{currentOrder?.orderNumber || 'Unavailable'}</h1>
            <p className="page-subtitle">Placed on {currentOrder?.createdAt ? new Date(currentOrder.createdAt).toLocaleString() : 'Date unavailable'}</p>
          </div>
        </div>
      </div>

      <div className="order-grid">
        {/* Main Content: Order Items & Delivery Address */}
        <div className="order-main-stack">
          {/* Purchased Items Card */}
          <div className="section-card">
            <div className="card-header">
              <h3>Order Line Items</h3>
            </div>
            <div className="order-items-list">
              {(currentOrder?.items || []).map((item, index) => <div className="item-row" key={item._id || `${item.name}-${index}`}>
                <div className="item-info">
                  <span className="item-name font-bold">{item.name}</span>
                </div>
                <div className="item-qty">Qty: {item.quantity}</div>
                <div className="item-price font-bold">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(item.price || 0) * Number(item.quantity || 0))}</div>
              </div>)}
              {!currentOrder?.items?.length && <p className="text-muted">No line items were returned for this order.</p>}
            </div>

            <div className="order-summary-footer">
              <div className="summary-line"><span>Subtotal:</span><span>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(currentOrder?.subtotal || 0))}</span></div>
              <div className="summary-line"><span>Shipping Fee:</span><span>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(currentOrder?.shippingFee || 0))}</span></div>
              <div className="summary-line total font-bold"><span>Total ({currentOrder?.paymentStatus || 'unpaid'}):</span><span>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(currentOrder?.total || 0))}</span></div>
            </div>
          </div>

          {/* Customer Shipping Address */}
          <div className="section-card">
            <div className="card-header">
              <h3>Shipping Address</h3>
            </div>
            <div className="shipping-box">
              <p className="font-bold">{currentOrder?.shippingAddress?.name || currentOrder?.user?.name || currentOrder?.user?.email || 'Customer details unavailable'}</p>
              <p className="text-muted"><MapPin size={14} /> {currentOrder?.shippingAddress?.address || 'Address unavailable'}{currentOrder?.shippingAddress?.state ? `, ${currentOrder.shippingAddress.state}` : ''}</p>
              <p className="text-muted">Phone: {currentOrder?.shippingAddress?.phone || 'Unavailable'}</p>
            </div>
          </div>
        </div>

        {/* Sidebar Controls: Status Update Form */}
        <div className="order-sidebar-stack">
          <div className="section-card order-status-card">
            <div className="card-header"><h3>Order Status</h3></div>
            <form className="status-form-body order-update-form" onSubmit={saveOrder}>
              <p><strong>Current payment:</strong> {currentOrder?.paymentStatus || 'unavailable'} · {currentOrder?.paymentMethod || 'unavailable'}</p>
              <label htmlFor="store-order-status">Fulfillment status</label>
              <CustomSelect
                id="store-order-status"
                ariaLabel="Fulfillment status"
                className="order-status-select"
                value={form.status}
                options={[
                  { value: 'processing', label: 'Processing' },
                  { value: 'shipped', label: 'Shipped' },
                  { value: 'delivered', label: 'Delivered' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
                onChange={updateStatus}
              />
              {form.status === 'cancelled' && <label htmlFor="store-order-cancellation-reason">Cancellation reason
                <textarea id="store-order-cancellation-reason" name="cancellationReason" value={form.cancellationReason} onChange={updateField} maxLength={500} required rows={3} placeholder="Explain why this order is being cancelled" />
              </label>}
              <label htmlFor="store-order-courier">Courier service</label>
              <input id="store-order-courier" name="courierService" value={form.courierService} onChange={updateField} maxLength={100} placeholder="e.g. GIG Logistics" />
              <label htmlFor="store-order-tracking">Tracking number</label>
              <input id="store-order-tracking" name="trackingNumber" value={form.trackingNumber} onChange={updateField} maxLength={120} placeholder="Courier tracking code" />
              <label htmlFor="store-order-tracking-url">Tracking link</label>
              <input id="store-order-tracking-url" name="trackingUrl" type="url" value={form.trackingUrl} onChange={updateField} maxLength={500} placeholder="https://courier.example/track/..." />
              <label htmlFor="store-order-delivery-date">Estimated delivery</label>
              <input id="store-order-delivery-date" name="estimatedDelivery" type="date" value={form.estimatedDelivery} onChange={updateField} />
              {error && <p className="order-update-error" role="alert">{error}</p>}
              {notice && <p className="order-update-success" role="status">{notice}</p>}
              <button type="submit" className="btn-primary order-update-submit" disabled={saving}>
                <Save size={15} /> {saving ? 'Saving…' : 'Save order updates'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}