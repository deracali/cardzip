import test from 'node:test'
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import {
  createPaymentHandlers,
  getEnabledProviders,
} from './service.js'

const env = {
  SKILLORA_FRONTEND_URL: 'https://skillora.example',
  PAYSTACK_SECRET_KEY: 'paystack-secret',
  PAYSTACK_WEBHOOK_SECRET: 'paystack-webhook-secret',
  PAYSTACK_SUPPORTED_CURRENCIES: 'NGN',
  STRIPE_SECRET_KEY: 'stripe-secret',
  STRIPE_WEBHOOK_SECRET: 'stripe-webhook-secret',
  STRIPE_SUPPORTED_CURRENCIES: 'NGN',
}

function setup({ course, fetchImpl, config = env } = {}) {
  const savedPayments = []
  const enrollments = []
  const defaultCourse = {
    _id: 'course-doc-1',
    courseId: 'web-development',
    title: 'Web Development',
    instructorId: 'instructor-1',
    price: 49,
    currency: 'NGN',
    published: true,
  }
  const Course = { findOne: async () => course === undefined ? defaultCourse : course }
  const Enrollment = {
    findOne: async ({ student, course: courseRef }) => enrollments.find((entry) => entry.student === student && entry.course === courseRef) || null,
    create: async (entry) => {
      const enrollment = { _id: `enrollment-${enrollments.length + 1}`, ...entry }
      enrollments.push(enrollment)
      return enrollment
    },
  }
  const Payment = {
    create: async (entry) => {
      const payment = {
        _id: `payment-${savedPayments.length + 1}`,
        status: 'pending',
        providerSessionId: '',
        ...entry,
        save: async () => {},
      }
      savedPayments.push(payment)
      return payment
    },
    findOne: async (query) => savedPayments.find((payment) => Object.entries(query).every(([key, value]) => payment[key] === value)) || null,
  }
  const handlers = createPaymentHandlers({ Course, Enrollment, Payment, env: config, fetchImpl: fetchImpl || (async () => { throw new Error('Unexpected provider request') }) })
  return { handlers, savedPayments, enrollments }
}

function response() {
  return {
    statusCode: 200,
    status(code) { this.statusCode = code; return this },
    json(value) { this.body = value; return this },
    sendStatus(code) { this.statusCode = code; return this },
    get(name) { return this.headers?.[name.toLowerCase()] },
  }
}

async function call(handler, request) {
  const res = response()
  await handler(request, res, (error) => {
    res.status(error?.status || 500).json({ error: error?.message })
  })
  return res
}

const studentRequest = (provider, overrides = {}) => ({
  body: { courseId: 'web-development', provider, price: 0.01, currency: 'USD' },
  user: { _id: 'student-1', email: 'learner@example.com' },
  ...overrides,
})

test('only enables providers with secrets and explicit NGN account support', () => {
  assert.deepEqual(getEnabledProviders(env), ['paystack', 'stripe'])
  assert.deepEqual(getEnabledProviders({ ...env, PAYSTACK_SUPPORTED_CURRENCIES: 'USD' }), ['stripe'])
  assert.deepEqual(getEnabledProviders({ ...env, STRIPE_WEBHOOK_SECRET: '' }), ['paystack'])
  assert.deepEqual(getEnabledProviders({}), [])
})

test('Paystack initiation uses database course price and returns hosted checkout only', async () => {
  let sent
  const { handlers, savedPayments } = setup({
    fetchImpl: async (url, options) => {
      sent = { url, options }
      return { ok: true, json: async () => ({ status: true, data: { authorization_url: 'https://checkout.paystack.com/session' } }) }
    },
  })
  const res = await call(handlers.initiate, studentRequest('paystack'))
  assert.equal(res.statusCode, 201)
  assert.equal(res.body.checkoutUrl, 'https://checkout.paystack.com/session')
  assert.equal(savedPayments[0].amount, 49)
  assert.equal(savedPayments[0].currency, 'NGN')
  assert.equal(JSON.parse(sent.options.body).amount, 4900)
  assert.equal(JSON.parse(sent.options.body).currency, 'NGN')
  assert.equal(sent.options.headers.Authorization, 'Bearer paystack-secret')
  assert.equal('card' in JSON.parse(sent.options.body), false)
})

test('Stripe initiation creates a hosted Checkout Session in NGN', async () => {
  let sent
  const { handlers, savedPayments } = setup({
    fetchImpl: async (url, options) => {
      sent = { url, options }
      return { ok: true, json: async () => ({ id: 'cs_test_1', url: 'https://checkout.stripe.com/session' }) }
    },
  })
  const res = await call(handlers.initiate, studentRequest('stripe'))
  assert.equal(res.statusCode, 201)
  assert.equal(res.body.checkoutUrl, 'https://checkout.stripe.com/session')
  assert.equal(savedPayments[0].providerSessionId, 'cs_test_1')
  const fields = new URLSearchParams(sent.options.body)
  assert.equal(fields.get('line_items[0][price_data][currency]'), 'ngn')
  assert.equal(fields.get('line_items[0][price_data][unit_amount]'), '4900')
  assert.equal(fields.get('client_reference_id'), savedPayments[0].providerReference)
  assert.equal(fields.has('card[number]'), false)
})

