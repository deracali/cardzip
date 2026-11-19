import { randomUUID } from "node:crypto";
import { newId } from "../models/store.js";
import { HttpError, normalizedEmail, requiredText } from "../utils/http.js";

const CURRENCY = "USD";
const toMinorUnits = (amount) => Math.round((amount + Number.EPSILON) * 100);
const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

function validateShippingAddress(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HttpError(400, "Shipping address is required.");
  }
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

function validateItems(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 50) {
    throw new HttpError(400, "Add between 1 and 50 products to your order.");
  }
  const quantities = new Map();
  for (const item of value) {
    if (!item || typeof item !== "object") throw new HttpError(400, "Order items are invalid.");
    const productId = requiredText(item.productId, "Product", 100);
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new HttpError(400, "Each product quantity must be between 1 and 20.");
    }
    quantities.set(productId, (quantities.get(productId) || 0) + quantity);
  }
  if ([...quantities.values()].some((quantity) => quantity > 20)) {
    throw new HttpError(400, "Each product quantity must be between 1 and 20.");
  }
  return [...quantities].map(([productId, quantity]) => ({ productId, quantity }));
}

function createPendingOrder(state, user, body, provider) {
  const itemsRequested = validateItems(body.items);
  const shippingAddress = validateShippingAddress(body.shippingAddress);
  const shippingMethod = body.shippingMethod || "standard";
  const shippingRates = { standard: 4.99, express: 12.99, "same-day": 19.99 };
  if (!Object.hasOwn(shippingRates, shippingMethod)) {
    throw new HttpError(400, "Choose a valid shipping method.");
  }

  const items = itemsRequested.map(({ productId, quantity }) => {
    const product = state.products.find((item) => item.id === productId && item.status === "active");
    if (!product || (!product.vendorId.startsWith("demo-")
      && !state.users.some((item) => item.id === product.vendorId && item.vendorStatus === "approved"))) {
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
  const now = new Date().toISOString();
  return {
    id: newId("order"),
    orderNumber: `MH-${randomUUID().slice(0, 8).toUpperCase()}`,
    userId: user.id,
    customerName: shippingAddress.name,
    shippingAddress,
    items,
    shippingMethod,
    subtotal,
    shipping,
    tax,
    total: roundMoney(subtotal + shipping + tax),
    currency: CURRENCY,
    status: "Pending",
    paymentStatus: "Pending",
    paymentProvider: provider,
    paymentReference: newId("payment"),
    inventoryReserved: true,
    reservationExpiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    createdAt: now,
  };
}

export function createPaymentController({ store, payments, frontendUrl }) {
  async function finalizeOrder({ orderId, provider, reference, sessionId, amount, currency, paid }) {
    return store.update((state) => {
      const order = state.orders.find((item) => item.id === orderId);
      if (!order || order.paymentProvider !== provider || order.currency !== CURRENCY) {
        throw new HttpError(404, "Payment order not found.");
      }
      if (order.paymentStatus === "Paid") return order;
      if (!paid) throw new HttpError(402, "The provider has not confirmed this payment.");
      if (amount !== toMinorUnits(order.total) || currency !== CURRENCY) {
        throw new HttpError(400, "The verified payment amount or currency does not match the order.");
      }
      if (provider === "paystack" && reference !== order.paymentReference) {
        throw new HttpError(400, "The verified payment reference does not match the order.");
      }
      if (provider === "stripe" && sessionId !== order.paymentSessionId) {
        throw new HttpError(400, "The verified Stripe session does not match the order.");
      }
      const reservationExpired = !order.inventoryReserved
        || !order.reservationExpiresAt
        || Date.parse(order.reservationExpiresAt) <= Date.now()
        || order.paymentStatus !== "Pending";
      if (order.paymentStatus !== "Pending" && !["Expired", "Failed"].includes(order.paymentStatus)) {
        throw new HttpError(409, "This order is no longer awaiting payment.");
      }
      if (order.inventoryReserved && Date.parse(order.reservationExpiresAt) <= Date.now()) {
        for (const item of order.items) {
          const product = state.products.find((entry) => entry.id === item.productId);
          if (product) product.stock += item.quantity;
        }
        order.inventoryReserved = false;
      }
      order.paymentStatus = "Paid";
      order.status = reservationExpired ? "Inventory review" : "Pending";
      order.inventoryReserved = false;
      order.paidAt = new Date().toISOString();
      return order;
    });
  }

  async function releaseOrder({ orderId, provider, status }) {
    return store.update((state) => {
      const order = state.orders.find((item) => item.id === orderId && item.paymentProvider === provider);
      if (!order || order.paymentStatus !== "Pending") return null;
      if (order.inventoryReserved) {
        for (const item of order.items) {
          const product = state.products.find((entry) => entry.id === item.productId);
          if (product) product.stock += item.quantity;
        }
        order.inventoryReserved = false;
      }
      order.paymentStatus = status;
      order.status = status === "Expired" ? "Payment expired" : "Payment failed";
      return order;
    });
  }

  async function findCustomerOrder(req, provider, reference) {
    const state = await store.read();
    const order = state.orders.find((item) => item.userId === req.user.id
      && item.paymentProvider === provider
      && (provider === "paystack" ? item.paymentReference === reference : item.paymentSessionId === reference));
    if (!order) throw new HttpError(404, "Payment order not found.");
    return order;
  }

  async function expireStaleReservations() {
    const now = Date.now();
    const current = await store.read();
    if (!current.orders.some((order) => order.paymentStatus === "Pending"
      && order.inventoryReserved
      && order.reservationExpiresAt
      && Date.parse(order.reservationExpiresAt) <= now)) return;
    await store.update((state) => {
      for (const order of state.orders) {
        if (order.paymentStatus !== "Pending" || !order.inventoryReserved
          || !order.reservationExpiresAt || Date.parse(order.reservationExpiresAt) > now) continue;
        for (const item of order.items) {
          const product = state.products.find((entry) => entry.id === item.productId);
          if (product) product.stock += item.quantity;
        }
        order.inventoryReserved = false;
        order.paymentStatus = "Expired";
        order.status = "Payment expired";
      }
    });
  }

  async function verifyPaystack(reference, expectedOrder) {
    const result = await payments.verifyPaystack(reference);
    if (result.reference !== expectedOrder.paymentReference
      || result.orderId !== expectedOrder.id
      || result.status !== "success") {
      throw new HttpError(402, "Paystack has not confirmed this order.");
    }
    return finalizeOrder({
      orderId: expectedOrder.id,
      provider: "paystack",
      reference: result.reference,
      amount: result.amount,
      currency: result.currency,
      paid: true,
    });
  }

  async function verifyStripe(sessionId, expectedOrder) {
    const result = await payments.verifyStripe(sessionId);
    if (result.sessionId !== sessionId || result.orderId !== expectedOrder.id || result.status !== "paid") {
      throw new HttpError(402, "Stripe has not confirmed this order.");
    }
    return finalizeOrder({
      orderId: expectedOrder.id,
      provider: "stripe",
      sessionId: result.sessionId,
      amount: result.amount,
      currency: result.currency,
      paid: true,
    });
  }

  async function handlePaystackWebhook(event) {
    const data = event?.data;
    if (event?.event === "charge.success" && data?.status === "success") {
      const state = await store.read();
      const order = state.orders.find((item) => item.paymentProvider === "paystack"
        && item.paymentReference === data.reference);
      if (!order || data.metadata?.orderId !== order.id) return;
      await finalizeOrder({
        orderId: order.id,
        provider: "paystack",
        reference: data.reference,
        amount: data.amount,
        currency: data.currency,
        paid: true,
      });
    } else if (event?.event === "charge.failed" && typeof data?.reference === "string") {
      const state = await store.read();
      const order = state.orders.find((item) => item.paymentProvider === "paystack"
        && item.paymentReference === data.reference);
      if (order) await releaseOrder({ orderId: order.id, provider: "paystack", status: "Failed" });
    }
  }

  async function handleStripeWebhook(event) {
    const session = event?.data?.object;
    if (!session?.metadata?.orderId) return;
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      if (session.payment_status !== "paid") return;
      const state = await store.read();
      const order = state.orders.find((item) => item.id === session.metadata.orderId
        && item.paymentProvider === "stripe");
      if (!order) return;
      await finalizeOrder({
        orderId: session.metadata.orderId,
        provider: "stripe",
        sessionId: session.id,
        amount: session.amount_total,
        currency: session.currency?.toUpperCase(),
        paid: true,
      });
    } else if (event.type === "checkout.session.expired") {
      await releaseOrder({ orderId: session.metadata.orderId, provider: "stripe", status: "Expired" });
    } else if (event.type === "checkout.session.async_payment_failed") {
      await releaseOrder({ orderId: session.metadata.orderId, provider: "stripe", status: "Failed" });
    }
  }

  return {
    providers: (req, res) => res.json(payments.providers()),
    expireStaleReservations: async (req, res, next) => {
      await expireStaleReservations();
      next();
    },

    checkout: async (req, res) => {
      const provider = req.body.provider;
      if (!["paystack", "stripe"].includes(provider)) throw new HttpError(400, "Choose Paystack or Stripe.");
      const available = payments.providers().providers.find((item) => item.id === provider && item.enabled);
      if (!available) throw new HttpError(503, `${provider === "stripe" ? "Stripe" : "Paystack"} checkout is not configured for USD.`);

      await expireStaleReservations();
      const order = await store.update((state) => {
        const created = createPendingOrder(state, req.user, req.body, provider);
        state.orders.unshift(created);
        return created;
      });
      const origin = req.get("origin") || frontendUrl || "http://localhost:3000";
      const returnUrl = new URL("/payment/return", origin);
      returnUrl.searchParams.set("provider", provider);
      returnUrl.searchParams.set("order", order.orderNumber);

      try {
        const checkout = await payments.initialize({ provider, order, returnUrl: returnUrl.toString() });
        const updatedOrder = await store.update((state) => {
          const saved = state.orders.find((item) => item.id === order.id);
          if (!saved) throw new HttpError(500, "The payment order could not be saved.");
          if (checkout.sessionId) saved.paymentSessionId = checkout.sessionId;
          return saved;
        });
        res.status(201).json({ order: updatedOrder, checkoutUrl: checkout.checkoutUrl });
      } catch (error) {
        await releaseOrder({ orderId: order.id, provider, status: "Failed" });
        throw error;
      }
    },

    verifyPaystack: async (req, res) => {
      const reference = requiredText(req.body.reference, "Payment reference", 160);
      const order = await findCustomerOrder(req, "paystack", reference);
      res.json({ order: await verifyPaystack(reference, order) });
    },

    verifyStripe: async (req, res) => {
      const sessionId = requiredText(req.body.sessionId, "Stripe session", 200);
      const order = await findCustomerOrder(req, "stripe", sessionId);
      res.json({ order: await verifyStripe(sessionId, order) });
    },

    cancelStripe: async (req, res) => {
      const orderNumber = requiredText(req.body.orderNumber, "Order number", 80);
      const state = await store.read();
      const order = state.orders.find((item) => item.userId === req.user.id
        && item.paymentProvider === "stripe"
        && item.orderNumber === orderNumber);
      if (!order?.paymentSessionId) throw new HttpError(404, "Payment order not found.");
      const result = await payments.expireStripeSession(order.paymentSessionId);
      if (result.sessionId !== order.paymentSessionId || result.orderId !== order.id) {
        throw new HttpError(409, "Stripe could not confirm that checkout was cancelled.");
      }
      if (result.status === "expired") {
        await releaseOrder({ orderId: order.id, provider: "stripe", status: "Expired" });
        res.json({ cancelled: true });
        return;
      }
      if (result.status === "complete" && result.paymentStatus === "paid") {
        const paidOrder = await finalizeOrder({
          orderId: order.id,
          provider: "stripe",
          sessionId: result.sessionId,
          amount: result.amount,
          currency: result.currency,
          paid: true,
        });
        res.json({ cancelled: false, paid: true, order: paidOrder });
        return;
      }
      throw new HttpError(409, "Stripe could not confirm that checkout was cancelled.");
    },

    paystackWebhook: async (req, res) => {
      const event = payments.verifyPaystackWebhook(req.rawBody, req.get("x-paystack-signature"));
      await handlePaystackWebhook(event);
      res.json({ received: true });
    },

    stripeWebhook: async (req, res) => {
      const event = payments.verifyStripeWebhook(req.rawBody, req.get("stripe-signature"));
      await handleStripeWebhook(event);
      res.json({ received: true });
    },
  };
}
