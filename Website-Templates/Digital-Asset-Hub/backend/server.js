import 'dotenv/config'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import helmet from 'helmet'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import AdminUser from './src/models/AdminUser.js'
import AdminRecord from './src/models/AdminRecord.js'
import authRoutes from './routes/auth.js'
import adminRoutes from './routes/admin.js'
import clientRoutes from './routes/client.js'

function configuration() {
  const missing = ['MONGODB_URI', 'JWT_SECRET'].filter((key) => !process.env[key]?.trim())
  if (missing.length) throw new Error(`Missing required settings: ${missing.join(', ')}.`)
  if (process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be at least 32 characters.')

  const origins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
  if (process.env.NODE_ENV === 'production' && (!process.env.ALLOWED_ORIGINS || origins.some((origin) => origin.includes('localhost')))) {
    throw new Error('Set ALLOWED_ORIGINS to the production website origin.')
  }
  return { origins, port: Number(process.env.PORT) || 5000 }
}

function createApp(config) {
  const app = express()
  app.disable('x-powered-by')
  app.use(helmet())
  app.use(cors({
    origin(origin, callback) {
      if (!origin || config.origins.includes(origin)) return callback(null, true)
      const error = new Error('This website origin is not allowed to access the Digital Asset Hub API.')
      error.status = 403
      return callback(error)
    },
    credentials: true,
  }))
  app.use(express.json({ limit: '100kb' }))
  app.use(cookieParser())
  app.get('/health', (_request, response) => {
    response.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' })
  })
  app.use('/api/auth', authRoutes)
  app.use('/api/admin', adminRoutes)
  app.use('/api/client', clientRoutes)
  app.use((_request, response) => response.status(404).json({ error: 'API route not found.' }))
  app.use((error, _request, response, _next) => {
    if (error?.type === 'entity.parse.failed') return response.status(400).json({ error: 'Request must contain valid JSON.' })
    if (error?.code === 11000) return response.status(409).json({ error: 'An account or record already exists.' })
    const status = Number.isInteger(error?.status) ? error.status : 500
    if (status >= 500) console.error('Digital Asset Hub API request failed:', error)
    return response.status(status).json({ error: status >= 500 ? 'The request could not be completed.' : error.message })
  })
  return app
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) {
    console.warn('No administrator seeded. Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env.')
    return
  }
  if (password.length < 12 || password.length > 128) throw new Error('ADMIN_PASSWORD must be between 12 and 128 characters.')
  if (await AdminUser.exists({ email })) return
  await AdminUser.create({ email, passwordHash: await bcrypt.hash(password, 12) })
  console.log(`Seeded Digital Asset Hub administrator: ${email}`)
}

async function seedDemoRecords() {
  if (process.env.SEED_DEMO_DATA !== 'true' || await AdminRecord.exists()) return
  const examples = [
    { kind: 'trade', reference: 'TRD-DEMO-001', customerName: 'Maya Okafor', email: 'maya@example.com', item: 'Amazon US · $100 gift card', amount: 84, currency: 'USD', status: 'pending', detail: 'Sample record for admin review' },
    { kind: 'bill', reference: 'BIL-DEMO-001', customerName: 'Daniel Mensah', email: 'daniel@example.com', item: 'MTN · data bundle', amount: 10, currency: 'USD', status: 'processing', detail: 'Sample record for admin review' },
    { kind: 'card', reference: 'VCC-DEMO-001', customerName: 'Amara Bello', email: 'amara@example.com', item: 'Virtual USD card ending 4821', amount: 5, currency: 'USD', status: 'active', detail: 'Sample record for admin review' },
    { kind: 'customer', reference: 'CUS-DEMO-001', customerName: 'Tobi Akin', email: 'tobi@example.com', item: 'Sample individual profile', amount: 0, currency: 'USD', status: 'active', detail: 'Sample record for admin review' },
    { kind: 'support', reference: 'SUP-DEMO-001', customerName: 'Zainab Yusuf', email: 'zainab@example.com', item: 'Payment status question', amount: 0, currency: 'USD', status: 'open', detail: 'Sample record for admin review' },
  ]
  await AdminRecord.insertMany(examples)
  console.log('Seeded clearly labeled Digital Asset Hub demo records.')
}

async function start() {
  const config = configuration()
  await mongoose.connect(process.env.MONGODB_URI)
  await seedAdmin()
  await seedDemoRecords()
  createApp(config).listen(config.port, () => {
    console.log(`Digital Asset Hub API listening on http://localhost:${config.port}`)
  })
}

start().catch((error) => {
  console.error('Unable to start Digital Asset Hub API:', error.message)
  process.exitCode = 1
})