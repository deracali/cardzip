import { Router } from 'express'
import Course from '../src/models/Course.js'
import Enrollment from '../src/models/Enrollment.js'
import Payment from '../src/models/Payment.js'
import { requireRole, requireUser } from '../src/middleware/auth.js'
import { createPaymentHandlers } from '../src/payments/service.js'

const router = Router()
const handlers = createPaymentHandlers({ Course, Enrollment, Payment })

router.get('/providers', handlers.providers)
router.post('/checkout', requireUser, requireRole('student'), handlers.initiate)
router.post('/verify', requireUser, requireRole('student'), handlers.verify)

export const paystackWebhookHandler = handlers.handlePaystackWebhook
export const stripeWebhookHandler = handlers.handleStripeWebhook

export default router
