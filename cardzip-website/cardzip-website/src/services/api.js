const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/+$/, '')
export const API_ORIGIN = new URL(API_BASE_URL).origin
const getPaystackCallbackUrl = () => new URL('/payment/callback', window.location.origin).toString()
const USER_TOKEN_KEY = 'cardzip-user-token'
const WALLET_CHANGE_EVENT = 'cardzip-wallet-changed'
const walletChangingRoutes = new Set([
  'POST /wallet/withdraw',
  'POST /payments/paystack/verify',
  'POST /store/orders',
  'POST /bills/pay',
  'POST /bills/paystack/verify',
  'POST /rent/sms4/buy',
  'POST /rent/sms4/paystack/verify',
  'POST /rent/sms4/renew',
])

const notifyWalletChanged = (path, method) => {
  const route = `${method.toUpperCase()} ${path.split('?')[0]}`
  if (walletChangingRoutes.has(route) && typeof window !== 'undefined') {
    window.dispatchEvent(new Event(WALLET_CHANGE_EVENT))
  }
}

export const getUserToken = () => localStorage.getItem(USER_TOKEN_KEY)

export const setUserToken = (token) => {
  if (token) localStorage.setItem(USER_TOKEN_KEY, token)
  else localStorage.removeItem(USER_TOKEN_KEY)
}

export async function apiRequest(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' }
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  if (body !== undefined && !isFormData) headers['Content-Type'] = 'application/json'
  const token = auth ? getUserToken() : null
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      ...(body !== undefined ? { body: isFormData ? body : JSON.stringify(body) } : {}),
    })
  } catch (error) {
    throw new Error(`Could not connect to Cardzip API at ${API_BASE_URL}: ${error.message}`, { cause: error })
  }
  const result = await response.json().catch(() => ({}))
  notifyWalletChanged(path, method)
  if (!response.ok) {
    const details = result.details
    const providerMessage = typeof details === 'string'
      ? details
      : details?.response_description || details?.message || details?.error
    const requestError = new Error(result.message || providerMessage || result.error || `Request failed (${response.status}).`)
    requestError.status = response.status
    requestError.data = result.data ?? details
    throw requestError
  }
  return result
}

