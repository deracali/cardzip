import { Router } from 'express'
import Booking from '../src/models/Booking.js'
import User from '../src/models/User.js'
import Vehicle from '../src/models/Vehicle.js'
import { requireAdmin, requireAuth } from '../src/middleware/auth.js'

const router = Router()

router.get('/summary', requireAuth, requireAdmin, async (_request, response) => {
  const [reservationCount, activeVehicles, customers, pending, revenue] = await Promise.all([
    Booking.countDocuments(),
    Vehicle.countDocuments({ active: true }),
    User.countDocuments({ role: 'renter' }),
    Booking.countDocuments({ status: 'pending' }),
    Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
  ])
  const customerList = await User.find({ role: 'renter' }).sort({ createdAt: -1 }).select('name email createdAt')
  response.json({
    metrics: {
      revenue: revenue[0]?.total ?? 0,
      reservations: reservationCount,
      activeVehicles,
      customers,
      pending,
    },
    customers: customerList.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      createdAt: customer.createdAt,
    })),
  })
})

export default router
