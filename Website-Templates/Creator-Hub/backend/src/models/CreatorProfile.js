import mongoose from 'mongoose'

const creatorProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'CreatorHubUser', required: true, unique: true, index: true },
  handle: { type: String, required: true, unique: true, lowercase: true, trim: true, minlength: 3, maxlength: 30, match: /^[a-z0-9._-]+$/ },
  displayName: { type: String, required: true, trim: true, maxlength: 100 },
  tagline: { type: String, default: 'Creator · Writer · Designer', trim: true, maxlength: 120 },
  bio: { type: String, default: '', trim: true, maxlength: 500 },
  avatarUrl: { type: String, default: '' },
  links: {
    type: [{
      label: { type: String, required: true, trim: true, maxlength: 60 },
      url: { type: String, required: true, trim: true, maxlength: 500 },
    }],
    default: [],
  },
  isPublic: { type: Boolean, default: true, index: true },
  plan: { type: String, enum: ['free', 'pro'], default: 'free' },
}, { timestamps: true })

export default mongoose.model('CreatorProfile', creatorProfileSchema)
