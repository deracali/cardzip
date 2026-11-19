import mongoose from 'mongoose'

const settingsSchema = new mongoose.Schema({
  key: { type: String, default: 'main', unique: true },
  platformName: { type: String, default: 'PulseLive', trim: true, maxlength: 100 },
  supportEmail: { type: String, default: 'help@pulselive.example', trim: true, maxlength: 254 },
  announcement: { type: String, default: '', trim: true, maxlength: 500 },
  organizerApplications: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('PulseLiveSettings', settingsSchema)