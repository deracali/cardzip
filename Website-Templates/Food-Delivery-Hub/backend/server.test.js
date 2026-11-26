import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { after, before, test } from "node:test";
import { createApp } from "./server.js";
import { createStore, newId } from "./models/store.js";
import { hashPassword, signToken } from "./services/auth-service.js";

const secret = "a-test-secret-long-enough-for-food-delivery-api";
let server;
let baseUrl;
let store;
let temporaryDirectory;
let adminToken;
let clientToken;
let paystack;
let initializedPayments;
let verificationOverrides;

before(async () => {
  temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "sizzle-smile-api-"));
  store = createStore(path.join(temporaryDirectory, "food.json"));
  const [adminPassword, clientPassword] = await Promise.all([
    hashPassword("admin-test-password"),
    hashPassword("client-test-password"),
  ]);
  const admin = { id: newId("user"), name: "Admin", email: "admin@test.local", role: "admin", passwordHash: adminPassword };
  const client = { id: newId("user"), name: "Client", email: "client@test.local", role: "client", passwordHash: clientPassword };
  await store.update((state) => { state.users.push(admin, client); });
  adminToken = signToken(admin, secret);
  clientToken = signToken(client, secret);
  initializedPayments = new Map();
  verificationOverrides = new Map();
  paystack = {
    currency: "NGN",
    isConfigured: () => true,
    initialize: async (payment) => {
      initializedPayments.set(payment.reference, payment);
      return { authorizationUrl: `https://checkout.paystack.com/${payment.reference}`, reference: payment.reference };
    },
    verify: async (reference) => ({
      status: "success",
      reference,
      amount: initializedPayments.get(reference)?.amount,
      currency: "NGN",
      customer: { email: initializedPayments.get(reference)?.email },
      paid_at: "2026-11-26T12:00:00.000Z",
      ...verificationOverrides.get(reference),
    }),
    verifyWebhookSignature: (_rawBody, signature) => signature === "valid-test-signature",
  };

  const app = createApp({
    env: { NODE_ENV: "test", ALLOWED_ORIGINS: "http://localhost:5173,http://localhost:3000" },
    jwtSecret: secret,
    store,
    paystack,
  });
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

async function api(pathname, { method = "GET", token, body, signature } = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(signature ? { "x-paystack-signature": signature } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { response, data: await response.json().catch(() => null) };
}

test("admin and client dashboards require authentication and the matching role", async () => {
  assert.equal((await api("/admin/dashboard")).response.status, 401);
  assert.equal((await api("/client/dashboard")).response.status, 401);
  assert.equal((await api("/admin/dashboard", { token: clientToken })).response.status, 403);
  assert.equal((await api("/client/dashboard", { token: adminToken })).response.status, 403);
});

test("client order payment is initialized, verified, and isolated from unpaid orders", async () => {
  const created = await api("/client/orders", {
    method: "POST",
    token: clientToken,
    body: {
      items: [{ dishId: "pizza", quantity: 2 }],
      address: "100 Greenwich Ave",
      phone: "212-555-0100",
      instructions: "Leave at the front desk.",
      currency: "NGN",
    },
  });
  assert.equal(created.response.status, 404);

  const currencyMismatch = await api("/client/payments/initialize", {
    method: "POST",
    token: clientToken,
    body: {
      items: [{ dishId: "pizza", quantity: 1 }],
      address: "100 Greenwich Ave",
      phone: "212-555-0100",
      currency: "USD",
    },
  });
  assert.equal(currencyMismatch.response.status, 409);

  const initialized = await api("/client/payments/initialize", {
    method: "POST",
    token: clientToken,
    body: {
      items: [{ dishId: "pizza", quantity: 2 }],
      address: "100 Greenwich Ave",
      phone: "212-555-0100",
      instructions: "Leave at the front desk.",
      currency: "NGN",
    },
  });
  assert.equal(initialized.response.status, 201);
  assert.equal(initialized.data.order.total, 29.97);
  assert.equal(initialized.data.order.paymentStatus, "pending");
  assert.equal(initialized.data.order.status, "Awaiting payment");
  assert.equal(initialized.data.currency, "NGN");
  assert.equal(initializedPayments.get(initialized.data.reference).amount, 2997);

  const invalidOrder = await api("/client/payments/initialize", {
    method: "POST",
    token: clientToken,
    body: { items: [{ dishId: "unknown", quantity: 1 }], address: "100 Greenwich Ave", phone: "212-555-0100", currency: "NGN" },
  });
  assert.equal(invalidOrder.response.status, 400);

  const blockedFulfillment = await api(`/admin/orders/${initialized.data.order.id}`, {
    method: "PATCH",
    token: adminToken,
    body: { status: "Preparing" },
  });
  assert.equal(blockedFulfillment.response.status, 409);

  const unpaidDashboard = await api("/client/dashboard", { token: clientToken });
  assert.equal(unpaidDashboard.response.status, 200);
  assert.equal(unpaidDashboard.data.orders[0].paymentStatus, "pending");

  const verified = await api("/client/payments/verify", {
    method: "POST",
    token: clientToken,
    body: { reference: initialized.data.reference },
  });
  assert.equal(verified.response.status, 200);
  assert.equal(verified.data.order.paymentStatus, "paid");
  assert.equal(verified.data.order.status, "Received");

  const clientDashboard = await api("/client/dashboard", { token: clientToken });
  assert.equal(clientDashboard.response.status, 200);
  assert.deepEqual(clientDashboard.data.orders.map((order) => order.id), [initialized.data.order.id]);

  const adminDashboard = await api("/admin/dashboard", { token: adminToken });
  assert.equal(adminDashboard.response.status, 200);
  assert.equal(adminDashboard.data.metrics.orders, 1);
  assert.equal(adminDashboard.data.metrics.openOrders, 1);

  const delivered = await api(`/admin/orders/${initialized.data.order.id}`, {
    method: "PATCH",
    token: adminToken,
    body: { status: "Delivered" },
  });
  assert.equal(delivered.response.status, 200);
  assert.equal(delivered.data.order.status, "Delivered");
});

test("payment verification rejects an amount mismatch and webhook signatures are required", async () => {
  const initialized = await api("/client/payments/initialize", {
    method: "POST",
    token: clientToken,
    body: {
      items: [{ dishId: "pizza", quantity: 1 }],
      address: "100 Greenwich Ave",
      phone: "212-555-0100",
      currency: "NGN",
    },
  });
  assert.equal(initialized.response.status, 201);
  verificationOverrides.set(initialized.data.reference, { amount: 1 });

  const mismatch = await api("/client/payments/verify", {
    method: "POST",
    token: clientToken,
    body: { reference: initialized.data.reference },
  });
  assert.equal(mismatch.response.status, 409);

  const badWebhook = await api("/payments/paystack/webhook", {
    method: "POST",
    body: { event: "charge.success", data: { reference: initialized.data.reference } },
    signature: "invalid-signature",
  });
  assert.equal(badWebhook.response.status, 401);

  verificationOverrides.delete(initialized.data.reference);
  const webhook = await api("/payments/paystack/webhook", {
    method: "POST",
    body: { event: "charge.success", data: { reference: initialized.data.reference } },
    signature: "valid-test-signature",
  });
  assert.equal(webhook.response.status, 200);
  const dashboard = await api("/client/dashboard", { token: clientToken });
  assert.equal(dashboard.data.orders.some((order) => order.paymentReference === initialized.data.reference && order.paymentStatus === "paid"), true);
});
