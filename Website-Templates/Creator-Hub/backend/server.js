import 'dotenv/config'
import dns from 'node:dns'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import helmet from 'helmet'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import authRoutes from './routes/auth.js'
import creatorRoutes from './routes/creators.js'
import contentRoutes from './routes/content.js'
import adminRoutes from './routes/admin.js'
import paymentRoutes from './routes/payments.js'
import siteRoutes from './routes/site.js'
import User from './src/models/User.js'
import CreatorProfile from './src/models/CreatorProfile.js'

function configuration() {
  const required = ['MONGODB_URI', 'JWT_SECRET']
  const missing = required.filter((key) => !process.env[key]?.trim())
  if (missing.length) throw new Error(`Missing required settings: ${missing.join(', ')}.`)
  if (process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be at least 32 characters.')
  const sameSite = process.env.COOKIE_SAME_SITE || 'lax'
  if (!['lax', 'strict', 'none'].includes(sameSite)) throw new Error('COOKIE_SAME_SITE must be lax, strict, or none.')
  const origins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
    .split(',').map((origin) => origin.trim()).filter(Boolean)
  const dnsServers = (process.env.MONGODB_DNS_SERVERS || '')
    .split(',').map((server) => server.trim()).filter(Boolean)
  if (process.env.NODE_ENV === 'production' && (!process.env.ALLOWED_ORIGINS || origins.some((origin) => origin.includes('localhost')))) {
    throw new Error('Set ALLOWED_ORIGINS to the production Creator Hub website origin.')
  }
  return { origins, dnsServers, port: Number(process.env.PORT) || 5100, sameSite }
}

function createApp(config) {
  const app = express()
  app.disable('x-powered-by')
  app.use(helmet())
  app.use(cors({
    origin(origin, callback) {
      if (!origin || config.origins.includes(origin)) return callback(null, true)
      const error = new Error('This website origin is not allowed to access Creator Hub.')
      error.status = 403
      return callback(error)
    },
    credentials: true,
  }))
  app.use(express.json({
    limit: '100kb',
    verify(request, _response, buffer) {
      if (request.originalUrl.startsWith('/api/payments/webhooks/')) request.rawBody = buffer
    },
  }))
  app.use(cookieParser())
  app.get('/health', (_request, response) => {
    response.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' })
  })
  app.use('/api/auth', authRoutes)
  app.use('/api/creators', creatorRoutes)
  app.use('/api/content', contentRoutes)
  app.use('/api/admin', adminRoutes)
  app.use('/api/payments', paymentRoutes)
  app.use('/api/site', siteRoutes)
  app.use((_request, response) => response.status(404).json({ error: 'API route not found.' }))
  app.use((error, _request, response, _next) => {
    if (error?.type === 'entity.parse.failed') return response.status(400).json({ error: 'Request must contain valid JSON.' })
    if (error instanceof mongoose.Error.ValidationError) return response.status(400).json({ error: 'One or more fields are invalid.' })
    if (error?.code === 11000) return response.status(409).json({ error: 'That email or creator handle is already registered.' })
    const status = Number.isInteger(error?.status) ? error.status : 500
    if (status >= 500) console.error('Creator Hub API request failed:', error)
    return response.status(status).json({ error: status === 500 ? 'The request could not be completed.' : error.message })
  })
  return app
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) {
    console.warn('No platform administrator seeded. Set ADMIN_EMAIL and ADMIN_PASSWORD in the backend environment.')
    return
  }
  if (password.length < 12 || password.length > 128) throw new Error('ADMIN_PASSWORD must be between 12 and 128 characters.')
  if (await User.exists({ role: 'admin' })) return
  await User.create({
    name: 'Creator Hub Administrator',
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: 'admin',
    active: true,
  })
  console.log(`Seeded Creator Hub administrator: ${email}`)
}

async function start() {
  const config = configuration()
  if (config.dnsServers.length) dns.setServers(config.dnsServers)
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to Creator Hub MongoDB.')
  await seedAdmin()
  await CreatorProfile.updateMany({ plan: { $exists: false } }, { $set: { plan: 'free' } })
  createApp(config).listen(config.port, () => {
    console.log(`Creator Hub API listening on http://localhost:${config.port}`)
  })
}

start().catch((error) => {
  console.error('Unable to start Creator Hub API:', error.message)
  process.exitCode = 1
})
