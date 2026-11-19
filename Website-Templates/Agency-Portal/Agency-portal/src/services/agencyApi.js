const SESSION_KEY = 'nova-agency-session'
const DATA_KEY = 'nova-agency-local-data-v1'
const LOCAL_ADMIN_INVITE_CODE = 'LOCAL-ADMIN'
const IMAGE_SIZE_LIMIT = 10 * 1024 * 1024
const collections = ['users', 'caseStudies', 'projects', 'clients', 'team', 'invoices', 'inquiries', 'messages', 'activity']

const createId = () => globalThis.crypto?.randomUUID?.()
  || `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`

const defaultSettings = () => ({
  studioName: 'NOVA Studio',
  email: 'hello@novastudio.co',
  website: '',
  description: 'Creative agency for ambitious brands.',
  notifications: {},
})

const emptyDatabase = () => ({
  users: [],
  caseStudies: [],
  projects: [],
  clients: [],
  team: [],
  invoices: [],
  inquiries: [],
  messages: [],
  activity: [],
  resetTokens: {},
  settings: defaultSettings(),
})

const readDatabase = () => {
  const saved = localStorage.getItem(DATA_KEY)
  if (!saved) return emptyDatabase()

  let parsed
  try {
    parsed = JSON.parse(saved)
  } catch (error) {
    throw new Error("Saved local agency data is invalid. Clear this site's local storage to start fresh.", { cause: error })
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error("Saved local agency data is invalid. Clear this site's local storage to start fresh.")
  }

  const data = { ...emptyDatabase(), ...parsed }
  collections.forEach((collection) => {
    if (!Array.isArray(data[collection])) {
      throw new Error(`Saved local agency ${collection} data is invalid. Clear this site’s local storage to start fresh.`)
    }
  })
  if (!data.resetTokens || typeof data.resetTokens !== 'object' || Array.isArray(data.resetTokens)) {
    data.resetTokens = {}
  }
  if (!data.settings || typeof data.settings !== 'object' || Array.isArray(data.settings)) {
    data.settings = defaultSettings()
  } else {
    data.settings = { ...defaultSettings(), ...data.settings }
  }
  return data
}

const saveDatabase = (data) => {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(data))
  } catch (error) {
    if (error?.name === 'QuotaExceededError' || error?.code === 22) {
      throw new Error("This browser's local storage is full. Remove some case-study images or clear local site data.", { cause: error })
    }
    throw error
  }
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

const createSession = (user) => ({
  token: `local-agency:${user.id}:${createId()}`,
  user: publicUser(user),
})

const getAuthenticatedUser = (data, expectedRole) => {
  const session = getAgencySession()
  if (!session) throw new Error('Sign in to continue.')
  const user = data.users.find((entry) => entry.id === session.user.id)
  if (!user) {
    clearAgencySession()
    throw new Error('Your local account is no longer available. Sign in again.')
  }
  if (expectedRole && user.role !== expectedRole) {
    throw new Error(`This account does not have ${expectedRole} access.`)
  }
  return user
}

const requireAdminDatabase = () => {
  const data = readDatabase()
  const user = getAuthenticatedUser(data, 'admin')
  return { data, user }
}

const recordActivity = (data, title, detail) => {
  data.activity.unshift({ id: createId(), title, detail, createdAt: new Date().toISOString() })
  data.activity = data.activity.slice(0, 30)
}

const newestFirst = (records) => records.slice().sort(
  (left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime(),
)

const createLocalImage = async (file) => {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.')
  if (file.size > IMAGE_SIZE_LIMIT) throw new Error('Images must be 10 MB or smaller.')
  if (typeof createImageBitmap !== 'function') {
    throw new Error('This browser cannot resize images for local storage.')
  }

  const bitmap = await createImageBitmap(file)
  try {
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Could not prepare this image for local storage.')
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.78)
  } finally {
    bitmap.close?.()
  }
}

