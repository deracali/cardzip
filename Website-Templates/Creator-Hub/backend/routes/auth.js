import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { rateLimit } from 'express-rate-limit'
import CreatorProfile from '../src/models/CreatorProfile.js'
import User from '../src/models/User.js'
import { clearSessionCookie, requireAuth, setSessionCookie } from '../src/middleware/auth.js'

const router = Router()
const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many account requests. Try again shortly.' },
})

function validEmail(value) {
  return typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function normalizeHandle(value) {
  return typeof value === 'string'
    ? value.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 30)
    : ''
}

router.post('/register', authLimit, async (request, response) => {
  const { name, email, password } = request.body ?? {}
  const handle = normalizeHandle(request.body?.handle || name?.toLowerCase().replace(/\s+/g, '-'))
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100 || !validEmail(email)) {
    return response.status(400).json({ error: 'Enter a valid name and email address.' })
  }
  if (!/^[a-z0-9][a-z0-9._-]{2,29}$/.test(handle)) {
    return response.status(400).json({ error: 'Choose a creator link between 3 and 30 characters using letters, numbers, dots, underscores or hyphens.' })
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return response.status(400).json({ error: 'Password must be between 8 and 128 characters.' })
  }
  if (await CreatorProfile.exists({ handle })) return response.status(409).json({ error: 'That creator link is already taken.' })
  const user = await User.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: await bcrypt.hash(password, 12),
    role: 'creator',
  })
  const profile = await CreatorProfile.create({
    user: user.id,
    handle,
    displayName: name.trim(),
  })
  setSessionCookie(response, user.id)
  return response.status(201).json({ user: user.toJSON(), profile: profile.toJSON() })
})

router.post('/login', authLimit, async (request, response) => {
  const { email, password } = request.body ?? {}
  if (!validEmail(email) || typeof password !== 'string' || !password || password.length > 128) {
    return response.status(400).json({ error: 'Enter your email and password.' })
  }
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash')
  if (!user || !user.active || !(await bcrypt.compare(password, user.passwordHash))) {
    return response.status(401).json({ error: 'Email or password is incorrect.' })
  }
  setSessionCookie(response, user.id)
  return response.json({ user: user.toJSON() })
})

router.post('/logout', (_request, response) => {
  clearSessionCookie(response)
  return response.json({ success: true })
})

router.get('/me', requireAuth, async (request, response) => {
  const profile = request.user.role === 'creator'
    ? await CreatorProfile.findOne({ user: request.user.id })
    : null
  return response.json({ user: request.user.toJSON(), profile })
})

export default router
