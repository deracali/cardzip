import mongoose from 'mongoose'

const exploreLinkSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, trim: true, maxlength: 280 },
  url: { type: String, required: true, trim: true, maxlength: 1000 },
  category: { type: String, default: 'FEATURED', trim: true, maxlength: 50 },
  imageUrl: { type: String, default: '', trim: true, maxlength: 1000 },
  active: { type: Boolean, default: true, index: true },
  order: { type: Number, default: 0 },
}, { timestamps: true })

export default mongoose.model('CreatorHubExploreLink', exploreLinkSchema)
