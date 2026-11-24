import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import * as adminController from '../controllers/admin-controller.js'
import * as authController from '../controllers/auth-controller.js'
import * as bookingsController from '../controllers/bookings-controller.js'
import * as eventsController from '../controllers/events-controller.js'
import * as organizerController from '../controllers/organizer-controller.js'
import * as paymentsController from '../controllers/payments-controller.js'
import { requireApprovedOrganizer, requireRole, requireUser } from '../src/middleware/auth.js'

const router = Router()
const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false })
const admin = Router()
const organizer = Router()

router.post('/auth/register', authLimit, authController.register)
router.post('/auth/login', authLimit, authController.login)
router.post('/auth/logout', authController.logout)
router.get('/auth/me', requireUser, authController.currentUser)

router.get('/events', eventsController.listPublicEvents)
router.get('/events/:slug', eventsController.getPublicEvent)

router.get('/payments/providers', paymentsController.listProviders)
router.post('/bookings', requireUser, requireRole('attendee'), bookingsController.createBooking)
router.post('/bookings/checkout', requireUser, requireRole('attendee'), paymentsController.initiateBookingPayment)
router.post('/bookings/verify', requireUser, requireRole('attendee'), paymentsController.verifyBookingPayment)
router.get('/bookings/mine', requireUser, requireRole('attendee'), bookingsController.listMyBookings)

admin.use(requireUser, requireRole('admin'))
admin.get('/summary', adminController.getSummary)
admin.get('/events', adminController.listEvents)
admin.post('/events', adminController.createEvent)
admin.patch('/events/:slug', adminController.updateEvent)
admin.get('/bookings', adminController.listBookings)
admin.patch('/bookings/:id', adminController.updateBooking)
admin.get('/organizers', adminController.listOrganizers)
admin.patch('/organizers/:id', adminController.updateOrganizer)
admin.get('/attendees', adminController.listAttendees)
admin.patch('/attendees/:id', adminController.updateAttendee)
admin.get('/settings', adminController.getSettings)
admin.put('/settings', adminController.updateSettings)
router.use('/admin', admin)

organizer.use(requireUser, requireApprovedOrganizer)
organizer.get('/events', organizerController.listEvents)
organizer.get('/bookings', organizerController.listBookings)
organizer.post('/events', organizerController.createEvent)
router.use('/organizer', organizer)

export default router
