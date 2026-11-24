import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import test from 'node:test'
import {
  createPaymentHandlers,
  getEnabledProviders,
  verifyPaystackSignature,
  verifyStripeSignature,
} from '../src/payments/service.js'

const env = {
  EVENT_HUB_FRONTEND_URL: 'http://localhost:3000',
  PAYSTACK_SECRET_KEY: 'paystack-test-secret',
  PAYSTACK_SUPPORTED_CURRENCIES: 'USD',
  STRIPE_SECRET_KEY: 'stripe-test-secret',
  STRIPE_WEBHOOK_SECRET: 'stripe-webhook-secret',
  STRIPE_SUPPORTED_CURRENCIES: 'USD',
}

function response() {
  return {
    statusCode: 200,
    status(code) { this.statusCode = code; return this },
    json(body) { this.body = body; return this },
    sendStatus(code) { this.statusCode = code; return this },
  }
}

function fixture(fetchImpl) {
  const bookings = []
  const Booking = {
    async create(values) {
      const booking = {
        _id: `booking-${bookings.length + 1}`,
        ...values,
        async save() { return this },
      }
      bookings.push(booking)
      return booking
    },
    async findOne(query) {
      return bookings.find((booking) => Object.entries(query).every(([key, value]) => String(booking[key]) === String(value))) || null
    },
  }
  const Event = {
    async findOne() {
      return { _id: 'event-1', slug: 'neon-pulse', title: 'Neon Pulse Festival', price: 89, published: true }
    },
  }
  return {
    bookings,
    handlers: createPaymentHandlers({ Booking, Event, env, fetchImpl }),
  }
}

const attendee = { _id: 'attendee-1', name: 'Jordan Lee', email: 'jordan@example.com' }
const initRequest = (provider) => ({
  user: attendee,
  body: { eventSlug: 'neon-pulse', ticketType: 'VIP Pass', quantity: 2, provider },
})

test('only exposes providers with valid USD configuration', () => {
  assert.deepEqual(getEnabledProviders(env), ['paystack', 'stripe'])
  assert.deepEqual(getEnabledProviders({ ...env, PAYSTACK_SUPPORTED_CURRENCIES: '' }), ['stripe'])
  assert.deepEqual(getEnabledProviders({ ...env, EVENT_HUB_FRONTEND_URL: 'javascript:alert(1)' }), [])
})

test('Paystack checkout uses the database price and verifies the returned transaction', async () => {
  let initializeBody
  let transactionAmount = 37800
  const fetchImpl = async (url, options) => {
    if (url.endsWith('/transaction/initialize')) {
      initializeBody = JSON.parse(options.body)
      return { ok: true, json: async () => ({ status: true, data: { authorization_url: 'https://checkout.paystack.com/test' } }) }
    }
    const booking = current.bookings[0]
    return {
      ok: true,
      json: async () => ({
        status: true,
        data: {
          status: 'success',
          reference: booking.reference,
          currency: 'USD',
          amount: transactionAmount,
          customer: { email: attendee.email },
          metadata: { bookingId: booking._id },
        },
      }),
    }
  }
  const current = fixture(fetchImpl)
  const checkoutResponse = response()
  await current.handlers.initiate(initRequest('paystack'), checkoutResponse, (error) => { throw error })

  assert.equal(checkoutResponse.statusCode, 201)
  assert.equal(checkoutResponse.body.checkoutUrl, 'https://checkout.paystack.com/test')
  assert.equal(initializeBody.amount, 37800)
  assert.equal(initializeBody.currency, 'USD')
  assert.equal(current.bookings[0].total, 378)
  assert.equal(current.bookings[0].paymentStatus, 'pending')

  const verifyResponse = response()
  await current.handlers.verify({
    user: attendee,
    body: { provider: 'paystack', reference: current.bookings[0].reference },
  }, verifyResponse, (error) => { throw error })
  assert.equal(verifyResponse.statusCode, 200)
  assert.equal(verifyResponse.body.booking.status, 'confirmed')
  assert.equal(verifyResponse.body.booking.paymentStatus, 'paid')

  const invalidFixture = fixture(async (url) => ({
    ok: true,
    json: async () => url.endsWith('/transaction/initialize')
      ? { status: true, data: { authorization_url: 'https://checkout.paystack.com/test' } }
      : {
          status: true,
          data: {
            status: 'success',
            reference: invalidFixture.bookings[0].reference,
            currency: 'USD',
            amount: 37799,
            customer: { email: attendee.email },
            metadata: { bookingId: invalidFixture.bookings[0]._id },
          },
        },
  }))
  const invalidStart = response()
  await invalidFixture.handlers.initiate(initRequest('paystack'), invalidStart, (error) => { throw error })
  let verificationError
  await invalidFixture.handlers.verify({
    user: attendee,
    body: { provider: 'paystack', reference: invalidFixture.bookings[0].reference },
  }, response(), (error) => { verificationError = error })
  assert.equal(verificationError.status, 402)
  assert.equal(invalidFixture.bookings[0].status, 'requested')
})

test('Stripe checkout persists its session and confirms only an exact paid session', async () => {
  let stripeBody
  const fetchImpl = async (url, options) => {
    if (options.method === 'POST') {
      stripeBody = new URLSearchParams(options.body)
      return { ok: true, json: async () => ({ id: 'cs_test_123', url: 'https://checkout.stripe.com/test' }) }
    }
    return {
      ok: true,
      json: async () => ({
        id: 'cs_test_123',
        status: 'complete',
        payment_status: 'paid',
        client_reference_id: 'booking-1',
        currency: 'usd',
        amount_total: 37800,
        metadata: { bookingId: 'booking-1' },
      }),
    }
  }
  const current = fixture(fetchImpl)
  const checkoutResponse = response()
  await current.handlers.initiate(initRequest('stripe'), checkoutResponse, (error) => { throw error })

  assert.equal(checkoutResponse.statusCode, 201)
  assert.equal(stripeBody.get('line_items[0][price_data][unit_amount]'), '18900')
  assert.equal(current.bookings[0].providerSessionId, 'cs_test_123')

  const verifyResponse = response()
  await current.handlers.verify({
    user: attendee,
    body: { provider: 'stripe', reference: 'cs_test_123' },
  }, verifyResponse, (error) => { throw error })
  assert.equal(verifyResponse.body.booking.paymentStatus, 'paid')
  assert.equal(verifyResponse.body.booking.status, 'confirmed')
})

test('webhook signature helpers reject altered payloads', () => {
  const payload = Buffer.from('{"id":"evt_1"}')
  const paystackSignature = createHmac('sha512', env.PAYSTACK_SECRET_KEY).update(payload).digest('hex')
  assert.equal(verifyPaystackSignature(payload, paystackSignature, env.PAYSTACK_SECRET_KEY), true)
  assert.equal(verifyPaystackSignature(Buffer.from('altered'), paystackSignature, env.PAYSTACK_SECRET_KEY), false)

  const timestamp = Math.floor(Date.now() / 1000)
  const stripeSignature = createHmac('sha256', env.STRIPE_WEBHOOK_SECRET).update(`${timestamp}.${payload}`).digest('hex')
  assert.equal(verifyStripeSignature(payload, `t=${timestamp},v1=${stripeSignature}`, env.STRIPE_WEBHOOK_SECRET), true)
  assert.equal(verifyStripeSignature(Buffer.from('altered'), `t=${timestamp},v1=${stripeSignature}`, env.STRIPE_WEBHOOK_SECRET), false)
})
