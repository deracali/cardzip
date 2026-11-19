import { Router } from 'express'
import Booking from '../src/models/Booking.js'
import { requireAdmin, requireAuth } from '../src/middleware/auth.js'

const router = Router()
const statuses = new Set(['pending', 'pending_payment', 'confirmed', 'completed', 'cancelled'])

router.get('/', requireAuth, async (request, response) => {
  const filter = request.user.role === 'admin' ? {} : { user: request.user.id }
  const bookings = await Booking.find(filter).sort({ createdAt: -1 })
  response.json({ bookings: bookings.map((booking) => ({ ...booking.toJSON(), id: booking.id })) })
})

router.post('/', requireAuth, async (request, response) => {
  response.status(410).json({ error: 'Reservations require online payment. Start checkout through /api/payments/checkout.' })
})

router.patch('/:id', requireAuth, requireAdmin, async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.id)) return response.status(400).json({ error: 'Invalid reservation id.' })
  const { status } = request.body ?? {}
  if (typeof status !== 'string' || !statuses.has(status)) {
    return response.status(400).json({ error: 'Choose a valid reservation status.' })
  }
  const booking = await Booking.findByIdAndUpdate(request.params.id, { $set: { status } }, { new: true, runValidators: true })
  if (!booking) return response.status(404).json({ error: 'Reservation not found.' })
  response.json({ booking: { ...booking.toJSON(), id: booking.id } })
})

export default router
