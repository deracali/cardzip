const SESSION_KEY = 'sizzle-smile-session'
const USERS_KEY = 'sizzle-demo-users'
const ORDERS_KEY = 'sizzle-demo-orders'

const DEMO_USERS = [
  { id: 'demo-customer-jordan', name: 'Jordan Lee', email: 'jordan@example.com', phone: '(555) 010-2401', role: 'client' },
  { id: 'demo-customer-maya', name: 'Maya Chen', email: 'maya@example.com', phone: '(555) 010-2402', role: 'client' },
  { id: 'demo-customer-elliot', name: 'Elliot Reed', email: 'elliot@example.com', phone: '(555) 010-2403', role: 'client' },
]

const DEMO_ORDERS = [
  {
    id: 'FD-DEMO-1042',
    clientId: 'demo-customer-jordan',
    clientName: 'Jordan Lee',
    clientEmail: 'jordan@example.com',
    items: [{ name: 'Sizzle Burger', quantity: 1, unitPrice: 18.99 }, { name: 'Truffle Fries', quantity: 1, unitPrice: 5.99 }],
    address: '128 Market Street, Apt 4',
    phone: '(555) 010-2401',
    instructions: '',
    subtotal: 24.98,
    deliveryFee: 1.99,
    total: 26.97,
    status: 'Delivered',
    createdAt: '2026-11-22T18:35:00.000Z',
  },
  {
    id: 'FD-DEMO-1048',
    clientId: 'demo-customer-jordan',
    clientName: 'Jordan Lee',
    clientEmail: 'jordan@example.com',
    items: [{ name: 'Crispy Chicken Bowl', quantity: 1, unitPrice: 16.99 }, { name: 'Lemonade', quantity: 1, unitPrice: 3.99 }],
    address: '128 Market Street, Apt 4',
    phone: '(555) 010-2401',
    instructions: 'Please leave at the front desk.',
    subtotal: 20.98,
    deliveryFee: 1.99,
    total: 22.97,
    status: 'On the way',
    createdAt: '2026-11-26T12:15:00.000Z',
  },
  {
    id: 'FD-DEMO-1051',
    clientId: 'demo-customer-maya',
    clientName: 'Maya Chen',
    clientEmail: 'maya@example.com',
    items: [{ name: 'Margherita Pizza', quantity: 1, unitPrice: 17.99 }],
    address: '42 Pine Avenue',
    phone: '(555) 010-2402',
    instructions: '',
    subtotal: 17.99,
    deliveryFee: 1.99,
    total: 19.98,
    status: 'Preparing',
    createdAt: '2026-11-25T19:40:00.000Z',
  },
  {
    id: 'FD-DEMO-1054',
    clientId: 'demo-customer-elliot',
    clientName: 'Elliot Reed',
    clientEmail: 'elliot@example.com',
    items: [{ name: 'Garden Pesto Pasta', quantity: 1, unitPrice: 15.99 }, { name: 'Sparkling Water', quantity: 1, unitPrice: 2.49 }],
    address: '9 Cedar Lane, Unit 2',
    phone: '(555) 010-2403',
    instructions: '',
    subtotal: 18.48,
    deliveryFee: 1.99,
    total: 20.47,
    status: 'Received',
    createdAt: '2026-11-24T17:20:00.000Z',
  },
]

function readList(key) {
  const defaults = key === USERS_KEY ? DEMO_USERS : key === ORDERS_KEY ? DEMO_ORDERS : []
  const value = localStorage.getItem(key)
  if (!value) {
    localStorage.setItem(key, JSON.stringify(defaults))
    return defaults
  }
  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) return defaults
    const merged = [...parsed, ...defaults.filter((item) => !parsed.some((storedItem) => storedItem.id === item.id))]
    if (merged.length !== parsed.length) localStorage.setItem(key, JSON.stringify(merged))
    return merged
  } catch {
    localStorage.setItem(key, JSON.stringify(defaults))
    return defaults
  }
}

function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function getFoodSession() {
  const value = localStorage.getItem(SESSION_KEY)
  if (!value) return null
  try {
    const session = JSON.parse(value)
    return session && typeof session.token === 'string' && session.user ? session : null
  } catch {
    return null
  }
}

export function saveFoodSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearFoodSession() {
  localStorage.removeItem(SESSION_KEY)
}

function ensureClientOrders(user) {
  const orders = readList(ORDERS_KEY)
  if (orders.some((order) => order.clientId === user.id)) return orders

  const sampleOrders = DEMO_ORDERS.slice(0, 2).map((order) => ({
    ...order,
    id: `${order.id}-${user.id}`,
    clientId: user.id,
    clientName: user.name,
    clientEmail: user.email,
    phone: user.phone || order.phone,
  }))
  const updatedOrders = [...sampleOrders, ...orders]
  localStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders))
  return updatedOrders
}

export function createFoodSession({ name, email, phone, role }) {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  if (!normalizedEmail) throw new Error('Enter a valid email address.')

  const users = readList(USERS_KEY)
  const existingUser = users.find((user) => user.email === normalizedEmail && user.role === role)
  const user = {
    ...existingUser,
    id: existingUser?.id || makeId('user'),
    name: String(name || '').trim() || existingUser?.name || normalizedEmail.split('@')[0],
    email: normalizedEmail,
    phone: String(phone || '').trim() || existingUser?.phone || '',
    role,
  }
  localStorage.setItem(USERS_KEY, JSON.stringify([
    ...users.filter((item) => item.id !== user.id),
    user,
  ]))

  const session = { token: `demo-${user.id}`, user }
  saveFoodSession(session)
  if (role === 'client') ensureClientOrders(user)
  return session
}

export function getClientDashboard(user) {
  const orders = ensureClientOrders(user)
    .filter((order) => order.clientId === user.id)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
  return { user, orders }
}

export function getAdminDashboard() {
  const users = readList(USERS_KEY)
  const clients = users.filter((user) => user.role === 'client')
  const recentOrders = readList(ORDERS_KEY)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
  const deliveredSales = recentOrders
    .filter((order) => order.status === 'Delivered')
    .reduce((sum, order) => sum + order.total, 0)

  return {
    metrics: {
      clients: clients.length,
      orders: recentOrders.length,
      openOrders: recentOrders.filter((order) => !['Delivered', 'Cancelled'].includes(order.status)).length,
      deliveredSales,
    },
    recentOrders,
    clients,
  }
}

export function createDemoOrder({ user, items, address, phone, instructions }) {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const order = {
    id: makeId('FD'),
    clientId: user.id,
    clientName: user.name,
    clientEmail: user.email,
    items,
    address,
    phone,
    instructions,
    subtotal,
    deliveryFee: items.length ? 1.99 : 0,
    total: subtotal + (items.length ? 1.99 : 0),
    status: 'Received',
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...readList(ORDERS_KEY)]))
  return order
}

export function updateDemoOrder(orderId, status) {
  const orders = readList(ORDERS_KEY)
  const order = orders.find((item) => item.id === orderId)
  if (!order) throw new Error('That demo order could not be found.')
  order.status = status
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
  return order
}
