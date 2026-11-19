import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'

const PAYSTACK_API = 'https://api.paystack.co'
const STRIPE_API = 'https://api.stripe.com/v1'

function isConfigured(env, provider, currency = 'NGN') {
  const prefix = provider.toUpperCase()
  const currencies = (env[`${prefix}_SUPPORTED_CURRENCIES`] || '')
    .split(',')
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean)
  return Boolean(env[`${prefix}_SECRET_KEY`]?.trim()
    && env[`${prefix}_WEBHOOK_SECRET`]?.trim()
    && currencies.includes(currency.toUpperCase()))
}

export function getEnabledProviders(env = process.env, currency = 'NGN') {
  return ['paystack', 'stripe'].filter((provider) => isConfigured(env, provider, currency))
}

function paymentError(status, message) {
  const error = new Error(message)
  error.status = status
  return error
}

function parseProviderResponse(response, message) {
  return response.json().catch(() => ({})).then((result) => {
    if (!response.ok) throw paymentError(502, message)
    return result
  })
}

function frontendUrl(env) {
  const value = env.SKILLORA_FRONTEND_URL?.trim()
  if (!value) throw paymentError(503, 'Online checkout is not configured.')
  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid protocol')
    return url.origin
  } catch {
    throw paymentError(503, 'Online checkout is not configured.')
  }
}

async function createProviderCheckout({ provider, payment, course, user, env, fetchImpl }) {
  const baseUrl = frontendUrl(env)
  if (provider === 'paystack') {
    const callback = new URL('/checkout', baseUrl)
    callback.searchParams.set('course', course.courseId)
    callback.searchParams.set('provider', provider)
    callback.searchParams.set('payment', 'success')
    const result = await parseProviderResponse(await fetchImpl(`${PAYSTACK_API}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: Math.round(course.price * 100),
        currency: course.currency || 'NGN',
        reference: payment.providerReference,
        callback_url: callback.toString(),
        metadata: { paymentId: String(payment._id), courseId: course.courseId },
      }),
    }), 'The payment provider could not start checkout.')
    if (result.status !== true || !result.data?.authorization_url) {
      throw paymentError(502, 'The payment provider could not start checkout.')
    }
    return { checkoutUrl: result.data.authorization_url }
  }

  const success = new URL('/checkout', baseUrl)
  success.searchParams.set('course', course.courseId)
  success.searchParams.set('provider', provider)
  success.searchParams.set('payment', 'success')
  success.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}')
  const cancel = new URL('/checkout', baseUrl)
  cancel.searchParams.set('course', course.courseId)
  cancel.searchParams.set('provider', provider)
  cancel.searchParams.set('payment', 'cancelled')
  const form = new URLSearchParams({
    mode: 'payment',
    success_url: success.toString().replace('%7BCHECKOUT_SESSION_ID%7D', '{CHECKOUT_SESSION_ID}'),
    cancel_url: cancel.toString(),
    customer_email: user.email,
    client_reference_id: payment.providerReference,
    'line_items[0][quantity]': '1',
    'line_items[0][price_data][currency]': (course.currency || 'NGN').toLowerCase(),
    'line_items[0][price_data][unit_amount]': String(Math.round(course.price * 100)),
    'line_items[0][price_data][product_data][name]': course.title,
    'metadata[paymentReference]': payment.providerReference,
    'metadata[courseId]': course.courseId,
    'metadata[studentId]': String(user._id),
  })
  const result = await parseProviderResponse(await fetchImpl(`${STRIPE_API}/checkout/sessions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY.trim()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Idempotency-Key': payment.providerReference,
    },
    body: form.toString(),
  }), 'The payment provider could not start checkout.')
  if (!result.id || !result.url) throw paymentError(502, 'The payment provider could not start checkout.')
  payment.providerSessionId = result.id
  await payment.save()
  return { checkoutUrl: result.url, reference: result.id }
}

async function fetchVerifiedPayment({ provider, payment, env, fetchImpl, reference }) {
  if (provider === 'paystack') {
    const result = await parseProviderResponse(await fetchImpl(
      `${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY.trim()}` } },
    ), 'Unable to verify this payment.')
    const transaction = result.data
    if (result.status !== true || transaction?.status !== 'success'
      || transaction.reference !== payment.providerReference
      || transaction.currency?.toUpperCase() !== payment.currency
      || Number(transaction.amount) !== Math.round(payment.amount * 100)) {
      throw paymentError(402, 'Payment has not been confirmed.')
    }
    return
  }

  if (!payment.providerSessionId || reference !== payment.providerSessionId) {
    throw paymentError(400, 'Payment reference is invalid.')
  }
  const result = await parseProviderResponse(await fetchImpl(
    `${STRIPE_API}/checkout/sessions/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY.trim()}` } },
  ), 'Unable to verify this payment.')
  if (result.payment_status !== 'paid'
    || result.client_reference_id !== payment.providerReference
    || result.currency?.toUpperCase() !== payment.currency
    || Number(result.amount_total) !== Math.round(payment.amount * 100)) {
    throw paymentError(402, 'Payment has not been confirmed.')
  }
}

