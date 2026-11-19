import 'dotenv/config'
import dns from 'node:dns'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import helmet from 'helmet'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import authRoutes from './routes/auth.js'
import bookingRoutes from './routes/bookings.js'
import adminRoutes from './routes/admin.js'
import paymentRoutes from './routes/payments.js'
import vehicleRoutes from './routes/vehicles.js'
import User from './src/models/User.js'
import Vehicle from './src/models/Vehicle.js'
import { createMongoHostLookup } from './src/services/mongoDns.js'

function loadConfiguration() {
  const required = ['MONGODB_URI', 'JWT_SECRET']
  const missing = required.filter((name) => !process.env[name]?.trim())
  if (missing.length) throw new Error(`Missing required backend settings: ${missing.join(', ')}.`)
  if (process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be at least 32 characters.')
  if (Boolean(process.env.ADMIN_EMAIL) !== Boolean(process.env.ADMIN_PASSWORD)) {
    throw new Error('Set both ADMIN_EMAIL and ADMIN_PASSWORD to seed the administrator.')
  }
  const sameSite = process.env.COOKIE_SAME_SITE || 'lax'
  if (!['lax', 'strict', 'none'].includes(sameSite)) throw new Error('COOKIE_SAME_SITE must be lax, strict, or none.')
  if (sameSite === 'none' && process.env.NODE_ENV !== 'production') {
    throw new Error('COOKIE_SAME_SITE=none requires HTTPS and should only be used in production.')
  }
  const origins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
  const dnsServers = (process.env.MONGODB_DNS_SERVERS || '')
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean)
  if (dnsServers.length && dnsServers.some((server) => !/^(?:\d{1,3}\.){3}\d{1,3}$|^[\da-fA-F:]+$/.test(server))) {
    throw new Error('MONGODB_DNS_SERVERS must be a comma-separated list of DNS server IP addresses.')
  }
  if (process.env.NODE_ENV === 'production' && (!process.env.ALLOWED_ORIGINS || origins.some((origin) => origin.includes('localhost')))) {
    throw new Error('Set ALLOWED_ORIGINS to your actual website origins before production startup.')
  }
  return { origins, dnsServers, port: Number(process.env.PORT) || 5000 }
}

async function initializeRentalData() {
  const legacyVehicles = await Vehicle.updateMany(
    { image: /^photo-/ },
    { $set: { active: false } },
  )
  if (legacyVehicles.modifiedCount) {
    console.log(`Disabled ${legacyVehicles.modifiedCount} legacy demo vehicle listing(s).`)
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminEmail || !adminPassword) {
    console.warn('No administrator seeded. Set ADMIN_EMAIL and ADMIN_PASSWORD before creating the first admin account.')
    return
  }
  if (adminPassword.length < 12 || adminPassword.length > 128) {
    throw new Error('ADMIN_PASSWORD must be between 12 and 128 characters.')
  }
  const existingAdmin = await User.findOne({ role: 'admin' })
  if (existingAdmin) return
  const passwordHash = await bcrypt.hash(adminPassword, 12)
  await User.create({ name: 'Voltigo Administrator', email: adminEmail, passwordHash, role: 'admin' })
  console.log(`Seeded the initial administrator account: ${adminEmail}`)
}

function createApp(configuration) {
  const app = express()
  app.disable('x-powered-by')
  app.use(helmet())
  app.use(cors({
    origin(origin, callback) {
      if (!origin || configuration.origins.includes(origin)) return callback(null, true)
      const error = new Error('This website origin is not allowed to access the Voltigo API.')
      error.status = 403
      callback(error)
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
  app.use('/api/vehicles', vehicleRoutes)
  app.use('/api/bookings', bookingRoutes)
  app.use('/api/payments', paymentRoutes)
  app.use('/api/admin', adminRoutes)
  app.use((_request, response) => response.status(404).json({ error: 'API route not found.' }))
  app.use((error, _request, response, _next) => {
    if (error?.type === 'entity.parse.failed') {
      return response.status(400).json({ error: 'The request body must contain valid JSON.' })
    }
    if (error instanceof mongoose.Error.ValidationError) {
      return response.status(400).json({ error: 'One or more fields are invalid.' })
    }
    if (error?.code === 11000) {
      return response.status(409).json({ error: 'An account with this email already exists.' })
    }
    if (error?.name === 'MulterError') {
      const message = error.code === 'LIMIT_FILE_SIZE'
        ? 'Vehicle photos must be 10 MB or smaller.'
        : 'Choose one valid vehicle photo.'
      return response.status(400).json({ error: message })
    }
    const status = Number.isInteger(error?.status) ? error.status : 500
    if (status >= 500) console.error('Voltigo API request failed:', error)
    response.status(status).json({ error: status === 500 ? 'The request could not be completed.' : error.message })
  })
  return app
}

async function start() {
  const configuration = loadConfiguration()
  if (configuration.dnsServers.length) {
    dns.setServers(configuration.dnsServers)
    console.log(`Using ${configuration.dnsServers.length} configured DNS resolvers for MongoDB.`)
  }
  await mongoose.connect(process.env.MONGODB_URI, {
    lookup: createMongoHostLookup(configuration.dnsServers),
  })
  console.log('Connected to MongoDB.')
  await initializeRentalData()
  const app = createApp(configuration)
  app.listen(configuration.port, () => {
    console.log(`Voltigo Express API listening on http://localhost:${configuration.port}`)
  })
}

start().catch((error) => {
  console.error('Unable to start Voltigo API:', error.message)
  process.exitCode = 1
})
