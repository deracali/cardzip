import Booking from '../src/models/Booking.js'
import Event from '../src/models/Event.js'
import PlatformSettings from '../src/models/PlatformSettings.js'
import User from '../src/models/User.js'

function slugify(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100)
}

function validEvent(data) {
  return typeof data.title === 'string' && data.title.trim().length >= 3 && data.title.length <= 160
    && typeof data.category === 'string' && data.category.trim().length > 0 && data.category.length <= 80
    && typeof data.date === 'string' && data.date.trim().length > 0 && data.date.length <= 80
    && typeof data.time === 'string' && data.time.trim().length > 0 && data.time.length <= 40
    && typeof data.location === 'string' && data.location.trim().length > 0 && data.location.length <= 180
    && Number.isFinite(data.price) && data.price >= 0 && data.price <= 100000
    && typeof data.description === 'string' && data.description.length <= 2000
    && typeof data.published === 'boolean'
    && Array.isArray(data.sessions) && data.sessions.length <= 200
    && data.sessions.every((session) => typeof session.title === 'string' && session.title.trim() && session.title.length <= 160)
}

export async function getSummary(_request, response) {
  const [events, publishedEvents, bookings, pendingBookings, attendees, organizers, pendingOrganizers] = await Promise.all([
    Event.countDocuments(), Event.countDocuments({ published: true }), Booking.countDocuments(),
    Booking.countDocuments({ status: 'requested' }), User.countDocuments({ role: 'attendee' }),
    User.countDocuments({ role: 'organizer' }), User.countDocuments({ role: 'organizer', organizerStatus: 'pending' }),
  ])
  response.json({ metrics: { events, publishedEvents, bookings, pendingBookings, attendees, organizers, pendingOrganizers } })
}

export async function listEvents(_request, response) {
  const events = await Event.find().populate('organizer', 'name email').sort({ updatedAt: -1 }).lean()
  response.json({ events })
}

export async function createEvent(request, response) {
  const body = request.body ?? {}
  const slug = slugify(body.slug || body.title || '')
  const event = { ...body, slug }
  if (!validEvent(event)) return response.status(400).json({ error: 'Provide valid event details, ticket price, sessions, and publication status.' })
  const created = await Event.create(event)
  response.status(201).json({ event: created })
}

export async function updateEvent(request, response) {
  const changes = request.body ?? {}
  const allowed = ['title', 'category', 'date', 'time', 'location', 'price', 'image', 'description', 'lineup', 'tag', 'sessions', 'published']
  if (!Object.keys(changes).length || Object.keys(changes).some((key) => !allowed.includes(key))) {
    return response.status(400).json({ error: 'Update valid event fields only.' })
  }
  if (changes.price !== undefined && (!Number.isFinite(changes.price) || changes.price < 0 || changes.price > 100000)) {
    return response.status(400).json({ error: 'Ticket price must be between 0 and 100000.' })
  }
  if (changes.published !== undefined && typeof changes.published !== 'boolean') {
    return response.status(400).json({ error: 'Publication status must be true or false.' })
  }
  if (changes.sessions !== undefined && (!Array.isArray(changes.sessions) || changes.sessions.length > 200 || changes.sessions.some((item) => typeof item.title !== 'string' || !item.title.trim()))) {
    return response.status(400).json({ error: 'Schedule must contain valid session titles.' })
  }
  const event = await Event.findOneAndUpdate({ slug: request.params.slug }, { $set: changes }, { new: true, runValidators: true })
  if (!event) return response.status(404).json({ error: 'Event not found.' })
  await Booking.updateMany({ event: event._id }, { $set: { eventTitle: event.title } })
  response.json({ event })
}

export async function listBookings(_request, response) {
  const bookings = await Booking.find().populate('attendee', 'name email active').populate('event', 'slug title category date location').sort({ createdAt: -1 }).limit(2000).lean()
  response.json({ bookings })
}

export async function updateBooking(request, response) {
  const status = request.body?.status
  if (!['requested', 'confirmed', 'cancelled'].includes(status)) return response.status(400).json({ error: 'Choose a valid booking request status.' })
  const booking = await Booking.findByIdAndUpdate(request.params.id, { $set: { status } }, { new: true, runValidators: true })
  if (!booking) return response.status(404).json({ error: 'Booking not found.' })
  response.json({ booking })
}

export async function listOrganizers(_request, response) {
  const organizers = await User.find({ role: 'organizer' }).select('-passwordHash').sort({ createdAt: -1 }).lean()
  response.json({ organizers })
}

export async function updateOrganizer(request, response) {
  const { organizerStatus, active } = request.body ?? {}
  if ((organizerStatus !== undefined && !['pending', 'approved', 'rejected'].includes(organizerStatus))
    || (active !== undefined && typeof active !== 'boolean')
    || Object.keys(request.body ?? {}).length === 0
    || Object.keys(request.body).some((key) => !['organizerStatus', 'active'].includes(key))) {
    return response.status(400).json({ error: 'Update organizer approval or account access only.' })
  }
  const changes = {}
  if (organizerStatus !== undefined) changes.organizerStatus = organizerStatus
  if (active !== undefined) changes.active = active
  const organizer = await User.findOneAndUpdate({ _id: request.params.id, role: 'organizer' }, { $set: changes }, { new: true }).select('-passwordHash')
  if (!organizer) return response.status(404).json({ error: 'Organizer not found.' })
  response.json({ organizer })
}

export async function listAttendees(_request, response) {
  const attendees = await User.find({ role: 'attendee' }).select('-passwordHash').sort({ createdAt: -1 }).limit(2000).lean()
  response.json({ attendees })
}

export async function updateAttendee(request, response) {
  const active = request.body?.active
  if (typeof active !== 'boolean') return response.status(400).json({ error: 'Set active to true or false.' })
  const attendee = await User.findOneAndUpdate({ _id: request.params.id, role: 'attendee' }, { $set: { active } }, { new: true }).select('-passwordHash')
  if (!attendee) return response.status(404).json({ error: 'Attendee not found.' })
  response.json({ attendee })
}

export async function getSettings(_request, response) {
  const settings = await PlatformSettings.findOneAndUpdate({ key: 'main' }, { $setOnInsert: { key: 'main' } }, { new: true, upsert: true, setDefaultsOnInsert: true }).lean()
  response.json({ settings })
}

export async function updateSettings(request, response) {
  const { platformName, supportEmail, announcement, organizerApplications } = request.body ?? {}
  if (typeof platformName !== 'string' || platformName.trim().length < 2 || platformName.length > 100
    || typeof supportEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail) || supportEmail.length > 254
    || typeof announcement !== 'string' || announcement.length > 500 || typeof organizerApplications !== 'boolean') {
    return response.status(400).json({ error: 'Provide valid platform settings.' })
  }
  const settings = await PlatformSettings.findOneAndUpdate(
    { key: 'main' },
    { $set: { platformName: platformName.trim(), supportEmail: supportEmail.trim(), announcement: announcement.trim(), organizerApplications } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  )
  response.json({ settings })
}
