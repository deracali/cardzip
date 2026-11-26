import { newId } from "../models/store.js";
import { HttpError, publicRecord, requiredText } from "../utils/http.js";

const minorUnits = (amount) => Math.round(amount * 100);

function matchesTransaction(transaction, payment, appointment, currency) {
  return transaction.status === "success"
    && transaction.reference === payment.reference
    && Number(transaction.amount) === payment.amount
    && transaction.currency === currency
    && transaction.customer?.email?.toLowerCase() === appointment.clientEmail.toLowerCase();
}

async function completePayment(store, payment, transaction) {
  return store.update((state) => {
    const current = (state.payments || []).find((item) => item.id === payment.id);
    if (!current) throw new HttpError(404, "Payment record not found.");
    if (current.status !== "paid") {
      current.status = "paid";
      current.paidAt = transaction.paid_at || new Date().toISOString();
      current.updatedAt = new Date().toISOString();
    }
    return current;
  });
}

async function verifyPayment(store, paystack, payment, appointment) {
  const transaction = await paystack.verify(payment.reference);
  if (!matchesTransaction(transaction, payment, appointment, paystack.currency)) {
    throw new HttpError(409, "The Paystack transaction does not match this service request.");
  }
  return completePayment(store, payment, transaction);
}

export function createPaymentController(store, paystack) {
  return {
    initialize: async (req, res) => {
      if (!paystack.isConfigured()) throw new HttpError(503, "Paystack is not configured on the API.");
      const appointmentId = requiredText(req.body?.appointmentId, "Service request", 120);
      const state = await store.read();
      const appointment = state.appointments.find((item) => item.id === appointmentId && item.clientId === req.user.id);
      if (!appointment) throw new HttpError(404, "Service request not found.");
      if (appointment.status === "Cancelled") throw new HttpError(409, "Cancelled service requests cannot be paid.");
      if (!Number.isFinite(appointment.quote) || appointment.quote <= 0) throw new HttpError(409, "This service request does not have a payable estimate.");
      const previous = (state.payments || []).find((item) => item.appointmentId === appointment.id && item.status === "paid");
      if (previous) throw new HttpError(409, "This service request has already been paid.");

      const payment = {
        id: newId("payment"),
        appointmentId: appointment.id,
        clientId: req.user.id,
        reference: newId("fixflow"),
        amount: minorUnits(appointment.quote),
        currency: paystack.currency,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      await store.update((current) => {
        current.payments ||= [];
        current.payments.unshift(payment);
      });

      try {
        const checkout = await paystack.initialize({
          email: appointment.clientEmail,
          amount: payment.amount,
          reference: payment.reference,
          metadata: { paymentId: payment.id, appointmentId: appointment.id, clientId: req.user.id },
        });
        res.status(201).json({
          payment: publicRecord(payment),
          authorizationUrl: checkout.authorizationUrl,
          reference: checkout.reference,
        });
      } catch (error) {
        await store.update((current) => {
          const record = (current.payments || []).find((item) => item.id === payment.id);
          if (record && record.status === "pending") record.status = "failed";
        });
        throw error;
      }
    },

    verify: async (req, res) => {
      const reference = requiredText(req.body?.reference, "Payment reference", 128);
      const state = await store.read();
      const payment = (state.payments || []).find((item) => item.reference === reference && item.clientId === req.user.id);
      if (!payment) throw new HttpError(404, "Payment reference not found.");
      const appointment = state.appointments.find((item) => item.id === payment.appointmentId && item.clientId === req.user.id);
      if (!appointment) throw new HttpError(404, "Service request not found.");
      if (payment.status === "paid") return res.json({ payment: publicRecord(payment) });
      const updated = await verifyPayment(store, paystack, payment, appointment);
      return res.json({ payment: publicRecord(updated) });
    },

    webhook: async (req, res) => {
      if (!paystack.isConfigured()) throw new HttpError(503, "Paystack is not configured on the API.");
      if (!paystack.verifyWebhookSignature(req.rawBody, req.get("x-paystack-signature"))) {
        throw new HttpError(401, "Invalid Paystack webhook signature.");
      }
      if (req.body?.event !== "charge.success") return res.sendStatus(200);
      const reference = requiredText(req.body?.data?.reference, "Payment reference", 128);
      const state = await store.read();
      const payment = (state.payments || []).find((item) => item.reference === reference);
      if (!payment) return res.sendStatus(200);
      const appointment = state.appointments.find((item) => item.id === payment.appointmentId);
      if (!appointment) return res.sendStatus(200);
      if (payment.status !== "paid") await verifyPayment(store, paystack, payment, appointment);
      return res.sendStatus(200);
    },
  };
}
