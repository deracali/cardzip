import { randomUUID, timingSafeEqual } from 'node:crypto'
import { Router } from 'express'
import Appointment from '../src/models/Appointment.js'
import Doctor from '../src/models/Doctor.js'
import { requireApprovedProvider, requireRole, requireUser } from '../src/middleware/auth.js'

const router = Router()

function validPaymentSecret(request) {
  const expected = process.env.CAREWELL_PAYMENT_FULFILLMENT_SECRET
  const provided = request.get('x-carewell-payment-secret')
  if (!expected || !provided) return false
  const expectedBuffer = Buffer.from(expected)
  const providedBuffer = Buffer.from(provided)
  return expectedBuffer.length === providedBuffer.length && timingSafeEqual(expectedBuffer, providedBuffer)
}

async function createAppointment(request, response, payment = {}) {
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
    ...payment,
  })
  response.status(201).json({ appointment })
}

router.post('/paid', requireUser, requireRole('patient'), async (request, response) => {
  if (!process.env.CAREWELL_PAYMENT_FULFILLMENT_SECRET) {
    return response.status(503).json({ error: 'Paid appointment fulfillment is not configured on the API.' })
  }
  if (!validPaymentSecret(request)) return response.status(403).json({ error: 'Paid appointment fulfillment is not authorized.' })
  const { paymentProvider, paymentReference } = request.body ?? {}
  if (!['stripe', 'paystack'].includes(paymentProvider) || typeof paymentReference !== 'string'
    || !paymentReference.trim() || paymentReference.length > 200) {
    return response.status(400).json({ error: 'A valid payment provider and reference are required.' })
  }
  const existing = await Appointment.findOne({ paymentReference }).lean()
  if (existing) {
    if (String(existing.patient) !== String(request.user._id)) {
      return response.status(409).json({ error: 'This payment reference is already linked to another appointment.' })
    }
    return response.json({ appointment: existing })
  }
  try {
    await createAppointment(request, response, { paymentProvider, paymentReference: paymentReference.trim() })
  } catch (error) {
    if (error?.code !== 11000) throw error
    const duplicate = await Appointment.findOne({ paymentReference }).lean()
    if (!duplicate || String(duplicate.patient) !== String(request.user._id)) throw error
    return response.json({ appointment: duplicate })
  }
})

router.post('/', requireUser, requireRole('patient'), (request, response) => createAppointment(request, response))

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