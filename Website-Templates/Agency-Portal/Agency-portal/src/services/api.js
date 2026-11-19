import { shopProducts } from '../data/shopProducts.js'

const USER_TOKEN_KEY = 'cardzip-user-token'
const LOCAL_DATA_KEY = 'cardzip-react-local-data-v1'
const ANALYTICS_VISITOR_ID_KEY = 'cardzip-campaign-analytics-visitor'
const WALLET_CHANGE_EVENT = 'cardzip-wallet-changed'
const getPaystackCallbackUrl = () => new URL('/payment/callback', window.location.origin).toString()

const createId = () => globalThis.crypto?.randomUUID?.()
  || `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`

const initialProducts = shopProducts.map((product) => ({
  ...product,
  _id: product.slug,
  id: product.slug,
  price: Number(String(product.price).replace(/[^\d.]/g, '')) || 0,
  image: product.image || '',
}))

const readLocalData = () => {
  const saved = localStorage.getItem(LOCAL_DATA_KEY)
  if (!saved) return { users: [], resources: { '/store/products': initialProducts } }
  const parsed = JSON.parse(saved)
  if (!parsed || !Array.isArray(parsed.users) || !parsed.resources || typeof parsed.resources !== 'object') {
    throw new Error('Saved local Cardzip data is invalid. Clear this site’s local data to start fresh.')
  }
  return parsed
}

const saveLocalData = (data) => localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(data))

const getCampaignAnalyticsVisitorId = () => {
  let visitorId = localStorage.getItem(ANALYTICS_VISITOR_ID_KEY)
  if (!visitorId) {
    visitorId = createId()
    localStorage.setItem(ANALYTICS_VISITOR_ID_KEY, visitorId)
  }
  return visitorId
}

export const setUserToken = (token) => {
  if (token) localStorage.setItem(USER_TOKEN_KEY, token)
  else localStorage.removeItem(USER_TOKEN_KEY)
}

export const getUserToken = () => {
  const token = localStorage.getItem(USER_TOKEN_KEY)
  if (token && !token.startsWith('local:')) {
    localStorage.removeItem(USER_TOKEN_KEY)
    return null
  }
  return token
}

const getCurrentUser = (data) => {
  const userId = getUserToken()?.split(':')[1]
  return data.users.find((user) => user.id === userId) || null
}

const publicUser = (user) => {
  const result = { ...user }
  delete result.passwordHash
  delete result.passwordSalt
  return result
}

const hashPassword = async (password, salt) => {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Local sign-in requires a secure browser context (HTTPS or localhost).')
  }
  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const digest = await globalThis.crypto.subtle.deriveBits({
    name: 'PBKDF2',
    hash: 'SHA-256',
    salt: new TextEncoder().encode(salt),
    iterations: 100000,
  }, key, 256)
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

const dataUrlForFile = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = () => reject(new Error(`Could not read ${file.name} for local storage.`))
  reader.readAsDataURL(file)
})

const serializeBody = async (body) => {
  if (!(typeof FormData !== 'undefined' && body instanceof FormData)) return body
  const result = {}
  for (const [key, value] of body.entries()) {
    result[key] = typeof File !== 'undefined' && value instanceof File
      ? { name: value.name, type: value.type, dataUrl: await dataUrlForFile(value) }
      : value
  }
  return result
}

const localOnlyError = () => new Error(
  'This action needs Cardzip’s server or a payment/provider integration and is unavailable in local-only mode.',
)

const isExternalAction = (path, method) => {
  const route = path.split('?')[0]
  return (
    route.startsWith('/payments/')
    || (route.startsWith('/rent/sms4/') && method !== 'GET')
    || route === '/pay'
    || route === '/verify-card'
    || route.startsWith('/tv/pay')
    || route.startsWith('/tv/verify-card')
    || route.startsWith('/education/pay')
    || route.startsWith('/bills/pay')
    || (route === '/wallet/withdraw' && method === 'POST')
    || route === '/users/google'
    || route === '/users/reset-code'
    || route === '/users/reset-password'
  )
}

const resourceKey = (_user, path) => path

const collectionLeaves = new Set([
  'apps', 'areas', 'bookings', 'campaigns', 'conversations', 'durations', 'events',
  'get', 'history', 'listings', 'messages', 'mine', 'my', 'my-campaigns',
  'numbers', 'notifications', 'orders', 'placements', 'pricing', 'products',
  'requests', 'reviews', 'shops', 'sms', 'variations', 'withdrawals',
])

