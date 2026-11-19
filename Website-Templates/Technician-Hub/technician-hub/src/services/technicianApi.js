const apiBaseUrl = (import.meta.env.VITE_TECHNICIAN_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '')
const sessionKey = 'polarflow-session'

export function getTechnicianSession() {
  if (typeof window === 'undefined') return null
  try {
    const session = JSON.parse(window.localStorage.getItem(sessionKey) || 'null')
    return session && typeof session.token === 'string' && session.user ? session : null
  } catch {
    return null
  }
}

export function saveTechnicianSession(session) {
  window.localStorage.setItem(sessionKey, JSON.stringify(session))
}

export function clearTechnicianSession() {
  window.localStorage.removeItem(sessionKey)
}

async function request(path, { method = 'GET', body, authenticated = true } = {}) {
  const session = authenticated ? getTechnicianSession() : null
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
  if (!result || typeof result !== 'object') throw new Error('The PolarFlow API returned an invalid response.')
  return result
}

export const technicianApi = {
  login: (body) => request('/auth/login', { method: 'POST', body, authenticated: false }),
  signupClient: (body) => request('/auth/signup', { method: 'POST', body, authenticated: false }),
  signupAdmin: (body) => request('/auth/admin-signup', { method: 'POST', body, authenticated: false }),
  createBooking: (body) => request('/public/bookings', { method: 'POST', body, authenticated: false }),
  clientDashboard: () => request('/client/dashboard'),
  membershipProviders: () => request('/client/membership/providers'),
  createMembershipCheckout: (provider) => request('/client/membership/checkout', { method: 'POST', body: { provider } }),
  verifyMembership: (body) => request('/client/membership/verify', { method: 'POST', body }),
  adminDashboard: () => request('/admin/dashboard'),
  updateBooking: (id, status) => request(`/admin/bookings/${encodeURIComponent(id)}`, { method: 'PATCH', body: { status } }),
}
