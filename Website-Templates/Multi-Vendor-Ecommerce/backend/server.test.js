import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { after, before, test } from "node:test";
import { createApp } from "./server.js";

let server;
let baseUrl;
let temporaryDirectory;
let store;
let adminToken;
let clientToken;
let vendorToken;
let vendorId;
let paystackTransaction;
let stripeSession;
let stripeSessionCount = 0;

before(async () => {
  temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "markethub-api-"));
  const fetchImpl = async (url, options = {}) => {
    if (url.endsWith("/transaction/initialize")) {
      const request = JSON.parse(options.body);
      paystackTransaction = {
        reference: request.reference,
        amount: request.amount,
        currency: request.currency,
        metadata: request.metadata,
      };
      return new Response(JSON.stringify({
        status: true,
        data: { authorization_url: "https://checkout.paystack.com/market-test", reference: request.reference },
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (url.includes("/transaction/verify/") && paystackTransaction) {
      return new Response(JSON.stringify({
        status: true,
        data: { ...paystackTransaction, status: "success" },
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (url.endsWith("/checkout/sessions") && options.method === "POST") {
      const request = new URLSearchParams(options.body);
      stripeSession = {
        id: `cs_test_market_order_${++stripeSessionCount}`,
        url: "https://checkout.stripe.com/market-test",
        status: "open",
        payment_status: "unpaid",
        amount_total: Number(request.get("line_items[0][price_data][unit_amount]")),
        currency: request.get("line_items[0][price_data][currency]"),
        metadata: { orderId: request.get("metadata[orderId]") },
      };
      return new Response(JSON.stringify(stripeSession), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (url.includes("/checkout/sessions/") && stripeSession) {
      if (options.method === "POST") stripeSession.status = "expired";
      return new Response(JSON.stringify(stripeSession), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    throw new Error(`Unexpected mock payment request: ${url}`);
  };
  const app = createApp({
    env: {
      NODE_ENV: "test",
      ADMIN_EMAIL: "admin@markethub.test",
      ADMIN_PASSWORD: "safe-admin-password",
      JWT_SECRET: "a-market-hub-test-secret-that-is-at-least-32-characters",
      ALLOWED_ORIGINS: "http://localhost:5173,http://localhost:3000",
      PAYSTACK_SECRET_KEY: "test-paystack-secret",
      PAYSTACK_CURRENCY: "USD",
      STRIPE_SECRET_KEY: "sk_test_market",
      STRIPE_CURRENCY: "USD",
      STRIPE_WEBHOOK_SECRET: "whsec_market",
    },
    dataFile: path.join(temporaryDirectory, "marketplace.json"),
    fetchImpl,
  });
  store = app.locals.store;
  await app.locals.initialize();
  server = app.listen(0);
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  if (server) {
    server.closeAllConnections();
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
  if (temporaryDirectory) await rm(temporaryDirectory, { recursive: true, force: true });
});

async function api(pathname, { method = "GET", token, body } = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { response, data: await response.json() };
}

test("admin bootstrap and role-protected portals work", async () => {
  const anonymousAdmin = await api("/admin/dashboard");
  assert.equal(anonymousAdmin.response.status, 401);

  const adminLogin = await api("/auth/login", {
    method: "POST",
    body: { email: "admin@markethub.test", password: "safe-admin-password", expectedRole: "admin" },
  });
  assert.equal(adminLogin.response.status, 200);
  adminToken = adminLogin.data.token;

  const adminSignup = await api("/auth/signup", {
    method: "POST",
    body: { name: "Attacker", email: "attacker@markethub.test", password: "safe-password-123", role: "admin" },
  });
  assert.equal(adminSignup.response.status, 400);

  const clientSignup = await api("/auth/signup", {
    method: "POST",
    body: { name: "Casey Buyer", email: "casey@markethub.test", password: "safe-password-123" },
  });
  assert.equal(clientSignup.response.status, 201);
  clientToken = clientSignup.data.token;

  const vendorSignup = await api("/auth/signup", {
    method: "POST",
    body: { name: "Jordan Seller", email: "jordan@markethub.test", password: "safe-password-123", role: "vendor" },
  });
  assert.equal(vendorSignup.response.status, 201);
  vendorToken = vendorSignup.data.token;
  vendorId = vendorSignup.data.user.id;
  assert.equal(vendorSignup.data.user.vendorStatus, "pending");

  assert.equal((await api("/admin/dashboard", { token: clientToken })).response.status, 403);
  assert.equal((await api("/client/dashboard", { token: vendorToken })).response.status, 403);
  assert.equal((await api("/vendor/products", { method: "POST", token: vendorToken, body: {} })).response.status, 403);

  const approval = await api(`/admin/vendors/${vendorId}`, {
    method: "PATCH",
    token: adminToken,
    body: { status: "approved" },
  });
  assert.equal(approval.response.status, 200);
  assert.equal(approval.data.vendor.vendorStatus, "approved");

  const product = await api("/vendor/products", {
    method: "POST",
    token: vendorToken,
    body: { name: "Handmade Desk Tray", category: "Home & Living", description: "A useful handmade tray for the everyday desk.", price: 25, stock: 3 },
  });
  assert.equal(product.response.status, 201);
  assert.equal(product.data.product.vendorId, vendorId);

  const order = await api("/client/orders", {
    method: "POST",
    token: clientToken,
    body: {
      items: [
        { productId: "headphones", quantity: 2, price: 0 },
        { productId: product.data.product.id, quantity: 1, price: 0 },
      ],
      shippingAddress: {
        name: "Casey Buyer",
        email: "casey@markethub.test",
        address: "12 Market Street",
        city: "Austin",
        state: "Texas",
        postalCode: "78701",
        country: "United States",
      },
    },
  });
  assert.equal(order.response.status, 201);
  assert.equal(order.data.order.subtotal, 124.98);
  assert.equal(order.data.order.paymentStatus, "Not processed");
  assert.equal(order.data.order.items[0].unitPrice, 49.99);

  const clientDashboard = await api("/client/dashboard", { token: clientToken });
  assert.equal(clientDashboard.response.status, 200);
  assert.equal(clientDashboard.data.orders.length, 1);
  assert.equal(clientDashboard.data.orders[0].userId, clientSignup.data.user.id);

  const vendorDashboard = await api("/vendor/dashboard", { token: vendorToken });
  assert.equal(vendorDashboard.response.status, 200);
  assert.equal(vendorDashboard.data.products.length, 1);
  assert.equal(vendorDashboard.data.orders.length, 1);
  assert.equal(vendorDashboard.data.orders[0].items.length, 1);

  const adminDashboard = await api("/admin/dashboard", { token: adminToken });
  assert.equal(adminDashboard.response.status, 200);
  assert.equal(adminDashboard.data.metrics.customers, 1);
  assert.equal(adminDashboard.data.metrics.vendors, 1);
  assert.equal(adminDashboard.data.metrics.orders, 1);
});

test("clients cannot read another customer's order", async () => {
  const secondSignup = await api("/auth/signup", {
    method: "POST",
    body: { name: "Taylor Buyer", email: "taylor@markethub.test", password: "safe-password-123" },
  });
  const firstDashboard = await api("/client/dashboard", { token: clientToken });
  const orderNumber = firstDashboard.data.orders[0].orderNumber;
  const denied = await api(`/client/orders/${orderNumber}`, { token: secondSignup.data.token });
  assert.equal(denied.response.status, 404);
});

test("customer checkout verifies Paystack and Stripe payments server-side", async () => {
  const providers = await api("/payments/providers");
  assert.equal(providers.response.status, 200);
  assert.deepEqual(providers.data.providers.map(({ id, enabled }) => ({ id, enabled })), [
    { id: "paystack", enabled: true },
    { id: "stripe", enabled: true },
  ]);
  const shippingAddress = {
    name: "Casey Buyer",
    email: "casey@markethub.test",
    address: "12 Market Street",
    city: "Austin",
    state: "Texas",
    postalCode: "78701",
    country: "United States",
  };

  const paystackCheckout = await api("/client/checkout", {
    method: "POST",
    token: clientToken,
    body: { provider: "paystack", items: [{ productId: "headphones", quantity: 1 }], shippingMethod: "standard", shippingAddress },
  });
  assert.equal(paystackCheckout.response.status, 201);
  assert.equal(paystackCheckout.data.order.paymentStatus, "Pending");
  assert.equal(paystackCheckout.data.order.currency, "USD");
  assert.equal(paystackTransaction.amount, Math.round(paystackCheckout.data.order.total * 100));
  assert.equal(paystackCheckout.data.checkoutUrl, "https://checkout.paystack.com/market-test");
  const prematureFulfillment = await api(`/admin/orders/${paystackCheckout.data.order.id}`, {
    method: "PATCH",
    token: adminToken,
    body: { status: "Confirmed" },
  });
  assert.equal(prematureFulfillment.response.status, 409);

  const paystackVerified = await api("/client/payments/paystack/verify", {
    method: "POST",
    token: clientToken,
    body: { reference: paystackCheckout.data.order.paymentReference },
  });
  assert.equal(paystackVerified.response.status, 200);
  assert.equal(paystackVerified.data.order.paymentStatus, "Paid");
  const paystackVerifiedAgain = await api("/client/payments/paystack/verify", {
    method: "POST",
    token: clientToken,
    body: { reference: paystackCheckout.data.order.paymentReference },
  });
  assert.equal(paystackVerifiedAgain.response.status, 200);

  const stripeCheckout = await api("/client/checkout", {
    method: "POST",
    token: clientToken,
    body: { provider: "stripe", items: [{ productId: "speaker", quantity: 1 }], shippingMethod: "standard", shippingAddress },
  });
  assert.equal(stripeCheckout.response.status, 201);
  stripeSession.payment_status = "paid";
  const stripeVerified = await api("/client/payments/stripe/verify", {
    method: "POST",
    token: clientToken,
    body: { sessionId: stripeCheckout.data.order.paymentSessionId },
  });
  assert.equal(stripeVerified.response.status, 200);
  assert.equal(stripeVerified.data.order.paymentStatus, "Paid");
  assert.equal(stripeVerified.data.order.paymentProvider, "stripe");

  const stockBeforeReservation = (await api("/products")).data.products.find((product) => product.id === "bag").stock;
  const expiringCheckout = await api("/client/checkout", {
    method: "POST",
    token: clientToken,
    body: { provider: "paystack", items: [{ productId: "bag", quantity: 1 }], shippingMethod: "standard", shippingAddress },
  });
  assert.equal(expiringCheckout.response.status, 201);
  await store.update((state) => {
    const pending = state.orders.find((order) => order.id === expiringCheckout.data.order.id);
    pending.reservationExpiresAt = new Date(0).toISOString();
  });
  const refreshedProducts = await api("/products");
  assert.equal(refreshedProducts.data.products.find((product) => product.id === "bag").stock, stockBeforeReservation);
  const expiredOrder = (await api("/client/dashboard", { token: clientToken })).data.orders
    .find((order) => order.id === expiringCheckout.data.order.id);
  assert.equal(expiredOrder.paymentStatus, "Expired");

  const stripeStockBeforeCancel = (await api("/products")).data.products.find((product) => product.id === "watch").stock;
  const stripeCancelCheckout = await api("/client/checkout", {
    method: "POST",
    token: clientToken,
    body: { provider: "stripe", items: [{ productId: "watch", quantity: 1 }], shippingMethod: "standard", shippingAddress },
  });
  assert.equal(stripeCancelCheckout.response.status, 201);
  const stripeCancelled = await api("/client/payments/stripe/cancel", {
    method: "POST",
    token: clientToken,
    body: { orderNumber: stripeCancelCheckout.data.order.orderNumber },
  });
  assert.equal(stripeCancelled.response.status, 200);
  assert.equal(stripeCancelled.data.cancelled, true);
  assert.equal((await api("/products")).data.products.find((product) => product.id === "watch").stock, stripeStockBeforeCancel);
});
