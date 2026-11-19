import { Router } from 'express'
import mongoose from 'mongoose'
import CreatorProfile from '../src/models/CreatorProfile.js'
import Payment from '../src/models/Payment.js'
import Product from '../src/models/Product.js'
import User from '../src/models/User.js'
import { requireAuth, requireCreator } from '../src/middleware/auth.js'
import {
  createPaymentReference,
  paystackConfiguration,
  paystackRequest,
  verifyPaystackWebhook,
} from '../src/services/paystack.js'

const router = Router()

function frontendUrl(request) {
  const allowed = (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:3001')
    .split(',').map((origin) => origin.trim()).filter(Boolean)
  const requestOrigin = request.get('origin')
  if (requestOrigin && allowed.includes(requestOrigin)) return requestOrigin
  const configured = process.env.FRONTEND_URL?.trim()
  if (configured && allowed.includes(configured)) return configured
  return allowed[0]
}

function returnUrl(request, reference) {
  const origin = frontendUrl(request)
  if (!origin) {
    const error = new Error('Configure FRONTEND_URL or ALLOWED_ORIGINS before starting Paystack checkout.')
    error.status = 500
    throw error
  }
  const url = new URL('/payment/return', origin)
  url.searchParams.set('reference', reference)
  return url.toString()
}

async function startTransaction({ request, payment, email, planCode }) {
  const config = paystackConfiguration()
  const callbackUrl = returnUrl(request, payment.reference)
  const payload = {
    email,
    currency: payment.currency,
    reference: payment.reference,
    callback_url: callbackUrl,
    metadata: {
      paymentId: payment.id,
      paymentType: payment.type,
      creatorId: String(payment.creator),
    },
  }
  if (planCode) payload.plan = planCode
  else payload.amount = payment.amount
  const result = await paystackRequest('/transaction/initialize', payload)
  if (!result.authorization_url || !result.reference) {
    const error = new Error('Paystack did not return a checkout URL.')
    error.status = 502
    throw error
  }
  payment.reference = result.reference
  await payment.save()
  return result
}

async function settlePayment(payment, transaction) {
  if (payment.status === 'success') return payment
  if (transaction.status !== 'success'
    || Number(transaction.amount) !== payment.amount
    || transaction.currency?.toUpperCase() !== payment.currency
    || transaction.reference !== payment.reference) {
    payment.status = 'failed'
    await payment.save()
    return payment
  }
  payment.status = 'success'
  payment.paidAt = new Date()
  await payment.save()
  if (payment.type === 'pro') {
    await User.findByIdAndUpdate(payment.user, {
      $set: {
        plan: 'pro',
        paystackCustomerCode: transaction.customer?.customer_code || '',
        ...(transaction.subscription?.subscription_code ? { paystackSubscriptionCode: transaction.subscription.subscription_code } : {}),
        ...(transaction.subscription?.next_payment_date ? { proNextPaymentAt: new Date(transaction.subscription.next_payment_date) } : {}),
      },
    })
    await CreatorProfile.findByIdAndUpdate(payment.creator, { $set: { plan: 'pro' } })
  }
  return payment
}

router.get('/config', (_request, response) => {
  const config = paystackConfiguration()
  const currency = /^[A-Z]{3}$/.test(config.currency) ? config.currency : 'USD'
  response.json({
    configured: config.configured,
    currency,
    proAmount: config.proAmount / 100,
    proPlanConfigured: Boolean(config.proPlanCode),
  })
})

router.post('/pro/checkout', requireAuth, requireCreator, async (request, response) => {
  const config = paystackConfiguration()
  if (!config.configured) return response.status(503).json({ error: 'Creator Pro payments are unavailable until Paystack is configured.' })
  if (!config.proPlanCode) return response.status(503).json({ error: 'Creator Pro subscription plan is not configured in Paystack yet.' })
  if (request.user.plan === 'pro') return response.status(409).json({ error: 'This account already has Creator Pro.' })
  if (!Number.isSafeInteger(config.proAmount) || config.proAmount < 1 || !/^[A-Z]{3}$/.test(config.currency)) {
    return response.status(500).json({ error: 'Paystack plan amount or currency is misconfigured.' })
  }
  const profile = await CreatorProfile.findOne({ user: request.user.id })
  if (!profile) return response.status(404).json({ error: 'Creator profile not found.' })
  const payment = await Payment.create({
    creator: profile.id,
    user: request.user.id,
    type: 'pro',
    reference: createPaymentReference(),
    amount: config.proAmount,
    currency: config.currency,
    customerEmail: request.user.email,
  })
  try {
    const transaction = await startTransaction({
      request,
      payment,
      email: request.user.email,
      planCode: config.proPlanCode,
    })
    response.status(201).json({ checkoutUrl: transaction.authorization_url, reference: payment.reference })
  } catch (error) {
    payment.status = 'failed'
    await payment.save()
    throw error
  }
})

router.post('/products/:id/checkout', async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.id)) return response.status(400).json({ error: 'Invalid product id.' })
  const email = request.body?.email
  if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return response.status(400).json({ error: 'Enter a valid email address for your receipt.' })
  }
  const config = paystackConfiguration()
  if (!config.configured) return response.status(503).json({ error: 'Product payments are unavailable until Paystack is configured.' })
  const product = await Product.findOne({ _id: request.params.id, active: true }).populate('creator', 'isPublic')
  if (!product || !product.creator?.isPublic) return response.status(404).json({ error: 'Product is not available.' })
  if (!/^[A-Z]{3}$/.test(config.currency)) return response.status(500).json({ error: 'PAYSTACK_CURRENCY must be a three-letter currency code.' })
  if (product.currency !== config.currency) {
    return response.status(409).json({ error: `This store accepts ${config.currency} payments. The product is priced in ${product.currency}.` })
  }
  const amount = Math.round(product.price * 100)
  const payment = await Payment.create({
    creator: product.creator.id,
    product: product.id,
    type: 'product',
    reference: createPaymentReference(),
    amount,
    currency: config.currency,
    customerEmail: email.trim().toLowerCase(),
  })
  try {
    const transaction = await startTransaction({ request, payment, email: payment.customerEmail })
    response.status(201).json({ checkoutUrl: transaction.authorization_url, reference: payment.reference })
  } catch (error) {
    payment.status = 'failed'
    await payment.save()
    throw error
  }
})

