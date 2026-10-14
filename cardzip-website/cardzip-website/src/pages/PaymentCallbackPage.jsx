import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckCircle2, Clock3, X, XCircle } from 'lucide-react'
import { billApi, sms4Api, userApi } from '../services/api'
import { clearCart } from '../services/cart'

export default function PaymentCallbackPage({ onNavigate }) {
  const reference = new URLSearchParams(window.location.search).get('reference')
  const purpose = new URLSearchParams(window.location.search).get('purpose')
  const [status, setStatus] = useState(() => reference ? 'verifying' : 'failed')
  const [message, setMessage] = useState(() => reference
    ? 'Confirming your payment securely with Paystack. Please do not close this page.'
    : 'The payment reference is missing. Your wallet has not been credited.')
  const [orderPayment, setOrderPayment] = useState(purpose === 'store_order')
  const [orderNumber, setOrderNumber] = useState('')
  const [virtualNumberPayment, setVirtualNumberPayment] = useState(purpose === 'virtual_number')
  const [virtualNumber, setVirtualNumber] = useState('')
  const verificationStarted = useRef(false)

  const verifyVirtualNumber = useCallback(async () => {
    if (!reference) return
    setStatus('verifying')
    try {
      const result = await sms4Api.verifyPaystack({ reference })
      const transaction = result.data
      if (transaction?.status === 'completed') {
        setStatus('success')
        setVirtualNumber(transaction.phoneNumber || '')
        setMessage('Paystack confirmed your payment and your virtual number is ready.')
      } else {
        setStatus('pending')
        setMessage('Your payment is confirmed and number fulfillment is still processing. Verify again shortly.')
      }
    } catch (error) {
      if (error.data?.status === 'failed') {
        setStatus('failed')
        setMessage(error.message || 'The virtual-number payment could not be completed.')
      } else {
        setStatus('pending')
        setMessage(`${error.message || 'Could not confirm the virtual-number payment right now.'} You can verify again shortly.`)
      }
    }
  }, [reference])

  useEffect(() => {
    if (!reference || verificationStarted.current) return
    verificationStarted.current = true
    if (purpose === 'bill_payment') {
      billApi.verifyPaystack({ reference })
        .then((result) => {
          const billPayment = result.data?.billPayment
          const paymentStatus = billPayment?.status === 'completed' ? 'success' : 'pending'
          sessionStorage.setItem('cardzip-bill-payment-result', JSON.stringify({ status: paymentStatus, billPayment, message: result.message }))
          setStatus(paymentStatus === 'success' ? 'success' : 'verifying')
          setMessage(paymentStatus === 'success' ? 'Bill payment confirmed. Your receipt is ready.' : 'Payment received. The provider is still processing your bill.')
        })
        .catch((error) => {
          sessionStorage.setItem('cardzip-bill-payment-result', JSON.stringify({
            status: 'failed',
            message: error.message,
            billPayment: error.data?.billPayment,
          }))
          setStatus('failed')
          setMessage(error.message)
        })
      return
    }
    if (purpose === 'virtual_number') {
      setVirtualNumberPayment(true)
      void verifyVirtualNumber()
      return
    }
    userApi.verifyFunding({ reference })
      .then((result) => {
        const isStoreOrder = Boolean(result.data?.order)
        setOrderPayment(isStoreOrder)
        if (isStoreOrder) {
          clearCart()
          setOrderNumber(result.data.order.orderNumber)
        }
        setStatus('success')
        setMessage(isStoreOrder
          ? `Payment confirmed. Order ${result.data.order.orderNumber} is now paid.`
          : 'Payment confirmed. Your wallet balance has been updated.')
      })
      .catch((error) => {
        setOrderPayment(purpose === 'store_order')
        setStatus('failed')
        setMessage(error.message)
      })
  }, [reference, purpose, onNavigate, verifyVirtualNumber])

  return (
    <div className="page-wrapper"><div className="page-container">
      <section className="wallet-form-card" role="status">
        <h1 className="page-title">{status === 'success' ? 'Payment complete' : status === 'failed' ? 'Payment not confirmed' : status === 'pending' ? 'Payment processing' : 'Verifying payment'}</h1>
        <p className="page-subtitle">{message}</p>
        <button type="button" className="btn-emerald-submit" onClick={() => onNavigate?.(purpose === 'bill_payment' ? '/bills' : virtualNumberPayment ? '/virtual-numbers' : status === 'success' && orderPayment ? '/orders' : status === 'success' ? '/wallet' : '/add-money')}>
          {purpose === 'bill_payment' ? 'Return to bills' : virtualNumberPayment ? 'View virtual numbers' : status === 'success' && orderPayment ? 'View orders' : status === 'success' ? 'View wallet' : 'Return to wallet funding'}
        </button>
      </section>
      {virtualNumberPayment && status !== 'verifying' && <div className="payment-choice-backdrop order-result-backdrop">
        <section className="payment-choice-dialog order-result-dialog" role="dialog" aria-modal="true" aria-labelledby="virtual-number-payment-title">
          <div className={`bill-result-icon ${status === 'success' ? 'success' : status === 'pending' ? 'pending' : 'failed'}`}>
            {status === 'success' ? <CheckCircle2 size={22} /> : status === 'pending' ? <Clock3 size={22} /> : <XCircle size={22} />}
          </div>
          <h2 id="virtual-number-payment-title">{status === 'success' ? 'Virtual number ready' : status === 'pending' ? 'Rental is processing' : 'Virtual-number payment not completed'}</h2>
          <p>{message}</p>
          {virtualNumber && <div className="order-result-reference"><span>Your new number</span><strong>{virtualNumber}</strong></div>}
          <div className="order-result-actions">
            {status === 'pending' && <button type="button" className="btn-emerald-submit" onClick={() => void verifyVirtualNumber()}>Verify again</button>}
            <button type="button" className="btn-emerald-submit" onClick={() => onNavigate?.('/virtual-numbers')}>View virtual numbers</button>
            <button type="button" className="btn-secondary-pill" onClick={() => onNavigate?.('/virtual-numbers')}>Close</button>
          </div>
          <button type="button" className="bill-payment-close" aria-label="Close payment result" onClick={() => onNavigate?.('/virtual-numbers')}><X size={18} /></button>
        </section>
      </div>}
      {orderPayment && status !== 'verifying' && <div className="payment-choice-backdrop order-result-backdrop">
        <section className="payment-choice-dialog order-result-dialog" role="dialog" aria-modal="true" aria-labelledby="paystack-order-result-title">
          <div className={`bill-result-icon ${status === 'success' ? 'success' : 'failed'}`}>
            {status === 'success' ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
          </div>
          <h2 id="paystack-order-result-title">{status === 'success' ? 'Order placed successfully' : 'Order payment could not be confirmed'}</h2>
          <p>{message}</p>
          {orderNumber && <div className="order-result-reference"><span>Order number</span><strong>{orderNumber}</strong></div>}
          <div className="order-result-actions">
            {status === 'success' && orderNumber
              ? <button type="button" className="btn-emerald-submit" onClick={() => onNavigate?.(`/orders/${encodeURIComponent(orderNumber)}`)}>View order and receipt</button>
              : <button type="button" className="btn-emerald-submit" onClick={() => onNavigate?.('/orders')}>Go to order history</button>}
            <button type="button" className="btn-secondary-pill" onClick={() => onNavigate?.('/shop')}>Return to shop</button>
          </div>
          <button type="button" className="bill-payment-close" aria-label="Close order result" onClick={() => onNavigate?.(status === 'success' ? '/orders' : '/shop')}><X size={18} /></button>
        </section>
      </div>}
    </div></div>
  )
}
