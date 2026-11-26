"use client";

import { useEffect, useRef, useState } from 'react'
import { CircleCheck, CircleX, LoaderCircle } from 'lucide-react'
import PageShell from '../components/PageShell'
import { getNGOSession, ngoApi } from '../services/ngoApi'

export default function PaymentCallbackPage({ reference }) {
  const [result, setResult] = useState({ status: 'checking', message: 'Verifying your payment securely…' })
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    const session = getNGOSession()
    if (!session?.token || session.user.role !== 'client') {
      window.location.replace(`/signin?redirect=${encodeURIComponent(`/payment/callback?reference=${encodeURIComponent(reference)}`)}`)
      return
    }
    if (!reference) {
      setResult({ status: 'failed', message: 'Paystack did not return a payment reference. Check your payment history before trying again.' })
      return
    }
    ngoApi.verifyPayment(reference)
      .then(({ donation }) => setResult({
        status: 'success',
        message: `Your ${donation.currency || 'USD'} ${Number(donation.amount).toFixed(2)} payment is verified.`,
      }))
      .catch((error) => setResult({
        status: 'failed',
        message: error instanceof Error ? error.message : 'We could not verify this payment. Check your payment history or contact support.',
      }))
  }, [reference])

  const success = result.status === 'success'
  return <PageShell><main className="page-main payment-result-page">
    <section className={`payment-result-card${success ? ' is-success' : result.status === 'failed' ? ' is-failed' : ''}`}>
      {result.status === 'checking' ? <LoaderCircle className="payment-result-icon is-spinning" size={38} /> : success ? <CircleCheck className="payment-result-icon" size={38} /> : <CircleX className="payment-result-icon" size={38} />}
      <span className="eyebrow section-eyebrow">{success ? 'PAYMENT VERIFIED' : result.status === 'failed' ? 'PAYMENT NOT VERIFIED' : 'SECURE VERIFICATION'}</span>
      <h1>{success ? 'Thank you for your gift.' : result.status === 'failed' ? 'We could not confirm payment.' : 'Confirming your payment'}</h1>
      <p role={result.status === 'failed' ? 'alert' : 'status'}>{result.message}</p>
      <div className="payment-result-actions"><a className="button button-green" href="/dashboard/payments">View payment history</a><a className="text-link" href="/causes">Back to causes</a></div>
    </section>
  </main></PageShell>
}
