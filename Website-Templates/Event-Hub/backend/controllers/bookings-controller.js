import { randomUUID } from 'node:crypto'
import Booking from '../src/models/Booking.js'
import Event from '../src/models/Event.js'

export async function createBooking(request, response) {
  const { eventSlug, ticketType, quantity } = request.body ?? {}
  if (typeof eventSlug !== 'string' || !['General Admission', 'VIP Pass'].includes(ticketType) || !Number.isInteger(quantity) || quantity < 1 || quantity > 6) {
    return response.status(400).json({ error: 'Choose a valid event, ticket type, and quantity.' })
  }
  const event = await Event.findOne({ slug: eventSlug, published: true })
  if (!event) return response.status(404).json({ error: 'Event is not available.' })
  const total = (event.price + (ticketType === 'VIP Pass' ? 100 : 0)) * quantity
  const booking = await Booking.create({
    reference: `PL-${randomUUID().replaceAll('-', '').slice(0, 10).toUpperCase()}`,
    attendee: request.user._id,
    attendeeName: request.user.name,
    attendeeEmail: request.user.email,
    event: event._id,
    eventSlug: event.slug,
    eventTitle: event.title,
    ticketType,
    quantity,
    total,
    status: 'requested',
    paymentStatus: 'not-integrated',
  })
  response.status(201).json({ booking, message: 'Booking request recorded. No payment was taken and no ticket was issued.' })
}

export async function listMyBookings(request, response) {
  const bookings = await Booking.find({ attendee: request.user._id }).sort({ createdAt: -1 }).lean()
  response.json({ bookings })
}
