import { Router } from 'express'
import Appointment from '../src/models/Appointment.js'
import ClinicSettings from '../src/models/ClinicSettings.js'
import Doctor from '../src/models/Doctor.js'
import User from '../src/models/User.js'
import { requireRole, requireUser } from '../src/middleware/auth.js'

const router = Router()
router.use(requireUser, requireRole('admin'))

router.get('/summary', async (_request, response) => {
  const [patients, providers, pendingProviders, doctors, pendingAppointments, upcomingAppointments, recentAppointments] = await Promise.all([
    User.countDocuments({ role: 'patient' }),
    User.countDocuments({ role: 'provider' }),
    User.countDocuments({ role: 'provider', providerStatus: 'pending' }),
    Doctor.countDocuments({ active: true }),
    Appointment.countDocuments({ status: 'pending' }),
    Appointment.countDocuments({ status: { $in: ['pending', 'confirmed'] }, startsAt: { $gte: new Date() } }),
    Appointment.find().sort({ createdAt: -1 }).limit(8).lean(),
  ])
  response.json({ metrics: { patients, providers, pendingProviders, doctors, pendingAppointments, upcomingAppointments }, recentAppointments })
})

router.get('/appointments', async (_request, response) => {
  const appointments = await Appointment.find().sort({ startsAt: -1 }).limit(300).lean()
  response.json({ appointments })
})

router.patch('/appointments/:id', async (request, response) => {
  const { status } = request.body ?? {}
  if (!['confirmed', 'completed', 'cancelled', 'pending'].includes(status)) {
    return response.status(400).json({ error: 'Choose a valid appointment status.' })
  }
  const appointment = await Appointment.findByIdAndUpdate(request.params.id, { $set: { status } }, { new: true, runValidators: true })
  if (!appointment) return response.status(404).json({ error: 'Appointment not found.' })
  response.json({ appointment })
})

router.get('/providers', async (_request, response) => {
  const providers = await User.find({ role: 'provider' }).select('-passwordHash').populate('providerDoctor', 'name slug specialty').sort({ createdAt: -1 }).lean()
  response.json({ providers })
})

router.patch('/providers/:id', async (request, response) => {
  const { providerStatus, active, doctorSlug } = request.body ?? {}
  if ((providerStatus !== undefined && !['pending', 'approved', 'rejected'].includes(providerStatus))
    || (active !== undefined && typeof active !== 'boolean')
    || (doctorSlug !== undefined && typeof doctorSlug !== 'string')
    || Object.keys(request.body ?? {}).length === 0
    || Object.keys(request.body).some((key) => !['providerStatus', 'active', 'doctorSlug'].includes(key))) {
    return response.status(400).json({ error: 'Update provider approval, assigned doctor, or active status only.' })
  }
  const provider = await User.findOne({ _id: request.params.id, role: 'provider' })
  if (!provider) return response.status(404).json({ error: 'Provider not found.' })
  let assignedDoctor = null
  if (doctorSlug) {
    assignedDoctor = await Doctor.findOne({ slug: doctorSlug })
    if (!assignedDoctor) return response.status(404).json({ error: 'Doctor listing not found.' })
    if (assignedDoctor.providerUser && String(assignedDoctor.providerUser) !== String(provider._id)) {
      return response.status(409).json({ error: 'That doctor listing is already assigned to another provider.' })
    }
  }
  const selectedDoctorId = assignedDoctor?._id || (doctorSlug === '' ? null : provider.providerDoctor)
  if (providerStatus === 'approved' && !selectedDoctorId) {
    return response.status(400).json({ error: 'Assign a doctor listing before approving this provider.' })
  }
  if (doctorSlug !== undefined) {
    if (provider.providerDoctor && String(provider.providerDoctor) !== String(assignedDoctor?._id)) {
      await Doctor.findByIdAndUpdate(provider.providerDoctor, { $set: { providerUser: null } })
    }
    provider.providerDoctor = assignedDoctor?._id || null
    if (assignedDoctor) {
      assignedDoctor.providerUser = provider._id
      await assignedDoctor.save()
    }
  }
  if (providerStatus !== undefined) provider.providerStatus = providerStatus
  if (active !== undefined) provider.active = active
  if (provider.providerStatus === 'rejected' && provider.providerDoctor) {
    await Doctor.findByIdAndUpdate(provider.providerDoctor, { $set: { providerUser: null } })
    provider.providerDoctor = null
  }
  await provider.save()
  await provider.populate('providerDoctor', 'name slug specialty')
  response.json({ provider: provider.toJSON() })
})

router.get('/patients', async (_request, response) => {
  const patients = await User.find({ role: 'patient' }).select('-passwordHash').sort({ createdAt: -1 }).limit(500).lean()
  response.json({ patients })
})

router.patch('/patients/:id', async (request, response) => {
  const { active } = request.body ?? {}
  if (typeof active !== 'boolean') return response.status(400).json({ error: 'Set active to true or false.' })
  const patient = await User.findOneAndUpdate({ _id: request.params.id, role: 'patient' }, { $set: { active } }, { new: true }).select('-passwordHash')
  if (!patient) return response.status(404).json({ error: 'Patient not found.' })
  response.json({ patient })
})

router.get('/doctors', async (_request, response) => {
  const doctors = await Doctor.find().sort({ name: 1 }).lean()
  response.json({ doctors })
})

router.patch('/doctors/:id', async (request, response) => {
  const { active, fee } = request.body ?? {}
  if ((active !== undefined && typeof active !== 'boolean')
    || (fee !== undefined && (!Number.isFinite(fee) || fee < 0 || fee > 10000))
    || Object.keys(request.body ?? {}).length === 0
    || Object.keys(request.body).some((key) => !['active', 'fee'].includes(key))) {
    return response.status(400).json({ error: 'Update doctor availability or a valid visit fee only.' })
  }
  const doctor = await Doctor.findByIdAndUpdate(request.params.id, { $set: request.body }, { new: true, runValidators: true })
  if (!doctor) return response.status(404).json({ error: 'Doctor not found.' })
  response.json({ doctor })
})

router.get('/settings', async (_request, response) => {
  const settings = await ClinicSettings.findOneAndUpdate({ key: 'main' }, { $setOnInsert: { key: 'main' } }, { new: true, upsert: true, setDefaultsOnInsert: true }).lean()
  response.json({ settings })
})

router.put('/settings', async (request, response) => {
  const { clinicName, supportEmail, appointmentNotice } = request.body ?? {}
  if (typeof clinicName !== 'string' || clinicName.trim().length < 2 || clinicName.length > 100
    || typeof supportEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail) || supportEmail.length > 254
    || typeof appointmentNotice !== 'string' || appointmentNotice.length > 300) {
    return response.status(400).json({ error: 'Provide a clinic name, valid support email, and appointment notice.' })
  }
  const settings = await ClinicSettings.findOneAndUpdate(
    { key: 'main' },
    { $set: { clinicName: clinicName.trim(), supportEmail: supportEmail.trim(), appointmentNotice: appointmentNotice.trim() } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  )
  response.json({ settings })
})

export default router