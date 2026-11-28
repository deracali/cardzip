import assert from 'node:assert/strict'
import { webcrypto } from 'node:crypto'
import { test } from 'node:test'
import { escapesLocalStore, getSavedStays, getSession, saveSession, toggleSavedStay } from './escapesLocalStore.js'

function installBrowserStorage(initialValues = {}) {
  const values = new Map()
  for (const [key, value] of Object.entries(initialValues)) values.set(key, value)
  globalThis.window = {
    crypto: webcrypto,
    localStorage: {
      getItem: (key) => values.get(key) || null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    },
  }
}

test('local Vite demo serves seeded accounts and sample reservations without API calls', async () => {
  installBrowserStorage()
  const session = await escapesLocalStore.login({
    email: 'guest@escapes.demo',
    password: 'EscapesDemoGuest2026!',
    expectedRole: 'client',
  })
  saveSession(session)

  const dashboard = await escapesLocalStore.clientDashboard()
  assert.equal(dashboard.reservations.length, 2)
  assert.equal(dashboard.reservations.every((reservation) => reservation.demoData), true)
  assert.deepEqual(getSavedStays(session.user.id), ['lagoon-ocean-suite', 'bamboo-hideaway'])
  assert.equal(toggleSavedStay('azure-breeze').includes('azure-breeze'), true)
  assert.deepEqual(getSavedStays(session.user.id), ['lagoon-ocean-suite', 'bamboo-hideaway', 'azure-breeze'])
})

test('new guest accounts receive sample dashboard requests and bookings persist locally', async () => {
  installBrowserStorage()
  const session = await escapesLocalStore.signup({
    name: 'New Guest',
    email: 'new-guest@example.test',
    password: 'a-safe-local-password',
  })
  saveSession(session)
  const preview = await escapesLocalStore.clientDashboard()
  assert.equal(preview.reservations.length, 2)
  assert.equal(preview.reservations.every((reservation) => reservation.guestEmail === session.user.email), true)

  const booking = await escapesLocalStore.createBooking({
    staySlug: 'azure-breeze',
    checkIn: '2030-04-10',
    checkOut: '2030-04-12',
    guests: 2,
    guestName: 'New Guest',
  })
  assert.equal(booking.reservation.total, 402)
  assert.equal(booking.reservation.paymentStatus, 'not_collected')
  assert.equal(booking.reservation.demoData, false)
  assert.equal(getSession().user.id, session.user.id)
})

test('stale saved data is merged with missing bundled demo records', async () => {
  installBrowserStorage({
    'escapes-demo-data-v1': JSON.stringify({
      users: [],
      stays: [{ slug: 'custom-stay', name: 'Saved custom stay' }],
      reservations: [],
      savedStays: {},
    }),
  })

  const guest = await escapesLocalStore.login({
    email: 'guest@escapes.demo',
    password: 'EscapesDemoGuest2026!',
    expectedRole: 'client',
  })
  saveSession(guest)
  const dashboard = await escapesLocalStore.clientDashboard()
  assert.equal(dashboard.reservations.length, 2)
  assert.equal((await escapesLocalStore.publicStays()).stays.some((stay) => stay.slug === 'custom-stay'), true)
  assert.equal((await escapesLocalStore.publicStays()).stays.some((stay) => stay.slug === 'azure-breeze'), true)
})

test('admin demo login can manage local properties and reservations only', async () => {
  installBrowserStorage()
  const session = await escapesLocalStore.login({
    email: 'admin@escapes.demo',
    password: 'EscapesDemoAdmin2026!',
    expectedRole: 'admin',
  })
  saveSession(session)
  const dashboard = await escapesLocalStore.adminDashboard()
  assert.ok(dashboard.metrics.customers > 0)
  const { stay } = await escapesLocalStore.createStay({
    name: 'Test Garden Stay',
    area: 'Ubud, Bali',
    room: 'Garden Suite',
    price: '125',
    type: 'Eco stay',
    categories: 'Cabins, Boutique Hotels',
    image: 'https://images.example.test/garden.jpg',
    description: 'A quiet garden property created for the local demo.',
  })
  assert.equal(stay.slug, 'test-garden-stay')
  await assert.rejects(
    escapesLocalStore.login({ email: 'guest@escapes.demo', password: 'wrong-password', expectedRole: 'client' }),
    /Email or password is incorrect/,
  )
})
