import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'

const PAYSTACK_API = 'https://api.paystack.co'
const STRIPE_API = 'https://api.stripe.com/v1'
const CURRENCY = 'USD'

function paymentError(status, message, options) {
  const error = new Error(message, options)
  error.status = status
  return error
}

function hasFrontendOrigin(env) {
  try {
    const url = new URL(env.EVENT_HUB_FRONTEND_URL)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

function isConfigured(env, provider, currency = CURRENCY) {
  const prefix = provider.toUpperCase()
  const currencies = (env[`${prefix}_SUPPORTED_CURRENCIES`] || '')
    .split(',')
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean)
  const webhookSecret = provider === 'paystack'
    ? env.PAYSTACK_WEBHOOK_SECRET || env.PAYSTACK_SECRET_KEY
    : env.STRIPE_WEBHOOK_SECRET
  return Boolean(env[`${prefix}_SECRET_KEY`]?.trim()
    && webhookSecret?.trim()
    && hasFrontendOrigin(env)
    && currencies.includes(currency.toUpperCase()))
}

export function getEnabledProviders(env = process.env, currency = CURRENCY) {
  return ['paystack', 'stripe'].filter((provider) => isConfigured(env, provider, currency))
}

function frontendOrigin(env) {
  try {
    const url = new URL(env.EVENT_HUB_FRONTEND_URL)
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Unsupported protocol')
    return url.origin
  } catch {
    throw paymentError(503, 'Online checkout is not configured.')
  }
}

async function providerResponse(response, errorMessage) {
  let result
  try {
    result = await response.json()
  } catch (error) {
    throw paymentError(502, errorMessage, { cause: error })
  }
  if (!response.ok) throw paymentError(502, errorMessage)
  return result
}

function checkoutUrl(origin, booking, provider, result) {
  const base = `${origin}/checkout/${encodeURIComponent(booking.eventSlug)}`
  if (provider === 'paystack') {
    const callback = new URL(base)
    callback.searchParams.set('payment', 'success')
    callback.searchParams.set('provider', provider)
    return { checkoutUrl: result.data.authorization_url, callbackUrl: callback.toString() }
  }
  const successUrl = `${base}?payment=success&provider=stripe&session_id={CHECKOUT_SESSION_ID}`
  const cancelUrl = `${base}?payment=cancelled`
  return { checkoutUrl: result.url, successUrl, cancelUrl }
}

async function startProviderCheckout({ provider, booking, requestUser, env, fetchImpl }) {
  const origin = frontendOrigin(env)
  const amount = Math.round(booking.total * 100)
  if (provider === 'paystack') {
    const callback = new URL(`${origin}/checkout/${encodeURIComponent(booking.eventSlug)}`)
    callback.searchParams.set('payment', 'success')
    callback.searchParams.set('provider', provider)
    const result = await providerResponse(await fetchImpl(`${PAYSTACK_API}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: requestUser.email,
        amount,
        currency: booking.currency,
        reference: booking.reference,
        callback_url: callback.toString(),
        metadata: { bookingId: String(booking._id), eventSlug: booking.eventSlug },
      }),
    }), 'Paystack could not start checkout.')
    if (result.status !== true || !result.data?.authorization_url) {
      throw paymentError(502, 'Paystack could not start checkout.')
    }
    return { checkoutUrl: result.data.authorization_url, reference: booking.reference }
  }

  const successUrl = `${origin}/checkout/${encodeURIComponent(booking.eventSlug)}?payment=success&provider=stripe&session_id={CHECKOUT_SESSION_ID}`
  const cancelUrl = `${origin}/checkout/${encodeURIComponent(booking.eventSlug)}?payment=cancelled`
  const form = new URLSearchParams({
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: requestUser.email,
    client_reference_id: String(booking._id),
    'line_items[0][quantity]': String(booking.quantity),
    'line_items[0][price_data][currency]': booking.currency.toLowerCase(),
    'line_items[0][price_data][unit_amount]': String(Math.round((booking.total / booking.quantity) * 100)),
    'line_items[0][price_data][product_data][name]': `${booking.eventTitle} — ${booking.ticketType}`,
    'metadata[bookingId]': String(booking._id),
    'metadata[bookingReference]': booking.reference,
  })
  const result = await providerResponse(await fetchImpl(`${STRIPE_API}/checkout/sessions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY.trim()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Idempotency-Key': booking.reference,
    },
    body: form.toString(),
  }), 'Stripe could not start checkout.')
  if (!result.id || !result.url) throw paymentError(502, 'Stripe could not start checkout.')
  booking.providerSessionId = result.id
  await booking.save()
  return { checkoutUrl: result.url, reference: result.id }
}

