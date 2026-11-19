import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  attendee: { type: mongoose.Schema.Types.ObjectId, ref: 'PulseLiveUser', required: true, index: true },
  attendeeName: { type: String, required: true, trim: true, maxlength: 100 },
  attendeeEmail: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'PulseLiveEvent', required: true, index: true },
  eventSlug: { type: String, required: true, lowercase: true, index: true },
  eventTitle: { type: String, required: true, trim: true, maxlength: 160 },
  ticketType: { type: String, enum: ['General Admission', 'VIP Pass'], required: true },
  quantity: { type: Number, min: 1, max: 6, required: true },
  total: { type: Number, min: 0, required: true },
  status: { type: String, enum: ['requested', 'confirmed', 'cancelled'], default: 'requested', index: true },
  paymentStatus: { type: String, enum: ['not-integrated', 'pending', 'paid', 'refunded'], default: 'not-integrated' },
}, { timestamps: true })

export default mongoose.model('PulseLiveBooking', bookingSchema)