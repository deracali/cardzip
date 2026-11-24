const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api').replace(/\/+$/, '')
const sessionKey = 'escapes-session'

export function getSession() {
  if (typeof window === 'undefined') return null
  try {
    const session = JSON.parse(window.localStorage.getItem(sessionKey) || 'null')
    return session && typeof session.token === 'string' && session.user ? session : null
  } catch {
    return null
  }
}

export function saveSession(session) {
  window.localStorage.setItem(sessionKey, JSON.stringify(session))
}

export function clearSession() {
  window.localStorage.removeItem(sessionKey)
}

async function request(path, { method = 'GET', body, authenticated = true } = {}) {
  const session = authenticated ? getSession() : null
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const result = await response.json().catch(() => null)
  if (!response.ok) throw new Error(result?.error || `Request failed (${response.status}).`)
  if (!result || typeof result !== 'object') throw new Error('The Escapes API returned an invalid response.')
  return result
}

export const escapesApi = {
  signup: (body) => request('/auth/signup', { method: 'POST', body, authenticated: false }),
  signupAdmin: (body) => request('/auth/admin-signup', { method: 'POST', body, authenticated: false }),
  login: (body) => request('/auth/login', { method: 'POST', body, authenticated: false }),
  publicStays: () => request('/public/stays', { authenticated: false }),
  publicStay: (slug) => request(`/public/stays/${encodeURIComponent(slug)}`, { authenticated: false }),
  paymentProviders: () => request('/client/payment/providers'),
  createBooking: (body) => request('/client/bookings/checkout', { method: 'POST', body }),
  verifyBooking: (body) => request('/client/bookings/verify', { method: 'POST', body }),
  clientDashboard: () => request('/client/dashboard'),
  adminDashboard: () => request('/admin/dashboard'),
  updateBooking: (id, status) => request(`/admin/bookings/${encodeURIComponent(id)}`, { method: 'PATCH', body: { status } }),
  createStay: (body) => request('/admin/stays', { method: 'POST', body }),
}
