import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { rateLimit } from 'express-rate-limit'
import User from '../src/models/User.js'
import { clearSessionCookie, createSessionToken, requireAuth, setSessionCookie } from '../src/middleware/auth.js'

const router = Router()
const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many account requests. Try again in a few minutes.' },
})

function isValidEmail(email) {
  return typeof email === 'string' && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

router.post('/register', authLimit, async (request, response) => {
  const { name, email, password } = request.body ?? {}
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 100 || !isValidEmail(email)) {
    return response.status(400).json({ error: 'Enter a valid name and email address.' })
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return response.status(400).json({ error: 'Password must be between 8 and 128 characters.' })
  }

  const normalizedEmail = email.trim().toLowerCase()
  if (await User.exists({ email: normalizedEmail })) {
    return response.status(409).json({ error: 'An account with this email already exists.' })
  }
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, 12),
    role: 'renter',
  })
  setSessionCookie(response, user.id)
  return response.status(201).json({ user: user.toJSON() })
})

router.post('/login', authLimit, async (request, response) => {
  const { email, password, admin } = request.body ?? {}
  if (!isValidEmail(email) || typeof password !== 'string' || !password || password.length > 128) {
    return response.status(400).json({ error: 'Enter your email and password.' })
  }
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash')
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return response.status(401).json({ error: 'Email or password is incorrect.' })
  }
  if (admin === true && user.role !== 'admin') {
    return response.status(403).json({ error: 'This account does not have administrator access.' })
  }
  setSessionCookie(response, user.id)
  return response.json({ user: user.toJSON() })
})

router.post('/logout', (_request, response) => {
  clearSessionCookie(response)
  response.json({ success: true })
})

router.get('/me', requireAuth, (request, response) => {
  response.json({ user: request.user.toJSON() })
})

export default router
