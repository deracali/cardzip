import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254, unique: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['creator', 'admin'], default: 'creator', index: true },
  active: { type: Boolean, default: true, index: true },
  plan: { type: String, enum: ['free', 'pro'], default: 'free' },
  paystackCustomerCode: { type: String, default: '' },
  paystackSubscriptionCode: { type: String, default: '', index: true },
  proNextPaymentAt: Date,
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

export default mongoose.model('CreatorHubUser', userSchema)
