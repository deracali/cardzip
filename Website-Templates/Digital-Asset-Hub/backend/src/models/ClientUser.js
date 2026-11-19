import mongoose from 'mongoose'

const clientUserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254, unique: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['client'], default: 'client' },
  active: { type: Boolean, default: true },
}, { timestamps: true })

clientUserSchema.set('toJSON', {
  transform(_document, value) {
    delete value.passwordHash
    delete value.__v
    value.id = String(value._id)
    delete value._id
    return value
  },
})

export default mongoose.model('DigitalAssetHubClient', clientUserSchema)