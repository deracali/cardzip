const API_BASE_URL = (import.meta.env.VITE_MARKETPLACE_API_URL || 'http://localhost:5500/api').replace(/\/+$/, '')
const SESSION_KEY = 'markethub-session'

export function getMarketplaceSession() {
  try {
    const saved = localStorage.getItem(SESSION_KEY)
    if (!saved) return null
    const session = JSON.parse(saved)
    return session?.token && session?.user ? session : null
  } catch (error) {
    console.error('Could not read the MarketHub session:', error)
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function getMarketplaceToken() {
  return getMarketplaceSession()?.token || null
}

export function saveMarketplaceSession(session) {
  if (!session?.token || !session?.user) throw new Error('The marketplace API returned an invalid session.')
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearMarketplaceSession() {
  localStorage.removeItem(SESSION_KEY)
}

async function request(path, { method = 'GET', body, token = getMarketplaceToken() } = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })
  } catch (error) {
    throw new Error(`Could not connect to MarketHub API at ${API_BASE_URL}: ${error.message}`, { cause: error })
  }
  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    const requestError = new Error(result.error || `Request failed (${response.status}).`)
    requestError.status = response.status
    throw requestError
  }
  return result
}

export const marketplaceApi = {
  login: (body) => request('/auth/login', { method: 'POST', body, token: null }),
  signup: (body) => request('/auth/signup', { method: 'POST', body, token: null }),
  me: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),
  products: () => request('/products', { token: null }),
  shops: () => request('/shops', { token: null }),
  paymentProviders: () => request('/payments/providers', { token: null }),
  clientDashboard: () => request('/client/dashboard'),
  createOrder: (body) => request('/client/orders', { method: 'POST', body }),
  createCheckout: (body) => request('/client/checkout', { method: 'POST', body }),
  verifyPaystackPayment: (reference) => request('/client/payments/paystack/verify', { method: 'POST', body: { reference } }),
  verifyStripePayment: (sessionId) => request('/client/payments/stripe/verify', { method: 'POST', body: { sessionId } }),
  cancelStripePayment: (orderNumber) => request('/client/payments/stripe/cancel', { method: 'POST', body: { orderNumber } }),
  vendorDashboard: () => request('/vendor/dashboard'),
  createProduct: (body) => request('/vendor/products', { method: 'POST', body }),
  updateVendorStatus: (vendorId, status) => request(`/admin/vendors/${encodeURIComponent(vendorId)}`, { method: 'PATCH', body: { status } }),
  updateOrderStatus: (orderId, status) => request(`/admin/orders/${encodeURIComponent(orderId)}`, { method: 'PATCH', body: { status } }),
  adminDashboard: () => request('/admin/dashboard'),
}
