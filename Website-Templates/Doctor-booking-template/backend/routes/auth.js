import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { rateLimit } from 'express-rate-limit'
import User from '../src/models/User.js'
import { clearSession, requireUser, setSession } from '../src/middleware/auth.js'

const router = Router()
const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false })

function validEmail(value) {
  return typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

router.post('/register', authLimit, async (request, response) => {
  const { name, email, phone = '', password, accountType = 'patient' } = request.body ?? {}
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100 || !validEmail(email)) {
    return response.status(400).json({ error: 'Enter a valid name and email address.' })
  }
  if (typeof phone !== 'string' || phone.length > 30 || typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return response.status(400).json({ error: 'Enter a valid phone number and a password between 8 and 128 characters.' })
  }
  if (!['patient', 'provider'].includes(accountType)) return response.status(400).json({ error: 'Choose a patient or provider account.' })
  const normalizedEmail = email.trim().toLowerCase()
  if (await User.exists({ email: normalizedEmail })) return response.status(409).json({ error: 'An account already uses this email.' })
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    phone: phone.trim(),
    passwordHash: await bcrypt.hash(password, 12),
    role: accountType,
    providerStatus: accountType === 'provider' ? 'pending' : 'not-applicable',
  })
  setSession(response, user.id)
  return response.status(201).json({ user: user.toJSON() })
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
  setSession(response, user.id)
  return response.json({ user: user.toJSON() })
})

router.post('/logout', (_request, response) => {
  clearSession(response)
  return response.json({ success: true })
})

router.get('/me', requireUser, (request, response) => response.json({ user: request.user.toJSON() }))

export default router