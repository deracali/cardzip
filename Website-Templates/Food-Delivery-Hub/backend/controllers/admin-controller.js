import { HttpError, publicRecord, safeUser } from "../utils/http.js";

const orderStatuses = new Set(["Received", "Preparing", "On the way", "Delivered", "Cancelled"]);

export function createAdminController(store) {
  return {
    dashboard: async (_req, res) => {
      const state = await store.read();
      const deliveredOrders = state.orders.filter((order) => order.paymentStatus === "paid" && order.status === "Delivered");
      res.json({
        metrics: {
          clients: state.users.filter((user) => user.role === "client").length,
          orders: state.orders.length,
          openOrders: state.orders.filter((order) => order.paymentStatus === "paid" && !["Delivered", "Cancelled"].includes(order.status)).length,
          deliveredSales: Number(deliveredOrders.reduce((total, order) => total + order.total, 0).toFixed(2)),
        },
        recentOrders: state.orders.slice(0, 10).map(publicRecord),
        clients: state.users.filter((user) => user.role === "client").map(safeUser),
      });
    },

    listOrders: async (_req, res) => {
      const state = await store.read();
      res.json({ orders: state.orders.map(publicRecord) });
    },

    updateOrder: async (req, res) => {
      const status = req.body?.status;
      if (!orderStatuses.has(status)) throw new HttpError(400, "Choose a valid order status.");
      const order = await store.update((state) => {
        const existing = state.orders.find((item) => item.id === req.params.id);
        if (!existing) throw new HttpError(404, "Order not found.");
        if (existing.paymentStatus !== "paid") throw new HttpError(409, "Only paid orders can be prepared or delivered.");
        existing.status = status;
        existing.updatedAt = new Date().toISOString();
        return existing;
      });
      res.json({ order: publicRecord(order) });
    },
  };
}
