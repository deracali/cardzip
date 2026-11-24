import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import { Router } from 'express'
import AdminRecord from '../src/models/AdminRecord.js'
import { requireClient } from '../src/middleware/clientAuth.js'

const router = Router()

router.get('/config', (_request, response) => {
  response.json({
    paystackConfigured: Boolean(process.env.PAYSTACK_SECRET_KEY?.trim()),
    publicKey: process.env.PAYSTACK_PUBLIC_KEY?.trim() || '',
    currency: (process.env.PAYSTACK_CURRENCY || 'USD').trim().toUpperCase(),
  })
})

async function paystackRequest(path, secret, options = {}) {
  const response = await fetch(`https://api.paystack.co${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    signal: AbortSignal.timeout(15000),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok || result.status === false) {
    const error = new Error(result.message || 'Paystack could not complete the request.')
    error.status = 502
    throw error
  }
  return result
}

router.post('/paystack/initialize', requireClient, async (request, response) => {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim()
  if (!secret) return response.status(503).json({ error: 'Paystack is not configured.' })
  const amount = Number(request.body?.amount)
  const callbackUrl = typeof request.body?.callbackUrl === 'string' ? request.body.callbackUrl : ''
  const service = typeof request.body?.service === 'string' ? request.body.service.trim() : 'Digital asset payment'
  const currency = (process.env.PAYSTACK_CURRENCY || 'USD').trim().toUpperCase()
  if (!Number.isFinite(amount) || amount < 1 || amount > 100000000 || !callbackUrl) {
    return response.status(400).json({ error: 'Enter a valid payment amount and callback URL.' })
  }
  let callback
  try {
    callback = new URL(callbackUrl)
  } catch {
    return response.status(400).json({ error: 'The Paystack callback URL is invalid.' })
  }
  if (!['http:', 'https:'].includes(callback.protocol)) return response.status(400).json({ error: 'The Paystack callback URL is invalid.' })

  const reference = `DAH-${randomUUID()}`
  const amountMinor = Math.round(amount * 100)
  const result = await paystackRequest('/transaction/initialize', secret, {
    method: 'POST',
    body: JSON.stringify({
      email: request.client.email,
      amount: amountMinor,
      currency,
      reference,
      callback_url: callback.toString(),
      metadata: { accountId: request.client.id, service },
    }),
  })
  if (!result.data?.authorization_url) return response.status(502).json({ error: 'Paystack did not return a checkout URL.' })
  await AdminRecord.create({
    kind: 'trade',
    accountId: request.client.id,
    reference,
    customerName: request.client.name,
    email: request.client.email,
    item: service,
    amount,
    currency,
    status: 'pending',
    detail: 'Paystack checkout initialized',
  })
  response.status(201).json({ authorizationUrl: result.data.authorization_url, reference, currency })
})

router.post('/paystack/verify', requireClient, async (request, response) => {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim()
  if (!secret) return response.status(503).json({ error: 'Paystack is not configured.' })
  const reference = typeof request.body?.reference === 'string' ? request.body.reference.trim() : ''
  if (!reference) return response.status(400).json({ error: 'Payment reference is required.' })
  const result = await paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`, secret)
  const transaction = result.data
  const record = await AdminRecord.findOne({ reference, email: request.client.email })
  if (!record) return response.status(404).json({ error: 'Payment record not found.' })
  if (transaction?.status !== 'success' || transaction?.reference !== reference) {
    record.status = 'rejected'
    record.detail = 'Paystack verification did not report success'
    await record.save()
    return response.json({ verified: false, status: transaction?.status || 'failed' })
  }
  const currency = (transaction.currency || record.currency || 'USD').toUpperCase()
  const amount = Number(transaction.amount || 0) / 100
  if (currency !== record.currency || amount !== record.amount) {
    return response.status(400).json({ error: 'Paystack amount or currency does not match this payment.' })
  }
  record.status = 'completed'
  record.detail = 'Paystack payment verified'
  await record.save()
  response.json({ verified: true, status: 'success', reference, amount, currency })
})

router.post('/paystack/webhook', async (request, response) => {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim()
  if (!secret) return response.status(503).json({ error: 'Paystack webhook verification is not configured.' })
  const signature = request.get('x-paystack-signature')
  const expected = createHmac('sha512', secret).update(request.rawBody || '').digest('hex')
  if (typeof signature !== 'string' || signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return response.status(400).json({ error: 'Invalid Paystack webhook signature.' })
  }
  if (request.body?.event !== 'charge.success') return response.json({ received: true })
  const data = request.body.data
  const record = await AdminRecord.findOne({ reference: data?.reference })
  if (record) {
    record.status = 'completed'
    record.detail = 'Paystack webhook confirmed payment'
    await record.save()
  }
  response.json({ received: true })
})

export default router
