import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true, index: true },
  customerName: { type: String, required: true, trim: true, maxlength: 100 },
  customerEmail: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
  vehicleName: { type: String, required: true },
  vehicleImage: { type: String, required: true },
  vehicleCategory: { type: String, required: true },
  dailyPrice: { type: Number, required: true, min: 1 },
  pickup: { type: String, required: true, trim: true, maxlength: 160 },
  dropoff: { type: String, required: true, trim: true, maxlength: 160 },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  days: { type: Number, required: true, min: 1 },
  protection: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 1 },
  status: { type: String, enum: ['pending', 'pending_payment', 'confirmed', 'completed', 'cancelled'], default: 'pending', index: true },
  paymentStatus: { type: String, enum: ['not_started', 'pending', 'succeeded', 'failed'], default: 'not_started', index: true },
  paymentProvider: { type: String, enum: ['stripe', 'paystack'] },
  paymentReference: { type: String, maxlength: 200 },
  paymentCurrency: { type: String, uppercase: true, minlength: 3, maxlength: 3 },
  paidAt: Date,
  paymentExpiresAt: Date,
}, { timestamps: true })

bookingSchema.index({ vehicle: 1, status: 1, start: 1, end: 1 })

export default mongoose.model('Booking', bookingSchema)
