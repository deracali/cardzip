import { Router } from 'express'
import Course from '../src/models/Course.js'

const router = Router()

router.get('/', async (_request, response) => {
  const courses = await Course.find({ published: true }).sort({ updatedAt: -1 }).lean()
  response.json({ courses: courses.map((course) => ({ ...course, id: course.courseId })) })
})

router.get('/:courseId', async (request, response) => {
  const course = await Course.findOne({ courseId: request.params.courseId, published: true }).lean()
  if (!course) return response.status(404).json({ error: 'Course not found.' })
  response.json({ course: { ...course, id: course.courseId } })
})

export default router