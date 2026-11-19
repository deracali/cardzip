import { HttpError, requiredText } from "../utils/http.js";
import { newId } from "../models/store.js";

export function createClientController(store) {
  return {
    dashboard: async (req, res) => {
      const state = await store.read();
      const donations = state.donations
        .filter((donation) => donation.userId === req.user.id)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
      res.json({ user: req.user, donations });
    },

    createDonation: async (req, res) => {
      const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
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

      const donation = await store.update((state) => {
        const campaign = campaignSlug
          ? state.campaigns.find((item) => item.slug === campaignSlug && item.active)
          : null;
        if (campaignSlug && !campaign) throw new HttpError(404, "This campaign is no longer available.");
        const created = {
          id: newId("pledge"),
          userId: req.user.id,
          donorName: req.user.name,
          donorEmail: req.user.email,
          campaignSlug: campaign?.slug || null,
          campaignTitle: campaign?.title || "Kindred General Fund",
          amount,
          frequency,
          note,
          status: "Pledge received",
          paymentStatus: "Not processed",
          createdAt: new Date().toISOString(),
        };
        state.donations.push(created);
        return created;
      });
      res.status(201).json({ donation });
    },
  };
}
