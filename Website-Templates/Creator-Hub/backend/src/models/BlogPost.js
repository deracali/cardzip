import mongoose from 'mongoose'

const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  slug: { type: String, required: true, trim: true, lowercase: true, unique: true, match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ },
  category: { type: String, default: 'CREATOR NOTES', trim: true, maxlength: 50 },
  excerpt: { type: String, required: true, trim: true, maxlength: 280 },
  body: { type: String, required: true, trim: true, maxlength: 20000 },
  coverImage: { type: String, default: '', trim: true, maxlength: 1000 },
  published: { type: Boolean, default: false, index: true },
  publishedAt: { type: Date },
}, { timestamps: true })

export default mongoose.model('CreatorHubBlogPost', blogPostSchema)
