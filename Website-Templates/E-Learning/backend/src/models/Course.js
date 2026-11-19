import mongoose from 'mongoose'

const courseSchema = new mongoose.Schema({
  courseId: { type: String, required: true, lowercase: true, trim: true, unique: true },
  category: { type: String, required: true, trim: true, maxlength: 80 },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  instructor: { type: String, required: true, trim: true, maxlength: 100 },
  instructorId: { type: String, required: true, lowercase: true, trim: true, maxlength: 80 },
  rating: { type: String, default: '0' },
  students: { type: String, default: '0' },
  price: { type: Number, min: 0, default: 0 },
  currency: { type: String, enum: ['NGN'], default: 'NGN', required: true },
  oldPrice: { type: Number, min: 0, default: 0 },
  duration: { type: String, trim: true, maxlength: 40, default: '' },
  lessons: { type: Number, min: 0, default: 0 },
  level: { type: String, trim: true, maxlength: 40, default: 'Beginner' },
  image: { type: String, trim: true, maxlength: 500, default: '' },
  tint: { type: String, trim: true, maxlength: 30, default: 'mint' },
  description: { type: String, trim: true, maxlength: 2000, default: '' },
  curriculum: { type: [String], default: [] },
  published: { type: Boolean, default: true, index: true },
}, { timestamps: true })

courseSchema.set('toJSON', {
  transform(_document, value) {
    delete value.__v
    value.id = value.courseId
    delete value._id
    return value
  },
})

export default mongoose.model('SkilloraCourse', courseSchema)