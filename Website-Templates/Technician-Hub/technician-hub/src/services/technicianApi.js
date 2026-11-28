const sessionKey = 'polarflow-session'
const usersKey = 'polarflow-users'
const bookingsKey = 'polarflow-bookings'
const membershipsKey = 'polarflow-memberships'
const adminInviteCode = 'POLARFLOW-LOCAL-ADMIN'
const initialData = {
  [usersKey]: [
    { id: 'demo-client-001', name: 'Avery Morgan', email: 'avery@example.demo', phone: '512-555-0118', role: 'client', createdAt: '2026-10-12T15:00:00.000Z' },
    { id: 'demo-client-002', name: 'Jordan Ellis', email: 'jordan@example.demo', phone: '512-555-0142', role: 'client', createdAt: '2026-10-18T15:00:00.000Z' },
    { id: 'demo-admin-001', name: 'PolarFlow Demo Admin', email: 'admin@example.demo', phone: '', role: 'admin', createdAt: '2026-10-10T15:00:00.000Z' },
  ],
  [bookingsKey]: [
    { id: 'demo-booking-001', reference: 'PF-DEMO101', userId: 'demo-client-001', serviceId: 'ac-tune-up', urgency: 'standard', estimate: 89, name: 'Avery Morgan', phone: '512-555-0118', email: 'avery@example.demo', zip: '78704', date: '2026-12-02', time: '8:00 AM - 10:00 AM', notes: '', status: 'requested', createdAt: '2026-10-22T15:00:00.000Z' },
    { id: 'demo-booking-002', reference: 'PF-DEMO102', userId: 'demo-client-002', serviceId: 'furnace-repair', urgency: 'standard', estimate: 129, name: 'Jordan Ellis', phone: '512-555-0142', email: 'jordan@example.demo', zip: '78745', date: '2026-12-05', time: '12:00 PM - 2:00 PM', notes: '', status: 'confirmed', createdAt: '2026-10-24T15:00:00.000Z' },
  ],
  [membershipsKey]: [
    { id: 'demo-membership-001', userId: 'demo-client-001', planName: 'Home Comfort Plan', amount: 19900, currency: 'USD', provider: 'local-demo', status: 'pending', paymentStatus: 'not_collected', externalReference: '', createdAt: '2026-10-22T15:00:00.000Z', expiresAt: null },
  ],
}

function readList(key) {
  try {
    let stored = window.localStorage.getItem(key)
    if (stored === null && Object.prototype.hasOwnProperty.call(initialData, key)) {
      stored = JSON.stringify(initialData[key])
      window.localStorage.setItem(key, stored)
    }
    const value = JSON.parse(stored || '[]')
    if (!Array.isArray(value)) throw new Error('Stored data is not a list.')
    return value
  } catch (error) {
    throw new Error(`Could not read local ${key} data: ${error.message}`, { cause: error })
  }
}