const paginate = (rows, searchParams) => {
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const limit = Math.max(1, Math.min(100, Number(searchParams.get('limit')) || rows.length || 20))
  const start = (page - 1) * limit
  return {
    data: rows.slice(start, start + limit),
    pagination: { page, limit, totalItems: rows.length, totalPages: Math.max(1, Math.ceil(rows.length / limit)) },
  }
}

export async function apiRequest(path, { method = 'GET', body, auth = true } = {}) {
  const normalizedMethod = method.toUpperCase()
  const url = new URL(path, typeof window === 'undefined' ? 'http://localhost' : window.location.origin)
  const route = url.pathname.replace(/\/+$/, '') || '/'

  if (isExternalAction(route, normalizedMethod)) throw localOnlyError()

  const data = readLocalData()
  const user = getCurrentUser(data)
  if (auth && !user) throw new Error('Sign in to continue.')

  if (route === '/users/signup' && normalizedMethod === 'POST') {
    const input = await serializeBody(body) || {}
    const email = String(input.email || '').trim().toLowerCase()
    if (!email || !input.password) throw new Error('Enter an email and password to create a local account.')
    if (data.users.some((entry) => entry.email === email)) throw new Error('An account with this email already exists on this device.')
    const salt = createId()
    const account = {
      id: createId(),
      name: String(input.name || '').trim(),
      email,
      passwordSalt: salt,
      passwordHash: await hashPassword(String(input.password), salt),
      walletBalance: 0,
      createdAt: new Date().toISOString(),
    }
    data.users.push(account)
    saveLocalData(data)
    const token = `local:${account.id}:${createId()}`
    setUserToken(token)
    return { token, user: publicUser(account), data: { token, user: publicUser(account) } }
  }

  if (route === '/users/login' && normalizedMethod === 'POST') {
    const input = await serializeBody(body) || {}
    const email = String(input.email || '').trim().toLowerCase()
    const account = data.users.find((entry) => entry.email === email)
    const passwordHash = account && await hashPassword(String(input.password || ''), account.passwordSalt)
    if (!account || passwordHash !== account.passwordHash) throw new Error('Email or password is incorrect for a local account on this device.')
    const token = `local:${account.id}:${createId()}`
    setUserToken(token)
    return { token, user: publicUser(account), data: { token, user: publicUser(account) } }
  }

  if (route === '/users/me' && normalizedMethod === 'GET') {
    return { data: publicUser(user), user: publicUser(user) }
  }

  if (route === '/wallet/balance' && normalizedMethod === 'GET') {
    return { data: { balance: Number(user.walletBalance || 0) } }
  }

  if (route === '/store/my-shop' && normalizedMethod === 'GET') {
    const shop = (data.resources['/store/shops'] || []).find((entry) => entry.ownerId === user.id) || null
    return { data: shop }
  }

  const isRead = normalizedMethod === 'GET'
  const parentRoute = route.split('/').slice(0, -1).join('/') || '/'
  const leaf = decodeURIComponent(route.split('/').pop() || '')
  const key = resourceKey(user, route)
  const parentKey = resourceKey(user, parentRoute)
  const records = data.resources[key] || []
  const hasId = route.split('/').length > 2
    && !collectionLeaves.has(leaf)
    && !Array.isArray(data.resources[key])

  if (isRead) {
    const collection = hasId ? data.resources[parentKey] || [] : records
    const item = hasId
      ? collection.find((entry) => [entry.id, entry._id, entry.slug, entry.orderNumber].some((value) => String(value || '') === leaf))
      : null
    const filtered = collection.filter((entry) => {
      const query = url.searchParams.get('search')
      return !query || JSON.stringify(entry).toLowerCase().includes(query.toLowerCase())
    })
    if (hasId) return { data: item || null }
    return { ...paginate(filtered, url.searchParams) }
  }

  const input = await serializeBody(body)
  let result
  if (normalizedMethod === 'POST') {
    if (route.endsWith('/read')) {
      const segments = route.split('/')
      const id = segments.at(-2)
      const collectionRoute = segments.slice(0, -2).join('/')
      const collection = data.resources[collectionRoute] || []
      const index = collection.findIndex((entry) => [entry.id, entry._id, entry.slug].some((value) => String(value || '') === id))
      if (index >= 0) {
        result = { ...collection[index], read: true }
        data.resources[collectionRoute] = collection.map((entry, rowIndex) => rowIndex === index ? result : entry)
      } else {
        result = { id, read: true }
      }
    } else {
      const entry = {
        ...(input && typeof input === 'object' && !Array.isArray(input) ? input : { value: input }),
        id: createId(),
        _id: createId(),
        createdAt: new Date().toISOString(),
        ...(user ? { ownerId: user.id } : {}),
      }
      if (route.endsWith('/images') && input?.image?.dataUrl) {
        entry.url = input.image.dataUrl
      }
      const collectionAliases = {
        '/gift-cards/submit': '/gift-cards/my',
        '/store/ads/campaigns': '/store/ads/my-campaigns',
        '/store/digital-assets': '/store/digital-assets/mine',
        '/support/requests': '/support/requests/my',
      }
      const targetKey = collectionAliases[route] || key
      if (route === '/store/ads/campaigns') entry.campaignId = entry.id
      data.resources[targetKey] = [...(data.resources[targetKey] || []), entry]
      result = entry
    }
  } else if (normalizedMethod === 'PATCH' || normalizedMethod === 'PUT') {
    if (route === '/users/me/bank-account') {
      const updatedUser = { ...user, bankAccount: input }
      data.users = data.users.map((entry) => entry.id === user.id ? updatedUser : entry)
      result = input
    } else if (route === '/notifications/read-all') {
      data.resources['/notifications'] = (data.resources['/notifications'] || []).map((entry) => ({ ...entry, read: true }))
      result = { updated: true }
    } else if (route.endsWith('/status') || route.endsWith('/read')) {
      const segments = route.split('/')
      const id = segments.at(-2)
      const collectionRoute = segments.slice(0, -2).join('/')
      const collection = data.resources[collectionRoute] || []
      const index = collection.findIndex((entry) => [entry.id, entry._id, entry.slug].some((value) => String(value || '') === id))
      if (index >= 0) {
        const updated = { ...collection[index], ...(input || {}), ...(route.endsWith('/read') ? { read: true } : {}) }
        data.resources[collectionRoute] = collection.map((entry, rowIndex) => rowIndex === index ? updated : entry)
        result = updated
      } else {
        result = { ...(input || {}), id, _id: id }
      }
    } else {
      const parentRecords = data.resources[parentKey] || []
      const index = parentRecords.findIndex((entry) => [entry.id, entry._id, entry.slug].some((value) => String(value || '') === leaf))
      if (index >= 0) {
        const updated = { ...parentRecords[index], ...(input || {}) }
        data.resources[parentKey] = parentRecords.map((entry, rowIndex) => rowIndex === index ? updated : entry)
        result = updated
      } else {
        result = { ...(input || {}), id: leaf, _id: leaf }
        data.resources[key] = [result]
      }
    }
  } else if (normalizedMethod === 'DELETE') {
    data.resources[parentKey] = (data.resources[parentKey] || []).filter(
      (entry) => ![entry.id, entry._id, entry.slug].some((value) => String(value || '') === leaf),
    )
    result = { id: leaf, deleted: true }
  } else {
    throw new Error(`Unsupported local operation: ${normalizedMethod} ${route}`)
  }

  saveLocalData(data)
  if (route.includes('/gift-cards/')) {
    window.dispatchEvent(new CustomEvent('cardzip-gift-card-trade-changed', { detail: result }))
  }
  if (route.includes('/wallet/')) window.dispatchEvent(new Event(WALLET_CHANGE_EVENT))
  return { data: result }
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
  createSellerDigitalAsset: (body) => apiRequest('/store/digital-assets', { method: 'POST', body }),
  myDigitalAssets: () => apiRequest('/store/digital-assets/mine'),
  initializeDigitalProductPayment: (productId, purchaseType) => apiRequest('/payments/paystack/initialize', {
    method: 'POST',
    body: { purpose: 'digital_product', productId, purchaseType, callbackUrl: getPaystackCallbackUrl() },
  }),
  initializeSellerDigitalAssetPayment: (productId) => apiRequest('/payments/paystack/initialize', {
    method: 'POST',
    body: { purpose: 'seller_digital_asset', productId, callbackUrl: getPaystackCallbackUrl() },
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
