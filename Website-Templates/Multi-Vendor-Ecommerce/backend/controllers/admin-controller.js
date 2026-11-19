import { HttpError } from "../utils/http.js";

const orderStatuses = new Set(["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled", "Inventory review", "Payment failed", "Payment expired"]);

export function createAdminController(store) {
  return {
    dashboard: async (req, res) => {
      const state = await store.read();
      const vendors = state.users.filter((user) => user.role === "vendor");
      res.json({
        metrics: {
          customers: state.users.filter((user) => user.role === "client").length,
          vendors: vendors.length,
          pendingVendors: vendors.filter((user) => user.vendorStatus === "pending").length,
          products: state.products.filter((product) => product.status === "active").length,
          orders: state.orders.length,
          pendingOrders: state.orders.filter((order) => order.status === "Pending").length,
          orderValue: state.orders.reduce((sum, order) => sum + order.total, 0),
        },
        vendors: vendors.map(({ passwordHash, ...vendor }) => vendor),
        products: state.products,
        orders: state.orders,
      });
    },

    updateVendor: async (req, res) => {
      const status = req.body.status;
      if (!["approved", "rejected"].includes(status)) throw new HttpError(400, "Vendor status must be approved or rejected.");
      const vendor = await store.update((state) => {
        const user = state.users.find((item) => item.id === req.params.vendorId && item.role === "vendor");
        if (!user) throw new HttpError(404, "Vendor application not found.");
        user.vendorStatus = status;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          vendorStatus: user.vendorStatus,
        };
      });
      res.json({ vendor });
    },

    updateOrder: async (req, res) => {
      const status = req.body.status;
      if (!orderStatuses.has(status)) throw new HttpError(400, "Choose a valid order status.");
      const order = await store.update((state) => {
        const found = state.orders.find((item) => item.id === req.params.orderId);
        if (!found) throw new HttpError(404, "Order not found.");
        if (["paystack", "stripe"].includes(found.paymentProvider)
          && found.paymentStatus !== "Paid"
          && ["Confirmed", "Shipped", "Delivered"].includes(status)) {
          throw new HttpError(409, "A provider payment must be verified before an order can be fulfilled.");
        }
        found.status = status;
        return found;
      });
      res.json({ order });
    },
  };
}