const addAdminRecord = (collection, input, defaults = {}) => {
  const { data } = requireAdminDatabase()
  const record = {
    ...defaults,
    ...input,
    id: createId(),
    createdAt: new Date().toISOString(),
  }
  data[collection].unshift(record)
  recordActivity(data, `Added ${collection}`, record.name || record.client || record.id)
  saveDatabase(data)
  return record
}

const updateAdminRecord = (collection, id, updates) => {
  const { data } = requireAdminDatabase()
  const index = data[collection].findIndex((record) => record.id === id)
  if (index < 0) throw new Error('This record was not found in local storage.')
  const updated = { ...data[collection][index], ...updates, updatedAt: new Date().toISOString() }
  data[collection][index] = updated
  saveDatabase(data)
  return updated
}

const localAdminMessage = (input) => {
  const { data } = requireAdminDatabase()
  const clientEmail = String(input.clientEmail || '').trim().toLowerCase()
  const body = String(input.message || '').trim()
  if (!clientEmail || !body) throw new Error('Enter a client email and message.')
  const client = data.users.find((user) => user.role === 'client' && user.email === clientEmail)
  const message = {
    id: createId(),
    clientEmail,
    client: client?.name || clientEmail,
    sender: 'admin',
    body,
    read: false,
    createdAt: new Date().toISOString(),
  }
  data.messages.push(message)
  recordActivity(data, 'Sent a client message', client?.name || clientEmail)
  saveDatabase(data)
  return message
}

