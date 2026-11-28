import { stays as bundledStays } from '../data/stays.js'

const dataKey = 'escapes-demo-data-v1'
const sessionKey = 'escapes-session'
const invitationCode = 'ESCAPES-LOCAL-ADMIN'
const samplePasswordHashes = {
  'guest@escapes.demo': 'b7b3a0d52d3d2815ad9556795ee1b62ecf6d9d34a0a995031104540d82fdc8f8',
  'admin@escapes.demo': '3f0f589a691c71d9225762880c671cc808bb9172381255f14ffb1d91725fd3c3',
}

function futureDate(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function createInitialData() {
  const checkIn = futureDate(28)
  const checkOut = futureDate(31)
  return {
    users: [
      { id: 'demo-guest', name: 'Jordan Guest', email: 'guest@escapes.demo', role: 'client', passwordHash: samplePasswordHashes['guest@escapes.demo'], createdAt: '2025-01-12T10:00:00.000Z' },
      { id: 'demo-admin', name: 'Escapes Admin', email: 'admin@escapes.demo', role: 'admin', passwordHash: samplePasswordHashes['admin@escapes.demo'], createdAt: '2025-01-01T10:00:00.000Z' },
    ],
    stays: structuredClone(bundledStays),
    reservations: [
      {
        id: 'demo-reservation-upcoming',
        reference: 'ESC-DEMO428',
        userId: 'demo-guest',
        staySlug: 'azure-breeze',
        stayName: 'Azure Breeze Luxury Resort & Spa',
        nightlyRate: 180,
        nights: 3,
        guests: 2,
        roomTotal: 540,
        cleaningFee: 24,
        serviceFee: 18,
        total: 582,
        currency: 'USD',
        checkIn,
        checkOut,
        guestName: 'Jordan Guest',
        guestEmail: 'guest@escapes.demo',
        specialRequests: 'Late arrival around 8 PM.',
        status: 'confirmed',
        paymentStatus: 'not_collected',
        createdAt: '2025-11-18T10:00:00.000Z',
        demoData: true,
      },
      {
        id: 'demo-reservation-past',
        reference: 'ESC-DEMO217',
        userId: 'demo-guest',
        staySlug: 'palm-jungle-retreat',
        stayName: 'Palm Jungle Retreat',
        nightlyRate: 142,
        nights: 2,
        guests: 2,
        roomTotal: 284,
        cleaningFee: 24,
        serviceFee: 18,
        total: 326,
        currency: 'USD',
        checkIn: futureDate(-90),
        checkOut: futureDate(-88),
        guestName: 'Jordan Guest',
        guestEmail: 'guest@escapes.demo',
        specialRequests: '',
        status: 'completed',
        paymentStatus: 'not_collected',
        createdAt: '2025-08-03T10:00:00.000Z',
        demoData: true,
      },
    ],
    savedStays: { 'demo-guest': ['lagoon-ocean-suite', 'bamboo-hideaway'] },
  }
}

function readData() {
  if (typeof window === 'undefined') return createInitialData()
  const stored = window.localStorage.getItem(dataKey)
  if (!stored) {
    const initialData = createInitialData()
    window.localStorage.setItem(dataKey, JSON.stringify(initialData))
    return initialData
  }

  let data
  try {
    data = JSON.parse(stored)
  } catch {
    throw new Error('Escapes demo data could not be read. Clear this site’s local storage and reload.')
  }
  if (!data || typeof data !== 'object') throw new Error('Escapes demo data has an invalid format.')

  const initialData = createInitialData()
  for (const key of ['users', 'stays', 'reservations']) {
    if (!Array.isArray(data[key])) data[key] = []
    const identity = (item) => key === 'stays' ? item.slug : key === 'users' ? item.id || item.email : item.id
    const existingIds = new Set(data[key].map(identity))
    data[key].push(...initialData[key].filter((item) => !existingIds.has(identity(item))))
  }
  if (!data.savedStays || typeof data.savedStays !== 'object') data.savedStays = initialData.savedStays
  window.localStorage.setItem(dataKey, JSON.stringify(data))
  return data
}

function writeData(data) {
  window.localStorage.setItem(dataKey, JSON.stringify(data))
}

function makeSession(user) {
  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  }
  return { token: `local-demo-${user.id}`, user: safeUser }
}

