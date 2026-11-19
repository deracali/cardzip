import 'dotenv/config'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import helmet from 'helmet'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { learningCourses } from '../E-Learning/src/data/learningData.js'
import Course from './src/models/Course.js'
import User from './src/models/User.js'
import adminRoutes from './routes/admin.js'
import authRoutes from './routes/auth.js'
import courseRoutes from './routes/courses.js'
import instructorRoutes from './routes/instructor.js'
import studentRoutes from './routes/student.js'
import paymentRoutes, { paystackWebhookHandler, stripeWebhookHandler } from './routes/payments.js'

function configuration() {
  const missing = ['MONGODB_URI', 'JWT_SECRET'].filter((key) => !process.env[key]?.trim())
  if (missing.length) throw new Error(`Missing required settings: ${missing.join(', ')}.`)
  if (process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be at least 32 characters.')
  const origins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(',').map((origin) => origin.trim()).filter(Boolean)
  if (process.env.NODE_ENV === 'production' && (!process.env.ALLOWED_ORIGINS || origins.some((origin) => origin.includes('localhost')))) {
    throw new Error('Set ALLOWED_ORIGINS to the production website origin.')
  }
  return { origins, port: Number(process.env.PORT) || 5300 }
}

function createApp(config) {
  const app = express()
  app.disable('x-powered-by')
  app.use(helmet())
  app.use(cors({
    origin(origin, callback) {
      if (!origin || config.origins.includes(origin)) return callback(null, true)
      const error = new Error('This website origin is not allowed to access Skillora.')
      error.status = 403
      return callback(error)
    },
    credentials: true,
  }))
  app.post('/api/webhooks/paystack', express.raw({ type: 'application/json', limit: '100kb' }), paystackWebhookHandler)
  app.post('/api/webhooks/stripe', express.raw({ type: 'application/json', limit: '100kb' }), stripeWebhookHandler)
  app.use(express.json({ limit: '100kb' }))
  app.use(cookieParser())
  app.get('/health', (_request, response) => response.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }))
  app.use('/api/auth', authRoutes)
  app.use('/api/courses', courseRoutes)
  app.use('/api/student', studentRoutes)
  app.use('/api/payments', paymentRoutes)
  app.use('/api/instructor', instructorRoutes)
  app.use('/api/admin', adminRoutes)
  app.use((_request, response) => response.status(404).json({ error: 'API route not found.' }))
  app.use((error, _request, response, _next) => {
    if (error?.type === 'entity.parse.failed') return response.status(400).json({ error: 'Request must contain valid JSON.' })
    if (error?.code === 11000) return response.status(409).json({ error: 'That account or enrollment already exists.' })
    const status = Number.isInteger(error?.status) ? error.status : 500
    if (status >= 500) console.error('Skillora API request failed:', error)
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
  if (await User.exists({ role: 'admin' })) return
  await User.create({ name: 'Skillora Administrator', email, passwordHash: await bcrypt.hash(password, 12), role: 'admin' })
  console.log(`Seeded Skillora administrator: ${email}`)
}

async function seedCourses() {
  for (const course of learningCourses) {
    await Course.updateOne({ courseId: course.id }, { $setOnInsert: { ...course, courseId: course.id, published: true } }, { upsert: true })
  }
}

async function start() {
  const config = configuration()
  await mongoose.connect(process.env.MONGODB_URI)
  await seedCourses()
  await seedAdmin()
  createApp(config).listen(config.port, () => console.log(`Skillora API listening on http://localhost:${config.port}`))
}

start().catch((error) => {
  console.error('Unable to start Skillora API:', error.message)
  process.exitCode = 1
})