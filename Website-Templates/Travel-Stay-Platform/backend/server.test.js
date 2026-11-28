import assert from "node:assert/strict";
import { once } from "node:events";
import { after, before, test } from "node:test";
import { createMemoryStore } from "./models/store.js";
import { createApp } from "./server.js";
import { configureMongoDns, createMongoLookup } from "./utils/mongodb-dns.js";

let server;
let baseUrl;
let clientToken;
let secondClientToken;
let adminToken;
let reservationId;
let paymentReference;
const paymentTransactions = new Map();

async function fakePaymentFetch(url, options = {}) {
  if (url.endsWith("/transaction/initialize")) {
    const request = JSON.parse(options.body);
    const transaction = {
      status: "success",
      reference: request.reference,
      amount: request.amount,
      currency: request.currency,
      customer: { email: request.email },
      metadata: request.metadata,
    };
    paymentTransactions.set(request.reference, transaction);
    return Response.json({ status: true, data: { authorization_url: "https://checkout.paystack.test/session", reference: request.reference } });
  }
  if (url.includes("/transaction/verify/")) {
    const reference = decodeURIComponent(new URL(url).pathname.split("/").pop());
    const transaction = paymentTransactions.get(reference);
    if (!transaction) return Response.json({ status: false, message: "Transaction not found." }, { status: 404 });
    return Response.json({ status: true, data: transaction });
  }
  throw new Error(`Unexpected payment provider URL: ${url}`);
}

