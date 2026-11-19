import { useEffect, useState } from 'react'
import { ArrowRight, CheckCircle2, LoaderCircle, ShieldCheck, XCircle } from 'lucide-react'
import PageShell from '../components/PageShell'
import { escapesApi } from '../services/escapesApi'

export default function PaymentCallbackPage() {
  const [state, setState] = useState(() => new URLSearchParams(window.location.search).get('cancelled') === '1' ? 'cancelled' : 'verifying')
  const [message, setMessage] = useState('')
  const [reference, setReference] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('cancelled') === '1') return
    const provider = params.get('provider')
    const reservationId = params.get('bookingId')
    const paymentReference = provider === 'stripe'
      ? params.get('session_id')
      : params.get('reference') || params.get('trxref')
    if (!provider || !reservationId || !paymentReference) {
      Promise.resolve().then(() => {
        setState('error')
        setMessage('The payment return did not include a reservation and provider reference.')
      })
      return
    }

    let active = true
    escapesApi.verifyBooking({ reservationId, provider, reference: paymentReference })
      .then((result) => {
        if (!active) return
        if (result.verified) {
          setReference(result.reservation.reference)
          setState('paid')
        } else {
          setState('pending')
          setMessage('The provider has not confirmed payment yet. You can check your trips again shortly.')
        }
      })
      .catch((error) => {
        if (!active) return
        setState('error')
        setMessage(error instanceof Error ? error.message : 'Payment verification could not be completed.')
      })
    return () => { active = false }
  }, [])

  return (
    <PageShell>
      <main className="page-main payment-result">
        <section className="payment-result-card">
          {state === 'verifying' ? <LoaderCircle size={28} className="payment-spinner" /> : state === 'paid' ? <CheckCircle2 size={30} /> : state === 'cancelled' || state === 'error' ? <XCircle size={30} /> : <ShieldCheck size={30} />}
          <span className="eyebrow payment-result-eyebrow">ESCAPES SECURE CHECKOUT</span>
          <h1>{state === 'verifying' ? 'Verifying your payment…' : state === 'paid' ? 'Your stay is confirmed.' : state === 'cancelled' ? 'Checkout was cancelled.' : state === 'pending' ? 'Payment confirmation is pending.' : 'We could not confirm payment.'}</h1>
          <p>{state === 'paid' ? `Payment was verified for reservation ${reference}. Your stay is now confirmed.` : state === 'cancelled' ? 'No confirmed payment was received. You can return to your account or start a new reservation.' : message || 'We are checking the payment provider’s confirmation. Please keep this page open.'}</p>
          {state === 'paid' && <p className="payment-result-note"><ShieldCheck size={15} /> Payment verified with the provider. Your reservation is available in your account.</p>}
          <div className="payment-result-actions">
            <a className="button button-primary" href="/client/dashboard">View my trips <ArrowRight size={15} /></a>
            <a className="outline-button" href="/stays">Browse stays</a>
          </div>
        </section>
      </main>
    </PageShell>
  )
}
