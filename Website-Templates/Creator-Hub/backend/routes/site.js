import { Router } from 'express'
import BlogPost from '../src/models/BlogPost.js'
import CreatorProfile from '../src/models/CreatorProfile.js'
import ExploreLink from '../src/models/ExploreLink.js'
import Product from '../src/models/Product.js'

const router = Router()

router.get('/blog', async (request, response) => {
  const parsedLimit = Number.parseInt(request.query.limit, 10)
  const limit = Number.isInteger(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 50) : 50
  const posts = await BlogPost.find({ published: true })
    .sort({ publishedAt: -1, updatedAt: -1 })
    .limit(limit)
    .select('title slug category excerpt coverImage publishedAt createdAt updatedAt')
  return response.json({ posts })
})

router.get('/blog/:slug', async (request, response) => {
  const post = await BlogPost.findOne({ slug: request.params.slug.toLowerCase(), published: true })
    .select('title slug category excerpt body coverImage publishedAt createdAt updatedAt')
  if (!post) return response.status(404).json({ error: 'Blog post not found.' })
  return response.json({ post })
})

router.get('/explore', async (_request, response) => {
  const links = await ExploreLink.find({ active: true }).sort({ order: 1, createdAt: -1 }).limit(100)
  return response.json({ links })
})

router.get('/store', async (_request, response) => {
  const products = await Product.find({ active: true, adminManaged: true })
    .populate({ path: 'creator', match: { isPublic: true }, select: 'handle displayName' })
    .sort({ createdAt: -1 })
    .limit(100)
  const visibleProducts = products.filter((product) => product.creator)
  return response.json({ products: visibleProducts })
})

router.get('/store/creators', async (_request, response) => {
  const creators = await CreatorProfile.find({ isPublic: true })
    .sort({ displayName: 1 })
    .select('handle displayName')
    .limit(100)
  return response.json({ creators })
})

export default router
