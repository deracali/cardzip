import mongoose from 'mongoose'

const subscriberSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'CreatorProfile', required: true, index: true },
  email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
  active: { type: Boolean, default: true },
}, { timestamps: true })

subscriberSchema.index({ creator: 1, email: 1 }, { unique: true })
export default mongoose.model('CreatorHubSubscriber', subscriberSchema)
