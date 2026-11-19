import mongoose from 'mongoose'

const clinicSettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'main', unique: true },
  clinicName: { type: String, default: 'Carewell', trim: true, maxlength: 100 },
  supportEmail: { type: String, default: 'hello@carewell.example', trim: true, maxlength: 254 },
  appointmentNotice: { type: String, default: 'Appointment requests are confirmed by the care team.', trim: true, maxlength: 300 },
}, { timestamps: true })

export default mongoose.model('CarewellClinicSettings', clinicSettingsSchema)