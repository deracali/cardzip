import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
  provider: { type: String, enum: ['paystack', 'stripe'], required: true },
  providerReference: { type: String, required: true, unique: true, index: true },
  providerSessionId: { type: String, default: '', index: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'SkilloraUser', required: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'SkilloraCourse', required: true },
  courseId: { type: String, required: true, lowercase: true },
  courseTitle: { type: String, required: true, trim: true, maxlength: 160 },
  instructorId: { type: String, required: true, lowercase: true },
  amount: { type: Number, required: true, min: 1 },
  currency: { type: String, enum: ['NGN'], required: true, default: 'NGN' },
  status: { type: String, enum: ['pending', 'paid', 'failed'], required: true, default: 'pending', index: true },
}, { timestamps: true })

paymentSchema.index({ provider: 1, providerSessionId: 1 }, { unique: true, partialFilterExpression: { providerSessionId: { $gt: '' } } })

export default mongoose.model('SkilloraPayment', paymentSchema)
