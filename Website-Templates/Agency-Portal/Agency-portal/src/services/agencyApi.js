const apiBaseUrl = (import.meta.env.VITE_AGENCY_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '')
const sessionKey = 'nova-agency-session'

export const getAgencySession = () => {
  try {
    const value = JSON.parse(localStorage.getItem(sessionKey) || 'null')
    return value && typeof value.token === 'string' && value.user ? value : null
  } catch {
    return null
  }
}

export const saveAgencySession = (session) => localStorage.setItem(sessionKey, JSON.stringify(session))
export const clearAgencySession = () => localStorage.removeItem(sessionKey)

async function request(path, { method = 'GET', body, authenticated = true } = {}) {
  const session = authenticated ? getAgencySession() : null
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
  if (!result || typeof result !== 'object') throw new Error('The agency API returned an invalid response.')
  return result
}

export const agencyApi = {
  login: (body) => request('/auth/login', { method: 'POST', body, authenticated: false }),
  signupAdmin: (body) => request('/auth/admin-signup', { method: 'POST', body, authenticated: false }),
  signupClient: (body) => request('/auth/signup', { method: 'POST', body, authenticated: false }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: { email }, authenticated: false }),
  resetPassword: (token, password) => request('/auth/reset-password', { method: 'POST', body: { token, password }, authenticated: false }),
  clientDashboard: () => request('/client/dashboard'),
  publicCaseStudies: () => request('/public/case-studies', { authenticated: false }),
  uploadCaseStudyImage: async (file) => {
    if (!file.type.startsWith('image/')) throw new Error('Choose an image file.')
    if (file.size > 10 * 1024 * 1024) throw new Error('Images must be 10 MB or smaller.')
    const signature = await request('/admin/case-studies/upload-signature', { method: 'POST' })
    const form = new FormData()
    form.append('file', file)
    form.append('api_key', signature.apiKey)
    form.append('timestamp', String(signature.timestamp))
    form.append('folder', signature.folder)
    form.append('signature', signature.signature)
    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(signature.cloudName)}/image/upload`, { method: 'POST', body: form })
    const result = await response.json().catch(() => null)
    if (!response.ok) throw new Error(result?.error?.message || `Cloudinary upload failed (${response.status}).`)
    if (typeof result?.secure_url !== 'string') throw new Error('Cloudinary returned no secure image URL.')
    return result.secure_url
  },
  clientInquiries: () => request('/client/inquiries'),
  submitInquiry: (body) => request('/client/inquiries', { method: 'POST', body }),
  sendClientMessage: (message) => request('/client/messages', { method: 'POST', body: { message } }),
  admin: {
    dashboard: () => request('/admin/dashboard'),
    projects: () => request('/admin/projects'),
    createProject: (body) => request('/admin/projects', { method: 'POST', body }),
    updateProject: (id, body) => request(`/admin/projects/${encodeURIComponent(id)}`, { method: 'PATCH', body }),
    caseStudies: () => request('/admin/case-studies'),
    createCaseStudy: (body) => request('/admin/case-studies', { method: 'POST', body }),
    updateCaseStudy: (id, body) => request(`/admin/case-studies/${encodeURIComponent(id)}`, { method: 'PATCH', body }),
    deleteCaseStudy: (id) => request(`/admin/case-studies/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    clients: () => request('/admin/clients'),
    createClient: (body) => request('/admin/clients', { method: 'POST', body }),
    updateClient: (id, body) => request(`/admin/clients/${encodeURIComponent(id)}`, { method: 'PATCH', body }),
    team: () => request('/admin/team'),
    createTeamMember: (body) => request('/admin/team', { method: 'POST', body }),
    updateTeamMember: (id, body) => request(`/admin/team/${encodeURIComponent(id)}`, { method: 'PATCH', body }),
    invoices: () => request('/admin/invoices'),
    createInvoice: (body) => request('/admin/invoices', { method: 'POST', body }),
    updateInvoice: (id, body) => request(`/admin/invoices/${encodeURIComponent(id)}`, { method: 'PATCH', body }),
    inquiries: () => request('/admin/inquiries'),
    updateInquiry: (id, body) => request(`/admin/inquiries/${encodeURIComponent(id)}`, { method: 'PATCH', body }),
    replyToInquiry: (id, message) => request(`/admin/inquiries/${encodeURIComponent(id)}/reply`, { method: 'POST', body: { message } }),
    messages: () => request('/admin/messages'),
    sendMessage: (body) => request('/admin/messages', { method: 'POST', body }),
    markMessageRead: (id) => request(`/admin/messages/${encodeURIComponent(id)}/read`, { method: 'PATCH' }),
    settings: () => request('/admin/settings'),
    updateSettings: (body) => request('/admin/settings', { method: 'PUT', body }),
  },
}