export const getAgencySession = () => {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
    if (!session || typeof session.token !== 'string' || !session.token.startsWith('local-agency:') || !session.user) {
      if (session) localStorage.removeItem(SESSION_KEY)
      return null
    }
    return session
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

export const saveAgencySession = (session) => {
  if (!session?.token?.startsWith('local-agency:') || !session.user) {
    throw new Error('Only local agency sessions can be saved in this Vite app.')
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export const clearAgencySession = () => localStorage.removeItem(SESSION_KEY)

const signUp = async (input, role) => {
  const data = readDatabase()
  const name = String(input.name || '').trim()
  const email = String(input.email || '').trim().toLowerCase()
  const password = String(input.password || '')
  if (!name || !email || password.length < 8) throw new Error('Enter your name, a valid email, and a password of at least 8 characters.')
  if (data.users.some((user) => user.email === email)) throw new Error('An account with this email already exists on this browser.')
  if (role === 'admin' && data.users.some((user) => user.role === 'admin')
    && input.inviteCode !== LOCAL_ADMIN_INVITE_CODE) {
    throw new Error('Additional local admin accounts require the invitation code LOCAL-ADMIN.')
  }

  const passwordSalt = createId()
  const user = {
    id: createId(),
    name,
    company: String(input.company || '').trim(),
    email,
    role,
    passwordSalt,
    passwordHash: await hashPassword(password, passwordSalt),
    createdAt: new Date().toISOString(),
  }
  data.users.push(user)
  saveDatabase(data)
  return createSession(user)
}

const login = async ({ email: inputEmail, password, expectedRole } = {}) => {
  const data = readDatabase()
  const email = String(inputEmail || '').trim().toLowerCase()
  const user = data.users.find((entry) => entry.email === email)
  const passwordHash = user && await hashPassword(String(password || ''), user.passwordSalt)
  if (!user || passwordHash !== user.passwordHash) {
    throw new Error('Email or password is incorrect for a local account on this browser.')
  }
  if (expectedRole && user.role !== expectedRole) {
    throw new Error(`This account does not have ${expectedRole} access.`)
  }
  return createSession(user)
}

const forgotPassword = (emailInput) => {
  const data = readDatabase()
  const email = String(emailInput || '').trim().toLowerCase()
  const user = data.users.find((entry) => entry.email === email)
  if (!user) return { message: 'No local account was found for that email on this browser.' }
  const resetToken = createId()
  data.resetTokens[resetToken] = user.id
  saveDatabase(data)
  return { resetToken, message: 'Local password reset token created for this browser.' }
}

const resetPassword = async (tokenInput, passwordInput) => {
  const data = readDatabase()
  const token = String(tokenInput || '')
  const userId = data.resetTokens[token]
  const user = data.users.find((entry) => entry.id === userId)
  const password = String(passwordInput || '')
  if (!user) throw new Error('This local password reset token is invalid or has expired.')
  if (password.length < 8) throw new Error('Choose a password with at least 8 characters.')
  user.passwordSalt = createId()
  user.passwordHash = await hashPassword(password, user.passwordSalt)
  delete data.resetTokens[token]
  saveDatabase(data)
  return { message: 'Password updated for this browser. You can now sign in.' }
}

const publicCaseStudies = () => ({ caseStudies: newestFirst(readDatabase().caseStudies) })

const submitInquiry = (input) => {
  const data = readDatabase()
  const user = getAuthenticatedUser(data, 'client')
  const project = String(input.project || '').trim()
  if (!project) throw new Error('Add a short description of your project.')
  const inquiry = {
    id: createId(),
    name: user.name,
    company: user.company,
    email: user.email,
    clientEmail: user.email,
    phone: String(input.phone || '').trim(),
    project,
    budget: String(input.budget || ''),
    status: 'New',
    createdAt: new Date().toISOString(),
  }
  data.inquiries.unshift(inquiry)
  recordActivity(data, 'Received a project inquiry', user.name)
  saveDatabase(data)
  return { inquiry }
}

const clientDashboard = () => {
  const data = readDatabase()
  const user = getAuthenticatedUser(data, 'client')
  const matchesClient = (record) => String(record.clientEmail || '').toLowerCase() === user.email
  return {
    user: publicUser(user),
    projects: newestFirst(data.projects.filter(matchesClient)),
    invoices: newestFirst(data.invoices.filter(matchesClient)),
    inquiries: newestFirst(data.inquiries.filter(matchesClient)),
    messages: data.messages.filter(matchesClient).slice().sort(
      (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
    ),
  }
}

const sendClientMessage = (messageInput) => {
  const data = readDatabase()
  const user = getAuthenticatedUser(data, 'client')
  const body = String(messageInput || '').trim()
  if (!body) throw new Error('Enter a message before sending.')
  const message = {
    id: createId(),
    clientEmail: user.email,
    client: user.name,
    sender: 'client',
    body,
    read: false,
    createdAt: new Date().toISOString(),
  }
  data.messages.push(message)
  recordActivity(data, 'Received a client message', user.name)
  saveDatabase(data)
  return { message }
}

const createCaseStudy = (input) => {
  const { data } = requireAdminDatabase()
  const id = createId()
  const slugBase = String(input.name || 'case-study')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'case-study'
  const record = {
    ...input,
    id,
    slug: `${slugBase}-${id.slice(0, 6)}`,
    name: String(input.name || '').trim(),
    image: String(input.image || ''),
    images: Array.isArray(input.images) ? input.images : [],
    deliverables: Array.isArray(input.deliverables) ? input.deliverables : [],
    createdAt: new Date().toISOString(),
  }
  data.caseStudies.unshift(record)
  recordActivity(data, 'Published a case study', record.name)
  saveDatabase(data)
  return record
}

const adminDashboard = () => {
  const { data } = requireAdminDatabase()
  const projects = newestFirst(data.projects)
  return {
    metrics: {
      activeProjects: data.projects.filter((project) => project.status !== 'Completed').length,
      monthlyRevenue: data.invoices
        .filter((invoice) => invoice.status === 'Paid')
        .reduce((total, invoice) => total + Number(invoice.amount || 0), 0),
      activeClients: data.clients.filter((client) => client.status === 'Active').length,
      pendingApprovals: data.inquiries.filter((inquiry) => inquiry.status === 'New').length,
    },
    projects: projects.slice(0, 5),
    activity: data.activity.slice(0, 8),
  }
}

const adminApi = {
  dashboard: async () => adminDashboard(),
  projects: async () => ({ projects: newestFirst(requireAdminDatabase().data.projects) }),
  createProject: async (input) => addAdminRecord('projects', input, { status: 'Planning', progress: 0 }),
  updateProject: async (id, input) => updateAdminRecord('projects', id, input),
  caseStudies: async () => ({ caseStudies: newestFirst(requireAdminDatabase().data.caseStudies) }),
  createCaseStudy: async (input) => createCaseStudy(input),
  deleteCaseStudy: async (id) => {
    const { data } = requireAdminDatabase()
    const removed = data.caseStudies.find((record) => record.id === id)
    data.caseStudies = data.caseStudies.filter((record) => record.id !== id)
    if (removed) recordActivity(data, 'Removed a case study', removed.name)
    saveDatabase(data)
    return { id, deleted: Boolean(removed) }
  },
  clients: async () => ({ clients: newestFirst(requireAdminDatabase().data.clients) }),
  createClient: async (input) => addAdminRecord('clients', {
    ...input,
    email: String(input.email || '').trim().toLowerCase(),
  }, { status: 'Onboarding' }),
  updateClient: async (id, input) => updateAdminRecord('clients', id, input),
  team: async () => ({ team: newestFirst(requireAdminDatabase().data.team) }),
  createTeamMember: async (input) => addAdminRecord('team', input, { status: 'Available' }),
  updateTeamMember: async (id, input) => updateAdminRecord('team', id, input),
  invoices: async () => ({ invoices: newestFirst(requireAdminDatabase().data.invoices) }),
  createInvoice: async (input) => addAdminRecord('invoices', {
    ...input,
    amount: Number(input.amount || 0),
    clientEmail: String(input.clientEmail || '').trim().toLowerCase(),
    date: new Date().toISOString(),
  }, { status: 'Due soon' }),
  updateInvoice: async (id, input) => updateAdminRecord('invoices', id, input),
  inquiries: async () => ({ inquiries: newestFirst(requireAdminDatabase().data.inquiries) }),
  updateInquiry: async (id, input) => updateAdminRecord('inquiries', id, input),
  replyToInquiry: async (id, messageInput) => {
    const message = String(messageInput || '').trim()
    if (!message) throw new Error('Enter a response before sending.')
    const inquiry = updateAdminRecord('inquiries', id, {
      response: message,
      respondedAt: new Date().toISOString(),
      status: 'Contacted',
    })
    return { inquiry }
  },
  messages: async () => ({ messages: newestFirst(requireAdminDatabase().data.messages) }),
  sendMessage: async (input) => ({ message: localAdminMessage(input) }),
  markMessageRead: async (id) => ({ message: updateAdminRecord('messages', id, { read: true }) }),
  settings: async () => ({ settings: requireAdminDatabase().data.settings }),
  updateSettings: async (input) => {
    const { data } = requireAdminDatabase()
    data.settings = {
      ...data.settings,
      ...input,
      notifications: { ...data.settings.notifications, ...input.notifications },
    }
    saveDatabase(data)
    return { settings: data.settings }
  },
}

export const agencyApi = {
  login,
  signupAdmin: (input) => signUp(input, 'admin'),
  signupClient: (input) => signUp(input, 'client'),
  forgotPassword,
  resetPassword,
  clientDashboard,
  publicCaseStudies,
  clientInquiries: () => {
    const data = readDatabase()
    const user = getAuthenticatedUser(data, 'client')
    return { inquiries: newestFirst(data.inquiries.filter((inquiry) => inquiry.clientEmail === user.email)) }
  },
  submitInquiry,
  sendClientMessage,
  uploadCaseStudyImage: createLocalImage,
  admin: adminApi,
}
