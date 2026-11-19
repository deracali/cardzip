import { Router } from 'express'
import Doctor from '../src/models/Doctor.js'

const router = Router()

router.get('/', async (_request, response) => {
  const doctors = await Doctor.find({ active: true }).sort({ name: 1 }).lean()
  response.json({ doctors })
})

router.get('/:slug', async (request, response) => {
  const doctor = await Doctor.findOne({ slug: request.params.slug, active: true }).lean()
  if (!doctor) return response.status(404).json({ error: 'Doctor not found.' })
  response.json({ doctor })
})

export default router