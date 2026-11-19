export function createPublicController(store) {
  return {
    health: (req, res) => res.json({ status: "ok", service: "markethub-api" }),
    products: async (req, res) => {
      const state = await store.read();
      const approvedVendorIds = new Set(state.users
        .filter((user) => user.role === "vendor" && user.vendorStatus === "approved")
        .map((user) => user.id));
      const products = state.products.filter((product) => product.status === "active"
        && (product.vendorId.startsWith("demo-") || approvedVendorIds.has(product.vendorId)));
      res.json({ products });
    },
    shops: async (req, res) => {
      const state = await store.read();
      const vendors = state.users
        .filter((user) => user.role === "vendor" && user.vendorStatus === "approved")
        .map((user) => ({
          id: user.id,
          name: user.shopName || user.name,
          slug: user.shopSlug || user.id,
          description: user.shopDescription || "",
        }));
      const seededShops = [
        { id: "demo-techtrend", name: "TechTrend Co.", slug: "techtrend", description: "Everyday technology, made simple." },
        { id: "demo-north-pine", name: "North & Pine", slug: "north-pine", description: "Considered essentials for living." },
        { id: "demo-haven-house", name: "Haven House", slug: "haven-house", description: "Comfort and character for your home." },
        { id: "demo-sage-bloom", name: "Sage & Bloom", slug: "sage-bloom", description: "Small-batch botanical skincare." },
      ];
      res.json({ shops: [...seededShops, ...vendors] });
    },
  };
}