async function verifyProviderPayment({ provider, booking, reference, env, fetchImpl }) {
  if (provider === 'paystack') {
    const result = await providerResponse(await fetchImpl(
      `${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY.trim()}` } },
    ), 'Unable to verify the Paystack payment.')
    const transaction = result.data
    if (result.status !== true || transaction?.status !== 'success'
      || transaction.reference !== booking.reference
      || transaction.currency?.toUpperCase() !== booking.currency
      || Number(transaction.amount) !== Math.round(booking.total * 100)
      || transaction.customer?.email?.toLowerCase() !== booking.attendeeEmail
      || String(transaction.metadata?.bookingId) !== String(booking._id)) {
      throw paymentError(402, 'Paystack has not confirmed this payment.')
    }
    return
  }

  if (!booking.providerSessionId || reference !== booking.providerSessionId) {
    throw paymentError(400, 'Stripe payment reference is invalid.')
  }
  const result = await providerResponse(await fetchImpl(
    `${STRIPE_API}/checkout/sessions/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY.trim()}` } },
  ), 'Unable to verify the Stripe payment.')
  if (result.payment_status !== 'paid'
    || result.status !== 'complete'
    || result.client_reference_id !== String(booking._id)
    || result.currency?.toUpperCase() !== booking.currency
    || Number(result.amount_total) !== Math.round(booking.total * 100)
    || String(result.metadata?.bookingId) !== String(booking._id)) {
    throw paymentError(402, 'Stripe has not confirmed this payment.')
  }
}

async function confirmBookingPayment({ provider, booking, reference, env, fetchImpl }) {
  if (!booking || booking.paymentProvider !== provider) throw paymentError(404, 'Booking payment not found.')
  if (!isConfigured(env, provider, booking.currency)) throw paymentError(503, 'This payment provider is not available.')
  if (booking.paymentStatus === 'paid' && booking.status === 'confirmed') return booking
  if (booking.status === 'cancelled') throw paymentError(409, 'This booking has been cancelled.')
  await verifyProviderPayment({ provider, booking, reference, env, fetchImpl })
  booking.paymentStatus = 'paid'
  booking.status = 'confirmed'
  await booking.save()
  return booking
}

function safeEqualHex(value, expected) {
  if (typeof value !== 'string' || !/^[a-f\d]+$/i.test(value) || value.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(value, 'hex'), Buffer.from(expected, 'hex'))
}

export function verifyPaystackSignature(rawBody, signature, secret) {
  if (!Buffer.isBuffer(rawBody) || !signature || !secret) return false
  const expected = createHmac('sha512', secret.trim()).update(rawBody).digest('hex')
  return safeEqualHex(signature, expected)
}

export function verifyStripeSignature(rawBody, signature, secret, now = Date.now()) {
  if (!Buffer.isBuffer(rawBody) || typeof signature !== 'string' || !secret) return false
  const parts = signature.split(',').map((part) => part.split('='))
  const timestamp = parts.find(([key]) => key === 't')?.[1]
  const signatures = parts.filter(([key]) => key === 'v1').map(([, value]) => value)
  if (!timestamp || !/^\d+$/.test(timestamp) || Math.abs(Math.floor(now / 1000) - Number(timestamp)) > 300) return false
  const expected = createHmac('sha256', secret.trim()).update(`${timestamp}.${rawBody.toString('utf8')}`).digest('hex')
  return signatures.some((value) => safeEqualHex(value, expected))
}

