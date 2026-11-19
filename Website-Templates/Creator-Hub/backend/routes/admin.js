import { Router } from 'express'
import CreatorProfile from '../src/models/CreatorProfile.js'
import Content from '../src/models/Content.js'
import BlogPost from '../src/models/BlogPost.js'
import ExploreLink from '../src/models/ExploreLink.js'
import Payment from '../src/models/Payment.js'
import Product from '../src/models/Product.js'
import Subscriber from '../src/models/Subscriber.js'
import User from '../src/models/User.js'
import { requireAdmin, requireAuth } from '../src/middleware/auth.js'
import { paystackConfiguration } from '../src/services/paystack.js'

const router = Router()
router.use(requireAuth, requireAdmin)

function validWebUrl(value, optional = false) {
  if (optional && !value) return true
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

function slugFromTitle(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

router.get('/summary', async (_request, response) => {
  const [creators, activeCreators, content, products, subscribers, pendingPayments, paid] = await Promise.all([
    User.countDocuments({ role: 'creator' }),
    User.countDocuments({ role: 'creator', active: true }),
    Content.countDocuments(),
    Product.countDocuments({ active: true }),
    Subscriber.countDocuments({ active: true }),
    Payment.countDocuments({ status: 'pending' }),
    Payment.aggregate([{ $match: { status: 'success' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
  ])
  return response.json({
    metrics: {
      creators,
      activeCreators,
      content,
      products,
      subscribers,
      pendingPayments,
      grossPayments: (paid[0]?.total || 0) / 100,
    },
  })
})

router.get('/creators', async (_request, response) => {
  const profiles = await CreatorProfile.find().populate('user', 'name email role active plan createdAt').sort({ createdAt: -1 })
  return response.json({ creators: profiles })
})

router.patch('/creators/:id', async (request, response) => {
  const { active, isPublic, plan } = request.body ?? {}
  if ((active !== undefined && typeof active !== 'boolean')
    || (isPublic !== undefined && typeof isPublic !== 'boolean')
    || (plan !== undefined && !['free', 'pro'].includes(plan))
    || !Object.keys(request.body ?? {}).length
    || Object.keys(request.body).some((key) => !['active', 'isPublic', 'plan'].includes(key))) {
    return response.status(400).json({ error: 'Update account activation, profile visibility, or plan only.' })
  }
  const profile = await CreatorProfile.findById(request.params.id)
  if (!profile) return response.status(404).json({ error: 'Creator not found.' })
  if (isPublic !== undefined) profile.isPublic = isPublic
  if (plan !== undefined) {
    profile.plan = plan
    await User.findByIdAndUpdate(profile.user, { $set: { plan } })
  }
  if (active !== undefined) await User.findByIdAndUpdate(profile.user, { $set: { active } })
  await profile.save()
  return response.json({ creator: profile })
})

router.get('/content', async (_request, response) => {
  const content = await Content.find().populate({ path: 'creator', select: 'handle displayName' }).sort({ updatedAt: -1 }).limit(200)
  return response.json({ content })
})

router.patch('/content/:id', async (request, response) => {
  const published = request.body?.published
  if (typeof published !== 'boolean') return response.status(400).json({ error: 'Set published to true or false.' })
  const content = await Content.findByIdAndUpdate(request.params.id, { $set: { published } }, { new: true, runValidators: true })
  if (!content) return response.status(404).json({ error: 'Content not found.' })
  return response.json({ content })
})

router.get('/blog', async (_request, response) => {
  const posts = await BlogPost.find().sort({ updatedAt: -1 }).limit(200)
  return response.json({ posts })
})

router.post('/blog', async (request, response) => {
  const { title, slug, category, excerpt, body, coverImage = '', published = false } = request.body ?? {}
  if (typeof title !== 'string' || typeof excerpt !== 'string' || typeof body !== 'string'
    || (slug !== undefined && typeof slug !== 'string')
    || (category !== undefined && typeof category !== 'string')
    || typeof coverImage !== 'string' || typeof published !== 'boolean'
    || !validWebUrl(coverImage, true)) {
    return response.status(400).json({ error: 'Provide a title, excerpt, article body, valid image URL, and publication status.' })
  }
  const post = await BlogPost.create({
    title,
    slug: slugFromTitle(slug || title),
    category,
    excerpt,
    body,
    coverImage,
    published,
    publishedAt: published ? new Date() : undefined,
  })
  return response.status(201).json({ post })
})

router.patch('/blog/:id', async (request, response) => {
  const allowedFields = ['title', 'slug', 'category', 'excerpt', 'body', 'coverImage', 'published']
  const changes = request.body ?? {}
  if (!Object.keys(changes).length || Object.keys(changes).some((key) => !allowedFields.includes(key))
    || (changes.coverImage !== undefined && (typeof changes.coverImage !== 'string' || !validWebUrl(changes.coverImage, true)))
    || (changes.published !== undefined && typeof changes.published !== 'boolean')) {
    return response.status(400).json({ error: 'Update valid blog fields only.' })
  }
  if (changes.slug !== undefined || changes.title !== undefined) {
    if ((changes.slug !== undefined && typeof changes.slug !== 'string')
      || (changes.title !== undefined && typeof changes.title !== 'string')) {
      return response.status(400).json({ error: 'Blog title and slug must be text.' })
    }
    changes.slug = slugFromTitle(changes.slug || changes.title || '')
  }
  if (changes.published === true) changes.publishedAt = new Date()
  const post = await BlogPost.findByIdAndUpdate(request.params.id, { $set: changes }, { new: true, runValidators: true })
  if (!post) return response.status(404).json({ error: 'Blog post not found.' })
  return response.json({ post })
})

router.delete('/blog/:id', async (request, response) => {
  const post = await BlogPost.findByIdAndDelete(request.params.id)
  if (!post) return response.status(404).json({ error: 'Blog post not found.' })
  return response.json({ message: 'Blog post deleted.' })
})

router.get('/explore', async (_request, response) => {
  const links = await ExploreLink.find().sort({ order: 1, updatedAt: -1 }).limit(200)
  return response.json({ links })
})

router.post('/explore', async (request, response) => {
  const { title, description, url, category, imageUrl = '', active = true } = request.body ?? {}
  if (typeof title !== 'string' || typeof description !== 'string' || typeof url !== 'string'
    || typeof imageUrl !== 'string' || typeof active !== 'boolean'
    || (category !== undefined && typeof category !== 'string')
    || !validWebUrl(url) || !validWebUrl(imageUrl, true)) {
    return response.status(400).json({ error: 'Provide a title, description, valid destination URL, optional valid image URL, and active status.' })
  }
  const link = await ExploreLink.create({ title, description, url, category, imageUrl, active })
  return response.status(201).json({ link })
})

router.patch('/explore/:id', async (request, response) => {
  const allowedFields = ['title', 'description', 'url', 'category', 'imageUrl', 'active']
  const changes = request.body ?? {}
  if (!Object.keys(changes).length || Object.keys(changes).some((key) => !allowedFields.includes(key))
    || (changes.url !== undefined && (typeof changes.url !== 'string' || !validWebUrl(changes.url)))
    || (changes.imageUrl !== undefined && (typeof changes.imageUrl !== 'string' || !validWebUrl(changes.imageUrl, true)))
    || (changes.active !== undefined && typeof changes.active !== 'boolean')) {
    return response.status(400).json({ error: 'Update valid explore link fields only.' })
  }
  const link = await ExploreLink.findByIdAndUpdate(request.params.id, { $set: changes }, { new: true, runValidators: true })
  if (!link) return response.status(404).json({ error: 'Explore link not found.' })
  return response.json({ link })
})

router.delete('/explore/:id', async (request, response) => {
  const link = await ExploreLink.findByIdAndDelete(request.params.id)
  if (!link) return response.status(404).json({ error: 'Explore link not found.' })
  return response.json({ message: 'Explore link deleted.' })
})

router.get('/products', async (_request, response) => {
  const products = await Product.find().populate({ path: 'creator', select: 'handle displayName' }).sort({ createdAt: -1 }).limit(200)
  return response.json({ products })
})

router.post('/products', async (request, response) => {
  const { creatorId, title, description, imageUrl = '', price, currency, downloadUrl } = request.body ?? {}
  if (typeof creatorId !== 'string' || typeof title !== 'string' || typeof description !== 'string'
    || typeof imageUrl !== 'string' || typeof downloadUrl !== 'string'
    || !Number.isFinite(price) || price <= 0
    || (currency !== undefined && typeof currency !== 'string')
    || !validWebUrl(imageUrl, true) || !validWebUrl(downloadUrl)) {
    return response.status(400).json({ error: 'Provide a creator, title, description, positive price, valid delivery URL, and optional valid image URL.' })
  }
  const creator = await CreatorProfile.findById(creatorId)
  if (!creator) return response.status(404).json({ error: 'Creator not found.' })
  const configuredCurrency = paystackConfiguration().currency
  const productCurrency = typeof currency === 'string' ? currency.toUpperCase() : configuredCurrency
  if (!/^[A-Z]{3}$/.test(configuredCurrency) || productCurrency !== configuredCurrency) {
    return response.status(400).json({ error: `Storefront products must use the configured payment currency (${configuredCurrency}).` })
  }
  const product = await Product.create({ creator: creator._id, title, description, imageUrl, price, currency: productCurrency, downloadUrl, adminManaged: true })
  return response.status(201).json({ product })
})

router.patch('/products/:id', async (request, response) => {
  const active = request.body?.active
  if (typeof active !== 'boolean') return response.status(400).json({ error: 'Set active to true or false.' })
  const product = await Product.findByIdAndUpdate(request.params.id, { $set: { active } }, { new: true, runValidators: true })
  if (!product) return response.status(404).json({ error: 'Product not found.' })
  return response.json({ product })
})

router.get('/payments', async (_request, response) => {
  const payments = await Payment.find()
    .populate({ path: 'creator', select: 'handle displayName' })
    .populate({ path: 'product', select: 'title' })
    .sort({ createdAt: -1 })
    .limit(200)
  return response.json({ payments })
})

router.get('/settings', (_request, response) => {
  const paystack = paystackConfiguration()
  return Promise.all([
    User.countDocuments({ role: 'creator' }),
    Subscriber.countDocuments({ active: true }),
  ]).then(([creators, subscribers]) => response.json({
    paymentProvider: {
      name: 'Paystack',
      configured: paystack.configured,
      currency: /^[A-Z]{3}$/.test(paystack.currency) ? paystack.currency : 'USD',
      proPlanConfigured: Boolean(paystack.proPlanCode),
      proAmount: paystack.proAmount / 100,
    },
    totals: { creators, subscribers },
  }))
})

export default router
