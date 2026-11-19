import mongoose from 'mongoose'

const adminRecordSchema = new mongoose.Schema({
  kind: { type: String, enum: ['trade', 'bill', 'card', 'customer', 'support'], required: true, index: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'DigitalAssetHubClient', index: true },
  reference: { type: String, required: true, trim: true, maxlength: 80 },
  customerName: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
  item: { type: String, required: true, trim: true, maxlength: 180 },
  amount: { type: Number, min: 0, default: 0 },
  currency: { type: String, trim: true, maxlength: 8, default: 'USD' },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'flagged', 'rejected', 'open', 'resolved', 'active', 'suspended'], default: 'pending', index: true },
  detail: { type: String, trim: true, maxlength: 1000, default: '' },
  active: { type: Boolean, default: true },
}, { timestamps: true })

adminRecordSchema.index({ kind: 1, createdAt: -1 })

export default mongoose.model('DigitalAssetHubAdminRecord', adminRecordSchema)