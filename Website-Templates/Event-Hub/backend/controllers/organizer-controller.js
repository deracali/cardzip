import Booking from '../src/models/Booking.js'
import Event from '../src/models/Event.js'

export async function listEvents(request, response) {
  const events = await Event.find({ organizer: request.user._id }).sort({ updatedAt: -1 }).lean()
  response.json({ events })
}

export async function listBookings(request, response) {
  const events = await Event.find({ organizer: request.user._id }).select('_id')
  const bookings = await Booking.find({ event: { $in: events.map((event) => event._id) } }).sort({ createdAt: -1 }).lean()
  response.json({ bookings })
}

export async function createEvent(request, response) {
  const body = request.body ?? {}
  const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') : ''
  if (!slug || typeof body.title !== 'string' || typeof body.category !== 'string' || typeof body.date !== 'string'
    || typeof body.time !== 'string' || typeof body.location !== 'string' || !Number.isFinite(body.price) || body.price < 0
    || typeof body.description !== 'string') {
    return response.status(400).json({ error: 'Provide event title, category, date, time, location, price, and description.' })
  }
  const event = await Event.create({ ...body, slug, organizer: request.user._id, published: false })
  response.status(201).json({ event })
}
