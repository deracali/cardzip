import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'CreatorProfile', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 1000 },
  imageUrl: { type: String, default: '', trim: true, maxlength: 1000 },
  price: { type: Number, required: true, min: 0.01, max: 10000000 },
  currency: { type: String, default: 'USD', uppercase: true, match: /^[A-Z]{3}$/ },
  downloadUrl: { type: String, default: '', trim: true, maxlength: 1000 },
  adminManaged: { type: Boolean, default: false, index: true },
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true })

export default mongoose.model('CreatorHubProduct', productSchema)
