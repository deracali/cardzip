import { Router } from 'express'
import Course from '../src/models/Course.js'
import Enrollment from '../src/models/Enrollment.js'
import { requireRole, requireUser } from '../src/middleware/auth.js'

const router = Router()
router.use(requireUser, requireRole('student'))

router.get('/enrollments', async (request, response) => {
  const enrollments = await Enrollment.find({ student: request.user._id }).populate('course').sort({ updatedAt: -1 }).lean()
  response.json({ enrollments })
})

router.post('/enrollments', async (request, response) => {
  const courseId = request.body?.courseId
  if (typeof courseId !== 'string') return response.status(400).json({ error: 'Choose a valid course.' })
  const course = await Course.findOne({ courseId, published: true })
  if (!course) return response.status(404).json({ error: 'Course is not available.' })
  if (course.price > 0) return response.status(402).json({ error: 'Paid enrollments are unavailable until a payment provider is configured and verified.' })
  const existing = await Enrollment.findOne({ student: request.user._id, course: course._id })
  if (existing) return response.status(409).json({ error: 'You are already enrolled in this course.' })
  const enrollment = await Enrollment.create({
    student: request.user._id,
    course: course._id,
    courseId: course.courseId,
    courseTitle: course.title,
    instructorId: course.instructorId,
  })
  response.status(201).json({ enrollment })
})

router.patch('/enrollments/:id/progress', async (request, response) => {
  const completedLessons = request.body?.completedLessons
  if (!Array.isArray(completedLessons) || completedLessons.some((item) => !Number.isInteger(item) || item < 0)) {
    return response.status(400).json({ error: 'Provide valid completed lesson indexes.' })
  }
  const enrollment = await Enrollment.findOne({ _id: request.params.id, student: request.user._id }).populate('course')
  if (!enrollment) return response.status(404).json({ error: 'Enrollment not found.' })
  const lessonCount = enrollment.course.curriculum.length * 3
  if (completedLessons.some((item) => item >= lessonCount)) return response.status(400).json({ error: 'A completed lesson is outside this course curriculum.' })
  enrollment.completedLessons = [...new Set(completedLessons)]
  enrollment.progress = lessonCount ? Math.round((enrollment.completedLessons.length / lessonCount) * 100) : 0
  enrollment.status = enrollment.progress === 100 ? 'completed' : 'active'
  await enrollment.save()
  response.json({ enrollment })
})

export default router