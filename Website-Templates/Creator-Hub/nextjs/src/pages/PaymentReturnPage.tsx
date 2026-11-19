"use client";

import { useEffect, useState } from 'react'
import { ArrowRight, Check, LoaderCircle } from 'lucide-react'
import { apiRequest } from '../services/api'
import '../dashboard.css'

type Verification = {
  payment: { status: string; type: string; amount: number; currency: string }
  creatorHandle?: string
  product?: { title: string; downloadUrl: string }
}

export default function PaymentReturnPage() {
  const [result, setResult] = useState<Verification | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const reference = new URLSearchParams(window.location.search).get('reference')
    if (!reference) {
      setError('Paystack did not return a transaction reference.')
      return
    }
    apiRequest<Verification>(`/payments/verify?reference=${encodeURIComponent(reference)}`)
      .then(setResult)
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : 'Payment verification failed.'))
  }, [])

  return <main className="ch-payment-page">
    <section className="ch-card ch-payment-card">
      <a className="creator-brand" href="/"><img className="creator-brand-logo" src="/creatorhub-logo.svg" alt="" /><span>CreatorHub</span></a>
      {!result && !error && <><LoaderCircle className="ch-payment-loader" size={32} /><h1>Verifying your payment</h1><p>We’re confirming the transaction with Paystack.</p></>}
      {error && <><h1>Payment not confirmed</h1><p className="ch-alert" role="alert">{error}</p><a className="creator-button creator-button-primary" href="/dashboard">Return to dashboard <ArrowRight size={14} /></a></>}
      {result && <><span className="ch-payment-check"><Check size={25} /></span><span className="ch-eyebrow">PAYMENT CONFIRMED</span><h1>{result.payment.type === 'pro' ? 'Creator Pro is active' : 'Thank you for your purchase'}</h1><p>{result.product ? `${result.product.title} · ${result.payment.currency} ${result.payment.amount.toFixed(2)}` : `Your Creator Pro payment of ${result.payment.currency} ${result.payment.amount.toFixed(2)} is complete.`}</p>{result.product?.downloadUrl && <a className="creator-button creator-button-primary" href={result.product.downloadUrl} target="_blank" rel="noreferrer">Download your product <ArrowRight size={14} /></a>}<a className="ch-inline-link" href={result.creatorHandle ? `/${result.creatorHandle}` : '/dashboard'}>Continue to CreatorHub <ArrowRight size={14} /></a></>}
    </section>
  </main>
}
