import mongoose from 'mongoose'

const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'SkilloraUser', required: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'SkilloraCourse', required: true, index: true },
  courseId: { type: String, required: true, lowercase: true, index: true },
  courseTitle: { type: String, required: true, trim: true, maxlength: 160 },
  instructorId: { type: String, required: true, lowercase: true, index: true },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  completedLessons: { type: [Number], default: [] },
  status: { type: String, enum: ['active', 'completed', 'refunded', 'suspended'], default: 'active', index: true },
}, { timestamps: true })

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true })

export default mongoose.model('SkilloraEnrollment', enrollmentSchema)