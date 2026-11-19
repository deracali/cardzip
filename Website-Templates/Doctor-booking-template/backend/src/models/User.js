import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254, unique: true },
  phone: { type: String, trim: true, maxlength: 30, default: '' },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['patient', 'provider', 'admin'], default: 'patient', index: true },
  providerDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'CarewellDoctor', default: null },
  providerStatus: { type: String, enum: ['not-applicable', 'pending', 'approved', 'rejected'], default: 'not-applicable', index: true },
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true })

userSchema.set('toJSON', {
  transform(_document, value) {
    delete value.passwordHash
    delete value.__v
    value.id = String(value._id)
    delete value._id
    return value
  },
})

export default mongoose.model('CarewellUser', userSchema)