export function createPaymentHandlers({ Booking, Event, env = process.env, fetchImpl = fetch }) {
  const providers = (_request, response) => response.json({ currency: CURRENCY, providers: getEnabledProviders(env) })

  const initiate = async (request, response, next) => {
    try {
      const { eventSlug, ticketType, quantity, provider } = request.body || {}
      if (typeof eventSlug !== 'string' || !['General Admission', 'VIP Pass'].includes(ticketType)
        || !Number.isInteger(quantity) || quantity < 1 || quantity > 6
        || !['paystack', 'stripe'].includes(provider)) {
        return response.status(400).json({ error: 'Choose a valid event, ticket type, quantity, and payment provider.' })
      }
      const event = await Event.findOne({ slug: eventSlug, published: true })
      if (!event) return response.status(404).json({ error: 'Event is not available.' })
      const unitPrice = event.price + (ticketType === 'VIP Pass' ? 100 : 0)
      const total = Math.round(unitPrice * 100) * quantity / 100
      if (!Number.isSafeInteger(Math.round(total * 100)) || total <= 0) {
        return response.status(400).json({ error: 'This event does not have a valid paid ticket price.' })
      }
      if (!isConfigured(env, provider, CURRENCY)) {
        return response.status(503).json({ error: `This provider is not configured for ${CURRENCY} checkout.` })
      }
      const booking = await Booking.create({
        reference: `PL-${randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`,
        attendee: request.user._id,
        attendeeName: request.user.name,
        attendeeEmail: request.user.email,
        event: event._id,
        eventSlug: event.slug,
        eventTitle: event.title,
        ticketType,
        quantity,
        total,
        currency: CURRENCY,
        status: 'requested',
        paymentStatus: 'pending',
        paymentProvider: provider,
      })
      try {
        const checkout = await startProviderCheckout({ provider, booking, requestUser: request.user, env, fetchImpl })
        return response.status(201).json({ bookingReference: booking.reference, provider, ...checkout })
      } catch (error) {
        booking.paymentStatus = 'failed'
        await booking.save()
        throw error
      }
    } catch (error) {
      return next(error)
    }
  }

  const verify = async (request, response, next) => {
    try {
      const { provider, reference } = request.body || {}
      if (!['paystack', 'stripe'].includes(provider) || typeof reference !== 'string' || !reference) {
        return response.status(400).json({ error: 'Provide a valid payment provider and reference.' })
      }
      const query = provider === 'paystack'
        ? { reference, paymentProvider: provider, attendee: request.user._id }
        : { providerSessionId: reference, paymentProvider: provider, attendee: request.user._id }
      const booking = await Booking.findOne(query)
      const confirmed = await confirmBookingPayment({ provider, booking, reference, env, fetchImpl })
      return response.json({ status: 'paid', booking: confirmed })
    } catch (error) {
      return next(error)
    }
  }

  async function handlePaystackWebhook(request, response, next) {
    try {
      const secret = env.PAYSTACK_WEBHOOK_SECRET || env.PAYSTACK_SECRET_KEY
      if (!verifyPaystackSignature(request.body, request.get('x-paystack-signature'), secret)) {
        return response.status(400).json({ error: 'Invalid webhook signature.' })
      }
      const event = JSON.parse(request.body.toString('utf8'))
      if (event.event === 'charge.success' && typeof event.data?.reference === 'string') {
        const booking = await Booking.findOne({ reference: event.data.reference, paymentProvider: 'paystack' })
        if (booking) await confirmBookingPayment({ provider: 'paystack', booking, reference: booking.reference, env, fetchImpl })
      }
      return response.sendStatus(200)
    } catch (error) {
      if (error instanceof SyntaxError) return response.status(400).json({ error: 'Invalid webhook payload.' })
      return next(error)
    }
  }

  async function handleStripeWebhook(request, response, next) {
    try {
      if (!verifyStripeSignature(request.body, request.get('stripe-signature'), env.STRIPE_WEBHOOK_SECRET)) {
        return response.status(400).json({ error: 'Invalid webhook signature.' })
      }
      const event = JSON.parse(request.body.toString('utf8'))
      if (['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type)) {
        const sessionId = event.data?.object?.id
        if (typeof sessionId === 'string') {
          const booking = await Booking.findOne({ providerSessionId: sessionId, paymentProvider: 'stripe' })
          if (booking) await confirmBookingPayment({ provider: 'stripe', booking, reference: sessionId, env, fetchImpl })
        }
      }
      return response.sendStatus(200)
    } catch (error) {
      if (error instanceof SyntaxError) return response.status(400).json({ error: 'Invalid webhook payload.' })
      return next(error)
    }
  }

  return { providers, initiate, verify, handlePaystackWebhook, handleStripeWebhook }
}