function writeList(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function createId(prefix) {
  return `${prefix}_${window.crypto.randomUUID()}`
}

async function passwordHash(password) {
  const bytes = new TextEncoder().encode(password)
  const digest = await window.crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function publicUser(user) {
  const safeUser = { ...user }
  delete safeUser.passwordHash
  return safeUser
}

function makeSession(user) {
  const session = { token: createId('local'), user: publicUser(user) }
  saveTechnicianSession(session)
  return session
}

function dashboardForClient(user) {
  const bookings = readList(bookingsKey)
    .filter((booking) => booking.userId === user.id)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
  const memberships = readList(membershipsKey)
    .filter((membership) => membership.userId === user.id)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
  const activeMembership = memberships.find((membership) =>
    membership.status === 'active' && Date.parse(membership.expiresAt) > Date.now(),
  ) || null
  return { bookings, memberships, activeMembership }
}

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

async function signup(body, role) {
  const email = String(body.email || '').trim().toLowerCase()
  const name = String(body.name || '').trim()
  const password = String(body.password || '')
  if (!email || !name || password.length < (role === 'admin' ? 10 : 8)) {
    throw new Error('Enter your name, a valid email address, and a longer password.')
  }
  const users = readList(usersKey)
  if (role === 'admin' && String(body.inviteCode || '').trim() !== adminInviteCode) {
    throw new Error('Enter the valid local demo administrator invitation code.')
  }
  if (role === 'admin' && users.some((user) => user.role === 'admin')) {
    throw new Error('An administrator account has already been created in this browser.')
  }
  if (users.some((user) => user.email === email)) throw new Error('An account with this email already exists.')
  const user = {
    id: createId('user'),
    name,
    email,
    role,
    passwordHash: await passwordHash(password),
    createdAt: new Date().toISOString(),
  }
  writeList(usersKey, [...users, user])
  return makeSession(user)
}

async function login({ email: inputEmail, password, expectedRole }) {
  const email = String(inputEmail || '').trim().toLowerCase()
  const hash = await passwordHash(String(password || ''))
  const user = readList(usersKey).find((record) => record.email === email && record.passwordHash === hash)
  if (!user || (expectedRole && user.role !== expectedRole)) {
    throw new Error('The email, password, or account type is incorrect.')
  }
  return makeSession(user)
}

function demoSession(id, role) {
  const user = readList(usersKey).find((record) => record.id === id && record.role === role)
  if (!user) throw new Error('Sample dashboard account is unavailable in local storage.')
  return makeSession(user)
}

function requireUser(role) {
  const session = getTechnicianSession()
  if (!session || session.user.role !== role) throw new Error(`Sign in with a ${role} account to continue.`)
  return session.user
}

export const technicianApi = {
  getSession: getTechnicianSession,
  saveSession: saveTechnicianSession,
  clearSession: clearTechnicianSession,
  demoClientSession: async () => demoSession('demo-client-001', 'client'),
  demoAdminSession: async () => demoSession('demo-admin-001', 'admin'),
  login,
  signupClient: (body) => signup(body, 'client'),
  signupAdmin: (body) => signup(body, 'admin'),
  createBooking: async (body) => {
    const session = getTechnicianSession()
    const email = String(body.email || '').trim().toLowerCase()
    const booking = {
      ...body,
      id: createId('booking'),
      reference: `PF-${window.crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      email,
      userId: session?.user.role === 'client' && session.user.email === email ? session.user.id : null,
      status: 'requested',
      createdAt: new Date().toISOString(),
    }
    writeList(bookingsKey, [...readList(bookingsKey), booking])
    return { booking }
  },
  clientDashboard: async () => dashboardForClient(requireUser('client')),
  membershipProviders: async () => ({ providers: ['demo'] }),
  createMembershipCheckout: async () => {
    const user = requireUser('client')
    const membership = {
      id: createId('membership'),
      userId: user.id,
      planName: 'Home Comfort Plan',
      amount: 19900,
      currency: 'USD',
      provider: 'local-demo',
      status: 'pending',
      paymentStatus: 'not_collected',
      createdAt: new Date().toISOString(),
      expiresAt: null,
    }
    writeList(membershipsKey, [...readList(membershipsKey), membership])
    return { membership }
  },
  verifyMembership: async ({ membershipId }) => {
    const membership = readList(membershipsKey).find((item) => item.id === membershipId)
    return { verified: false, membership: membership || null }
  },
  adminDashboard: async () => {
    requireUser('admin')
    const users = readList(usersKey)
    const bookings = readList(bookingsKey).sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    const memberships = readList(membershipsKey).sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    return {
      metrics: {
        customers: users.filter((user) => user.role === 'client').length,
        bookings: bookings.length,
        requestedBookings: bookings.filter((booking) => booking.status === 'requested').length,
        activeMemberships: memberships.filter((membership) =>
          membership.status === 'active' && Date.parse(membership.expiresAt) > Date.now(),
        ).length,
      },
      bookings,
      memberships,
      customers: users.filter((user) => user.role === 'client').map(publicUser),
    }
  },
  updateBooking: async (id, status) => {
    requireUser('admin')
    if (!['requested', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      throw new Error('Choose a valid booking status.')
    }
    let updated
    const bookings = readList(bookingsKey).map((booking) => {
      if (booking.id !== id) return booking
      updated = { ...booking, status, updatedAt: new Date().toISOString() }
      return updated
    })
    if (!updated) throw new Error('Service request not found.')
    writeList(bookingsKey, bookings)
    return { booking: updated }
  },
}
