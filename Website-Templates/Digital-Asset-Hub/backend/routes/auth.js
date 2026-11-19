import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { rateLimit } from 'express-rate-limit'
import AdminUser from '../src/models/AdminUser.js'
import AdminRecord from '../src/models/AdminRecord.js'
import ClientUser from '../src/models/ClientUser.js'
import { clearClientSession, requireClient, setClientSession } from '../src/middleware/clientAuth.js'

const router = Router()
const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false })

function validEmail(value) {
  return typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

router.post('/register', authLimit, async (request, response) => {
  const { name, email, password } = request.body ?? {}
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100 || !validEmail(email)) {
    return response.status(400).json({ error: 'Enter a valid name and email address.' })
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return response.status(400).json({ error: 'Password must be between 8 and 128 characters.' })
  }
  const normalizedEmail = email.trim().toLowerCase()
  if (await ClientUser.exists({ email: normalizedEmail }) || await AdminUser.exists({ email: normalizedEmail })) {
    return response.status(409).json({ error: 'An account already uses this email.' })
  }
  const user = await ClientUser.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, 12),
  })
  await AdminRecord.create({
    kind: 'customer',
    accountId: user.id,
    reference: `CUS-${user.id.slice(-8).toUpperCase()}`,
    customerName: user.name,
    email: user.email,
    item: 'Digital Asset Hub client account',
    status: 'active',
    detail: 'Client account created',
  })
  setClientSession(response, user.id)
  return response.status(201).json({ user: user.toJSON() })
})

router.post('/login', authLimit, async (request, response) => {
  const { email, password } = request.body ?? {}
  if (!validEmail(email) || typeof password !== 'string' || !password || password.length > 128) {
    return response.status(400).json({ error: 'Enter your email and password.' })
  }
  const user = await ClientUser.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash')
  if (!user || !user.active || !(await bcrypt.compare(password, user.passwordHash))) {
    return response.status(401).json({ error: 'Email or password is incorrect.' })
  }
  setClientSession(response, user.id)
  return response.json({ user: user.toJSON() })
})

router.post('/logout', (_request, response) => {
  clearClientSession(response)
  return response.json({ success: true })
})

router.get('/me', requireClient, (request, response) => response.json({ user: request.client.toJSON() }))

export default router