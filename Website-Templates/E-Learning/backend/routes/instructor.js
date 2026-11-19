import { Router } from 'express'
import Course from '../src/models/Course.js'
import Enrollment from '../src/models/Enrollment.js'
import { requireApprovedInstructor, requireUser } from '../src/middleware/auth.js'

const router = Router()
router.use(requireUser, requireApprovedInstructor)

router.get('/courses', async (request, response) => {
  const courses = await Course.find({ instructorId: request.user._id.toString() }).sort({ updatedAt: -1 }).lean()
  response.json({ courses })
})

router.get('/enrollments', async (request, response) => {
  const courses = await Course.find({ instructorId: request.user._id.toString() }).select('_id')
  const enrollments = await Enrollment.find({ course: { $in: courses.map((course) => course._id) } }).populate('student', 'name email').populate('course', 'title').sort({ createdAt: -1 }).limit(300).lean()
  response.json({ enrollments })
})

export default router