async function hashPassword(password) {
  const bytes = new TextEncoder().encode(password)
  const digest = await window.crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function currentUser() {
  return getSession()?.user || null
}

function sampleReservationsFor(user) {
  const data = readData()
  return data.reservations
    .filter((reservation) => reservation.demoData)
    .map((reservation) => ({
      ...reservation,
      id: `${reservation.id}-${user.id}`,
      reference: `${reservation.reference}-${user.id.slice(-4).toUpperCase()}`,
      userId: user.id,
      guestName: user.name,
      guestEmail: user.email,
      demoData: true,
    }))
}

export function getSession() {
  if (typeof window === 'undefined') return null
  const session = JSON.parse(window.localStorage.getItem(sessionKey) || 'null')
  return session && typeof session.token === 'string' && session.user ? session : null
}

export function saveSession(session) {
  window.localStorage.setItem(sessionKey, JSON.stringify(session))
}

export function clearSession() {
  window.localStorage.removeItem(sessionKey)
}

export function getStays() {
  return readData().stays
}

export function getSavedStays(userId = currentUser()?.id) {
  if (!userId) return []
  return readData().savedStays[userId] || []
}

export function toggleSavedStay(slug) {
  const user = currentUser()
  if (!user || user.role !== 'client') throw new Error('Sign in with a guest account to save stays.')
  const data = readData()
  const saved = new Set(data.savedStays[user.id] || [])
  if (saved.has(slug)) saved.delete(slug)
  else saved.add(slug)
  data.savedStays[user.id] = [...saved]
  writeData(data)
  return data.savedStays[user.id]
}

export const escapesLocalStore = {
  async signup(body) {
    const data = readData()
    const email = String(body.email || '').trim().toLowerCase()
    if (data.users.some((user) => user.email === email)) throw new Error('An account with this email already exists.')
    const user = {
      id: `guest-${window.crypto.randomUUID()}`,
      name: String(body.name || '').trim(),
      email,
      role: 'client',
      passwordHash: await hashPassword(String(body.password || '')),
      createdAt: new Date().toISOString(),
    }
    data.users.push(user)
    writeData(data)
    return makeSession(user)
  },

  async signupAdmin(body) {
    if (body.inviteCode !== invitationCode) throw new Error('The local demo invitation code is incorrect.')
    const data = readData()
    const email = String(body.email || '').trim().toLowerCase()
    if (data.users.some((user) => user.email === email)) throw new Error('An account with this email already exists.')
    const user = {
      id: `admin-${window.crypto.randomUUID()}`,
      name: String(body.name || '').trim(),
      email,
      role: 'admin',
      passwordHash: await hashPassword(String(body.password || '')),
      createdAt: new Date().toISOString(),
    }
    data.users.push(user)
    writeData(data)
    return makeSession(user)
  },

  async login(body) {
    const data = readData()
    const email = String(body.email || '').trim().toLowerCase()
    const user = data.users.find((item) => item.email === email)
    if (!user || user.role !== body.expectedRole || user.passwordHash !== await hashPassword(String(body.password || ''))) {
      throw new Error('Email or password is incorrect.')
    }
    return makeSession(user)
  },

  async publicStays() {
    return { stays: getStays() }
  },

  async publicStay(slug) {
    const stay = getStays().find((item) => item.slug === slug)
    if (!stay) throw new Error('Stay not found.')
    return { stay }
  },

  async clientDashboard() {
    const user = currentUser()
    if (!user || user.role !== 'client') throw new Error('Sign in with a guest account to view your dashboard.')
    const data = readData()
    const reservations = data.reservations.filter((item) => item.userId === user.id)
    return { reservations: reservations.length ? reservations : sampleReservationsFor(user) }
  },

  async adminDashboard() {
    const user = currentUser()
    if (!user || user.role !== 'admin') throw new Error('Administrator access is required.')
    const data = readData()
    const customers = data.users.filter((item) => item.role === 'client').map((item) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      role: item.role,
      createdAt: item.createdAt,
    }))
    const reservations = data.reservations
    return {
      metrics: {
        customers: customers.length,
        reservations: reservations.length,
        requestedReservations: reservations.filter((item) => item.status === 'requested' || item.status === 'pending_payment').length,
        confirmedReservations: reservations.filter((item) => item.status === 'confirmed').length,
        grossBookingValue: reservations.reduce((total, item) => total + item.total, 0),
      },
      reservations,
      customers,
      stays: data.stays,
    }
  },

  async createBooking(body) {
    const user = currentUser()
    if (!user || user.role !== 'client') throw new Error('Sign in with a guest account to request a reservation.')
    if (body.guestEmail && String(body.guestEmail).trim().toLowerCase() !== user.email) {
      throw new Error('Guest email must match the signed-in account.')
    }
    const data = readData()
    const stay = data.stays.find((item) => item.slug === body.staySlug)
    if (!stay) throw new Error('Choose a valid stay.')
    const checkIn = new Date(`${body.checkIn}T00:00:00`)
    const checkOut = new Date(`${body.checkOut}T00:00:00`)
    const nights = Math.round((checkOut - checkIn) / 86400000)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (!Number.isFinite(nights) || checkIn < today || nights < 1) throw new Error('Choose a valid future check-in date and a later check-out date.')
    const guests = Number(body.guests)
    if (!Number.isInteger(guests) || guests < 1 || guests > 6) throw new Error('Choose between 1 and 6 guests.')
    const reservation = {
      id: `reservation-${window.crypto.randomUUID()}`,
      reference: `ESC-${window.crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      userId: user.id,
      staySlug: stay.slug,
      stayName: stay.name,
      nightlyRate: stay.price,
      nights,
      guests,
      roomTotal: stay.price * nights,
      cleaningFee: 24,
      serviceFee: 18,
      total: stay.price * nights + 42,
      currency: 'USD',
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      guestName: body.guestName || user.name,
      guestEmail: user.email,
      specialRequests: body.specialRequests || '',
      status: 'requested',
      paymentStatus: 'not_collected',
      createdAt: new Date().toISOString(),
      demoData: false,
    }
    data.reservations.unshift(reservation)
    writeData(data)
    return { reservation }
  },

  async updateBooking(id, status) {
    const user = currentUser()
    if (!user || user.role !== 'admin') throw new Error('Administrator access is required.')
    const data = readData()
    const reservation = data.reservations.find((item) => item.id === id)
    if (!reservation) throw new Error('Reservation not found.')
    if (!['requested', 'confirmed', 'cancelled', 'completed'].includes(status)) throw new Error('Choose a valid reservation status.')
    reservation.status = status
    reservation.updatedAt = new Date().toISOString()
    writeData(data)
    return { reservation }
  },

  async createStay(body) {
    const user = currentUser()
    if (!user || user.role !== 'admin') throw new Error('Administrator access is required.')
    const data = readData()
    const name = String(body.name || '').trim()
    const slug = name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    if (!slug || data.stays.some((item) => item.slug === slug)) throw new Error('A valid, unique property name is required.')
    const stay = {
      id: `stay-${window.crypto.randomUUID()}`,
      slug,
      name,
      shortName: name,
      area: String(body.area || '').trim(),
      price: Number(body.price),
      rating: 'New',
      reviews: 0,
      type: String(body.type || '').trim(),
      categories: String(body.categories || '').split(',').map((item) => item.trim()).filter(Boolean),
      image: String(body.image || '').trim(),
      room: String(body.room || '').trim(),
      description: String(body.description || '').trim(),
    }
    if (!stay.area || !Number.isFinite(stay.price) || stay.price < 1 || !stay.type || !stay.image.startsWith('https://') || !stay.room || !stay.description || !stay.categories.length) {
      throw new Error('Complete every property field with a valid HTTPS image URL.')
    }
    data.stays.push(stay)
    writeData(data)
    return { stay }
  },
}
