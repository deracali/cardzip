import { Router } from 'express'
import mongoose from 'mongoose'
import Booking from '../src/models/Booking.js'
import Vehicle from '../src/models/Vehicle.js'
import { requireAdmin, requireAuth } from '../src/middleware/auth.js'
import { vehicleImageUpload } from '../src/middleware/upload.js'
import { isVoltigoCloudinaryImage, uploadVehicleImage } from '../src/services/cloudinary.js'
import { isValidVehicle } from '../src/validation/vehicles.js'

const router = Router()

router.get('/', async (_request, response) => {
  const vehicles = await Vehicle.find({ active: true }).sort({ createdAt: 1 })
  response.json({ vehicles: vehicles.map((vehicle) => ({ ...vehicle.toJSON(), id: vehicle.id })) })
})

router.post('/upload', requireAuth, requireAdmin, vehicleImageUpload.single('file'), async (request, response) => {
  if (!request.file) return response.status(400).json({ error: 'Choose a vehicle image to upload.' })
  const uploaded = await uploadVehicleImage(request.file)
  response.status(201).json(uploaded)
})

router.post('/', requireAuth, requireAdmin, async (request, response) => {
  const body = request.body ?? {}
  if (!isValidVehicle(body) || !isVoltigoCloudinaryImage(body.image)) {
    return response.status(400).json({ error: 'Provide valid vehicle details and upload a photo to the configured Cloudinary account.' })
  }
  const vehicle = await Vehicle.create({
    name: body.name.trim(),
    category: body.category.trim(),
    label: typeof body.label === 'string' ? body.label.trim() : '',
    price: Number(body.price),
    details: typeof body.details === 'string' && body.details.trim() ? body.details.trim() : 'Available for booking',
    seats: Number(body.seats),
    fuel: typeof body.fuel === 'string' && body.fuel.trim() ? body.fuel.trim() : 'Auto',
    image: body.image,
  })
  response.status(201).json({ vehicle: vehicle.toJSON() })
})

router.patch('/:id', requireAuth, requireAdmin, async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.id)) return response.status(400).json({ error: 'Invalid vehicle id.' })
  const body = request.body ?? {}
  if (!isValidVehicle(body, true) || !Object.keys(body).length) return response.status(400).json({ error: 'One or more vehicle details are invalid.' })
  if (Object.keys(body).some((field) => !['name', 'category', 'price', 'seats', 'fuel', 'details', 'label'].includes(field))) {
    return response.status(400).json({ error: 'One or more vehicle details are invalid.' })
  }
  const vehicle = await Vehicle.findOne({ _id: request.params.id, active: true })
  if (!vehicle) return response.status(404).json({ error: 'Vehicle not found.' })
  for (const field of ['name', 'category', 'fuel', 'details', 'label']) {
    if (body[field] !== undefined) vehicle[field] = body[field].trim()
  }
  if (body.price !== undefined) vehicle.price = Number(body.price)
  if (body.seats !== undefined) vehicle.seats = Number(body.seats)
  await vehicle.save()
  response.json({ vehicle: vehicle.toJSON() })
})

router.delete('/:id', requireAuth, requireAdmin, async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.id)) return response.status(400).json({ error: 'Invalid vehicle id.' })
  const vehicle = await Vehicle.findOneAndUpdate(
    { _id: request.params.id, active: true },
    { $set: { active: false } },
    { new: true },
  )
  if (!vehicle) return response.status(404).json({ error: 'Vehicle not found.' })
  response.json({ success: true })
})

export default router
