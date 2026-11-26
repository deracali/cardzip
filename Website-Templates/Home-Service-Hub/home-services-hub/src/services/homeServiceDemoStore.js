const sessionKey = 'fixflow-session'
const dataKey = 'fixflow-demo-data'
const demoPassword = 'FixFlowDemo2026!'

const demoUsers = [
  { id: 'user-admin', name: 'Jordan Lee', email: 'admin@fixflow.demo', phone: '(800) 555-0199', role: 'admin' },
  { id: 'user-client', name: 'Taylor Morgan', email: 'client@fixflow.demo', phone: '(303) 555-0142', role: 'client' },
  { id: 'user-client-two', name: 'Alex Rivera', email: 'alex@fixflow.demo', phone: '(303) 555-0178', role: 'client' },
]

const demoAppointments = [
  { id: 'request-1048', clientId: 'user-client', clientName: 'Taylor Morgan', clientEmail: 'client@fixflow.demo', serviceId: 'pipe', serviceName: 'Pipe repair', urgency: 'emergency', preferredDate: '2026-12-03', address: '1842 Cedar Avenue, Denver, CO', phone: '(303) 555-0142', description: 'Kitchen sink supply line is leaking.', quote: 189, status: 'Scheduled', isDemo: true, createdAt: '2026-11-24T16:20:00.000Z' },
  { id: 'request-1047', clientId: 'user-client-two', clientName: 'Alex Rivera', clientEmail: 'alex@fixflow.demo', serviceId: 'cooling', serviceName: 'AC maintenance', urgency: 'standard', preferredDate: '2026-12-06', address: '822 Pearl Street, Denver, CO', phone: '(303) 555-0178', description: 'Seasonal system tune-up.', quote: 149, status: 'Requested', isDemo: true, createdAt: '2026-11-23T10:35:00.000Z' },
  { id: 'request-1042', clientId: 'user-client', clientName: 'Taylor Morgan', clientEmail: 'client@fixflow.demo', serviceId: 'drain', serviceName: 'Drain cleaning', urgency: 'standard', preferredDate: '2026-11-17', address: '1842 Cedar Avenue, Denver, CO', phone: '(303) 555-0142', description: 'Slow kitchen drain.', quote: 99, status: 'Completed', isDemo: true, createdAt: '2026-11-15T09:10:00.000Z' },
]

function readData() {
  let saved
  try {
    saved = JSON.parse(localStorage.getItem(dataKey) || 'null')
  } catch (error) {
    console.error('Could not read FixFlow demo data; restoring bundled sample records.', error)
  }

  const mergeSeed = (seed, existing) => {
    const records = Array.isArray(existing) ? existing : []
    const savedIds = new Set(records.filter((item) => item && typeof item.id === 'string').map((item) => item.id))
    return [
      ...records.filter((item) => item && typeof item.id === 'string'),
      ...seed.filter((item) => !savedIds.has(item.id)),
    ]
  }
  const data = {
    ...(saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {}),
    users: mergeSeed(demoUsers, saved?.users),
    appointments: mergeSeed(demoAppointments, saved?.appointments),
  }
  localStorage.setItem(dataKey, JSON.stringify(data))
  return data
}

function saveData(data) {
  localStorage.setItem(dataKey, JSON.stringify(data))
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

async function passwordDigest(password) {
  if (!globalThis.crypto?.subtle) return `local-demo-${password}`
  const bytes = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

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

export const homeServiceDemoStore = {
  async login(_apiBaseUrl, { email, password, expectedRole }) {
    const normalizedEmail = email.trim().toLowerCase()
    const data = readData()
    let user
    if (password === demoPassword && normalizedEmail === 'admin@fixflow.demo') {
      user = demoUsers[0]
    } else if (password === demoPassword && normalizedEmail === 'client@fixflow.demo') {
      user = demoUsers[1]
    } else {
      const digest = await passwordDigest(password)
      user = data.users.find((item) => item.email === normalizedEmail && item.passwordHash === digest)
    }
    if (!user) throw new Error('Email or password is incorrect. Try a published demo account.')
    if (expectedRole && user.role !== expectedRole) throw new Error('This account cannot access that portal.')
    return { token: `demo-${createId('session')}`, user: { ...user, passwordHash: undefined } }
  },

  async signup(_apiBaseUrl, { name, email, phone, password }) {
    const data = readData()
    const normalizedEmail = email.trim().toLowerCase()
    if (data.users.some((user) => user.email === normalizedEmail)) throw new Error('An account with that email already exists.')
    const user = {
      id: createId('user'),
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      role: 'client',
      passwordHash: await passwordDigest(password),
    }
    data.users.push(user)
    saveData(data)
    return { token: `demo-${createId('session')}`, user: { ...user, passwordHash: undefined } }
  },

  async clientDashboard() {
    const session = getHomeServiceSession()
    const data = readData()
    const appointments = data.appointments.filter((item) => item.clientId === session?.user?.id)
    const demoAppointmentsForClient = demoAppointments
      .filter((item) => item.clientId === 'user-client')
      .map((item) => ({
        ...item,
        id: `sample-${session?.user?.id}-${item.id}`,
        clientId: session?.user?.id,
        isDemo: true,
      }))
    return {
      user: session?.user,
      appointments: appointments.length ? appointments : demoAppointmentsForClient,
    }
  },

  async createAppointment(_apiBaseUrl, body) {
    const session = getHomeServiceSession()
    if (session?.user?.role !== 'client') throw new Error('A client account is required to request service.')
    const names = { pipe: 'Pipe repair', drain: 'Drain cleaning', cooling: 'AC maintenance', heating: 'Heating' }
    const prices = { pipe: 129, drain: 99, cooling: 149, heating: 159 }
    const surcharges = { standard: 0, emergency: 60, weekend: 30 }
    if (!names[body.serviceId] || !Object.hasOwn(surcharges, body.urgency)) throw new Error('Choose a valid service and visit time.')
    const data = readData()
    const appointment = {
      ...body,
      id: createId('request'),
      clientId: session.user.id,
      clientName: session.user.name,
      clientEmail: session.user.email,
      serviceName: names[body.serviceId],
      quote: prices[body.serviceId] + surcharges[body.urgency],
      status: 'Requested',
      createdAt: new Date().toISOString(),
    }
    data.appointments.unshift(appointment)
    saveData(data)
    return { appointment }
  },

  async adminDashboard() {
    const data = readData()
    return {
      metrics: {
        clients: data.users.filter((user) => user.role === 'client').length,
        appointments: data.appointments.length,
        newRequests: data.appointments.filter((item) => item.status === 'Requested').length,
        activeAppointments: data.appointments.filter((item) => ['Scheduled', 'In Progress'].includes(item.status)).length,
      },
      appointments: data.appointments.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      clients: data.users.filter((user) => user.role === 'client').map((user) => {
        const client = { ...user }
        delete client.passwordHash
        return client
      }),
    }
  },

  async updateAppointment(_apiBaseUrl, id, status) {
    const statuses = ['Requested', 'Scheduled', 'In Progress', 'Completed', 'Cancelled']
    if (!statuses.includes(status)) throw new Error('Choose a valid appointment status.')
    const data = readData()
    const appointment = data.appointments.find((item) => item.id === id)
    if (!appointment) throw new Error('Service request not found.')
    appointment.status = status
    appointment.updatedAt = new Date().toISOString()
    saveData(data)
    return { appointment }
  },
}
