import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'renter'], default: 'renter', required: true },
}, {
  timestamps: true,
  toJSON: {
    transform(_document, value) {
      value.id = value._id.toString()
      delete value._id
      delete value.__v
      delete value.passwordHash
      return value
    },
  },
})

export default mongoose.model('User', userSchema)
