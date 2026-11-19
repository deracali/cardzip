import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'

export function paystackConfiguration() {
  return {
    configured: Boolean(process.env.PAYSTACK_SECRET_KEY?.trim()),
    currency: (process.env.PAYSTACK_CURRENCY || 'USD').trim().toUpperCase(),
    proAmount: Number(process.env.CREATOR_PRO_PRICE_MINOR || 1200),
    proPlanCode: process.env.PAYSTACK_PRO_PLAN_CODE?.trim() || '',
  }
}

export function requirePaystackSecret() {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim()
  if (!secret) {
    const error = new Error('Paystack payments are not configured. Add PAYSTACK_SECRET_KEY to the backend environment.')
    error.status = 503
    throw error
  }
  return secret
}

export function createPaymentReference() {
  return `creatorhub_${randomUUID()}`
}

export async function paystackRequest(endpoint, payload) {
  const secret = requirePaystackSecret()
  let response
  try {
    response = await fetch(`https://api.paystack.co${endpoint}`, {
      method: payload ? 'POST' : 'GET',
      headers: {
        Authorization: `Bearer ${secret}`,
        ...(payload ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(payload ? { body: JSON.stringify(payload) } : {}),
      signal: AbortSignal.timeout(15000),
    })
  } catch (cause) {
    const error = new Error('Unable to reach Paystack. Please try again.')
    error.status = 502
    error.cause = cause
    throw error
  }
  let result
  try {
    result = await response.json()
  } catch (cause) {
    const error = new Error('Paystack returned an invalid response.')
    error.status = 502
    error.cause = cause
    throw error
  }
  if (!response.ok || !result.status) {
    const error = new Error(result.message || 'Paystack could not complete the request.')
    error.status = 502
    throw error
  }
  return result.data
}

export function verifyPaystackWebhook(signature, rawBody) {
  if (!signature || !Buffer.isBuffer(rawBody)) return false
  const expected = createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '').update(rawBody).digest('hex')
  if (signature.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}
