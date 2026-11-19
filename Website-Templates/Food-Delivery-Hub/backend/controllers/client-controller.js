import { menuItems } from "../data/menu.js";
import { newId } from "../models/store.js";
import { HttpError, optionalText, publicRecord, requiredText } from "../utils/http.js";

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

    createOrder: async (req, res) => {
      const items = req.body?.items;
      if (!Array.isArray(items) || items.length === 0 || items.length > 30) {
        throw new HttpError(400, "Choose at least one menu item.");
      }
      const orderItems = items.map((item) => {
        const menuItem = menuItems[item?.dishId];
        if (!menuItem || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) {
          throw new HttpError(400, "The order contains an invalid menu item or quantity.");
        }
        return { dishId: item.dishId, name: menuItem.name, quantity: item.quantity, unitPrice: menuItem.price };
      });
      const address = requiredText(req.body?.address, "Delivery address", 240);
      const phone = requiredText(req.body?.phone, "Phone number", 40);
      const instructions = optionalText(req.body?.instructions, "Delivery instructions", 500);
      const subtotal = orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      const order = await store.update((state) => {
        const created = {
          id: newId("order"),
          clientId: req.user.id,
          clientName: req.user.name,
          clientEmail: req.user.email,
          items: orderItems,
          address,
          phone,
          instructions,
          subtotal: Number(subtotal.toFixed(2)),
          deliveryFee: 1.99,
          total: Number((subtotal + 1.99).toFixed(2)),
          status: "Received",
          createdAt: new Date().toISOString(),
        };
        state.orders.unshift(created);
        return created;
      });
      res.status(201).json({ order: publicRecord(order) });
    },
  };
}
