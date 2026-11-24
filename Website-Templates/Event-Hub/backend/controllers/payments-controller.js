import Booking from '../src/models/Booking.js'
import Event from '../src/models/Event.js'
import { createPaymentHandlers } from '../src/payments/service.js'

const handlers = createPaymentHandlers({ Booking, Event })

export const listProviders = handlers.providers
export const initiateBookingPayment = handlers.initiate
export const verifyBookingPayment = handlers.verify
export const handlePaystackWebhook = handlers.handlePaystackWebhook
export const handleStripeWebhook = handlers.handleStripeWebhook
