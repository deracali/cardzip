import { Router } from 'express'
import Course from '../src/models/Course.js'
import Enrollment from '../src/models/Enrollment.js'
import PlatformSettings from '../src/models/PlatformSettings.js'
import User from '../src/models/User.js'
import { requireRole, requireUser } from '../src/middleware/auth.js'

const router = Router()
router.use(requireUser, requireRole('admin'))

function slugify(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)
}

function validCourse(course) {
  return typeof course.title === 'string' && course.title.trim().length >= 3 && course.title.length <= 160
    && typeof course.category === 'string' && course.category.trim().length > 0 && course.category.length <= 80
    && typeof course.instructor === 'string' && course.instructor.trim().length > 0 && course.instructor.length <= 100
    && typeof course.instructorId === 'string' && course.instructorId.trim().length > 0 && course.instructorId.length <= 80
    && Number.isFinite(course.price) && course.price >= 0 && course.price <= 10000
    && (course.currency === undefined || course.currency === 'NGN')
    && Array.isArray(course.curriculum) && course.curriculum.length <= 80
    && course.curriculum.every((lesson) => typeof lesson === 'string' && lesson.trim().length > 0 && lesson.length <= 160)
    && typeof course.published === 'boolean'
}

router.get('/summary', async (_request, response) => {
  const [students, instructors, pendingInstructors, courses, publishedCourses, enrollments, activeEnrollments] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'instructor' }),
    User.countDocuments({ role: 'instructor', instructorStatus: 'pending' }),
    Course.countDocuments(),
    Course.countDocuments({ published: true }),
    Enrollment.countDocuments(),
    Enrollment.countDocuments({ status: 'active' }),
  ])
  response.json({ metrics: { students, instructors, pendingInstructors, courses, publishedCourses, enrollments, activeEnrollments } })
})

router.get('/courses', async (_request, response) => {
  const courses = await Course.find().sort({ updatedAt: -1 }).lean()
  response.json({ courses: courses.map((course) => ({ ...course, id: course.courseId })) })
})

router.post('/courses', async (request, response) => {
  const body = request.body ?? {}
  const courseId = slugify(body.courseId || body.title || '')
  const course = { ...body, courseId }
  if (!validCourse(course)) return response.status(400).json({ error: 'Provide a course title, category, instructor, valid price, curriculum, and publication status.' })
  const created = await Course.create(course)
  response.status(201).json({ course: created.toJSON() })
})

router.patch('/courses/:courseId', async (request, response) => {
  const changes = request.body ?? {}
  const allowed = ['title', 'category', 'instructor', 'instructorId', 'rating', 'students', 'price', 'oldPrice', 'duration', 'lessons', 'level', 'image', 'tint', 'description', 'curriculum', 'published']
  if (!Object.keys(changes).length || Object.keys(changes).some((key) => !allowed.includes(key))) {
    return response.status(400).json({ error: 'Update valid course fields only.' })
  }
  if (changes.title !== undefined && typeof changes.title !== 'string') return response.status(400).json({ error: 'Course title must be text.' })
  if (changes.price !== undefined && (!Number.isFinite(changes.price) || changes.price < 0 || changes.price > 10000)) return response.status(400).json({ error: 'Course price must be between 0 and 10000.' })
  if (changes.curriculum !== undefined && (!Array.isArray(changes.curriculum) || changes.curriculum.length > 80 || changes.curriculum.some((lesson) => typeof lesson !== 'string' || !lesson.trim() || lesson.length > 160))) {
    return response.status(400).json({ error: 'Curriculum must contain up to 80 lesson titles.' })
  }
  const course = await Course.findOneAndUpdate({ courseId: request.params.courseId }, { $set: changes }, { new: true, runValidators: true })
  if (!course) return response.status(404).json({ error: 'Course not found.' })
  await Enrollment.updateMany({ course: course._id }, { $set: { courseTitle: course.title, instructorId: course.instructorId } })
  response.json({ course: course.toJSON() })
})

router.get('/instructors', async (_request, response) => {
  const instructors = await User.find({ role: 'instructor' }).select('-passwordHash').sort({ createdAt: -1 }).lean()
  response.json({ instructors })
})

router.patch('/instructors/:id', async (request, response) => {
  const { instructorStatus, active } = request.body ?? {}
  if ((instructorStatus !== undefined && !['pending', 'approved', 'rejected'].includes(instructorStatus))
    || (active !== undefined && typeof active !== 'boolean')
    || Object.keys(request.body ?? {}).length === 0
    || Object.keys(request.body).some((key) => !['instructorStatus', 'active'].includes(key))) {
    return response.status(400).json({ error: 'Update instructor approval or access status only.' })
  }
  const changes = {}
  if (instructorStatus !== undefined) changes.instructorStatus = instructorStatus
  if (active !== undefined) changes.active = active
  const instructor = await User.findOneAndUpdate({ _id: request.params.id, role: 'instructor' }, { $set: changes }, { new: true }).select('-passwordHash')
  if (!instructor) return response.status(404).json({ error: 'Instructor not found.' })
  response.json({ instructor })
})

router.get('/students', async (_request, response) => {
  const students = await User.find({ role: 'student' }).select('-passwordHash').sort({ createdAt: -1 }).limit(1000).lean()
  response.json({ students })
})

router.patch('/students/:id', async (request, response) => {
  const active = request.body?.active
  if (typeof active !== 'boolean') return response.status(400).json({ error: 'Set active to true or false.' })
  const student = await User.findOneAndUpdate({ _id: request.params.id, role: 'student' }, { $set: { active } }, { new: true }).select('-passwordHash')
  if (!student) return response.status(404).json({ error: 'Student not found.' })
  response.json({ student })
})

router.get('/enrollments', async (_request, response) => {
  const enrollments = await Enrollment.find().populate('student', 'name email active').populate('course', 'courseId title instructor').sort({ createdAt: -1 }).limit(1000).lean()
  response.json({ enrollments })
})

router.patch('/enrollments/:id', async (request, response) => {
  const status = request.body?.status
  if (!['active', 'completed', 'refunded', 'suspended'].includes(status)) return response.status(400).json({ error: 'Choose a valid enrollment status.' })
  const enrollment = await Enrollment.findByIdAndUpdate(request.params.id, { $set: { status } }, { new: true, runValidators: true })
  if (!enrollment) return response.status(404).json({ error: 'Enrollment not found.' })
  response.json({ enrollment })
})

router.get('/settings', async (_request, response) => {
  const settings = await PlatformSettings.findOneAndUpdate({ key: 'main' }, { $setOnInsert: { key: 'main' } }, { new: true, upsert: true, setDefaultsOnInsert: true }).lean()
  response.json({ settings })
})

router.put('/settings', async (request, response) => {
  const { platformName, supportEmail, instructorApplications, announcement } = request.body ?? {}
  if (typeof platformName !== 'string' || platformName.trim().length < 2 || platformName.length > 100
    || typeof supportEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail) || supportEmail.length > 254
    || typeof instructorApplications !== 'boolean' || typeof announcement !== 'string' || announcement.length > 500) {
    return response.status(400).json({ error: 'Provide valid platform settings.' })
  }
  const settings = await PlatformSettings.findOneAndUpdate({ key: 'main' }, {
    $set: { platformName: platformName.trim(), supportEmail: supportEmail.trim(), instructorApplications, announcement: announcement.trim() },
  }, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true })
  response.json({ settings })
})

export default router