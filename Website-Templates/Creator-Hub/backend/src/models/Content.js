import mongoose from 'mongoose'

const contentSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'CreatorProfile', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 140 },
  type: { type: String, enum: ['blog', 'video', 'podcast', 'link'], default: 'blog' },
  description: { type: String, default: '', trim: true, maxlength: 1000 },
  url: { type: String, default: '', trim: true, maxlength: 1000 },
  imageUrl: { type: String, default: '', trim: true, maxlength: 1000 },
  published: { type: Boolean, default: false, index: true },
}, { timestamps: true })

export default mongoose.model('CreatorHubContent', contentSchema)
