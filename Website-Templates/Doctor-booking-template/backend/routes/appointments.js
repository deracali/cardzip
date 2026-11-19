import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import Appointment from '../src/models/Appointment.js'
import Doctor from '../src/models/Doctor.js'
import { requireApprovedProvider, requireRole, requireUser } from '../src/middleware/auth.js'

const router = Router()

router.post('/', requireUser, requireRole('patient'), async (request, response) => {
  const { doctorSlug, appointmentType, startsAt, timeLabel } = request.body ?? {}
  const date = new Date(startsAt)
  if (typeof doctorSlug !== 'string' || !['in-person', 'online'].includes(appointmentType)
    || typeof timeLabel !== 'string' || Number.isNaN(date.valueOf()) || date <= new Date()) {
    return response.status(400).json({ error: 'Choose an available doctor, appointment type, and future date and time.' })
  }
  const doctor = await Doctor.findOne({ slug: doctorSlug, active: true })
  if (!doctor) return response.status(404).json({ error: 'This doctor is not currently accepting appointments.' })
  if (!doctor.availability.includes(timeLabel)) return response.status(400).json({ error: 'That appointment time is not in this doctor’s available schedule.' })
  const exists = await Appointment.exists({ doctor: doctor._id, startsAt: date, status: { $in: ['pending', 'confirmed'] } })
  if (exists) return response.status(409).json({ error: 'That appointment time was just booked. Please choose another time.' })
  const appointment = await Appointment.create({
    reference: `CW-${randomUUID().replaceAll('-', '').slice(0, 10).toUpperCase()}`,
    patient: request.user._id,
    patientName: request.user.name,
    patientEmail: request.user.email,
    doctor: doctor._id,
    doctorSlug: doctor.slug,
    doctorName: doctor.name,
    specialty: doctor.specialty,
    appointmentType,
    timeLabel,
    startsAt: date,
    fee: doctor.fee,
  })
  response.status(201).json({ appointment })
})

router.get('/mine', requireUser, requireRole('patient'), async (request, response) => {
  const appointments = await Appointment.find({ patient: request.user._id }).sort({ startsAt: -1 }).limit(100).lean()
  response.json({ appointments })
})

router.get('/provider', requireUser, requireApprovedProvider, async (request, response) => {
  const doctor = await Doctor.findOne({ providerUser: request.user._id })
  if (!doctor) return response.json({ appointments: [] })
  const appointments = await Appointment.find({ doctor: doctor._id }).sort({ startsAt: 1 }).limit(200).lean()
  response.json({ appointments })
})

export default router