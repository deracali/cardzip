import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'CreatorProfile', index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'CreatorHubUser', index: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'CreatorHubProduct' },
  type: { type: String, enum: ['pro', 'product'], required: true, index: true },
  provider: { type: String, enum: ['paystack'], default: 'paystack' },
  reference: { type: String, required: true, unique: true, index: true },
  amount: { type: Number, required: true, min: 1 },
  currency: { type: String, required: true, uppercase: true },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending', index: true },
  paidAt: Date,
  customerEmail: { type: String, required: true, lowercase: true },
}, { timestamps: true })

export default mongoose.model('CreatorHubPayment', paymentSchema)
