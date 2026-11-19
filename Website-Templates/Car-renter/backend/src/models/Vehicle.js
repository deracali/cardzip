import mongoose from 'mongoose'

const vehicleSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  category: { type: String, required: true, trim: true, maxlength: 40 },
  label: { type: String, default: '', trim: true, maxlength: 40 },
  price: { type: Number, required: true, min: 1, max: 10000 },
  details: { type: String, required: true, trim: true, maxlength: 180 },
  seats: { type: Number, required: true, min: 1, max: 20 },
  fuel: { type: String, required: true, trim: true, maxlength: 40 },
  image: { type: String, required: true, maxlength: 2048 },
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true })

export default mongoose.model('Vehicle', vehicleSchema)
