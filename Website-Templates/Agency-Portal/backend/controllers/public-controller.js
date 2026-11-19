export function createPublicController(store) {
  return {
    health: (_req, res) => res.json({ status: "ok", service: "nova-studio-agency-api" }),
    listCaseStudies: async (_req, res) => {
      const state = await store.read();
      res.json({ caseStudies: state.caseStudies || [] });
    },
  };
}