router.get('/verify', async (request, response) => {
  const reference = request.query.reference
  if (typeof reference !== 'string' || reference.length > 100) return response.status(400).json({ error: 'A valid Paystack transaction reference is required.' })
  const payment = await Payment.findOne({ reference }).populate('product', 'title downloadUrl').populate('creator', 'handle')
  if (!payment) return response.status(404).json({ error: 'Payment not found.' })
  const transaction = await paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`)
  const settled = await settlePayment(payment, transaction)
  if (settled.status !== 'success') return response.status(402).json({ error: 'Payment has not completed.', payment: { status: settled.status, type: settled.type } })
  return response.json({
    payment: { status: settled.status, type: settled.type, amount: settled.amount / 100, currency: settled.currency },
    creatorHandle: settled.creator?.handle,
    product: settled.product ? {
      title: settled.product.title,
      downloadUrl: settled.product.downloadUrl,
    } : undefined,
  })
})

router.post('/webhooks/paystack', async (request, response) => {
  if (!process.env.PAYSTACK_SECRET_KEY?.trim()) return response.status(503).json({ error: 'Paystack webhook verification is not configured.' })
  if (!verifyPaystackWebhook(request.get('x-paystack-signature'), request.rawBody)) {
    return response.status(400).json({ error: 'Invalid Paystack webhook signature.' })
  }
  if (request.body?.event === 'subscription.create') {
    const subscription = request.body.data
    const customerCode = subscription?.customer?.customer_code
    if (customerCode) {
      await User.updateOne(
        { paystackCustomerCode: customerCode },
        { $set: { paystackSubscriptionCode: subscription.subscription_code || '', proNextPaymentAt: subscription.next_payment_date ? new Date(subscription.next_payment_date) : undefined } },
      )
    }
    return response.json({ received: true })
  }
  if (['subscription.disable', 'subscription.not_renew'].includes(request.body?.event)) {
    const subscriptionCode = request.body.data?.subscription_code
    if (subscriptionCode) {
      const user = await User.findOne({ paystackSubscriptionCode: subscriptionCode })
      if (user && request.body.event === 'subscription.disable') {
        user.plan = 'free'
        user.paystackSubscriptionCode = ''
        user.proNextPaymentAt = undefined
        await user.save()
        await CreatorProfile.updateOne({ user: user.id }, { $set: { plan: 'free' } })
      }
    }
    return response.json({ received: true })
  }
  if (request.body?.event !== 'charge.success') return response.json({ received: true })
  const event = request.body.data
  const payment = await Payment.findOne({ reference: event?.reference })
  if (payment) {
    await settlePayment(payment, event)
  } else {
    const subscriptionCode = event?.plan_object?.subscription_code || event?.subscription?.subscription_code
    if (!subscriptionCode) return response.status(404).json({ error: 'Payment or subscription record not found.' })
    const user = await User.findOne({ paystackSubscriptionCode: subscriptionCode })
    if (!user || event.status !== 'success') return response.status(404).json({ error: 'Subscription owner not found.' })
    user.plan = 'pro'
    if (event.customer?.customer_code) user.paystackCustomerCode = event.customer.customer_code
    if (event.plan_object?.next_payment_date) user.proNextPaymentAt = new Date(event.plan_object.next_payment_date)
    await user.save()
    await CreatorProfile.updateOne({ user: user.id }, { $set: { plan: 'pro' } })
  }
  return response.json({ received: true })
})

export default router
