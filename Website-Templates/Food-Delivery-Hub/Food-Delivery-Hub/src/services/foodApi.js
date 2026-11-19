const sessionKey = 'sizzle-smile-session'

export function getFoodSession() {
  try {
    const value = JSON.parse(localStorage.getItem(sessionKey) || 'null')
    return value && typeof value.token === 'string' && value.user ? value : null
  } catch {
    return null
  }
}

export function saveFoodSession(session) {
  localStorage.setItem(sessionKey, JSON.stringify(session))
}

export function clearFoodSession() {
  localStorage.removeItem(sessionKey)
}

async function request(apiBaseUrl, path, { method = 'GET', body, authenticated = true } = {}) {
  const session = authenticated ? getFoodSession() : null
  let response
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
  } catch (error) {
    throw new Error(`Could not connect to the Sizzle&Smile API at ${apiBaseUrl}: ${error.message}`, { cause: error })
  }
  const result = await response.json().catch(() => null)
  if (!response.ok) {
    const apiError = new Error(result?.error || `Request failed (${response.status}).`)
    apiError.status = response.status
    throw apiError
  }
  if (!result || typeof result !== 'object') throw new Error('The Sizzle&Smile API returned an invalid response.')
  return result
}

export const foodApi = {
  login: (apiBaseUrl, body) => request(apiBaseUrl, '/auth/login', { method: 'POST', body, authenticated: false }),
  signup: (apiBaseUrl, body) => request(apiBaseUrl, '/auth/signup', { method: 'POST', body, authenticated: false }),
  logout: (apiBaseUrl) => request(apiBaseUrl, '/auth/logout', { method: 'POST' }),
  clientDashboard: (apiBaseUrl) => request(apiBaseUrl, '/client/dashboard'),
  createOrder: (apiBaseUrl, body) => request(apiBaseUrl, '/client/orders', { method: 'POST', body }),
  adminDashboard: (apiBaseUrl) => request(apiBaseUrl, '/admin/dashboard'),
  updateOrder: (apiBaseUrl, id, status) => request(apiBaseUrl, `/admin/orders/${encodeURIComponent(id)}`, { method: 'PATCH', body: { status } }),
}