async function fulfillPayment(payment, { Enrollment }) {
  let enrollment = await Enrollment.findOne({ student: payment.student, course: payment.course })
  if (!enrollment) {
    try {
      enrollment = await Enrollment.create({
        student: payment.student,
        course: payment.course,
        courseId: payment.courseId,
        courseTitle: payment.courseTitle,
        instructorId: payment.instructorId,
      })
    } catch (error) {
      if (error?.code !== 11000) throw error
      enrollment = await Enrollment.findOne({ student: payment.student, course: payment.course })
      if (!enrollment) throw error
    }
  }
  if (payment.status !== 'paid') {
    payment.status = 'paid'
    await payment.save()
  }
  return enrollment
}

async function confirmPayment({ provider, payment, reference, env, fetchImpl, Enrollment }) {
  if (!payment || payment.provider !== provider) throw paymentError(404, 'Payment not found.')
  if (!isConfigured(env, provider, payment.currency)) throw paymentError(503, 'This payment provider is not available.')
  if (payment.status === 'paid') return fulfillPayment(payment, { Enrollment })
  await fetchVerifiedPayment({ provider, payment, env, fetchImpl, reference })
  return fulfillPayment(payment, { Enrollment })
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

export function createPaymentHandlers({ Course, Enrollment, Payment, env = process.env, fetchImpl = fetch }) {
  const providers = (_request, response) => response.json({ currency: 'NGN', providers: getEnabledProviders(env) })

  const initiate = async (request, response, next) => {
    try {
      const { courseId, provider } = request.body || {}
      if (typeof courseId !== 'string' || !['paystack', 'stripe'].includes(provider)) {
        return response.status(400).json({ error: 'Choose a valid course and payment provider.' })
      }
      const course = await Course.findOne({ courseId, published: true })
      if (!course) return response.status(404).json({ error: 'Course is not available.' })
      const currency = (course.currency || 'NGN').toUpperCase()
      if (!Number.isSafeInteger(course.price) || course.price <= 0 || currency !== 'NGN') {
        return response.status(400).json({ error: 'Choose a valid paid course priced in NGN.' })
      }
      if (!isConfigured(env, provider, currency)) {
        return response.status(503).json({ error: 'This payment provider is not available for NGN.' })
      }
      const existing = await Enrollment.findOne({ student: request.user._id, course: course._id })
      if (existing) return response.status(409).json({ error: 'You are already enrolled in this course.' })
      const payment = await Payment.create({
        provider,
        providerReference: randomUUID(),
        student: request.user._id,
        course: course._id,
        courseId: course.courseId,
        courseTitle: course.title,
        instructorId: course.instructorId,
        amount: course.price,
        currency,
      })
      try {
        const checkout = await createProviderCheckout({ provider, payment, course, user: request.user, env, fetchImpl })
        return response.status(201).json({ provider, ...checkout })
      } catch (error) {
        payment.status = 'failed'
        await payment.save()
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
        return response.status(400).json({ error: 'Provide a valid payment reference.' })
      }
      const query = provider === 'paystack'
        ? { provider, providerReference: reference, student: request.user._id }
        : { provider, providerSessionId: reference, student: request.user._id }
      const payment = await Payment.findOne(query)
      const enrollment = await confirmPayment({ provider, payment, reference, env, fetchImpl, Enrollment })
      return response.json({ status: 'paid', enrollment })
    } catch (error) {
      return next(error)
    }
  }

  async function handlePaystackWebhook(request, response, next) {
    try {
      const secret = env.PAYSTACK_WEBHOOK_SECRET
      if (!verifyPaystackSignature(request.body, request.get('x-paystack-signature'), secret)) {
        return response.status(400).json({ error: 'Invalid webhook signature.' })
      }
      const event = JSON.parse(request.body.toString('utf8'))
      if (event.event === 'charge.success') {
        const reference = event.data?.reference
        const payment = await Payment.findOne({ provider: 'paystack', providerReference: reference })
        if (payment) await confirmPayment({ provider: 'paystack', payment, reference, env, fetchImpl, Enrollment })
      }
      return response.sendStatus(200)
    } catch (error) {
      if (error instanceof SyntaxError) return response.status(400).json({ error: 'Invalid webhook payload.' })
      return next(error)
    }
  }

  async function handleStripeWebhook(request, response, next) {
    try {
      const secret = env.STRIPE_WEBHOOK_SECRET
      if (!verifyStripeSignature(request.body, request.get('stripe-signature'), secret)) {
        return response.status(400).json({ error: 'Invalid webhook signature.' })
      }
      const event = JSON.parse(request.body.toString('utf8'))
      if (['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type) && event.data?.object?.id) {
        const sessionId = event.data.object.id
        let payment = await Payment.findOne({ provider: 'stripe', providerSessionId: sessionId })
        if (!payment && typeof event.data.object.client_reference_id === 'string') {
          payment = await Payment.findOne({ provider: 'stripe', providerReference: event.data.object.client_reference_id })
          if (payment && !payment.providerSessionId) {
            payment.providerSessionId = sessionId
            await payment.save()
          }
        }
        if (payment) await confirmPayment({ provider: 'stripe', payment, reference: sessionId, env, fetchImpl, Enrollment })
      }
      return response.sendStatus(200)
    } catch (error) {
      if (error instanceof SyntaxError) return response.status(400).json({ error: 'Invalid webhook payload.' })
      return next(error)
    }
  }

  return { providers, initiate, verify, handlePaystackWebhook, handleStripeWebhook }
}
