import assert from "node:assert/strict";
import { once } from "node:events";
import { after, before, test } from "node:test";
import { createMemoryStore } from "./models/store.js";
import { createApp } from "./server.js";

let server;
let baseUrl;
let clientToken;
let secondClientToken;
let adminToken;
let membershipId;
let stripeReference;
let stripeForm;

const fakeFetch = async (url, options = {}) => {
  if (url === "https://api.stripe.com/v1/checkout/sessions" && options.method === "POST") {
    stripeForm = new URLSearchParams(options.body);
    return new Response(JSON.stringify({ id: "cs_test_123", url: "https://checkout.stripe.test/session" }), { status: 200 });
  }
  if (url === "https://api.stripe.com/v1/checkout/sessions/cs_test_123") {
    return new Response(JSON.stringify({
      id: stripeReference,
      metadata: { membershipId },
      client_reference_id: membershipId,
      payment_status: "paid",
      amount_total: 19900,
      currency: "usd",
    }), { status: 200 });
  }
  throw new Error(`Unexpected provider request: ${options.method || "GET"} ${url}`);
};

before(async () => {
  const app = createApp({
    env: {
      NODE_ENV: "test",
      ADMIN_SIGNUP_CODE: "private-test-invite",
      STRIPE_SECRET_KEY: "sk_test_placeholder",
      STRIPE_WEBHOOK_SECRET: "whsec_test_placeholder",
      STRIPE_SUPPORTED_CURRENCIES: "USD",
      PAYSTACK_SECRET_KEY: "sk_test_paystack_placeholder",
      PAYSTACK_SUPPORTED_CURRENCIES: "",
      ALLOWED_ORIGINS: "http://localhost:5173,http://localhost:3000",
    },
    jwtSecret: "polarflow-test-signing-secret-long-enough",
    store: createMemoryStore(),
    fetchImpl: fakeFetch,
  });
  server = app.listen(0);
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  if (!server) return;
  server.closeAllConnections();
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

async function api(path, { method = "GET", token, body, origin } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(origin ? { Origin: origin } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { response, data: await response.json() };
}

test("customer and admin dashboards require their respective roles", async () => {
  const anonymous = await api("/client/dashboard");
  assert.equal(anonymous.response.status, 401);

  const signup = await api("/auth/signup", {
    method: "POST",
    body: { name: "Jordan Customer", phone: "512-555-0100", email: "jordan@example.test", password: "HVAC-customer-pass-1" },
  });
  assert.equal(signup.response.status, 201);
  clientToken = signup.data.token;

  const secondSignup = await api("/auth/signup", {
    method: "POST",
    body: { name: "Casey Customer", phone: "512-555-0101", email: "casey@example.test", password: "HVAC-customer-pass-2" },
  });
  assert.equal(secondSignup.response.status, 201);
  secondClientToken = secondSignup.data.token;

  const clientDenied = await api("/admin/dashboard", { token: clientToken });
  assert.equal(clientDenied.response.status, 403);

  const noInvite = await api("/auth/admin-signup", {
    method: "POST",
    body: { name: "HVAC Admin", email: "admin@example.test", password: "HVAC-admin-pass-1" },
  });
  assert.equal(noInvite.response.status, 400);

  const adminSignup = await api("/auth/admin-signup", {
    method: "POST",
    body: {
      name: "HVAC Admin",
      email: "admin@example.test",
      password: "HVAC-admin-pass-1",
      inviteCode: "private-test-invite",
    },
  });
  assert.equal(adminSignup.response.status, 201);
  adminToken = adminSignup.data.token;
  assert.equal((await api("/admin/dashboard", { token: adminToken })).response.status, 200);
});

test("appointment prices are server-calculated and requests stay scoped to their creator", async () => {
  const created = await api("/public/bookings", {
    method: "POST",
    token: clientToken,
    body: {
      serviceId: "ac-tune-up",
      urgency: "emergency",
      estimate: 1,
      name: "Jordan Customer",
      phone: "512-555-0100",
      email: "jordan@example.test",
      zip: "78704",
      date: "2030-01-15",
      time: "8:00 AM - 10:00 AM",
    },
  });
  assert.equal(created.response.status, 201);
  assert.equal(created.data.booking.estimate, 189);
  assert.equal(created.data.booking.status, "requested");

  const spoofed = await api("/public/bookings", {
    method: "POST",
    body: {
      serviceId: "ac-tune-up",
      name: "Impersonator",
      phone: "512-555-9999",
      email: "jordan@example.test",
      zip: "78704",
      date: "2030-01-16",
      time: "8:00 AM - 10:00 AM",
    },
  });
  assert.equal(spoofed.response.status, 201);

  const customerDashboard = await api("/client/dashboard", { token: clientToken });
  assert.deepEqual(customerDashboard.data.bookings.map((item) => item.id), [created.data.booking.id]);

  const unrelatedDashboard = await api("/client/dashboard", { token: secondClientToken });
  assert.deepEqual(unrelatedDashboard.data.bookings, []);

  const adminDashboard = await api("/admin/dashboard", { token: adminToken });
  assert.equal(adminDashboard.data.bookings.length, 2);

  const update = await api(`/admin/bookings/${created.data.booking.id}`, {
    method: "PATCH",
    token: adminToken,
    body: { status: "confirmed" },
  });
  assert.equal(update.data.booking.status, "confirmed");

  const clientDeniedUpdate = await api(`/admin/bookings/${created.data.booking.id}`, {
    method: "PATCH",
    token: clientToken,
    body: { status: "completed" },
  });
  assert.equal(clientDeniedUpdate.response.status, 403);
});

test("annual membership payment is verified by Stripe before activation", async () => {
  const providers = await api("/client/membership/providers", { token: clientToken });
  assert.deepEqual(providers.data.providers, ["stripe"]);

  const checkout = await api("/client/membership/checkout", {
    method: "POST",
    token: clientToken,
    origin: "http://localhost:5173",
    body: { provider: "stripe", amount: 1 },
  });
  assert.equal(checkout.response.status, 201);
  assert.equal(checkout.data.redirectUrl, "https://checkout.stripe.test/session");
  membershipId = checkout.data.membershipId;
  stripeReference = "cs_test_123";
  assert.equal(stripeForm.get("line_items[0][price_data][unit_amount]"), "19900");

  const otherCustomer = await api("/client/membership/verify", {
    method: "POST",
    token: secondClientToken,
    body: { provider: "stripe", membershipId, reference: stripeReference },
  });
  assert.equal(otherCustomer.response.status, 404);

  const verified = await api("/client/membership/verify", {
    method: "POST",
    token: clientToken,
    body: { provider: "stripe", membershipId, reference: stripeReference },
  });
  assert.equal(verified.response.status, 200);
  assert.equal(verified.data.verified, true);
  assert.equal(verified.data.membership.status, "active");
  assert.ok(Date.parse(verified.data.membership.expiresAt) > Date.now());
  assert.equal((await api("/client/dashboard", { token: clientToken })).data.activeMembership.id, membershipId);
});

test("unconfigured providers and disallowed browser origins are rejected", async () => {
  const unavailable = await api("/client/membership/checkout", {
    method: "POST",
    token: clientToken,
    body: { provider: "paystack" },
  });
  assert.equal(unavailable.response.status, 503);

  const blockedOrigin = await api("/health", { origin: "https://attacker.example" });
  assert.equal(blockedOrigin.response.status, 403);
});
