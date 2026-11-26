const API_BASE_URL = (process.env.NEXT_PUBLIC_NGO_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '')
const SESSION_KEY = 'kindred-ngo-session'

export function getNGOSession() {
  if (typeof window === 'undefined') return null
  const saved = window.localStorage.getItem(SESSION_KEY)
  if (!saved) return null
  try {
    const session = JSON.parse(saved)
    return session?.token && session?.user ? session : null
  } catch (error) {
    console.error('Could not read the Kindred session:', error)
    window.localStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function saveNGOSession(session) {
  if (!session?.token || !session?.user) throw new Error('The Kindred API returned an invalid session.')
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  window.dispatchEvent(new Event('kindred-session-change'))
}

export function clearNGOSession() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(SESSION_KEY)
  window.dispatchEvent(new Event('kindred-session-change'))
}

async function request(path, { method = 'GET', body, token } = {}) {
  const sessionToken = token === undefined ? getNGOSession()?.token : token
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error'
    throw new Error(`Could not connect to the Kindred API at ${API_BASE_URL}: ${message}`, { cause: error })
  }

  let result
  try {
    result = await response.json()
  } catch {
    result = null
  }
  if (!response.ok) {
    const message = result && typeof result.error === 'string' ? result.error : `Request failed (${response.status}).`
    const requestError = new Error(message)
    requestError.status = response.status
    throw requestError
  }
  if (!result || typeof result !== 'object') throw new Error('The Kindred API returned an invalid response.')
  return result
}

export const ngoApi = {
  login: (body) => request('/auth/login', { method: 'POST', body, token: null }),
  signup: (body) => request('/auth/signup', { method: 'POST', body, token: null }),
  signupAdmin: (body) => request('/auth/admin-signup', { method: 'POST', body, token: null }),
  me: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),
  campaigns: () => request('/public/campaigns', { token: null }),
  clientDashboard: () => request('/client/dashboard'),
  createDonation: (body) => request('/client/donations', { method: 'POST', body }),
  initializePayment: (body) => request('/client/payments/initialize', { method: 'POST', body }),
  verifyPayment: (reference) => request('/client/payments/verify', { method: 'POST', body: { reference } }),
  adminDashboard: () => request('/admin/dashboard'),
  updateDonationStatus: (id, status) => request(`/admin/donations/${encodeURIComponent(id)}`, { method: 'PATCH', body: { status } }),
}
