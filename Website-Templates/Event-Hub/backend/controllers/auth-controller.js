import bcrypt from 'bcryptjs'
import PlatformSettings from '../src/models/PlatformSettings.js'
import User from '../src/models/User.js'
import { clearSession, setSession } from '../src/middleware/auth.js'

const validEmail = (value) => typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

export async function register(request, response) {
  const { name, email, password, accountType = 'attendee' } = request.body ?? {}
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100 || !validEmail(email)) {
    return response.status(400).json({ error: 'Enter a valid name and email address.' })
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return response.status(400).json({ error: 'Password must be between 8 and 128 characters.' })
  }
  if (!['attendee', 'organizer'].includes(accountType)) {
    return response.status(400).json({ error: 'Choose an attendee or organizer account.' })
  }
  const settings = await PlatformSettings.findOne({ key: 'main' }).lean()
  if (accountType === 'organizer' && settings?.organizerApplications === false) {
    return response.status(403).json({ error: 'Organizer applications are currently closed.' })
  }
  const normalizedEmail = email.trim().toLowerCase()
  if (await User.exists({ email: normalizedEmail })) {
    return response.status(409).json({ error: 'An account already uses this email.' })
  }
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, 12),
    role: accountType,
    organizerStatus: accountType === 'organizer' ? 'pending' : 'not-applicable',
  })
  setSession(response, user.id)
  response.status(201).json({ user: user.toJSON() })
}

export async function login(request, response) {
  const { email, password } = request.body ?? {}
  if (!validEmail(email) || typeof password !== 'string' || !password || password.length > 128) {
    return response.status(400).json({ error: 'Enter your email and password.' })
  }
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash')
  if (!user || !user.active || !(await bcrypt.compare(password, user.passwordHash))) {
    return response.status(401).json({ error: 'Email or password is incorrect.' })
  }
  setSession(response, user.id)
  response.json({ user: user.toJSON() })
}

export function logout(_request, response) {
  clearSession(response)
  response.json({ success: true })
}

export function currentUser(request, response) {
  response.json({ user: request.user.toJSON() })
}
