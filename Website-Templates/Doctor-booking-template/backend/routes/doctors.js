import { Router } from 'express'
import Appointment from '../src/models/Appointment.js'
import Doctor from '../src/models/Doctor.js'
import Review from '../src/models/Review.js'
import { requireRole, requireUser } from '../src/middleware/auth.js'

const router = Router()

async function reviewSummaries(doctorIds) {
  const summaries = await Review.aggregate([
    { $match: { doctor: { $in: doctorIds } } },
    { $group: { _id: '$doctor', rating: { $avg: '$rating' }, reviews: { $sum: 1 } } },
  ])
  return new Map(summaries.map((summary) => [String(summary._id), summary]))
}

router.get('/', async (_request, response) => {
  const doctors = await Doctor.find({ active: true }).sort({ name: 1 }).lean()
  const summaries = await reviewSummaries(doctors.map((doctor) => doctor._id))
  response.json({ doctors: doctors.map((doctor) => {
    const summary = summaries.get(String(doctor._id))
    return { ...doctor, rating: summary?.rating ?? 0, reviews: summary?.reviews ?? 0 }
  }) })
})

router.get('/:slug/reviews/mine', requireUser, requireRole('patient'), async (request, response) => {
  const doctor = await Doctor.findOne({ slug: request.params.slug, active: true }).select('_id')
  if (!doctor) return response.status(404).json({ error: 'Doctor not found.' })
  const review = await Review.findOne({ doctor: doctor._id, patient: request.user._id }).lean()
  return response.json({ review })
})

router.get('/:slug/reviews', async (request, response) => {
  const doctor = await Doctor.findOne({ slug: request.params.slug, active: true }).select('_id')
  if (!doctor) return response.status(404).json({ error: 'Doctor not found.' })
  const [reviews, summary] = await Promise.all([
    Review.find({ doctor: doctor._id }).sort({ createdAt: -1 }).limit(50).select('displayName rating comment createdAt').lean(),
    Review.aggregate([
      { $match: { doctor: doctor._id } },
      { $group: { _id: null, averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } },
    ]),
  ])
  return response.json({
    reviews,
    averageRating: summary[0]?.averageRating ?? 0,
    totalReviews: summary[0]?.totalReviews ?? 0,
  })
})

router.post('/:slug/reviews', requireUser, requireRole('patient'), async (request, response) => {
  const { rating, comment } = request.body ?? {}
  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || typeof comment !== 'string'
    || comment.trim().length < 5 || comment.trim().length > 1000) {
    return response.status(400).json({ error: 'Choose a 1–5 star rating and enter a comment between 5 and 1,000 characters.' })
  }
  const doctor = await Doctor.findOne({ slug: request.params.slug, active: true })
  if (!doctor) return response.status(404).json({ error: 'Doctor not found.' })
  const appointment = await Appointment.findOne({
    doctor: doctor._id,
    patient: request.user._id,
    status: 'completed',
  }).sort({ startsAt: -1 }).select('_id')
  if (!appointment) return response.status(403).json({ error: 'A completed appointment is required before leaving a review.' })
  if (await Review.exists({ doctor: doctor._id, patient: request.user._id })) {
    return response.status(409).json({ error: 'You have already reviewed this doctor.' })
  }
  const nameParts = request.user.name.trim().split(/\s+/)
  const review = await Review.create({
    doctor: doctor._id,
    patient: request.user._id,
    appointment: appointment._id,
    displayName: nameParts.length > 1 ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.` : nameParts[0],
    rating,
    comment: comment.trim(),
  })
  return response.status(201).json({ review: {
    _id: review.id,
    displayName: review.displayName,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
  } })
})

router.get('/:slug', async (request, response) => {
  const doctor = await Doctor.findOne({ slug: request.params.slug, active: true }).lean()
  if (!doctor) return response.status(404).json({ error: 'Doctor not found.' })
  const summaries = await reviewSummaries([doctor._id])
  const summary = summaries.get(String(doctor._id))
  response.json({ doctor: { ...doctor, rating: summary?.rating ?? 0, reviews: summary?.reviews ?? 0 } })
})

export default router