import { Router } from 'express'
import mongoose from 'mongoose'
import Booking from '../src/models/Booking.js'
import Vehicle from '../src/models/Vehicle.js'
import { requireAuth } from '../src/middleware/auth.js'
import { parseReservationPeriod } from '../src/validation/vehicles.js'
import {
  amountInMinorUnits,
  createPaystackCheckout,
  createStripeCheckout,
  getEnabledPaymentProviders,
  getPaymentCurrency,
  retrieveStripeCheckout,
  verifyPaystackSignature,
  verifyPaystackTransaction,
  verifyStripeSignature,
} from '../src/services/payments.js'

const router = Router()
const providers = new Set(['stripe', 'paystack'])
const paidStripeEvents = new Set(['checkout.session.completed', 'checkout.session.async_payment_succeeded'])

function frontendOrigin(request) {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
  const requestOrigin = request.get('origin')
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) return requestOrigin
  return allowedOrigins.includes('http://localhost:3000') ? 'http://localhost:3000' : allowedOrigins[0]
}

function createReturnUrls(request, bookingId, provider) {
  const origin = frontendOrigin(request)
  if (!origin) {
    const error = new Error('No website origin is configured for payment checkout.')
    error.status = 500
    throw error
  }
  const requestedReturn = request.body?.returnUrl
  let base
  try {
    base = requestedReturn ? new URL(requestedReturn) : new URL('/checkout', origin)
  } catch {
    const error = new Error('The payment return URL is invalid.')
    error.status = 400
    throw error
  }
  if (base.origin !== origin || base.pathname !== '/checkout') {
    const error = new Error('The payment return URL must point to the Voltigo checkout page.')
    error.status = 400
    throw error
  }
  const success = new URL(base)
  success.searchParams.set('payment', 'success')
  success.searchParams.set('provider', provider)
  success.searchParams.set('bookingId', bookingId)
  const cancel = new URL(base)
  cancel.searchParams.set('payment', 'cancelled')
  cancel.searchParams.set('provider', provider)
  cancel.searchParams.set('bookingId', bookingId)
  return { success: success.toString(), cancel: cancel.toString() }
}

function isMatchingAmount(booking, amount, currency) {
  return Number.isInteger(amount)
    && amount === amountInMinorUnits(booking.total, booking.paymentCurrency)
    && currency?.toUpperCase() === booking.paymentCurrency
}

async function settleBooking(booking, { succeeded, amount, currency }) {
  if (!isMatchingAmount(booking, amount, currency)) {
    const error = new Error('The payment amount or currency does not match this reservation.')
    error.status = 400
    throw error
  }
  if (booking.paymentStatus === 'succeeded') return booking
  booking.paymentStatus = succeeded ? 'succeeded' : 'failed'
  if (succeeded) {
    booking.status = 'confirmed'
    booking.paidAt = new Date()
  }
  await booking.save()
  return booking
}

router.get('/providers', (_request, response) => {
  response.json({ providers: getEnabledPaymentProviders(), currency: getPaymentCurrency() })
})

router.post('/checkout', requireAuth, async (request, response) => {
  if (request.user.role !== 'renter') return response.status(403).json({ error: 'Use a renter account to pay for a reservation.' })
  const { provider, vehicleId, pickup, dropoff, start: rawStart, end: rawEnd, coverage } = request.body ?? {}
  if (!providers.has(provider)) return response.status(400).json({ error: 'Choose Stripe or Paystack for payment.' })
  if (!getEnabledPaymentProviders().includes(provider)) {
    return response.status(503).json({ error: `${provider === 'stripe' ? 'Stripe' : 'Paystack'} is not configured. Add its secret key to the backend environment.` })
  }
  const period = parseReservationPeriod(rawStart, rawEnd)
  if (!mongoose.isValidObjectId(vehicleId)
    || typeof pickup !== 'string' || !pickup.trim() || pickup.trim().length > 160
    || typeof dropoff !== 'string' || !dropoff.trim() || dropoff.trim().length > 160
    || !period) {
    return response.status(400).json({ error: 'Enter a vehicle, pickup and return locations, and a valid date range.' })
  }
  const { start, end, days } = period
  const vehicle = await Vehicle.findOne({ _id: vehicleId, active: true })
  if (!vehicle) return response.status(404).json({ error: 'That vehicle is no longer available.' })
  const now = new Date()
  const conflict = await Booking.exists({
    vehicle: vehicle.id,
    $or: [
      { status: { $in: ['pending', 'confirmed'] } },
      { status: 'pending_payment', paymentExpiresAt: { $gt: now } },
    ],
    start: { $lt: end },
    end: { $gt: start },
  })
  if (conflict) return response.status(409).json({ error: 'That vehicle already has a reservation for those dates.' })

  const currency = getPaymentCurrency()
  const protection = coverage === true ? 18 * days : 0
  const booking = await Booking.create({
    user: request.user.id,
    vehicle: vehicle.id,
    customerName: request.user.name,
    customerEmail: request.user.email,
    vehicleName: vehicle.name,
    vehicleImage: vehicle.image,
    vehicleCategory: vehicle.category,
    dailyPrice: vehicle.price,
    pickup: pickup.trim(),
    dropoff: dropoff.trim(),
    start,
    end,
    days,
    protection,
    total: vehicle.price * days + protection,
    status: 'pending_payment',
    paymentStatus: 'pending',
    paymentProvider: provider,
    paymentCurrency: currency,
    paymentExpiresAt: new Date(Date.now() + 30 * 60 * 1000),
  })

  try {
    const returnUrl = createReturnUrls(request, booking.id, provider)
    const checkout = provider === 'stripe'
      ? await createStripeCheckout({ booking, returnUrl, currency })
      : await createPaystackCheckout({ booking, returnUrl, currency })
    booking.paymentReference = checkout.reference
    await booking.save()
    response.status(201).json({ bookingId: booking.id, checkoutUrl: checkout.url, provider, currency, total: booking.total })
  } catch (error) {
    booking.paymentStatus = 'failed'
    await booking.save()
    throw error
  }
})

