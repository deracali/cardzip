import mongoose from 'mongoose'

const appointmentSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'CarewellUser', required: true, index: true },
  patientName: { type: String, required: true, trim: true, maxlength: 100 },
  patientEmail: { type: String, required: true, lowercase: true, trim: true, maxlength: 254, index: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'CarewellDoctor', required: true, index: true },
  doctorSlug: { type: String, required: true, lowercase: true, index: true },
  doctorName: { type: String, required: true, trim: true, maxlength: 120 },
  specialty: { type: String, required: true, trim: true, maxlength: 80 },
  appointmentType: { type: String, enum: ['in-person', 'online'], required: true },
  timeLabel: { type: String, required: true, trim: true, maxlength: 20 },
  startsAt: { type: Date, required: true, index: true },
  fee: { type: Number, required: true, min: 0 },
  paymentProvider: { type: String, enum: ['stripe', 'paystack'], default: undefined },
  paymentReference: { type: String, trim: true, default: undefined },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending', index: true },
}, { timestamps: true })

appointmentSchema.index({ doctor: 1, startsAt: 1, status: 1 })
appointmentSchema.index({ paymentReference: 1 }, { unique: true, sparse: true })

export default mongoose.model('CarewellAppointment', appointmentSchema)