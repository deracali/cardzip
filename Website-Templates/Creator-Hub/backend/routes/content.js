import { Router } from 'express'
import mongoose from 'mongoose'
import CreatorProfile from '../src/models/CreatorProfile.js'
import Content from '../src/models/Content.js'
import Product from '../src/models/Product.js'
import Payment from '../src/models/Payment.js'
import { requireAuth, requireCreator } from '../src/middleware/auth.js'

const router = Router()

function validHttpUrl(value, optional = true) {
  if (optional && !value) return true
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

async function creatorProfile(userId) {
  return CreatorProfile.findOne({ user: userId })
}

router.post('/', requireAuth, requireCreator, async (request, response) => {
  const body = request.body ?? {}
  if (typeof body.title !== 'string' || !body.title.trim() || body.title.length > 140
    || !['blog', 'video', 'podcast', 'link'].includes(body.type)
    || typeof body.description !== 'string' || body.description.length > 1000
    || !validHttpUrl(body.url) || !validHttpUrl(body.imageUrl)) {
    return response.status(400).json({ error: 'Enter a title, supported content type, description and valid URLs.' })
  }
  const profile = await creatorProfile(request.user.id)
  if (!profile) return response.status(404).json({ error: 'Creator profile not found.' })
  const content = await Content.create({
    creator: profile.id,
    title: body.title.trim(),
    type: body.type,
    description: body.description.trim(),
    url: body.url || '',
    imageUrl: body.imageUrl || '',
    published: body.published === true,
  })
  return response.status(201).json({ content })
})

router.patch('/:id', requireAuth, requireCreator, async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.id)) return response.status(400).json({ error: 'Invalid content id.' })
  const body = request.body ?? {}
  const allowed = ['title', 'type', 'description', 'url', 'imageUrl', 'published']
  if (!Object.keys(body).length || Object.keys(body).some((key) => !allowed.includes(key))
    || (body.title !== undefined && (typeof body.title !== 'string' || !body.title.trim() || body.title.length > 140))
    || (body.type !== undefined && !['blog', 'video', 'podcast', 'link'].includes(body.type))
    || (body.description !== undefined && (typeof body.description !== 'string' || body.description.length > 1000))
    || (body.url !== undefined && !validHttpUrl(body.url))
    || (body.imageUrl !== undefined && !validHttpUrl(body.imageUrl))
    || (body.published !== undefined && typeof body.published !== 'boolean')) {
    return response.status(400).json({ error: 'One or more content fields are invalid.' })
  }
  const profile = await creatorProfile(request.user.id)
  const content = await Content.findOneAndUpdate(
    { _id: request.params.id, creator: profile?.id },
    { $set: body },
    { new: true, runValidators: true },
  )
  if (!content) return response.status(404).json({ error: 'Content not found.' })
  return response.json({ content })
})

router.delete('/:id', requireAuth, requireCreator, async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.id)) return response.status(400).json({ error: 'Invalid content id.' })
  const profile = await creatorProfile(request.user.id)
  const content = await Content.findOneAndDelete({ _id: request.params.id, creator: profile?.id })
  if (!content) return response.status(404).json({ error: 'Content not found.' })
  return response.json({ success: true })
})

router.post('/products', requireAuth, requireCreator, async (request, response) => {
  const body = request.body ?? {}
  if (typeof body.title !== 'string' || !body.title.trim() || body.title.length > 120
    || typeof body.description !== 'string' || !body.description.trim() || body.description.length > 1000
    || !Number.isFinite(Number(body.price)) || Number(body.price) <= 0 || Number(body.price) > 10000000
    || !validHttpUrl(body.imageUrl) || !validHttpUrl(body.downloadUrl, false)) {
    return response.status(400).json({ error: 'Enter valid product details, a positive price, and an http(s) download or delivery URL.' })
  }
  const profile = await creatorProfile(request.user.id)
  const product = await Product.create({
    creator: profile.id,
    title: body.title.trim(),
    description: body.description.trim(),
    price: Number(body.price),
    currency: typeof body.currency === 'string' && /^[A-Z]{3}$/i.test(body.currency) ? body.currency.toUpperCase() : 'USD',
    imageUrl: body.imageUrl || '',
    downloadUrl: body.downloadUrl,
  })
  return response.status(201).json({ product })
})

router.patch('/products/:id', requireAuth, requireCreator, async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.id)) return response.status(400).json({ error: 'Invalid product id.' })
  const body = request.body ?? {}
  const allowed = ['title', 'description', 'price', 'currency', 'imageUrl', 'downloadUrl', 'active']
  if (!Object.keys(body).length || Object.keys(body).some((key) => !allowed.includes(key))
    || (body.title !== undefined && (typeof body.title !== 'string' || !body.title.trim() || body.title.length > 120))
    || (body.description !== undefined && (typeof body.description !== 'string' || body.description.length > 1000))
    || (body.price !== undefined && (!Number.isFinite(Number(body.price)) || Number(body.price) <= 0 || Number(body.price) > 10000000))
    || (body.currency !== undefined && (typeof body.currency !== 'string' || !/^[A-Z]{3}$/i.test(body.currency)))
    || (body.imageUrl !== undefined && !validHttpUrl(body.imageUrl))
    || (body.downloadUrl !== undefined && !validHttpUrl(body.downloadUrl))
    || (body.active !== undefined && typeof body.active !== 'boolean')) {
    return response.status(400).json({ error: 'One or more product fields are invalid.' })
  }
  const profile = await creatorProfile(request.user.id)
  const product = await Product.findOneAndUpdate(
    { _id: request.params.id, creator: profile?.id },
    { $set: body },
    { new: true, runValidators: true },
  )
  if (!product) return response.status(404).json({ error: 'Product not found.' })
  return response.json({ product })
})

router.delete('/products/:id', requireAuth, requireCreator, async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.id)) return response.status(400).json({ error: 'Invalid product id.' })
  const profile = await creatorProfile(request.user.id)
  const product = await Product.findOneAndUpdate({ _id: request.params.id, creator: profile?.id }, { $set: { active: false } }, { new: true })
  if (!product) return response.status(404).json({ error: 'Product not found.' })
  await Payment.updateMany({ product: product.id, status: 'pending' }, { $set: { status: 'failed' } })
  return response.json({ success: true })
})

export default router
