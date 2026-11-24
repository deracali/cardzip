import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'CarewellDoctor', required: true, index: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'CarewellUser', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'CarewellAppointment', required: true },
  displayName: { type: String, required: true, trim: true, maxlength: 100 },
  rating: { type: Number, required: true, min: 1, max: 5, validate: Number.isInteger },
  comment: { type: String, required: true, trim: true, minlength: 5, maxlength: 1000 },
}, { timestamps: true })

reviewSchema.index({ doctor: 1, patient: 1 }, { unique: true })

export default mongoose.model('CarewellReview', reviewSchema)
