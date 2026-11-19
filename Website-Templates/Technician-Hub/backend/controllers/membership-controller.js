import { randomUUID } from "node:crypto";
import { MEMBERSHIP_CURRENCY, MEMBERSHIP_PLAN_ID, MEMBERSHIP_PRICE_CENTS } from "../services/payment-service.js";
import { HttpError } from "../utils/http.js";

const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export function createMembershipController({ store, payments, env, allowedOrigins }) {
  async function activateVerifiedPayment(verified) {
    if (verified.status !== "paid") return null;
    if (verified.amount !== MEMBERSHIP_PRICE_CENTS || verified.currency !== MEMBERSHIP_CURRENCY) {
      throw new HttpError(400, "The verified payment amount or currency does not match the membership.");
    }
    return store.update((state) => {
      const membership = state.memberships.find((item) => item.id === verified.membershipId);
      if (!membership || membership.provider !== verified.provider || membership.externalReference !== verified.reference) {
        throw new HttpError(404, "The membership payment could not be matched to an order.");
      }
      if (membership.status === "active") return membership;
      if (membership.status !== "pending") throw new HttpError(409, "This membership payment is no longer pending.");
      const activatedAt = new Date();
      membership.status = "active";
      membership.paidAt = activatedAt.toISOString();
      membership.startsAt = activatedAt.toISOString();
      membership.expiresAt = new Date(activatedAt.getTime() + YEAR_MS).toISOString();
      membership.updatedAt = activatedAt.toISOString();
      return membership;
    });
  }

  return {
    providers: (req, res) => res.json({ providers: payments.availableProviders() }),

    checkout: async (req, res) => {
      const provider = req.body.provider;
      if (provider !== "paystack" && provider !== "stripe") throw new HttpError(400, "Choose Paystack or Stripe.");
      if (!payments.isAvailable(provider)) throw new HttpError(503, `${provider} is not configured for USD payments.`);
      const state = await store.read();
      const activeMembership = state.memberships.find((item) =>
        item.userId === req.user.id && item.status === "active" && Date.parse(item.expiresAt) > Date.now());
      if (activeMembership) throw new HttpError(409, "Your Home Comfort Plan membership is already active.");

      const now = new Date().toISOString();
      const membership = {
        id: `membership_${randomUUID()}`,
        userId: req.user.id,
        planId: MEMBERSHIP_PLAN_ID,
        planName: "Home Comfort Plan",
        amount: MEMBERSHIP_PRICE_CENTS,
        currency: MEMBERSHIP_CURRENCY,
        provider,
        externalReference: null,
        status: "initializing",
        createdAt: now,
        updatedAt: now,
      };
      await store.update((draft) => { draft.memberships.push(membership); });

      const origin = req.get("origin");
      const frontendUrl = origin && allowedOrigins.has(origin) ? origin : env.FRONTEND_URL || "http://localhost:5173";
      try {
        const checkout = await payments.createCheckout(provider, membership, req.user, frontendUrl);
        await store.update((draft) => {
          const created = draft.memberships.find((item) => item.id === membership.id);
          if (!created) throw new HttpError(500, "The membership checkout could not be saved.");
          created.externalReference = checkout.externalReference;
          created.status = "pending";
          created.updatedAt = new Date().toISOString();
        });
        res.status(201).json({ membershipId: membership.id, redirectUrl: checkout.redirectUrl });
      } catch (error) {
        await store.update((draft) => {
          const created = draft.memberships.find((item) => item.id === membership.id);
          if (created?.status === "initializing") {
            created.status = "failed";
            created.updatedAt = new Date().toISOString();
          }
        });
        throw error;
      }
    },

    verify: async (req, res) => {
      const provider = req.body.provider;
      const membershipId = req.body.membershipId;
      const reference = req.body.reference;
      if (!["paystack", "stripe"].includes(provider)) throw new HttpError(400, "Choose a valid payment provider.");
      if (typeof membershipId !== "string" || typeof reference !== "string") {
        throw new HttpError(400, "Membership and payment references are required.");
      }
      const state = await store.read();
      const membership = state.memberships.find((item) => item.id === membershipId && item.userId === req.user.id);
      if (!membership) throw new HttpError(404, "Membership order not found.");
      if (membership.provider !== provider || membership.externalReference !== reference) {
        throw new HttpError(400, "The payment reference does not match this membership order.");
      }
      if (membership.status === "active") {
        res.json({ membership, verified: true });
        return;
      }
      const verified = await payments.verifyPayment(provider, reference);
      if (verified.membershipId !== membership.id) throw new HttpError(400, "The provider payment does not match this membership order.");
      verified.provider = provider;
      const activated = await activateVerifiedPayment(verified);
      res.json({ membership: activated, verified: Boolean(activated) });
    },

    webhook: async (req, res, provider) => {
      const signature = provider === "stripe" ? req.get("stripe-signature") : req.get("x-paystack-signature");
      if (!payments.verifyWebhook(provider, req.body, signature)) throw new HttpError(400, "Payment webhook signature is invalid.");
      let event;
      try {
        event = JSON.parse(req.body.toString("utf8"));
      } catch {
        throw new HttpError(400, "Payment webhook payload is invalid.");
      }
      const reference = provider === "stripe"
        ? event.type === "checkout.session.completed" ? event.data?.object?.id : null
        : event.event === "charge.success" ? event.data?.reference : null;
      if (!reference) {
        res.json({ received: true });
        return;
      }
      const verified = await payments.verifyPayment(provider, reference);
      verified.provider = provider;
      const membership = await activateVerifiedPayment(verified);
      res.json({ received: true, activated: Boolean(membership) });
    },
  };
}