test('rejects unavailable, invalid, free, unpublished and non-NGN courses before creating payments', async () => {
  const missingSecrets = setup({ config: {}, fetchImpl: async () => { throw new Error('Must not call provider') } })
  assert.deepEqual((await call(missingSecrets.handlers.providers, {})).body.providers, [])
  const unavailable = await call(missingSecrets.handlers.initiate, studentRequest('paystack'))
  assert.equal(unavailable.statusCode, 503)

  const noAccount = createPaymentHandlers({
    Course: { findOne: async () => ({ _id: 'c', courseId: 'web-development', title: 'Course', instructorId: 'i', price: 49, currency: 'NGN' }) },
    Enrollment: { findOne: async () => null },
    Payment: { create: async () => { throw new Error('Must not create a payment') } },
    env: {},
  })
  const disabled = await call(noAccount.initiate, studentRequest('stripe'))
  assert.equal(disabled.statusCode, 503)

  for (const invalidCourse of [
    null,
    { _id: 'free', courseId: 'free', title: 'Free', instructorId: 'i', price: 0, currency: 'NGN' },
    { _id: 'usd', courseId: 'usd', title: 'USD', instructorId: 'i', price: 49, currency: 'USD' },
  ]) {
    const invalid = setup({ course: invalidCourse, fetchImpl: async () => { throw new Error('Must not call provider') } })
    const result = await call(invalid.handlers.initiate, studentRequest('paystack'))
    assert.ok([400, 404].includes(result.statusCode))
    assert.equal(invalid.savedPayments.length, 0)
  }
})

test('Paystack verification creates enrollment only after provider confirms exact NGN amount', async () => {
  let paid = false
  const { handlers, savedPayments, enrollments } = setup({
    fetchImpl: async (url) => url.endsWith('/transaction/initialize')
      ? { ok: true, json: async () => ({ status: true, data: { authorization_url: 'https://checkout.paystack.com/session' } }) }
      : {
        ok: true,
        json: async () => ({
          status: true,
          data: {
            status: paid ? 'success' : 'abandoned',
            reference: savedPayments[0].providerReference,
            amount: 4900,
            currency: 'NGN',
          },
        }),
      },
  })
  await call(handlers.initiate, studentRequest('paystack'))
  const reference = savedPayments[0].providerReference
  const unpaid = await call(handlers.verify, studentRequest('paystack', { body: { provider: 'paystack', reference } }))
  assert.equal(unpaid.statusCode, 402)
  assert.equal(enrollments.length, 0)
  paid = true
  const verified = await call(handlers.verify, studentRequest('paystack', { body: { provider: 'paystack', reference } }))
  assert.equal(verified.statusCode, 200)
  assert.equal(verified.body.status, 'paid')
  assert.equal(enrollments.length, 1)
  assert.equal(savedPayments[0].status, 'paid')
})

test('signed Paystack webhook verifies provider transaction before enrollment', async () => {
  let payment
  const { handlers, savedPayments, enrollments } = setup({
    fetchImpl: async (url) => url.endsWith('/transaction/initialize')
      ? { ok: true, json: async () => ({ status: true, data: { authorization_url: 'https://checkout.paystack.com/session' } }) }
      : {
        ok: true,
        json: async () => ({ status: true, data: { status: 'success', reference: payment.providerReference, amount: 4900, currency: 'NGN' } }),
      },
  })
  await call(handlers.initiate, studentRequest('paystack'))
  payment = savedPayments[0]
  const body = Buffer.from(JSON.stringify({ event: 'charge.success', data: { reference: payment.providerReference } }))
  const signature = createHmac('sha512', env.PAYSTACK_WEBHOOK_SECRET).update(body).digest('hex')
  const res = await call(handlers.handlePaystackWebhook, { body, get: () => signature })
  assert.equal(res.statusCode, 200)
  assert.equal(enrollments.length, 1)
  const invalid = await call(handlers.handlePaystackWebhook, { body, get: () => 'bad-signature' })
  assert.equal(invalid.statusCode, 400)
})

test('Stripe verification and signed webhook require a paid matching Checkout Session', async () => {
  let sessionPaid = false
  const { handlers, savedPayments, enrollments } = setup({
    fetchImpl: async (url) => url.endsWith('/checkout/sessions')
      ? { ok: true, json: async () => ({ id: 'cs_test_1', url: 'https://checkout.stripe.com/session' }) }
      : {
        ok: true,
        json: async () => ({
          id: 'cs_test_1',
          payment_status: sessionPaid ? 'paid' : 'unpaid',
          client_reference_id: savedPayments[0].providerReference,
          currency: 'ngn',
          amount_total: 4900,
        }),
      },
  })
  await call(handlers.initiate, studentRequest('stripe'))
  const sessionId = savedPayments[0].providerSessionId
  const request = studentRequest('stripe', { body: { provider: 'stripe', reference: sessionId } })
  assert.equal((await call(handlers.verify, request)).statusCode, 402)
  assert.equal(enrollments.length, 0)
  sessionPaid = true
  assert.equal((await call(handlers.verify, request)).statusCode, 200)
  assert.equal(enrollments.length, 1)

  const webhookBody = Buffer.from(JSON.stringify({
    type: 'checkout.session.completed',
    data: { object: { id: sessionId, client_reference_id: savedPayments[0].providerReference } },
  }))
  const timestamp = Math.floor(Date.now() / 1000)
  const digest = createHmac('sha256', env.STRIPE_WEBHOOK_SECRET).update(`${timestamp}.${webhookBody.toString('utf8')}`).digest('hex')
  const webhook = await call(handlers.handleStripeWebhook, {
    body: webhookBody,
    get: () => `t=${timestamp},v1=${digest}`,
  })
  assert.equal(webhook.statusCode, 200)
  assert.equal(enrollments.length, 1)
})

