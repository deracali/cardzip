export function createPublicController() {
  return {
    health: (_req, res) => res.json({ status: "ok", service: "fixflow-pro-api" }),
  };
}
