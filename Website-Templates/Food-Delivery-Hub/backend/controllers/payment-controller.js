import { menuItems } from "../data/menu.js";
import { newId } from "../models/store.js";
import { HttpError, optionalText, publicRecord, requiredText } from "../utils/http.js";

function minorUnits(amount) {
  return Math.round(amount * 100);
}

function matchesOrder(transaction, order, currency) {
  return transaction.reference === order.paymentReference
    && transaction.amount === minorUnits(order.total)
    && transaction.currency === currency
    && transaction.customer?.email?.toLowerCase() === order.clientEmail.toLowerCase();
}

async function completePayment(store, transaction, order, currency) {
  if (transaction.status !== "success") throw new HttpError(402, "Paystack has not confirmed a successful payment.");
  if (!matchesOrder(transaction, order, currency)) {
    throw new HttpError(409, "The Paystack transaction does not match this order.");
  }
  return store.update((state) => {
    const current = state.orders.find((item) => item.paymentReference === order.paymentReference);
    if (!current) throw new HttpError(404, "Order not found.");
    if (current.paymentStatus !== "paid") {
      current.paymentStatus = "paid";
      current.status = "Received";
      current.paidAt = transaction.paid_at || new Date().toISOString();
      current.updatedAt = new Date().toISOString();
    }
    return current;
  });
}

export function createPaymentController(store, paystack) {
  return {
    initialize: async (req, res) => {
      if (!paystack.isConfigured()) throw new HttpError(503, "Paystack is not configured on the API.");
      const requestedCurrency = requiredText(req.body?.currency, "Currency", 3);
      if (requestedCurrency !== paystack.currency) {
        throw new HttpError(409, "The storefront currency does not match the Paystack account currency.");
      }
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
      const order = {
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
        status: "Awaiting payment",
        paymentStatus: "pending",
        paymentReference: newId("pay"),
        currency: paystack.currency,
        createdAt: new Date().toISOString(),
      };
      await store.update((state) => {
        state.orders.unshift(order);
      });

      try {
        const checkout = await paystack.initialize({
          email: req.user.email,
          amount: minorUnits(order.total),
          reference: order.paymentReference,
          metadata: { orderId: order.id, clientId: req.user.id },
        });
        res.status(201).json({
          order: publicRecord(order),
          authorizationUrl: checkout.authorizationUrl,
          reference: checkout.reference,
          currency: paystack.currency,
        });
      } catch (error) {
        await store.update((state) => {
          const current = state.orders.find((item) => item.id === order.id);
          if (current && current.paymentStatus === "pending") {
            current.paymentStatus = "failed";
            current.status = "Payment failed";
            current.updatedAt = new Date().toISOString();
          }
        });
        throw error;
      }
    },

    verify: async (req, res) => {
      const reference = requiredText(req.body?.reference, "Payment reference", 128);
      const state = await store.read();
      const order = state.orders.find((item) => item.paymentReference === reference && item.clientId === req.user.id);
      if (!order) throw new HttpError(404, "Payment reference not found.");
      const transaction = await paystack.verify(reference);
      const updated = await completePayment(store, transaction, order, paystack.currency);
      res.json({ order: publicRecord(updated) });
    },

    webhook: async (req, res) => {
      if (!paystack.isConfigured()) throw new HttpError(503, "Paystack is not configured on the API.");
      if (!paystack.verifyWebhookSignature(req.rawBody, req.get("x-paystack-signature"))) {
        throw new HttpError(401, "Invalid Paystack webhook signature.");
      }
      if (req.body?.event !== "charge.success") return res.sendStatus(200);
      const reference = requiredText(req.body?.data?.reference, "Payment reference", 128);
      const state = await store.read();
      const order = state.orders.find((item) => item.paymentReference === reference);
      if (!order) return res.sendStatus(200);
      const transaction = await paystack.verify(reference);
      await completePayment(store, transaction, order, paystack.currency);
      return res.sendStatus(200);
    },
  };
}
