import mongoose from 'mongoose'

const rateSchema = new mongoose.Schema({
  asset: { type: String, required: true, trim: true, maxlength: 60 },
  payoutRate: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, uppercase: true, trim: true, maxlength: 8 },
}, { _id: false })

const adminSettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'main', unique: true },
  supportEmail: { type: String, default: 'support@example.com', trim: true, maxlength: 254 },
  maintenanceMode: { type: Boolean, default: false },
  rates: { type: [rateSchema], default: [
    { asset: 'Amazon US gift card', payoutRate: 0.84, currency: 'USD' },
    { asset: 'Apple gift card', payoutRate: 0.79, currency: 'USD' },
    { asset: 'Bitcoin', payoutRate: 61250, currency: 'USD' },
    { asset: 'USDT', payoutRate: 1, currency: 'USD' },
  ] },
}, { timestamps: true })

export default mongoose.model('DigitalAssetHubAdminSettings', adminSettingsSchema)