import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, CheckCircle2, MessageSquare, ShieldCheck, X, XCircle } from 'lucide-react'
import { userApi } from '../services/api'
import { clearCart, getCart } from '../services/cart'
import { formatNaira } from '../utils/currency'
import CardzipLoader from '../components/CardzipLoader'

export default function CheckoutPage({ onNavigate }) {
  const [cart] = useState(getCart)
  const [paymentMethod, setPaymentMethod] = useState('wallet')
  const [showPaymentChoice, setShowPaymentChoice] = useState(() => getCart().length > 0)
  const [profile, setProfile] = useState(null)
  const [shipping, setShipping] = useState({ name: '', phone: '', address: '', state: '' })
  const [balance, setBalance] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [orderResult, setOrderResult] = useState(null)
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart])
  const total = subtotal + 1500

  useEffect(() => {
    Promise.all([userApi.account(), userApi.wallet()])
      .then(([account, wallet]) => {
        setProfile(account.data.user)
        setBalance(wallet.data)
        setShipping((current) => ({
          ...current,
          name: account.data.user.name || '',
          ...(account.data.user.bankAccount ? {} : {}),
        }))
      })
      .catch((requestError) => setError(requestError.message))
  }, [])

  const updateShipping = (event) => setShipping({ ...shipping, [event.target.name]: event.target.value })

  const placeOrder = async (event) => {
    event.preventDefault()
    if (!cart.length) {
      setError('Your cart is empty. Add an item before checkout.')
      return
    }
    setSubmitting(true)
    setError('')
    const body = {
      items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity, selectedColor: item.selectedColor })),
      shippingAddress: shipping,
      paymentMethod: paymentMethod === 'wallet' ? 'wallet' : 'paystack',
    }
    try {
      if (paymentMethod === 'wallet') {
        const result = await userApi.createStoreOrder(body)
        clearCart()
        setOrderResult({ success: true, orderNumber: result.data.orderNumber, message: 'Your wallet payment was successful and your order is confirmed.' })
      } else {
        const result = await userApi.initializeStorePayment({ ...body, paymentMethod: undefined })
        window.location.assign(result.data.authorizationUrl)
      }
    } catch (requestError) {
      setError(requestError.message)
      setOrderResult({ success: false, message: requestError.message })
      setSubmitting(false)
    }
  }

  return (
    <div className="page-wrapper"><div className="page-container">
      <div className="page-header-row"><div><div className="breadcrumb">Home / Shop / Checkout</div><h1 className="page-title">Checkout</h1><p className="page-subtitle">Confirm delivery and choose wallet or Paystack payment.</p></div><button type="button" className="btn-secondary-pill" onClick={() => onNavigate?.('/cart')}>Back to cart <ArrowUpRight size={14} /></button></div>
      <div className="stepper-bar"><span className="step completed">✓ Cart</span><span className="step active">01 Delivery & payment</span><span className="step">02 Confirmation</span></div>
      {error && <p className="wallet-notice error" role="alert">{error}</p>}
      {orderResult && <div className="payment-choice-backdrop order-result-backdrop">
        <section className="payment-choice-dialog order-result-dialog" role="dialog" aria-modal="true" aria-labelledby="order-result-title">
          <button type="button" className="bill-payment-close" aria-label="Close order result" onClick={() => orderResult.success ? onNavigate?.('/orders') : setOrderResult(null)}><X size={18} /></button>
          <div className={`bill-result-icon ${orderResult.success ? 'success' : 'failed'}`}>
            {orderResult.success ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
          </div>
          <h2 id="order-result-title">{orderResult.success ? 'Order placed successfully' : 'Order could not be placed'}</h2>
          <p>{orderResult.message}</p>
          {orderResult.orderNumber && <div className="order-result-reference"><span>Order number</span><strong>{orderResult.orderNumber}</strong></div>}
          <div className="order-result-actions">
            {orderResult.success ? <>
              <button type="button" className="btn-emerald-submit" onClick={() => onNavigate?.(`/orders/${encodeURIComponent(orderResult.orderNumber)}`)}>View order and receipt</button>
              <button type="button" className="btn-secondary-pill" onClick={() => onNavigate?.('/orders')}>Go to order history</button>
            </> : <button type="button" className="btn-emerald-submit" onClick={() => setOrderResult(null)}>Try again</button>}
          </div>
        </section>
      </div>}
      {showPaymentChoice && <div className="payment-choice-backdrop">
        <section className="payment-choice-dialog" role="dialog" aria-modal="true" aria-labelledby="payment-choice-title">
          <h2 id="payment-choice-title">Choose how to pay</h2>
          <p>Select a payment method for your order. You can review it again at checkout.</p>
          <div className="payment-options">
            <button type="button" className={`pay-option ${paymentMethod === 'wallet' ? 'selected' : ''}`} onClick={() => setPaymentMethod('wallet')}>
              <span className="pay-top"><span>Cardzip wallet</span><span className={`radio-dot ${paymentMethod === 'wallet' ? 'active' : ''}`} /></span>
              <span className="pay-sub">Balance: {balance ? formatNaira(balance.balance) : <CardzipLoader compact label="Loading wallet balance" />}</span>
            </button>
            <button type="button" className={`pay-option ${paymentMethod === 'paystack' ? 'selected' : ''}`} onClick={() => setPaymentMethod('paystack')}>
              <span className="pay-top"><span>Paystack</span><span className={`radio-dot ${paymentMethod === 'paystack' ? 'active' : ''}`} /></span>
              <span className="pay-sub">Visa · Mastercard · Verve</span>
            </button>
          </div>
          {paymentMethod === 'wallet' && balance && balance.balance < total && <p className="payment-choice-note" role="status">Your wallet balance is below the order total. Choose Paystack or add funds to your wallet.</p>}
          <button type="button" className="btn-emerald-submit" onClick={() => setShowPaymentChoice(false)}>Continue to checkout</button>
        </section>
      </div>}
      <form className="checkout-grid" onSubmit={placeOrder}>
        <div className="checkout-main-col">
          <section className="checkout-card"><h3 className="section-title">Delivery details</h3><p className="section-desc">Where should we send your order?</p>
            <div className="form-grid-2"><div className="field-group"><label htmlFor="delivery-name">Full name</label><input id="delivery-name" name="name" value={shipping.name} onChange={updateShipping} required /></div>
              <div className="field-group"><label htmlFor="delivery-phone">Phone number</label><input id="delivery-phone" name="phone" value={shipping.phone} onChange={updateShipping} required /></div></div>
            <div className="field-group"><label htmlFor="delivery-address">Street address</label><input id="delivery-address" name="address" value={shipping.address} onChange={updateShipping} required /></div>
            <div className="field-group"><label htmlFor="delivery-state">State / region</label><input id="delivery-state" name="state" value={shipping.state} onChange={updateShipping} required /></div>
            {profile && <span className="field-hint">Signed in as {profile.email}</span>}
          </section>
          <section className="checkout-card"><h3 className="section-title">Payment method</h3><p className="section-desc">Choose a secure way to pay for {formatNaira(total)}.</p>
            <div className="payment-options">
              <button type="button" className={`pay-option ${paymentMethod === 'wallet' ? 'selected' : ''}`} onClick={() => setPaymentMethod('wallet')}><span className="pay-top"><span>Cardzip wallet</span><span className={`radio-dot ${paymentMethod === 'wallet' ? 'active' : ''}`} /></span><span className="pay-sub">Balance: {balance ? formatNaira(balance.balance) : <CardzipLoader compact label="Loading wallet balance" />}</span></button>
              <button type="button" className={`pay-option ${paymentMethod === 'paystack' ? 'selected' : ''}`} onClick={() => setPaymentMethod('paystack')}><span className="pay-top"><span>Paystack</span><span className={`radio-dot ${paymentMethod === 'paystack' ? 'active' : ''}`} /></span><span className="pay-sub">Visa · Mastercard · Verve</span></button>
            </div>
            {paymentMethod === 'wallet' && balance && balance.balance < total && <p role="status">Your wallet balance is less than the order total; choose Paystack or add funds to your wallet.</p>}
          </section>
        </div>
        <aside className="checkout-sidebar-col"><div className="sidebar-card"><h3 className="sidebar-title">Your order</h3>
          {cart.map((item) => <div className="cost-row" key={item.productId}><span>{item.name} × {item.quantity}</span><span>{formatNaira(item.price * item.quantity)}</span></div>)}
          {!cart.length && <p>Your cart is empty.</p>}
          <div className="cost-breakdown"><div className="cost-row"><span>Subtotal</span><span>{formatNaira(subtotal)}</span></div><div className="cost-row"><span>Shipping</span><span>{formatNaira(1500)}</span></div><div className="cost-row total-row"><span>Total</span><span className="total-val">{formatNaira(total)}</span></div></div>
          <button type="submit" disabled={submitting || !cart.length || (paymentMethod === 'wallet' && balance !== null && balance.balance < total)} className="btn-emerald-submit">{submitting ? 'Processing…' : paymentMethod === 'wallet' ? 'Place wallet order' : 'Continue to Paystack'} <ArrowUpRight size={16} /></button>
        </div><div className="protection-card"><ShieldCheck size={18} className="green-txt" /><div><strong>Your checkout is protected</strong><p>Card payment is verified by Paystack. Your card details are never stored here.</p></div></div><div className="support-card-dark"><h4>Need a hand with your order?</h4><p>Contact Cardzip support if checkout fails.</p><a href="mailto:support@cardzip.ng" className="chat-link"><MessageSquare size={14} /> Email support ↗</a></div></aside>
      </form>
    </div></div>
  )
}
