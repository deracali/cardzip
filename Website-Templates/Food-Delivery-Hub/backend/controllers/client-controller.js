import { publicRecord } from "../utils/http.js";

function ownedOrders(state, userId) {
  return state.orders
    .filter((order) => order.clientId === userId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .map(publicRecord);
}

export function createClientController(store) {
  return {
    dashboard: async (req, res) => {
      const state = await store.read();
      res.json({ user: req.user, orders: ownedOrders(state, req.user.id) });
    },

  };
}