before(async () => {
  const app = createApp({
    env: {
      NODE_ENV: "test",
      ADMIN_SIGNUP_CODE: "private-test-invite",
      ALLOWED_ORIGINS: "http://localhost:5173,http://localhost:3000",
      PAYSTACK_SECRET_KEY: "test-paystack-secret",
      PAYSTACK_SUPPORTED_CURRENCIES: "USD",
    },
    jwtSecret: "escapes-test-signing-secret-long-enough",
    store: createMemoryStore(),
    fetchImpl: fakePaymentFetch,
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

test("guest and admin routes enforce account roles", async () => {
  assert.equal((await api("/client/dashboard")).response.status, 401);
  const guest = await api("/auth/signup", {
    method: "POST",
    body: { name: "Jordan Guest", email: "jordan@example.test", password: "escapes-guest-pass-1" },
  });
  assert.equal(guest.response.status, 201);
  clientToken = guest.data.token;

  const otherGuest = await api("/auth/signup", {
    method: "POST",
    body: { name: "Casey Guest", email: "casey@example.test", password: "escapes-guest-pass-2" },
  });
  assert.equal(otherGuest.response.status, 201);
  secondClientToken = otherGuest.data.token;

  const unauthorizedAdmin = await api("/admin/dashboard", { token: clientToken });
  assert.equal(unauthorizedAdmin.response.status, 403);

  const missingInvite = await api("/auth/admin-signup", {
    method: "POST",
    body: { name: "Escapes Admin", email: "admin@example.test", password: "escapes-admin-pass-1" },
  });
  assert.equal(missingInvite.response.status, 400);

  const admin = await api("/auth/admin-signup", {
    method: "POST",
    body: {
      name: "Escapes Admin",
      email: "admin@example.test",
      password: "escapes-admin-pass-1",
      inviteCode: "private-test-invite",
    },
  });
  assert.equal(admin.response.status, 201);
  adminToken = admin.data.token;
  assert.equal((await api("/admin/dashboard", { token: adminToken })).response.status, 200);
});

test("checkout uses server rates, starts hosted payment, and scopes reservations to their guest", async () => {
  const checkIn = new Date();
  checkIn.setUTCDate(checkIn.getUTCDate() + 30);
  const checkOut = new Date(checkIn);
  checkOut.setUTCDate(checkOut.getUTCDate() + 2);
  const formatDate = (date) => date.toISOString().slice(0, 10);
  const created = await api("/client/bookings/checkout", {
    method: "POST",
    token: clientToken,
    body: {
      staySlug: "azure-breeze",
      checkIn: formatDate(checkIn),
      checkOut: formatDate(checkOut),
      guests: 2,
      guestName: "Jordan Guest",
      guestEmail: "jordan@example.test",
      provider: "paystack",
    },
  });
  assert.equal(created.response.status, 201);
  reservationId = created.data.reservation.id;
  paymentReference = created.data.reservation.externalReference;
  assert.equal(created.data.reservation.nightlyRate, 180);
  assert.equal(created.data.reservation.nights, 2);
  assert.equal(created.data.reservation.total, 402);
  assert.equal(created.data.reservation.status, "pending_payment");
  assert.equal(created.data.reservation.paymentStatus, "pending");
  assert.equal(created.data.redirectUrl, "https://checkout.paystack.test/session");

  const ownDashboard = await api("/client/dashboard", { token: clientToken });
  assert.deepEqual(ownDashboard.data.reservations.map((item) => item.id), [reservationId]);
  const otherDashboard = await api("/client/dashboard", { token: secondClientToken });
  assert.deepEqual(otherDashboard.data.reservations, []);

  const adminDashboard = await api("/admin/dashboard", { token: adminToken });
  assert.equal(adminDashboard.data.metrics.customers, 2);
  assert.equal(adminDashboard.data.metrics.reservations, 1);
  assert.equal(adminDashboard.data.reservations[0].guestEmail, "jordan@example.test");
  assert.equal(JSON.stringify(adminDashboard.data).includes("passwordHash"), false);
});

test("payment verification is required before admin status changes and invalid booking data is rejected", async () => {
  const denied = await api(`/admin/bookings/${reservationId}`, {
    method: "PATCH",
    token: clientToken,
    body: { status: "confirmed" },
  });
  assert.equal(denied.response.status, 403);

  const updated = await api(`/admin/bookings/${reservationId}`, {
    method: "PATCH",
    token: adminToken,
    body: { status: "confirmed" },
  });
  assert.equal(updated.response.status, 409);

  const verified = await api("/client/bookings/verify", {
    method: "POST",
    token: clientToken,
    body: { reservationId, provider: "paystack", reference: paymentReference },
  });
  assert.equal(verified.response.status, 200);
  assert.equal(verified.data.verified, true);
  assert.equal(verified.data.reservation.paymentStatus, "paid");

  const confirmed = await api(`/admin/bookings/${reservationId}`, {
    method: "PATCH",
    token: adminToken,
    body: { status: "completed" },
  });
  assert.equal(confirmed.response.status, 200);
  assert.equal(confirmed.data.reservation.status, "completed");

  const invalidDateRange = await api("/client/bookings/checkout", {
    method: "POST",
    token: clientToken,
    body: {
      staySlug: "azure-breeze",
      checkIn: "2030-01-03",
      checkOut: "2030-01-02",
      guests: 2,
      guestName: "Jordan Guest",
      guestEmail: "jordan@example.test",
      provider: "paystack",
    },
  });
  assert.equal(invalidDateRange.response.status, 400);

  const blockedOrigin = await api("/health", { origin: "https://not-escapes.example" });
  assert.equal(blockedOrigin.response.status, 403);
});

test("only admins can add property listings and new properties appear in the live admin dashboard", async () => {
  const body = {
    name: "Cove Garden Hotel",
    area: "Canggu, Bali",
    room: "Garden Suite",
    type: "Boutique hotel",
    price: 155,
    categories: "Boutique Hotels, City Apartments",
    image: "https://images.example.test/cove-garden.jpg",
    description: "A quiet boutique stay with a garden courtyard, thoughtful service, and easy access to local beaches.",
  };
  const denied = await api("/admin/stays", { method: "POST", token: clientToken, body });
  assert.equal(denied.response.status, 403);

  const created = await api("/admin/stays", { method: "POST", token: adminToken, body });
  assert.equal(created.response.status, 201);
  assert.equal(created.data.stay.slug, "cove-garden-hotel");
  assert.equal(created.data.stay.price, 155);

  const dashboard = await api("/admin/dashboard", { token: adminToken });
  assert.equal(dashboard.data.stays.length, 1);
  assert.equal(dashboard.data.stays[0].name, body.name);
  const publicCatalog = await api("/public/stays");
  assert.equal(publicCatalog.data.stays[0].slug, "cove-garden-hotel");
  const publicStay = await api("/public/stays/cove-garden-hotel");
  assert.equal(publicStay.data.stay.price, 155);

  const insecureImage = await api("/admin/stays", {
    method: "POST",
    token: adminToken,
    body: { ...body, name: "Unsafe Image Hotel", image: "http://images.example.test/photo.jpg" },
  });
  assert.equal(insecureImage.response.status, 400);
});

test("MongoDB DNS configuration uses reliable defaults and validates overrides", () => {
  let configured;
  assert.deepEqual(configureMongoDns({}, (servers) => { configured = servers; }), ["1.1.1.1", "8.8.8.8"]);
  assert.deepEqual(configured, ["1.1.1.1", "8.8.8.8"]);
  assert.deepEqual(
    configureMongoDns({ MONGODB_DNS_SERVERS: "9.9.9.9, 149.112.112.112" }, (servers) => { configured = servers; }),
    ["9.9.9.9", "149.112.112.112"],
  );
  assert.throws(() => configureMongoDns({ MONGODB_DNS_SERVERS: "not-an-ip" }, () => {}), /MONGODB_DNS_SERVERS/);
});

test("MongoDB socket lookup falls back to configured DNS resolvers for an ENOTFOUND host", async () => {
  const systemError = Object.assign(new Error("getaddrinfo ENOTFOUND atlas-node.example"), { code: "ENOTFOUND" });
  let ipv4Lookups = 0;
  let ipv6Lookups = 0;
  const lookup = createMongoLookup({
    lookup: (_hostname, _options, callback) => callback(systemError),
    resolve4: (_hostname, callback) => {
      ipv4Lookups += 1;
      callback(null, ["192.0.2.10"]);
    },
    resolve6: (_hostname, callback) => {
      ipv6Lookups += 1;
      callback(null, ["2001:db8::10"]);
    },
  });
  const addresses = await new Promise((resolve, reject) => {
    lookup("atlas-node.example", { all: true }, (error, result) => error ? reject(error) : resolve(result));
  });
  assert.deepEqual(addresses, [
    { address: "192.0.2.10", family: 4 },
    { address: "2001:db8::10", family: 6 },
  ]);
  assert.equal(ipv4Lookups, 1);
  assert.equal(ipv6Lookups, 1);
});

test("MongoDB socket lookup preserves non-ENOTFOUND system lookup failures", async () => {
  const systemError = Object.assign(new Error("DNS lookup timed out"), { code: "EAI_AGAIN" });
  let resolverCalled = false;
  const lookup = createMongoLookup({
    lookup: (_hostname, _options, callback) => callback(systemError),
    resolve4: () => { resolverCalled = true; },
    resolve6: () => { resolverCalled = true; },
  });
  await new Promise((resolve) => {
    lookup("atlas-node.example", {}, (error) => {
      assert.equal(error, systemError);
      resolve();
    });
  });
  assert.equal(resolverCalled, false);
});
