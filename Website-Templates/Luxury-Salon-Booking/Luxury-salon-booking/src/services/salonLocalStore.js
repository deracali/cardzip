import { appointmentStatuses, appointmentTimes, services, stylists } from '../components/salon/salonData'

const SESSION_KEY = 'lumiere-session'
const ACCOUNTS_KEY = 'lumiere-demo-accounts'
const SERVICES_KEY = 'lumiere-demo-services'
const APPOINTMENTS_KEY = 'lumiere-demo-appointments'
const ADMIN_EMAIL = 'admin@lumiere.local'
const ADMIN_PASSWORD = 'LumiereAdmin2026!'

function readList(key, initialValue) {
  const stored = localStorage.getItem(key)
  if (stored === null) {
    localStorage.setItem(key, JSON.stringify(initialValue))
    return initialValue
  }
  const parsed = JSON.parse(stored)
  if (!Array.isArray(parsed)) throw new Error(`Saved Lumière data for ${key} is invalid. Clear this browser's salon demo data and reload.`)
  return parsed
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' },
    key,
    256,
  )
  return bytesToHex(new Uint8Array(bits))
}

function hexToBytes(value) {
  return new Uint8Array(value.match(/.{2}/g).map((part) => Number.parseInt(part, 16)))
}

function demoAppointments() {
  const dates = [-3, -1, 0, 1, 2, 4].map((offset) => {
    const date = new Date()
    date.setDate(date.getDate() + offset)
    return date.toISOString().slice(0, 10)
  })
  const clients = [
    ['Olivia Parker', 'olivia.parker@example.test'],
    ['Noah Williams', 'noah.williams@example.test'],
    ['Ava Thompson', 'ava.thompson@example.test'],
    ['Liam Chen', 'liam.chen@example.test'],
    ['Mia Patel', 'mia.patel@example.test'],
    ['Ethan Brooks', 'ethan.brooks@example.test'],
  ]

  return services.slice(0, 4).map((service, index) => ({
    id: `demo-appointment-${index + 1}`,
    clientId: `demo-client-${index + 1}`,
    clientName: clients[index][0],
    clientEmail: clients[index][1],
    serviceId: service.id,
    serviceName: service.name,
    category: service.category,
    duration: service.duration,
    price: service.price,
    date: dates[index],
    time: appointmentTimes[index],
    stylist: stylists[index % stylists.length],
    notes: index === 1 ? 'Please use fragrance-free products.' : '',
    status: ['Requested', 'Confirmed', 'Completed', 'Requested'][index],
    createdAt: new Date(Date.now() - index * 3600000).toISOString(),
  }))
}

export function getSalonSession() {
  const stored = localStorage.getItem(SESSION_KEY)
  if (!stored) return null
  const session = JSON.parse(stored)
  return session?.user?.id && session.user.role ? session : null
}

export function saveSalonSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function updateLocalClient(userId, changes) {
  const accounts = readList(ACCOUNTS_KEY, [])
  const account = accounts.find((item) => item.id === userId)
  if (!account) throw new Error('Client account not found.')
  account.name = changes.name.trim()
  account.phone = changes.phone.trim()
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  const session = getSalonSession()
  if (session?.user.id === userId) {
    session.user = { ...session.user, name: account.name, phone: account.phone }
    saveSalonSession(session)
    return session.user
  }
  const client = { ...account }
  delete client.passwordSalt
  delete client.passwordHash
  return client
}

export function clearSalonSession() {
  localStorage.removeItem(SESSION_KEY)
}

