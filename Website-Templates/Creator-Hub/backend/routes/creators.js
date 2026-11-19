import { Router } from 'express'
import CreatorProfile from '../src/models/CreatorProfile.js'
import Content from '../src/models/Content.js'
import Product from '../src/models/Product.js'
import Subscriber from '../src/models/Subscriber.js'
import Payment from '../src/models/Payment.js'
import { requireAuth, requireCreator } from '../src/middleware/auth.js'

const router = Router()

router.get('/me', requireAuth, requireCreator, async (request, response) => {
  const profile = await CreatorProfile.findOne({ user: request.user.id })
  if (!profile) return response.status(404).json({ error: 'Creator profile not found.' })
  const [content, products, subscribers, earnings] = await Promise.all([
    Content.find({ creator: profile.id }).sort({ updatedAt: -1 }),
    Product.find({ creator: profile.id }).sort({ updatedAt: -1 }),
    Subscriber.countDocuments({ creator: profile.id, active: true }),
    Payment.aggregate([{ $match: { creator: profile._id, type: 'product', status: 'success' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
  ])
  return response.json({
    profile,
    content,
    products,
    analytics: {
      contentCount: content.length,
      publishedCount: content.filter((item) => item.published).length,
      subscribers,
      earnings: (earnings[0]?.total || 0) / 100,
      plan: request.user.plan,
    },
  })
})

router.patch('/me', requireAuth, requireCreator, async (request, response) => {
  const allowed = ['displayName', 'tagline', 'bio', 'avatarUrl', 'links', 'isPublic']
  const body = request.body ?? {}
  if (!Object.keys(body).length || Object.keys(body).some((key) => !allowed.includes(key))) {
    return response.status(400).json({ error: 'Update only supported creator profile fields.' })
  }
  if (body.displayName !== undefined && (typeof body.displayName !== 'string' || !body.displayName.trim() || body.displayName.trim().length > 100)) {
    return response.status(400).json({ error: 'Creator name must be between 1 and 100 characters.' })
  }
  if (body.tagline !== undefined && (typeof body.tagline !== 'string' || body.tagline.length > 120)) {
    return response.status(400).json({ error: 'Tagline must be 120 characters or fewer.' })
  }
  if (body.bio !== undefined && (typeof body.bio !== 'string' || body.bio.length > 500)) {
    return response.status(400).json({ error: 'Bio must be 500 characters or fewer.' })
  }
  if (body.avatarUrl !== undefined && (typeof body.avatarUrl !== 'string' || body.avatarUrl.length > 1000)) {
    return response.status(400).json({ error: 'Avatar URL is invalid.' })
  }
  if (body.isPublic !== undefined && typeof body.isPublic !== 'boolean') {
    return response.status(400).json({ error: 'Profile visibility must be true or false.' })
  }
  if (body.links !== undefined && (!Array.isArray(body.links) || body.links.length > 12 || body.links.some((link) => (
    typeof link?.label !== 'string' || !link.label.trim() || link.label.length > 60
    || typeof link?.url !== 'string' || link.url.length > 500
    || !/^https?:\/\//i.test(link.url)
  )))) {
    return response.status(400).json({ error: 'Add up to 12 links with valid labels and http(s) URLs.' })
  }
  const update = Object.fromEntries(Object.entries(body).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]))
  const profile = await CreatorProfile.findOneAndUpdate({ user: request.user.id }, { $set: update }, { new: true, runValidators: true })
  if (!profile) return response.status(404).json({ error: 'Creator profile not found.' })
  return response.json({ profile })
})

router.get('/directory', async (_request, response) => {
  const profiles = await CreatorProfile.find({ isPublic: true })
    .sort({ updatedAt: -1 })
    .limit(48)
    .populate('user', 'active')
  const creators = profiles
    .filter((profile) => profile.user?.active)
    .map((profile) => ({
      handle: profile.handle,
      displayName: profile.displayName,
      tagline: profile.tagline,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
    }))
  return response.json({ creators })
})

router.get('/:handle', async (request, response) => {
  const handle = request.params.handle.toLowerCase()
  const profile = await CreatorProfile.findOne({ handle, isPublic: true }).populate('user', 'active plan')
  if (!profile || !profile.user?.active) return response.status(404).json({ error: 'Creator not found.' })
  const [content, products] = await Promise.all([
    Content.find({ creator: profile.id, published: true }).sort({ updatedAt: -1 }),
    Product.find({ creator: profile.id, active: true }).sort({ updatedAt: -1 }),
  ])
  return response.json({ profile, content, products })
})

router.post('/:handle/subscribe', async (request, response) => {
  const profile = await CreatorProfile.findOne({ handle: request.params.handle.toLowerCase(), isPublic: true })
  if (!profile) return response.status(404).json({ error: 'Creator not found.' })
  const email = request.body?.email
  if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return response.status(400).json({ error: 'Enter a valid email address.' })
  }
  await Subscriber.updateOne(
    { creator: profile.id, email: email.trim().toLowerCase() },
    { $set: { active: true } },
    { upsert: true, runValidators: true },
  )
  return response.status(201).json({ subscribed: true })
})

router.get('/:handle/products', async (request, response) => {
  const profile = await CreatorProfile.findOne({ handle: request.params.handle.toLowerCase(), isPublic: true })
  if (!profile) return response.status(404).json({ error: 'Creator not found.' })
  const products = await Product.find({ creator: profile.id, active: true }).sort({ createdAt: -1 })
  return response.json({ products })
})

router.get('/me/subscribers', requireAuth, requireCreator, async (request, response) => {
  const profile = await CreatorProfile.findOne({ user: request.user.id })
  if (!profile) return response.status(404).json({ error: 'Creator profile not found.' })
  const subscribers = await Subscriber.find({ creator: profile.id, active: true }).sort({ createdAt: -1 }).select('email createdAt')
  return response.json({ subscribers })
})

router.get('/me/payments', requireAuth, requireCreator, async (request, response) => {
  const profile = await CreatorProfile.findOne({ user: request.user.id })
  if (!profile) return response.status(404).json({ error: 'Creator profile not found.' })
  const payments = await Payment.find({ creator: profile.id }).sort({ createdAt: -1 }).limit(100)
  return response.json({ payments })
})

export default router
