import mongoose from 'mongoose'

const adminUserSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254, unique: true },
  passwordHash: { type: String, required: true, select: false },
  active: { type: Boolean, default: true },
}, { timestamps: true })

adminUserSchema.set('toJSON', {
  transform(_document, value) {
    delete value.passwordHash
    delete value.__v
    value.id = String(value._id)
    delete value._id
    return value
  },
})

export default mongoose.model('DigitalAssetHubAdmin', adminUserSchema)