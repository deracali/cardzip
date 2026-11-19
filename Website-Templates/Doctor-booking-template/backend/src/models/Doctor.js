import mongoose from 'mongoose'

const doctorSchema = new mongoose.Schema({
  slug: { type: String, required: true, lowercase: true, trim: true, unique: true },
  providerUser: { type: mongoose.Schema.Types.ObjectId, ref: 'CarewellUser', default: null, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  specialty: { type: String, required: true, trim: true, maxlength: 80 },
  credentials: { type: String, trim: true, maxlength: 100, default: '' },
  location: { type: String, trim: true, maxlength: 120, default: '' },
  fee: { type: Number, min: 0, default: 0 },
  rating: { type: Number, min: 0, max: 5, default: 5 },
  reviews: { type: Number, min: 0, default: 0 },
  experience: { type: String, trim: true, maxlength: 40, default: '' },
  bio: { type: String, trim: true, maxlength: 1200, default: '' },
  education: { type: String, trim: true, maxlength: 240, default: '' },
  availability: { type: [String], default: [] },
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true })

export default mongoose.model('CarewellDoctor', doctorSchema)