import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { after, before, test } from "node:test";
import { createApp } from "./server.js";
import { createStore, newId } from "./models/store.js";
import { hashPassword, signToken } from "./services/auth-service.js";

const secret = "a-test-secret-long-enough-for-the-fixflow-api";
let server;
let baseUrl;
let temporaryDirectory;
let adminToken;
let clientToken;
let otherClientToken;
let initializedPayments;

before(async () => {
  temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "fixflow-api-"));
  const store = createStore(path.join(temporaryDirectory, "fixflow.json"));
  const [adminPassword, clientPassword] = await Promise.all([
    hashPassword("admin-test-password"),
    hashPassword("client-test-password"),
  ]);
  const admin = { id: newId("user"), name: "Admin", email: "admin@test.local", role: "admin", passwordHash: adminPassword };
  const client = { id: newId("user"), name: "Client", email: "client@test.local", role: "client", passwordHash: clientPassword };
  const otherClient = { id: newId("user"), name: "Other Client", email: "other@test.local", role: "client", passwordHash: clientPassword };
  await store.update((state) => { state.users.push(admin, client, otherClient); });
  adminToken = signToken(admin, secret);
  clientToken = signToken(client, secret);
  otherClientToken = signToken(otherClient, secret);
  initializedPayments = new Map();

  server = createApp({
    env: { NODE_ENV: "test", ALLOWED_ORIGINS: "http://localhost:5173,http://localhost:3000" },
    jwtSecret: secret,
    store,
    paystack: {
      currency: "USD",
      isConfigured: () => true,
      initialize: async (payment) => {
        initializedPayments.set(payment.reference, payment);
        return { authorizationUrl: `https://checkout.paystack.com/${payment.reference}`, reference: payment.reference };
      },
      verify: async (reference) => {
        const payment = initializedPayments.get(reference);
        return {
          reference,
          amount: payment.amount,
          currency: "USD",
          status: "success",
          customer: { email: payment.email },
          paid_at: "2026-06-15T12:00:00.000Z",
        };
      },
      verifyWebhookSignature: () => true,
    },
  }).listen(0);
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

test("admin and client dashboards require authentication and the matching role", async () => {
  assert.equal((await api("/admin/dashboard")).response.status, 401);
  assert.equal((await api("/client/dashboard")).response.status, 401);
  assert.equal((await api("/admin/dashboard", { token: clientToken })).response.status, 403);
  assert.equal((await api("/client/dashboard", { token: adminToken })).response.status, 403);
  assert.equal((await api("/admin/appointments/unknown", { method: "PATCH", token: clientToken, body: { status: "Completed" } })).response.status, 403);
});

test("client signup cannot choose admin role and requests are isolated by client", async () => {
  const signup = await api("/auth/signup", {
    method: "POST",
    body: { name: "New Client", email: "new@test.local", password: "new-client-password", role: "admin" },
  });
  assert.equal(signup.response.status, 201);
  assert.equal(signup.data.user.role, "client");

  const created = await api("/client/appointments", {
    method: "POST",
    token: clientToken,
    body: {
      serviceId: "pipe",
      urgency: "emergency",
      preferredDate: "2099-12-31",
      address: "100 Main Street",
      phone: "555-0100",
      description: "Leaking pipe in the kitchen.",
    },
  });
  assert.equal(created.response.status, 201);
  assert.equal(created.data.appointment.quote, 189);

  const invalid = await api("/client/appointments", {
    method: "POST",
    token: clientToken,
    body: { serviceId: "unknown", urgency: "standard", preferredDate: "2099-12-31", address: "100 Main Street", phone: "555-0100" },
  });
  assert.equal(invalid.response.status, 400);

  const clientDashboard = await api("/client/dashboard", { token: clientToken });
  assert.deepEqual(clientDashboard.data.appointments.map((appointment) => appointment.id), [created.data.appointment.id]);
  const otherClientDashboard = await api("/client/dashboard", { token: otherClientToken });
  assert.equal(otherClientDashboard.response.status, 200);
  assert.deepEqual(otherClientDashboard.data.appointments, []);

  const adminDashboard = await api("/admin/dashboard", { token: adminToken });
  assert.equal(adminDashboard.response.status, 200);
  assert.equal(adminDashboard.data.metrics.appointments, 1);
  assert.equal(adminDashboard.data.metrics.paidPayments, 0);

  const payment = await api("/client/payments/initialize", {
    method: "POST",
    token: clientToken,
    body: { appointmentId: created.data.appointment.id, amount: 1 },
  });
  assert.equal(payment.response.status, 201);
  assert.equal(payment.data.payment.amount, 18900);
  assert.match(payment.data.authorizationUrl, /^https:\/\/checkout\.paystack\.com\//);

  const wrongOwner = await api("/client/payments/initialize", {
    method: "POST",
    token: otherClientToken,
    body: { appointmentId: created.data.appointment.id },
  });
  assert.equal(wrongOwner.response.status, 404);

  initializedPayments.set(payment.data.reference, {
    ...initializedPayments.get(payment.data.reference),
    email: "client@test.local",
  });
  const verified = await api("/client/payments/verify", {
    method: "POST",
    token: clientToken,
    body: { reference: payment.data.reference },
  });
  assert.equal(verified.response.status, 200, JSON.stringify(verified.data));
  assert.equal(verified.data.payment.status, "paid");
  const updatedDashboard = await api("/client/dashboard", { token: clientToken });
  assert.equal(updatedDashboard.data.appointments[0].paymentStatus, "paid");
  const updatedAdminDashboard = await api("/admin/dashboard", { token: adminToken });
  assert.equal(updatedAdminDashboard.data.metrics.paidPayments, 1);
  assert.equal(updatedAdminDashboard.data.metrics.paidTotal, 189);
  assert.equal(updatedAdminDashboard.data.appointments[0].paymentStatus, "paid");
});
