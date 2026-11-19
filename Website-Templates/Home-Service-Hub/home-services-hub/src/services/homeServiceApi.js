const sessionKey = 'fixflow-session'

export function getHomeServiceSession() {
  try {
    const value = JSON.parse(localStorage.getItem(sessionKey) || 'null')
    return value && typeof value.token === 'string' && value.user ? value : null
  } catch {
    return null
  }
}

export function saveHomeServiceSession(session) {
  localStorage.setItem(sessionKey, JSON.stringify(session))
}

export function clearHomeServiceSession() {
  localStorage.removeItem(sessionKey)
}

async function request(apiBaseUrl, path, { method = 'GET', body, authenticated = true } = {}) {
  const session = authenticated ? getHomeServiceSession() : null
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
    throw new Error(`Could not connect to the FixFlow API at ${apiBaseUrl}: ${error.message}`, { cause: error })
  }
  const result = await response.json().catch(() => null)
  if (!response.ok) {
    const apiError = new Error(result?.error || `Request failed (${response.status}).`)
    apiError.status = response.status
    throw apiError
  }
  if (!result || typeof result !== 'object') throw new Error('The FixFlow API returned an invalid response.')
  return result
}

export const homeServiceApi = {
  login: (apiBaseUrl, body) => request(apiBaseUrl, '/auth/login', { method: 'POST', body, authenticated: false }),
  signup: (apiBaseUrl, body) => request(apiBaseUrl, '/auth/signup', { method: 'POST', body, authenticated: false }),
  clientDashboard: (apiBaseUrl) => request(apiBaseUrl, '/client/dashboard'),
  createAppointment: (apiBaseUrl, body) => request(apiBaseUrl, '/client/appointments', { method: 'POST', body }),
  adminDashboard: (apiBaseUrl) => request(apiBaseUrl, '/admin/dashboard'),
  updateAppointment: (apiBaseUrl, id, status) => request(
    apiBaseUrl,
    `/admin/appointments/${encodeURIComponent(id)}`,
    { method: 'PATCH', body: { status } },
  ),
}