export async function authenticateLocal({ email, password, signupDetails }) {
  const normalizedEmail = email.trim().toLowerCase()
  if (!signupDetails && normalizedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    return { user: { id: 'demo-admin', name: 'Lumière Administrator', email: ADMIN_EMAIL, role: 'admin' } }
  }

  const accounts = readList(ACCOUNTS_KEY, [])
  if (signupDetails) {
    if (accounts.some((account) => account.email === normalizedEmail)) throw new Error('An account with that email already exists.')
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const user = {
      id: `client-${crypto.randomUUID()}`,
      name: signupDetails.name.trim(),
      email: normalizedEmail,
      phone: signupDetails.phone.trim(),
      role: 'client',
    }
    accounts.push({ ...user, passwordSalt: bytesToHex(salt), passwordHash: await hashPassword(password, salt) })
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
    return { user }
  }

  const account = accounts.find((item) => item.email === normalizedEmail)
  if (!account) throw new Error('Email or password is incorrect.')
  const passwordMatches = await hashPassword(password, hexToBytes(account.passwordSalt))
  if (passwordMatches !== account.passwordHash) throw new Error('Email or password is incorrect.')
  const user = { ...account }
  delete user.passwordSalt
  delete user.passwordHash
  return { user }
}

export function getSalonServices() {
  return readList(SERVICES_KEY, services.map((service) => ({ ...service, active: true })))
}

export function saveSalonService(updatedService) {
  const saved = getSalonServices()
  const index = saved.findIndex((service) => service.id === updatedService.id)
  if (index < 0) throw new Error('Service not found.')
  saved[index] = { ...saved[index], ...updatedService }
  localStorage.setItem(SERVICES_KEY, JSON.stringify(saved))
  return saved[index]
}

export function addSalonService(service) {
  const saved = getSalonServices()
  const record = {
    ...service,
    id: `service-${crypto.randomUUID()}`,
    active: true,
  }
  saved.push(record)
  localStorage.setItem(SERVICES_KEY, JSON.stringify(saved))
  return record
}

export function getSalonAppointments() {
  return readList(APPOINTMENTS_KEY, demoAppointments())
}

export function getClientAppointments(userId) {
  return getSalonAppointments().filter((appointment) => appointment.clientId === userId)
}

export function createLocalAppointment(user, { serviceId, date, time, stylist, notes }) {
  const service = getSalonServices().find((item) => item.id === serviceId && item.active !== false)
  if (!service) throw new Error('Choose an available salon service.')
  if (date < new Date().toISOString().slice(0, 10)) throw new Error('Appointment date cannot be in the past.')
  if (!appointmentTimes.includes(time)) throw new Error('Choose an available appointment time.')
  if (!stylists.includes(stylist)) throw new Error('Choose an available stylist.')
  if (notes.length > 500) throw new Error('Appointment notes must be 500 characters or fewer.')

  const appointment = {
    id: `appointment-${crypto.randomUUID()}`,
    clientId: user.id,
    clientName: user.name,
    clientEmail: user.email,
    serviceId: service.id,
    serviceName: service.name,
    category: service.category,
    duration: service.duration,
    price: service.price,
    date,
    time,
    stylist,
    notes,
    status: 'Requested',
    createdAt: new Date().toISOString(),
  }
  const appointments = getSalonAppointments()
  appointments.unshift(appointment)
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments))
  return appointment
}

export function updateLocalAppointment(id, status) {
  if (!appointmentStatuses.includes(status)) throw new Error('Choose a valid appointment status.')
  const appointments = getSalonAppointments()
  const appointment = appointments.find((item) => item.id === id)
  if (!appointment) throw new Error('Appointment not found.')
  appointment.status = status
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments))
  return appointment
}

export function getLocalClients() {
  const appointments = getSalonAppointments()
  const accounts = readList(ACCOUNTS_KEY, [])
  const clientsById = new Map()
  for (const appointment of appointments) {
    clientsById.set(appointment.clientId, {
      id: appointment.clientId,
      name: appointment.clientName,
      email: appointment.clientEmail,
    })
  }
  for (const account of accounts) {
    const client = { ...account }
    delete client.passwordSalt
    delete client.passwordHash
    clientsById.set(client.id, client)
  }
  return Array.from(clientsById.values()).sort((left, right) => left.name.localeCompare(right.name))
}

export function resetSalonDemoData() {
  for (const key of [SESSION_KEY, ACCOUNTS_KEY, SERVICES_KEY, APPOINTMENTS_KEY]) localStorage.removeItem(key)
}
