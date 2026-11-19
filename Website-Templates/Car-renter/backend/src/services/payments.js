import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'

export function getPaymentCurrency() {
  const currency = (process.env.PAYMENT_CURRENCY || 'USD').trim().toUpperCase()
  if (!/^[A-Z]{3}$/.test(currency)) {
    const error = new Error('PAYMENT_CURRENCY must be a three-letter currency code.')
    error.status = 500
    throw error
  }
  return currency
}

export function getEnabledPaymentProviders() {
  return [
    ...(process.env.STRIPE_SECRET_KEY?.trim() ? ['stripe'] : []),
    ...(process.env.PAYSTACK_SECRET_KEY?.trim() ? ['paystack'] : []),
  ]
}

export function amountInMinorUnits(amount, currency) {
  const fractionDigits = new Intl.NumberFormat('en', {
    style: 'currency',
    currency,
  }).resolvedOptions().maximumFractionDigits
  return Math.round(amount * (10 ** fractionDigits))
}

export function requireProviderSecret(provider) {
  const secret = provider === 'stripe'
    ? process.env.STRIPE_SECRET_KEY?.trim()
    : process.env.PAYSTACK_SECRET_KEY?.trim()
  if (!secret) {
    const error = new Error(`${provider === 'stripe' ? 'Stripe' : 'Paystack'} is not configured. Add its secret key to the backend environment.`)
    error.status = 503
    throw error
  }
  return secret
}

async function providerRequest(url, options) {
  let response
  try {
    response = await fetch(url, { ...options, signal: AbortSignal.timeout(15000) })
  } catch (cause) {
    const error = new Error('Unable to reach the payment provider. Please try again.')
    error.status = 502
    error.cause = cause
    throw error
  }
  let result
  try {
    result = await response.json()
  } catch (cause) {
    const error = new Error('The payment provider returned an invalid response.')
    error.status = 502
    error.cause = cause
    throw error
  }
  if (!response.ok) {
    const error = new Error(result?.error?.message || result?.message || 'The payment provider could not start checkout.')
    error.status = 502
    throw error
  }
  return result
}

export async function createStripeCheckout({ booking, returnUrl, currency }) {
  const secret = requireProviderSecret('stripe')
  const stripeSuccessUrl = new URL(returnUrl.success)
  stripeSuccessUrl.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}')
  const form = new URLSearchParams({
    mode: 'payment',
    customer_email: booking.customerEmail,
    client_reference_id: booking.id,
    success_url: stripeSuccessUrl.toString(),
    cancel_url: returnUrl.cancel,
    'line_items[0][price_data][currency]': currency.toLowerCase(),
    'line_items[0][price_data][unit_amount]': String(amountInMinorUnits(booking.total, currency)),
    'line_items[0][price_data][product_data][name]': `${booking.vehicleName} rental`,
    'line_items[0][price_data][product_data][description]': `${booking.days} rental day(s)${booking.protection ? ', including selected protection' : ''}`,
    'line_items[0][quantity]': '1',
    'metadata[bookingId]': booking.id,
    'metadata[userId]': String(booking.user),
  })
  const result = await providerRequest('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form,
  })
  if (!result.id || !result.url) {
    const error = new Error('Stripe did not return a checkout session.')
    error.status = 502
    throw error
  }
  return { reference: result.id, url: result.url }
}

export async function createPaystackCheckout({ booking, returnUrl, currency }) {
  const secret = requireProviderSecret('paystack')
  const reference = `voltigo_${randomUUID()}`
  const result = await providerRequest('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: booking.customerEmail,
      amount: amountInMinorUnits(booking.total, currency),
      currency,
      reference,
      callback_url: returnUrl.success,
      metadata: { bookingId: booking.id, userId: String(booking.user) },
    }),
  })
  if (!result.status || !result.data?.authorization_url || !result.data?.reference) {
    const error = new Error(result.message || 'Paystack did not return a checkout URL.')
    error.status = 502
    throw error
  }
  return { reference: result.data.reference, url: result.data.authorization_url }
}

export async function retrieveStripeCheckout(sessionId) {
  const secret = requireProviderSecret('stripe')
  return providerRequest(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { Authorization: `Bearer ${secret}` },
  })
}

export async function verifyPaystackTransaction(reference) {
  const secret = requireProviderSecret('paystack')
  return providerRequest(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` },
  })
}

function safeCompareHex(actual, expected) {
  if (typeof actual !== 'string' || !/^[\da-f]+$/i.test(actual) || actual.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expected, 'hex'))
}

export function verifyStripeSignature(signatureHeader, rawBody) {
  const parts = Object.fromEntries((signatureHeader || '').split(',').map((part) => part.split('=')))
  const timestamp = Number(parts.t)
  if (!Number.isInteger(timestamp) || Math.abs(Date.now() / 1000 - timestamp) > 300 || !Buffer.isBuffer(rawBody)) return false
  const expected = createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET || '')
    .update(`${timestamp}.${rawBody}`)
    .digest('hex')
  return safeCompareHex(parts.v1, expected)
}

export function verifyPaystackSignature(signatureHeader, rawBody) {
  if (typeof signatureHeader !== 'string' || !Buffer.isBuffer(rawBody)) return false
  const expected = createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '')
    .update(rawBody)
    .digest('hex')
  return safeCompareHex(signatureHeader, expected)
}
