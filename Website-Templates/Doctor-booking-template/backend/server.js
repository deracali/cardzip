import 'dotenv/config'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import helmet from 'helmet'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import Doctor from './src/models/Doctor.js'
import User from './src/models/User.js'
import adminRoutes from './routes/admin.js'
import appointmentRoutes from './routes/appointments.js'
import authRoutes from './routes/auth.js'
import doctorRoutes from './routes/doctors.js'

const starterDoctors = [
  {
    slug: 'sarah-mitchell', name: 'Dr. Sarah Mitchell', specialty: 'Dermatology', credentials: 'MD, FAAD', location: 'New York, NY', fee: 120, rating: 4.9, reviews: 128, experience: '12 years',
    bio: 'Thoughtful, evidence-based dermatology care focused on preventive skin health and personalized treatment plans.',
    education: 'Columbia University College of Physicians and Surgeons', availability: ['9:00 AM', '10:30 AM', '1:00 PM', '2:30 PM'],
  },
  {
    slug: 'james-chen', name: 'Dr. James Chen', specialty: 'Cardiology', credentials: 'MD, FACC', location: 'Brooklyn, NY', fee: 150, rating: 4.8, reviews: 96, experience: '15 years',
    bio: 'Preventive heart care with clear communication and treatment plans that work in everyday life.',
    education: 'New York University School of Medicine', availability: ['8:30 AM', '11:00 AM', '1:30 PM', '3:00 PM'],
  },
  {
    slug: 'emily-rodriguez', name: 'Dr. Emily Rodriguez', specialty: 'Pediatrics', credentials: 'MD, FAAP', location: 'Queens, NY', fee: 100, rating: 5, reviews: 142, experience: '10 years',
    bio: 'Warm, family-centered care for children at every stage, with space for questions and clear guidance.',
    education: 'Albert Einstein College of Medicine', availability: ['9:30 AM', '11:30 AM', '2:00 PM', '4:00 PM'],
  },
]

function configuration() {
  const missing = ['MONGODB_URI', 'JWT_SECRET'].filter((key) => !process.env[key]?.trim())
  if (missing.length) throw new Error(`Missing required settings: ${missing.join(', ')}.`)
  if (process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be at least 32 characters.')
  const origins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000')
    .split(',').map((origin) => origin.trim()).filter(Boolean)
  if (process.env.NODE_ENV === 'production' && (!process.env.ALLOWED_ORIGINS || origins.some((origin) => origin.includes('localhost')))) {
    throw new Error('Set ALLOWED_ORIGINS to the production website origin.')
  }
  return { origins, port: Number(process.env.PORT) || 5200 }
}

function createApp(config) {
  const app = express()
  app.disable('x-powered-by')
  app.use(helmet())
  app.use(cors({
    origin(origin, callback) {
      if (!origin || config.origins.includes(origin)) return callback(null, true)
      const error = new Error('This website origin is not allowed to access Carewell.')
      error.status = 403
      return callback(error)
    },
    credentials: true,
  }))
  app.use(express.json({ limit: '100kb' }))
  app.use(cookieParser())
  app.get('/health', (_request, response) => response.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }))
  app.use('/api/auth', authRoutes)
  app.use('/api/doctors', doctorRoutes)
  app.use('/api/appointments', appointmentRoutes)
  app.use('/api/admin', adminRoutes)
  app.use((_request, response) => response.status(404).json({ error: 'API route not found.' }))
  app.use((error, _request, response, _next) => {
    if (error?.type === 'entity.parse.failed') return response.status(400).json({ error: 'Request must contain valid JSON.' })
    if (error?.code === 11000) return response.status(409).json({ error: 'An account or booking already exists.' })
    const status = Number.isInteger(error?.status) ? error.status : 500
    if (status >= 500) console.error('Carewell API request failed:', error)
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
  await User.create({ name: 'Carewell Administrator', email, passwordHash: await bcrypt.hash(password, 12), role: 'admin' })
  console.log(`Seeded Carewell administrator: ${email}`)
}

async function seedDoctors() {
  for (const doctor of starterDoctors) {
    await Doctor.updateOne({ slug: doctor.slug }, { $setOnInsert: doctor }, { upsert: true })
  }
}

async function start() {
  const config = configuration()
  await mongoose.connect(process.env.MONGODB_URI)
  await seedDoctors()
  await seedAdmin()
  createApp(config).listen(config.port, () => console.log(`Carewell API listening on http://localhost:${config.port}`))
}

start().catch((error) => {
  console.error('Unable to start Carewell API:', error.message)
  process.exitCode = 1
})