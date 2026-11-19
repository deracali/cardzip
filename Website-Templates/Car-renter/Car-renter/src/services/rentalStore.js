import { vehicles } from '../data/vehicles'

const keys = {
  accounts: 'voltigo.accounts.v1',
  session: 'voltigo.session.v1',
  fleet: 'voltigo.fleet.v1',
  bookings: 'voltigo.bookings.v1',
}

function read(key, fallback) {
  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch (error) {
    console.error(`Unable to read Voltigo local data (${key}).`, error)
    throw new Error('Voltigo could not read saved browser data. Clear this site’s local storage and try again.', { cause: error })
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Unable to save Voltigo local data (${key}).`, error)
    throw new Error('Your browser could not save this change. Check available storage and try again.', { cause: error })
  }
}

export function getFleet() {
  return read(keys.fleet, vehicles.map((vehicle) => ({
    ...vehicle,
    id: vehicle.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    active: true,
  }))).filter((vehicle) => vehicle.active !== false)
}

export function getAccounts() {
  const accounts = read(keys.accounts, null)
  if (accounts) return accounts
  const initial = [{
    id: 'voltigo-admin',
    name: 'Voltigo Administrator',
    email: 'admin@voltigo.local',
    password: 'Admin123!',
    role: 'admin',
    createdAt: new Date().toISOString(),
  }]
  write(keys.accounts, initial)
  return initial
}

export function registerRenter({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase()
  const accounts = getAccounts()
  if (accounts.some((account) => account.email === normalizedEmail)) {
    throw new Error('An account with this email already exists.')
  }
  const account = {
    id: `renter-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: 'renter',
    createdAt: new Date().toISOString(),
  }
  write(keys.accounts, [...accounts, account])
  write(keys.session, account.id)
  return account
}

export function signIn(email, password, adminOnly = false) {
  const account = getAccounts().find((item) =>
    item.email === email.trim().toLowerCase() && item.password === password,
  )
  if (!account || (adminOnly && account.role !== 'admin')) {
    throw new Error(adminOnly
      ? 'Administrator email or password is incorrect.'
      : 'Email or password is incorrect.')
  }
  write(keys.session, account.id)
  return account
}

export function getCurrentUser() {
  const id = read(keys.session, null)
  const account = id ? getAccounts().find((item) => item.id === id) : null
  if (!account) return null
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    createdAt: account.createdAt,
  }
}

export function signOut() {
  window.localStorage.removeItem(keys.session)
}

export function getBookings() {
  return read(keys.bookings, [])
}

export function createBooking(booking, customer) {
  const user = getCurrentUser()
  if (!user || user.role !== 'renter') {
    throw new Error('Sign in with a renter account before confirming your reservation.')
  }
  const record = {
    id: `trip-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId: user.id,
    customerName: customer.name.trim() || user.name,
    customerEmail: user.email,
    vehicleId: booking.vehicle.id,
    vehicleName: booking.vehicle.name,
    vehicleCategory: booking.vehicle.category,
    vehicleImage: booking.vehicle.image,
    pickup: booking.pickup,
    dropoff: booking.dropoff,
    start: booking.start,
    end: booking.end,
    days: booking.days,
    protection: booking.protection,
    total: booking.total,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  write(keys.bookings, [record, ...getBookings()])
  return record
}

export function saveFleet(fleet) {
  write(keys.fleet, fleet)
}

export function updateBookingStatus(id, status) {
  write(keys.bookings, getBookings().map((booking) =>
    booking.id === id ? { ...booking, status } : booking,
  ))
}

export function addVehicle(vehicle) {
  const fleet = getFleet()
  const item = {
    ...vehicle,
    id: `car-${Date.now()}`,
    price: Number(vehicle.price),
    seats: Number(vehicle.seats),
    active: true,
  }
  saveFleet([...fleet, item])
  return item
}

export async function uploadVehicleImage(file) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim()
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim()
  if (!cloudName || !uploadPreset) {
    throw new Error('Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to enable vehicle uploads.')
  }
  if (!(file instanceof File) || !['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)
    || file.size === 0 || file.size > 10 * 1024 * 1024) {
    throw new Error('Choose a JPEG, PNG, WebP, or AVIF image up to 10 MB.')
  }
  const data = new FormData()
  data.append('file', file)
  data.append('upload_preset', uploadPreset)
  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, {
    method: 'POST',
    body: data,
  })
  const result = await response.json()
  if (!response.ok || !result.secure_url) {
    console.error('Cloudinary vehicle image upload failed:', result.error?.message || response.status)
    throw new Error(result.error?.message || 'Cloudinary could not upload this image.')
  }
  return result.secure_url
}

export function removeVehicle(id) {
  saveFleet(getFleet().map((vehicle) =>
    vehicle.id === id ? { ...vehicle, active: false } : vehicle,
  ))
}
