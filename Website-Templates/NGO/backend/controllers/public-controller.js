export function createPublicController(store) {
  return {
    health: (req, res) => res.json({ status: "ok", service: "kindred-ngo-api" }),
    campaigns: async (req, res) => {
      const state = await store.read();
      res.json({ campaigns: state.campaigns.filter((campaign) => campaign.active) });
    },
  };
}
