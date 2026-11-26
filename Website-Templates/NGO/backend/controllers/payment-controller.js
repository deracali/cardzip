import { HttpError, requiredText } from "../utils/http.js";
import { newId } from "../models/store.js";

function donationInput(body, store, user, currency) {
  const amountValue = Number(body.amount);
  const amount = Math.round(amountValue * 100) / 100;
  if (!Number.isFinite(amount) || amount < 1 || amount > 100000) {
    throw new HttpError(400, "Gift amount must be between $1 and $100,000.");
  }
  const frequency = body.frequency;
  if (!["once", "monthly"].includes(frequency)) throw new HttpError(400, "Choose a one-time or monthly gift.");
  const campaignSlug = typeof body.campaignSlug === "string" && body.campaignSlug.trim()
    ? requiredText(body.campaignSlug, "Campaign", 120)
    : null;
  const note = typeof body.note === "string" && body.note.trim()
    ? requiredText(body.note, "Note", 500)
    : "";
  return store.update((state) => {
    const campaign = campaignSlug
      ? state.campaigns.find((item) => item.slug === campaignSlug && item.active)
      : null;
    if (campaignSlug && !campaign) throw new HttpError(404, "This campaign is no longer available.");
    const donation = {
      id: newId("pledge"),
      userId: user.id,
      donorName: user.name,
      donorEmail: user.email,
      campaignSlug: campaign?.slug || null,
      campaignTitle: campaign?.title || "Kindred General Fund",
      amount,
      currency,
      frequency,
      note,
      status: "Payment pending",
      paymentStatus: "Pending",
      paymentReference: newId("kindred"),
      createdAt: new Date().toISOString(),
    };
    state.donations.push(donation);
    return donation;
  });
}

async function findDonationByReference(store, reference) {
  const state = await store.read();
  return state.donations.find((donation) => donation.paymentReference === reference) || null;
}

function assertVerifiedTransaction(transaction, donation) {
  if (
    transaction.status !== "success"
    || transaction.reference !== donation.paymentReference
    || transaction.amount !== Math.round(donation.amount * 100)
    || transaction.currency !== donation.currency
  ) {
    throw new HttpError(409, "Paystack has not confirmed this payment with the expected amount and currency.");
  }
}

async function recordSuccessfulPayment(store, transaction, donation) {
  assertVerifiedTransaction(transaction, donation);
  return store.update((state) => {
    const record = state.donations.find((item) => item.id === donation.id);
    if (!record) throw new HttpError(404, "Gift payment record not found.");
    if (record.paymentStatus !== "Paid") {
      record.paymentStatus = "Paid";
      record.status = "Pledge received";
      record.paidAt = new Date().toISOString();
    }
    return record;
  });
}

export function createPaymentController({ store, paystack }) {
  return {
    initialize: async (req, res) => {
      paystack.assertConfigured();
      const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
      const donation = await donationInput(body, store, req.user, paystack.currency);
      let checkout;
      try {
        checkout = await paystack.initializeTransaction({
          email: req.user.email,
          amount: donation.amount,
          reference: donation.paymentReference,
          metadata: { donationId: donation.id, userId: req.user.id },
        });
      } catch (error) {
        await store.update((state) => {
          const record = state.donations.find((item) => item.id === donation.id);
          if (record?.paymentStatus === "Pending") record.paymentStatus = "Initialization failed";
        });
        throw error;
      }
      res.status(201).json({ authorizationUrl: checkout.authorizationUrl, reference: checkout.reference });
    },

    verify: async (req, res) => {
      const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
      const reference = requiredText(body.reference, "Payment reference", 160);
      const donation = await findDonationByReference(store, reference);
      if (!donation || donation.userId !== req.user.id) throw new HttpError(404, "Gift payment record not found.");
      if (donation.paymentStatus === "Paid") {
        res.json({ donation });
        return;
      }
      const transaction = await paystack.verifyTransaction(reference);
      const updated = await recordSuccessfulPayment(store, transaction, donation);
      res.json({ donation: updated });
    },

    webhook: async (req, res) => {
      const signature = req.get("x-paystack-signature");
      if (!paystack.verifyWebhookSignature(req.rawBody, signature)) {
        throw new HttpError(401, "Paystack webhook signature is invalid.");
      }
      const event = req.body;
      if (event?.event !== "charge.success" || typeof event?.data?.reference !== "string") {
        res.json({ received: true });
        return;
      }
      const donation = await findDonationByReference(store, event.data.reference);
      if (!donation) {
        res.json({ received: true });
        return;
      }
      const transaction = await paystack.verifyTransaction(donation.paymentReference);
      await recordSuccessfulPayment(store, transaction, donation);
      res.json({ received: true });
    },
  };
}
