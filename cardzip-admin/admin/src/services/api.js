const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/+$/, '')
export const API_ORIGIN = new URL(API_BASE_URL).origin
const ADMIN_TOKEN_KEY = 'cardzip-admin-token'
const withdrawalAccessHeaders = (accessToken) => accessToken ? { 'X-Withdrawal-Access': accessToken } : {}

export const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY)

export const setAdminToken = (token) => {
  if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token)
  else localStorage.removeItem(ADMIN_TOKEN_KEY)
}

export async function apiRequest(path, { method = 'GET', body, auth = true, headers: extraHeaders = {} } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  Object.assign(headers, extraHeaders)
  const token = auth ? getAdminToken() : null
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })
  } catch (error) {
    throw new Error(`Could not connect to Cardzip API at ${API_BASE_URL}: ${error.message}`, { cause: error })
  }
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.message || result.error || `Request failed (${response.status}).`)
  return result
}

export const adminApi = {
  bootstrapStatus: () => apiRequest('/admin/bootstrap-status', { auth: false }),
  bootstrap: (body) => apiRequest('/admin/signup', { method: 'POST', body, auth: false }),
  signIn: (body) => apiRequest('/admin/signin', { method: 'POST', body, auth: false }),
  profile: () => apiRequest('/admin/me'),
  overview: (query = '') => apiRequest(`/admin/overview${query}`),
  walletDashboard: (query = '') => apiRequest(`/admin/wallet${query}`),
  treasury: () => apiRequest('/admin/treasury'),
  virtualNumberTransactions: (query = '') => apiRequest(`/admin/virtual-numbers/transactions${query}`),
  walletFunding: (query = '') => apiRequest(`/admin/add-money${query}`),
  billPaymentHistory: (query = '') => apiRequest(`/bills/admin/history${query}`),
  storeDashboard: (query = '') => apiRequest(`/store/admin/dashboard${query}`),
  updateStoreOrder: (id, body) => apiRequest(`/store/admin/orders/${encodeURIComponent(id)}`, { method: 'PATCH', body }),
  storeProducts: (query = '') => apiRequest(`/store/admin/products${query}`),
  createStoreProduct: (body) => apiRequest('/store/admin/products', { method: 'POST', body }),
  updateStoreProduct: (id, body) => apiRequest(`/store/admin/products/${encodeURIComponent(id)}`, { method: 'PUT', body }),
  deleteStoreProduct: (id) => apiRequest(`/store/admin/products/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  users: (query = '') => apiRequest(`/users/get${query}`),
  user: (id) => apiRequest(`/users/get/${encodeURIComponent(id)}`),
  updateUser: (id, body) => apiRequest(`/users/update/${encodeURIComponent(id)}`, { method: 'PUT', body }),
  giftCardTrades: (query = '') => apiRequest(`/gift-cards/get${query}`),
  giftCardCatalog: (query = '') => apiRequest(`/cards/get${query}`, { auth: false }),
  pendingGiftCardTrades: (query = '') => apiRequest(`/gift-cards/pending${query}`),
  reviewGiftCardTrade: (id, body) => apiRequest(`/gift-cards/update/${encodeURIComponent(id)}`, { method: 'PATCH', body }),
  staff: (query = '') => apiRequest(`/admin/staff${query}`),
  createStaff: (body) => apiRequest('/admin/staff', { method: 'POST', body }),
  updateStaff: (id, body) => apiRequest(`/admin/staff/${encodeURIComponent(id)}`, { method: 'PATCH', body }),
  tasks: (query = '') => apiRequest(`/admin/tasks${query}`),
  createTask: (body) => apiRequest('/admin/tasks', { method: 'POST', body }),
  updateTask: (id, body) => apiRequest(`/admin/tasks/${encodeURIComponent(id)}`, { method: 'PATCH', body }),
  staffAttendance: (query = '') => apiRequest(`/admin/attendance${query}`),
  companyExpenses: () => apiRequest('/admin/expenses'),
  payCompanyExpense: (body) => apiRequest('/admin/expenses/pay', { method: 'POST', body }),
  myStaffAttendance: () => apiRequest('/admin/attendance/me'),
  clockIn: () => apiRequest('/admin/attendance/clock-in', { method: 'POST', body: {} }),
  clockOut: () => apiRequest('/admin/attendance/clock-out', { method: 'POST', body: {} }),
  supportRequests: (query = '') => apiRequest(`/admin/support-requests${query}`),
  updateSupportRequest: (id, body) => apiRequest(`/admin/support-requests/${encodeURIComponent(id)}`, { method: 'PATCH', body }),
  withdrawals: (query = '', accessToken) => apiRequest(`/admin/withdrawals${query}`, { headers: withdrawalAccessHeaders(accessToken) }),
  withdrawalAudit: (id, accessToken) => apiRequest(`/admin/withdrawals/${encodeURIComponent(id)}/audit`, { headers: withdrawalAccessHeaders(accessToken) }),
  reviewWithdrawal: (id, body, accessToken) => apiRequest(`/admin/withdrawals/${encodeURIComponent(id)}`, { method: 'PATCH', body, headers: withdrawalAccessHeaders(accessToken) }),
  whatsAppInbox: (query = '') => apiRequest(`/whatsapp/inbox${query}`),
  withdrawalPasskeyStatus: () => apiRequest('/admin/withdrawal-passkey'),
  verifyWithdrawalPasskey: (body) => apiRequest('/admin/withdrawal-passkey/verify', { method: 'POST', body }),
  setWithdrawalPasskey: (body) => apiRequest('/admin/withdrawal-passkey', { method: 'PUT', body }),
}
