import { HttpError } from "../utils/http.js";

export function createAdminController(store) {
  return {
    dashboard: async (req, res) => {
      const state = await store.read();
      const donations = [...state.donations].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
      const clients = state.users.filter((user) => user.role === "client");
      const totalPledges = donations.reduce((total, donation) => total + donation.amount, 0);
      res.json({
        user: req.user,
        metrics: {
          clients: clients.length,
          campaigns: state.campaigns.filter((campaign) => campaign.active).length,
          pledges: donations.length,
          totalPledged: Math.round(totalPledges * 100) / 100,
          pendingReview: donations.filter((donation) => donation.status === "Pledge received").length,
        },
        donations: donations.slice(0, 100),
      });
    },

    donations: async (req, res) => {
      const state = await store.read();
      const donations = [...state.donations].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
      res.json({ donations: donations.slice(0, 200) });
    },

    updateDonation: async (req, res) => {
      const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
      const status = body.status;
      if (!["Acknowledged", "Cancelled"].includes(status)) {
        throw new HttpError(400, "Choose Acknowledged or Cancelled.");
      }
      const donation = await store.update((state) => {
        const record = state.donations.find((item) => item.id === req.params.id);
        if (!record) throw new HttpError(404, "Gift pledge not found.");
        record.status = status;
        record.updatedAt = new Date().toISOString();
        return record;
      });
      res.json({ donation });
    },
  };
}
