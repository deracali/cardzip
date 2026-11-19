import mongoose from 'mongoose'

const settingsSchema = new mongoose.Schema({
  key: { type: String, default: 'main', unique: true },
  platformName: { type: String, default: 'Skillora', trim: true, maxlength: 100 },
  supportEmail: { type: String, default: 'support@skillora.example', trim: true, maxlength: 254 },
  instructorApplications: { type: Boolean, default: true },
  announcement: { type: String, default: '', trim: true, maxlength: 500 },
}, { timestamps: true })

export default mongoose.model('SkilloraPlatformSettings', settingsSchema)