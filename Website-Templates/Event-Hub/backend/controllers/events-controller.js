import Event from '../src/models/Event.js'

export async function listPublicEvents(_request, response) {
  const events = await Event.find({ published: true }).sort({ date: 1 }).lean()
  response.json({ events: events.map((event) => ({ ...event, id: event.slug })) })
}

export async function getPublicEvent(request, response) {
  const event = await Event.findOne({ slug: request.params.slug, published: true }).lean()
  if (!event) return response.status(404).json({ error: 'Event not found.' })
  response.json({ event: { ...event, id: event.slug } })
}