router.get('/verify', requireAuth, async (request, response) => {
  const { provider, bookingId } = request.query
  if (!providers.has(provider) || !mongoose.isValidObjectId(bookingId)) {
    return response.status(400).json({ error: 'Payment verification details are invalid.' })
  }
  const booking = await Booking.findOne({ _id: bookingId, user: request.user.id, paymentProvider: provider })
  if (!booking) return response.status(404).json({ error: 'Reservation not found for this account.' })

  let succeeded = false
  let amount
  let currency
  if (provider === 'stripe') {
    const sessionId = request.query.sessionId
    if (typeof sessionId !== 'string' || sessionId !== booking.paymentReference) {
      return response.status(400).json({ error: 'Stripe checkout session does not match this reservation.' })
    }
    const session = await retrieveStripeCheckout(sessionId)
    if (session.metadata?.bookingId !== booking.id || session.client_reference_id !== booking.id) {
      return response.status(400).json({ error: 'Stripe checkout session metadata does not match this reservation.' })
    }
    succeeded = session.payment_status === 'paid'
    amount = session.amount_total
    currency = session.currency
  } else {
    const reference = request.query.reference
    if (typeof reference !== 'string' || reference !== booking.paymentReference) {
      return response.status(400).json({ error: 'Paystack transaction reference does not match this reservation.' })
    }
    const result = await verifyPaystackTransaction(reference)
    if (result.data?.reference !== booking.paymentReference) {
      return response.status(400).json({ error: 'Paystack transaction does not match this reservation.' })
    }
    succeeded = result.data?.status === 'success'
    amount = result.data?.amount
    currency = result.data?.currency
  }
  await settleBooking(booking, { succeeded, amount, currency })
  response.json({
    paid: booking.paymentStatus === 'succeeded',
    booking: { ...booking.toJSON(), id: booking.id },
  })
})

router.post('/webhooks/stripe', async (request, response) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
  if (!webhookSecret) return response.status(503).json({ error: 'Stripe webhook verification is not configured.' })
  if (!verifyStripeSignature(request.get('stripe-signature'), request.rawBody)) {
    return response.status(400).json({ error: 'Invalid Stripe webhook signature.' })
  }
  const event = request.body
  if (!paidStripeEvents.has(event?.type)) return response.json({ received: true })
  const session = event.data?.object
  if (session?.payment_status !== 'paid') return response.json({ received: true })
  const bookingId = session?.metadata?.bookingId
  if (!mongoose.isValidObjectId(bookingId)) return response.status(400).json({ error: 'Stripe event has no valid reservation reference.' })
  const booking = await Booking.findOne({ _id: bookingId, paymentProvider: 'stripe', paymentReference: session.id })
  if (!booking) return response.status(404).json({ error: 'Reservation for Stripe event was not found.' })
  await settleBooking(booking, {
    succeeded: true,
    amount: session.amount_total,
    currency: session.currency,
  })
  response.json({ received: true })
})

router.post('/webhooks/paystack', async (request, response) => {
  if (!process.env.PAYSTACK_SECRET_KEY?.trim()) {
    return response.status(503).json({ error: 'Paystack webhook verification is not configured.' })
  }
  if (!verifyPaystackSignature(request.get('x-paystack-signature'), request.rawBody)) {
    return response.status(400).json({ error: 'Invalid Paystack webhook signature.' })
  }
  const event = request.body
  if (event?.event !== 'charge.success') return response.json({ received: true })
  const transaction = event.data
  const booking = await Booking.findOne({ paymentProvider: 'paystack', paymentReference: transaction?.reference })
  if (!booking) return response.status(404).json({ error: 'Reservation for Paystack event was not found.' })
  await settleBooking(booking, {
    succeeded: transaction.status === 'success',
    amount: transaction.amount,
    currency: transaction.currency,
  })
  response.json({ received: true })
})

export default router