export const userApi = {
  login: (body) => apiRequest('/users/login', { method: 'POST', body, auth: false }),
  googleSignIn: (body) => apiRequest('/users/google', { method: 'POST', body, auth: false }),
  signup: (body) => apiRequest('/users/signup', { method: 'POST', body, auth: false }),
  requestPasswordReset: (body) => apiRequest('/users/reset-code', { method: 'POST', body, auth: false }),
  resetPassword: (body) => apiRequest('/users/reset-password', { method: 'POST', body, auth: false }),
  account: () => apiRequest('/users/me'),
  wallet: () => apiRequest('/wallet/balance'),
  walletHistory: (query = '') => apiRequest(`/wallet/history${query}`),
  withdrawals: (query = '') => apiRequest(`/wallet/withdrawals${query}`),
  requestWithdrawal: (body) => apiRequest('/wallet/withdraw', { method: 'POST', body }),
  notifications: (query = '?page=1&limit=100') => apiRequest(`/notifications${query}`),
  markNotificationRead: (id) => apiRequest(`/notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => apiRequest('/notifications/read-all', { method: 'PATCH' }),
  initializeFunding: (body) => apiRequest('/payments/paystack/initialize', { method: 'POST', body: { ...body, callbackUrl: getPaystackCallbackUrl(), purpose: 'wallet_funding' } }),
  verifyFunding: (body) => apiRequest('/payments/paystack/verify', { method: 'POST', body }),
  saveBankAccount: (body) => apiRequest('/users/me/bank-account', { method: 'PUT', body }),
  storeProducts: (query = '') => apiRequest(`/store/products${query}`),
  storeProduct: (slug) => apiRequest(`/store/products/${encodeURIComponent(slug)}`),
  storeOrders: (query = '') => apiRequest(`/store/orders${query}`),
  storeOrder: (orderNumber) => apiRequest(`/store/orders/${encodeURIComponent(orderNumber)}`),
  createStoreOrder: (body) => apiRequest('/store/orders', { method: 'POST', body }),
  initializeStorePayment: (body) => apiRequest('/payments/paystack/initialize', { method: 'POST', body: { ...body, callbackUrl: getPaystackCallbackUrl(), purpose: 'store_order' } }),
  giftCardTrades: (query = '') => apiRequest(`/gift-cards/my${query}`),
  submitGiftCardTrade: (body) => apiRequest('/gift-cards/submit', { method: 'POST', body }),
  giftCardCatalog: (query = '') => apiRequest(`/cards/get${query}`, { auth: false }),
}

export const sms4Api = {
  areas: () => apiRequest('/rent/sms4/areas'),
  apps: () => apiRequest('/rent/sms4/apps'),
  durations: (appName) => apiRequest(`/rent/sms4/durations?appName=${encodeURIComponent(appName)}`),
  pricing: (appName, duration) => {
    const params = new URLSearchParams({ appName })
    if (duration !== undefined && duration !== '') params.set('duration', duration)
    return apiRequest(`/rent/sms4/pricing?${params}`)
  },
  numbers: (onlyActive = true) => apiRequest(`/rent/sms4/numbers?onlyActive=${onlyActive}`),
  sms: (rentalId) => apiRequest(`/rent/sms4/sms?${new URLSearchParams({ rentalId })}`),
  buy: (body) => apiRequest('/rent/sms4/buy', {
    method: 'POST',
    body: {
      ...body,
      ...(body.paymentMethod === 'paystack'
        ? { callbackUrl: getPaystackCallbackUrl() }
        : {}),
    },
  }),
  verifyPaystack: (body) => apiRequest('/rent/sms4/paystack/verify', { method: 'POST', body }),
  renew: (body) => apiRequest('/rent/sms4/renew', { method: 'POST', body }),
  setAutoRenew: (body) => apiRequest('/rent/sms4/auto-renew', { method: 'POST', body }),
  cancel: (body) => apiRequest('/rent/sms4/cancel', { method: 'POST', body }),
}

export const supportApi = {
  requests: (query = '') => apiRequest(`/support/requests/my${query}`),
  createRequest: (body) => apiRequest('/support/requests', { method: 'POST', body }),
  reply: (id, body) => apiRequest(`/support/requests/${encodeURIComponent(id)}/replies`, { method: 'POST', body }),
}

export const billApi = {
  dataVariations: (serviceID) => apiRequest(`/data/variations/${encodeURIComponent(serviceID)}`, { auth: false }),
  pay: (body) => apiRequest('/pay', { method: 'POST', body }),
  verifyCard: (body) => apiRequest('/verify-card', { method: 'POST', body }),
  tvVariations: (serviceID) => apiRequest(`/tv/variations?serviceID=${encodeURIComponent(serviceID)}`, { auth: false }),
  verifyTvCard: (body) => apiRequest('/tv/verify-card', { method: 'POST', body }),
  payTv: (body) => apiRequest('/tv/pay', { method: 'POST', body }),
  educationVariations: (serviceID) => apiRequest(`/education/variations/${encodeURIComponent(serviceID)}`, { auth: false }),
  payWaec: (body) => apiRequest('/education/pay-waec', { method: 'POST', body }),
  history: (query = '') => apiRequest(`/bills/history${query}`),
  payWithWallet: (body) => apiRequest('/bills/pay', { method: 'POST', body }),
  initializePaystack: (body) => apiRequest('/bills/paystack/initialize', { method: 'POST', body: { ...body, callbackUrl: getPaystackCallbackUrl() } }),
  verifyPaystack: (body) => apiRequest('/bills/paystack/verify', { method: 'POST', body }),
}
