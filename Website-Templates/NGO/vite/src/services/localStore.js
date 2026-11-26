import { campaigns } from '../data/campaigns'

const SESSION_KEY = 'kindred-ngo-session'
const USERS_KEY = 'kindred-ngo-users'
const DONATIONS_KEY = 'kindred-ngo-donations'
const DEMO_CLIENTS = [
  { id: 'demo-client-amina', name: 'Amina Niyonzima', email: 'amina@example.test', role: 'client' },
  { id: 'demo-client-james', name: 'James Okafor', email: 'james@example.test', role: 'client' },
]
const DEMO_DONATIONS = [
  {
    id: 'demo-pledge-water',
    userId: 'demo-client-amina',
    donorName: 'Amina Niyonzima',
    donorEmail: 'amina@example.test',
    campaignSlug: 'clean-water-schools',
    campaignTitle: 'Provide Clean Water to Rural Schools',
    amount: 50,
    frequency: 'once',
    status: 'Sample record',
    paymentStatus: 'Demo only',
    isDemo: true,
    createdAt: '2026-03-12T10:00:00.000Z',
  },
  {
    id: 'demo-pledge-classrooms',
    userId: 'demo-client-james',
    donorName: 'James Okafor',
    donorEmail: 'james@example.test',
    campaignSlug: 'classrooms-teachers',
    campaignTitle: 'Build Classrooms & Train 200 Teachers',
    amount: 25,
    frequency: 'monthly',
    status: 'Sample record',
    paymentStatus: 'Demo only',
    isDemo: true,
    createdAt: '2026-03-10T14:30:00.000Z',
  },
  {
    id: 'demo-pledge-clinics',
    userId: 'demo-client-amina',
    donorName: 'Amina Niyonzima',
    donorEmail: 'amina@example.test',
    campaignSlug: 'mobile-clinics',
    campaignTitle: 'Mobile Clinics for Remote Villages',
    amount: 100,
    frequency: 'once',
    status: 'Sample record',
    paymentStatus: 'Demo only',
    isDemo: true,
    createdAt: '2026-03-08T09:15:00.000Z',
  },
]

function readList(key) {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || '[]')
    return Array.isArray(value) ? value : []
  } catch (error) {
    console.error(`Could not read local Kindred data (${key}):`, error)
    return []
  }
}

function makeId(prefix) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`
}

export function getNGOSession() {
  if (typeof window === 'undefined') return null
  try {
    const session = JSON.parse(window.localStorage.getItem(SESSION_KEY) || 'null')
    return session?.token && session?.user ? session : null
  } catch (error) {
    console.error('Could not read the local Kindred session:', error)
    window.localStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function saveNGOSession(session) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  window.dispatchEvent(new Event('kindred-session-change'))
}

export function clearNGOSession() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(SESSION_KEY)
  window.dispatchEvent(new Event('kindred-session-change'))
}

export function createLocalSession({ name, email, role }) {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  if (!normalizedEmail) throw new Error('Enter a valid email address.')

  const users = readList(USERS_KEY)
  const existing = users.find((item) => item.email === normalizedEmail && item.role === role)
  const user = {
    id: existing?.id || makeId('user'),
    name: String(name || '').trim() || existing?.name || normalizedEmail.split('@')[0],
    email: normalizedEmail,
    role,
  }
  const nextUsers = [...users.filter((item) => item.id !== user.id), user]
  window.localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers))

  const session = { token: `local-${makeId('session')}`, user }
  saveNGOSession(session)
  return session
}

export function getClientDashboard(user) {
  const localDonations = readList(DONATIONS_KEY)
    .filter((donation) => donation.userId === user.id)
  const sampleDonations = DEMO_DONATIONS
    .map((donation) => ({
      ...donation,
      id: `${donation.id}-${user.id}`,
      userId: user.id,
      donorName: user.name,
      donorEmail: user.email,
    }))
  const donations = [...localDonations, ...sampleDonations]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
  return { user, donations }
}

export function getAdminDashboard() {
  const donations = [...readList(DONATIONS_KEY), ...DEMO_DONATIONS]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
  const clients = [...DEMO_CLIENTS, ...readList(USERS_KEY).filter((user) => user.role === 'client')]
  return {
    user: getNGOSession()?.user,
    clients,
    campaigns,
    donations,
    metrics: {
      clients: clients.length,
      campaigns: campaigns.length,
      pledges: donations.length,
      pendingReview: donations.filter((donation) => !donation.isDemo && donation.status === 'Pledge received').length,
      totalPledged: donations
        .filter((donation) => donation.paymentStatus === 'Paid')
        .reduce((total, donation) => total + donation.amount, 0),
    },
  }
}

export function createLocalDonation({ user, amount, frequency, campaignSlug, note }) {
  const numericAmount = Number(amount)
  if (!Number.isFinite(numericAmount) || numericAmount < 1 || numericAmount > 100000) {
    throw new Error('Gift amount must be between $1 and $100,000.')
  }
  if (!['once', 'monthly'].includes(frequency)) throw new Error('Choose a one-time or monthly gift.')
  const campaign = campaignSlug ? campaigns.find((item) => item.slug === campaignSlug) : null
  if (campaignSlug && !campaign) throw new Error('This campaign is no longer available.')

  const donation = {
    id: makeId('pledge'),
    userId: user.id,
    donorName: user.name,
    donorEmail: user.email,
    campaignSlug: campaign?.slug || null,
    campaignTitle: campaign?.title || 'Kindred General Fund',
    amount: Math.round(numericAmount * 100) / 100,
    frequency,
    note: String(note || '').trim().slice(0, 500),
    status: 'Pledge received',
    paymentStatus: 'Not processed',
    createdAt: new Date().toISOString(),
  }
  window.localStorage.setItem(DONATIONS_KEY, JSON.stringify([donation, ...readList(DONATIONS_KEY)]))
  return donation
}

export function updateLocalDonationStatus(id, status) {
  if (!['Acknowledged', 'Cancelled'].includes(status)) throw new Error('Choose Acknowledged or Cancelled.')
  const donations = readList(DONATIONS_KEY)
  const donation = donations.find((item) => item.id === id)
  if (!donation) throw new Error('Gift pledge not found.')
  donation.status = status
  donation.updatedAt = new Date().toISOString()
  window.localStorage.setItem(DONATIONS_KEY, JSON.stringify(donations))
  return donation
}
