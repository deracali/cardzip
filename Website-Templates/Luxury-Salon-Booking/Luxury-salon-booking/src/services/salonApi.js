const API_BASE_URL = (import.meta.env.VITE_SALON_API_URL || 'http://localhost:5600/api').replace(/\/+$/, '')
const SESSION_KEY = 'lumiere-session'

export function getSalonSession() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
    return session && typeof session.token === 'string' && session.user ? session : null
  } catch {
    return null
  }
}

export function saveSalonSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSalonSession() {
  localStorage.removeItem(SESSION_KEY)
}

export function errorStatus(error) {
  return error && typeof error === 'object' && 'status' in error ? error.status : undefined
}

async function request(path, { method = 'GET', body } = {}) {
  const session = getSalonSession()
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })
  } catch (error) {
    throw new Error(`Could not connect to Lumière API at ${API_BASE_URL}: ${error instanceof Error ? error.message : 'Network request failed.'}`, { cause: error })
  }
  const result = await response.json().catch(() => null)
  if (!response.ok) {
    const apiError = new Error(typeof result?.error === 'string' ? result.error : `Request failed (${response.status}).`)
    apiError.status = response.status
    throw apiError
  }
  if (!result || typeof result !== 'object') throw new Error('Lumière API returned an invalid response.')
  return result
}

export const salonApi = {
  signup: (body) => request('/auth/signup', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  currentUser: () => request('/auth/me'),
  clientDashboard: () => request('/client/dashboard'),
  createAppointment: (body) => request('/client/appointments', { method: 'POST', body }),
  adminDashboard: () => request('/admin/dashboard'),
  updateAppointment: (id, status) => request(`/admin/appointments/${encodeURIComponent(id)}`, { method: 'PATCH', body: { status } }),
}
