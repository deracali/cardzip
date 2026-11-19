import mongoose from 'mongoose'

const sessionSchema = new mongoose.Schema({
  time: { type: String, trim: true, maxlength: 30, default: '' },
  end: { type: String, trim: true, maxlength: 30, default: '' },
  track: { type: String, trim: true, maxlength: 80, default: '' },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  speaker: { type: String, trim: true, maxlength: 120, default: '' },
  kind: { type: String, trim: true, maxlength: 40, default: 'Talk' },
}, { _id: false })

const eventSchema = new mongoose.Schema({
  slug: { type: String, required: true, lowercase: true, trim: true, unique: true },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  category: { type: String, required: true, trim: true, maxlength: 80 },
  date: { type: String, required: true, trim: true, maxlength: 80 },
  time: { type: String, required: true, trim: true, maxlength: 40 },
  location: { type: String, required: true, trim: true, maxlength: 180 },
  price: { type: Number, min: 0, required: true },
  image: { type: String, trim: true, maxlength: 1000, default: '' },
  description: { type: String, trim: true, maxlength: 2000, default: '' },
  lineup: { type: String, trim: true, maxlength: 500, default: '' },
  tag: { type: String, trim: true, maxlength: 80, default: '' },
  sessions: { type: [sessionSchema], default: [] },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'PulseLiveUser', default: null, index: true },
  published: { type: Boolean, default: false, index: true },
}, { timestamps: true })

eventSchema.set('toJSON', {
  transform(_document, value) {
    delete value.__v
    value.id = value.slug
    delete value._id
    return value
  },
})

export default mongoose.model('PulseLiveEvent', eventSchema)