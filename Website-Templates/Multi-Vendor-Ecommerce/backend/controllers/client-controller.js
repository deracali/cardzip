import { randomUUID } from "node:crypto";
import { newId } from "../models/store.js";
import { HttpError, requiredText, normalizedEmail } from "../utils/http.js";

const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

function validateShippingAddress(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new HttpError(400, "Shipping address is required.");
  return {
    name: requiredText(value.name, "Recipient name", 120, 2),
    email: normalizedEmail(value.email),
    address: requiredText(value.address, "Street address", 240, 4),
    city: requiredText(value.city, "City", 100, 2),
    state: requiredText(value.state, "State or region", 100, 2),
    postalCode: requiredText(value.postalCode, "ZIP or postal code", 24, 2),
    country: requiredText(value.country, "Country", 80, 2),
  };
}

export function createClientController(store) {
  return {
    dashboard: async (req, res) => {
      const state = await store.read();
      const orders = state.orders.filter((order) => order.userId === req.user.id);
      res.json({ user: req.user, orders });
    },

    createOrder: async (req, res) => {
      if (!Array.isArray(req.body.items) || req.body.items.length < 1 || req.body.items.length > 50) {
        throw new HttpError(400, "Add between 1 and 50 products to your order.");
      }
      const requestedItems = req.body.items.map((item) => {
        if (!item || typeof item !== "object") throw new HttpError(400, "Order items are invalid.");
        const productId = requiredText(item.productId, "Product", 100);
        const quantity = Number(item.quantity);
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
          throw new HttpError(400, "Each product quantity must be between 1 and 20.");
        }
        return { productId, quantity };
      });
      const shippingAddress = validateShippingAddress(req.body.shippingAddress);
      const shippingMethod = req.body.shippingMethod || "standard";
      const shippingRates = { standard: 4.99, express: 12.99, "same-day": 19.99 };
      if (!Object.hasOwn(shippingRates, shippingMethod)) throw new HttpError(400, "Choose a valid shipping method.");
      const created = await store.update((state) => {
        const items = requestedItems.map(({ productId, quantity }) => {
          const product = state.products.find((item) => item.id === productId && item.status === "active");
          if (!product || (!product.vendorId.startsWith("demo-")
            && !state.users.some((user) => user.id === product.vendorId && user.vendorStatus === "approved"))) {
            throw new HttpError(404, "One or more products are no longer available.");
          }
          if (product.stock < quantity) throw new HttpError(409, `${product.name} does not have enough stock.`);
          return {
            productId: product.id,
            vendorId: product.vendorId,
            productName: product.name,
            seller: product.seller,
            quantity,
            unitPrice: product.price,
            lineTotal: roundMoney(product.price * quantity),
          };
        });
        for (const item of items) {
          const product = state.products.find((entry) => entry.id === item.productId);
          product.stock -= item.quantity;
        }
        const subtotal = roundMoney(items.reduce((sum, item) => sum + item.lineTotal, 0));
        const shipping = shippingMethod === "standard" && subtotal >= 75 ? 0 : shippingRates[shippingMethod];
        const tax = roundMoney(subtotal * 0.08);
        const order = {
          id: newId("order"),
          orderNumber: `MH-${randomUUID().slice(0, 8).toUpperCase()}`,
          userId: req.user.id,
          customerName: shippingAddress.name,
          shippingAddress,
          items,
          shippingMethod,
          subtotal,
          shipping,
          tax,
          total: roundMoney(subtotal + shipping + tax),
          status: "Pending",
          paymentStatus: "Not processed",
          createdAt: new Date().toISOString(),
        };
        state.orders.unshift(order);
        return order;
      });
      res.status(201).json({ order: created });
    },

    order: async (req, res) => {
      const state = await store.read();
      const order = state.orders.find((item) => item.orderNumber === req.params.orderNumber && item.userId === req.user.id);
      if (!order) throw new HttpError(404, "Order not found.");
      res.json({ order });
    },
  };
}
