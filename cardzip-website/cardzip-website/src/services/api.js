const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://cardzip-server-hvg6.onrender.com/api').replace(/\/+$/, '')
export const API_ORIGIN = new URL(API_BASE_URL).origin
const getPaystackCallbackUrl = () => (
  import.meta.env.VITE_PAYSTACK_CALLBACK_URL?.trim()
  || new URL('/payment/callback', window.location.origin).toString()
)
const USER_TOKEN_KEY = 'cardzip-user-token'
const ANALYTICS_VISITOR_ID_KEY = 'cardzip-campaign-analytics-visitor'
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

const getCampaignAnalyticsVisitorId = () => {
  let visitorId = localStorage.getItem(ANALYTICS_VISITOR_ID_KEY)
  if (!visitorId) {
    visitorId = `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
    localStorage.setItem(ANALYTICS_VISITOR_ID_KEY, visitorId)
  }
  return visitorId
}

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

const downloadBlob = (blob, filename) => {
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}

export const userApi = {
  featureSettings: () => apiRequest('/users/features', { auth: false }),
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
  uploadSellerDigitalAssetImage: (file) => {
    const body = new FormData()
    body.append('image', file)
    return apiRequest('/store/digital-assets/images', { method: 'POST', body })
  },
  uploadSellerDigitalAssetSourceCode: (file) => {
    const body = new FormData()
    body.append('sourceCode', file)
    return apiRequest('/store/digital-assets/source-code', { method: 'POST', body })
  },
  uploadSellerDigitalAssetDocument: (file) => {
    const body = new FormData()
    body.append('document', file)
    return apiRequest('/store/digital-assets/documents', { method: 'POST', body })
  },
  createSellerDigitalAsset: (body) => apiRequest('/store/digital-assets', { method: 'POST', body }),
  myDigitalAssets: () => apiRequest('/store/digital-assets/mine'),
  myDigitalProductPayments: (productId) => apiRequest(`/payments/digital-products/${encodeURIComponent(productId)}`),
  downloadDigitalProductFile: async (productId, fileType, documentIndex, filename, reference) => {
    if (!reference) throw new Error('The verified payment reference is missing. Return to the product page and check your purchase.')
    const token = getUserToken()
    const path = `/payments/digital-products/${encodeURIComponent(productId)}/download/${encodeURIComponent(fileType)}/${encodeURIComponent(documentIndex ?? 0)}`
    let response
    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        body: new Blob([JSON.stringify({ reference })], { type: 'application/json' }),
        headers: {
          Accept: 'application/octet-stream',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
    } catch (error) {
      throw new Error(`Could not connect to Cardzip API at ${API_BASE_URL}: ${error.message}`, { cause: error })
    }
    if (!response.ok) {
      const result = await response.json().catch(() => ({}))
      throw new Error(result.message || `Could not download this file (${response.status}).`)
    }
    downloadBlob(await response.blob(), filename)
  },
  initializeDigitalProductPayment: (productId, purchaseType) => apiRequest('/payments/paystack/initialize', {
    method: 'POST',
    body: { purpose: 'digital_product', productId, purchaseType, callbackUrl: getPaystackCallbackUrl() },
  }),
  initializeSellerDigitalAssetPayment: (productId, purchaseType = 'use') => apiRequest('/payments/paystack/initialize', {
    method: 'POST',
    body: { purpose: 'seller_digital_asset', productId, purchaseType, callbackUrl: getPaystackCallbackUrl() },
  }),
  shops: (query = '') => apiRequest(`/store/shops${query}`, { auth: false }),
  shop: (slug) => apiRequest(`/store/shops/${encodeURIComponent(slug)}`, { auth: false }),
  shopProducts: (slug, query = '') => apiRequest(`/store/shops/${encodeURIComponent(slug)}/products${query}`, { auth: false }),
  shopAppointments: (slug) => apiRequest(`/store/shops/${encodeURIComponent(slug)}/appointments`, { auth: false }),
  bookShopAppointment: (slug, appointmentId) => apiRequest(`/store/shops/${encodeURIComponent(slug)}/appointments/${encodeURIComponent(appointmentId)}/book`, { method: 'POST' }),
  adPlacements: () => apiRequest('/store/ads/placements', { auth: false }),
  currentAd: (key) => apiRequest(`/store/ads/current/${encodeURIComponent(key)}`, { auth: false }),
  trackAdCampaignEvent: (campaignId, eventType) => apiRequest(`/store/ads/campaigns/${encodeURIComponent(campaignId)}/events`, { method: 'POST', body: { eventType, visitorId: getCampaignAnalyticsVisitorId() }, auth: false }),
  createAdCampaign: (body) => apiRequest('/store/ads/campaigns', { method: 'POST', body }),
  uploadAdCreative: (file) => {
    const body = new FormData()
    body.append('image', file)
    return apiRequest('/store/ads/images', { method: 'POST', body })
  },
  myAdCampaigns: (query = '') => apiRequest(`/store/ads/my-campaigns${query}`),
  myCommunityPromotions: () => apiRequest('/community-market/promotions/mine'),
  trackCommunityPromotionEvent: (targetId, targetType, eventType) => apiRequest('/community-market/promotions/events', { method: 'POST', body: { targetId, targetType, eventType, visitorId: getCampaignAnalyticsVisitorId() }, auth: false }),
  initializeBannerPayment: (campaignId) => apiRequest('/payments/paystack/initialize', {
    method: 'POST',
    body: { purpose: 'banner_ad', campaignId, callbackUrl: getPaystackCallbackUrl() },
  }),
  myShop: () => apiRequest('/store/my-shop'),
  myShopAppointments: () => apiRequest('/store/my-shop/appointments'),
  myBookedShopAppointments: () => apiRequest('/store/my-shop/bookings'),
  createShopAppointment: (body) => apiRequest('/store/my-shop/appointments', { method: 'POST', body }),
  updateShopAppointment: (appointmentId, status, cancellationReason = '') => apiRequest(`/store/my-shop/appointments/${encodeURIComponent(appointmentId)}`, { method: 'PATCH', body: { status, cancellationReason } }),
  deleteShopAppointment: (appointmentId) => apiRequest(`/store/my-shop/appointments/${encodeURIComponent(appointmentId)}`, { method: 'DELETE' }),
  createShop: (body) => apiRequest('/store/shops', { method: 'POST', body }),
  uploadShopProductImage: (file) => {
    const body = new FormData()
    body.append('image', file)
    return apiRequest('/store/my-shop/products/image', { method: 'POST', body })
  },
  createShopProduct: (body) => apiRequest('/store/my-shop/products', { method: 'POST', body }),
  deleteShopProduct: (productId) => apiRequest(`/store/my-shop/products/${encodeURIComponent(productId)}`, { method: 'DELETE' }),
  shopProduct: (shopSlug, productSlug) => apiRequest(`/store/shops/${encodeURIComponent(shopSlug)}/products/${encodeURIComponent(productSlug)}`, { auth: false }),
  communityListings: (query = '') => apiRequest(`/community-market/listings${query}`, { auth: false }),
  createCommunityListing: (body) => apiRequest('/community-market/listings', { method: 'POST', body }),
  updateCommunityListing: (id, body) => apiRequest(`/community-market/listings/${encodeURIComponent(id)}`, { method: 'PATCH', body }),
  deleteCommunityListing: (id) => apiRequest(`/community-market/listings/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  updateCommunityListingSold: (id, isSold) => apiRequest(`/community-market/listings/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: { isSold } }),
  communityListing: (id) => apiRequest(`/community-market/listings/${encodeURIComponent(id)}`, { auth: false }),
  relatedCommunityListings: (id) => apiRequest(`/community-market/listings/${encodeURIComponent(id)}/related`, { auth: false }),
  communityListingReviews: (id) => apiRequest(`/community-market/listings/${encodeURIComponent(id)}/reviews`, { auth: false }),
  myCommunityListingReview: (id) => apiRequest(`/community-market/listings/${encodeURIComponent(id)}/reviews/mine`),
  saveCommunityListingReview: (id, body) => apiRequest(`/community-market/listings/${encodeURIComponent(id)}/reviews`, { method: 'POST', body }),
  startCommunityConversation: (listingId) => apiRequest('/community-market/conversations', { method: 'POST', body: { listingId } }),
  myCommunityConversations: () => apiRequest('/community-market/conversations'),
  communityConversationMessages: (conversationId) => apiRequest(`/community-market/conversations/${encodeURIComponent(conversationId)}/messages`),
  markCommunityConversationRead: (conversationId) => apiRequest(`/community-market/conversations/${encodeURIComponent(conversationId)}/read`, { method: 'POST' }),
  sendCommunityMessage: (conversationId, body) => apiRequest(`/community-market/conversations/${encodeURIComponent(conversationId)}/messages`, { method: 'POST', body: { body } }),
  communityPromotionPricing: () => apiRequest('/community-market/promotions/pricing', { auth: false }),
  initializeCommunityPromotionPayment: (listingId, duration) => apiRequest('/payments/paystack/initialize', {
    method: 'POST',
    body: { purpose: 'community_promotion', listingId, duration, callbackUrl: getPaystackCallbackUrl() },
  }),
  initializeDigitalAssetPromotionPayment: (digitalAssetId, duration) => apiRequest('/payments/paystack/initialize', {
    method: 'POST',
    body: { purpose: 'community_promotion', digitalAssetId, duration, callbackUrl: getPaystackCallbackUrl() },
  }),
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
