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
let reservationId;

before(async () => {
  const app = createApp({
    env: {
      NODE_ENV: "test",
      ADMIN_SIGNUP_CODE: "private-test-invite",
      ALLOWED_ORIGINS: "http://localhost:5173,http://localhost:3000",
    },
    jwtSecret: "escapes-test-signing-secret-long-enough",
    store: createMemoryStore(),
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

test("reservations use server rates and are visible only to their owning guest", async () => {
  const checkIn = new Date();
  checkIn.setUTCDate(checkIn.getUTCDate() + 30);
  const checkOut = new Date(checkIn);
  checkOut.setUTCDate(checkOut.getUTCDate() + 2);
  const formatDate = (date) => date.toISOString().slice(0, 10);
  const created = await api("/client/bookings", {
    method: "POST",
    token: clientToken,
    body: {
      staySlug: "azure-breeze",
      checkIn: formatDate(checkIn),
      checkOut: formatDate(checkOut),
      guests: 2,
      guestName: "Jordan Guest",
      guestEmail: "jordan@example.test",
      nightlyRate: 1,
      total: 1,
    },
  });
  assert.equal(created.response.status, 201);
  reservationId = created.data.reservation.id;
  assert.equal(created.data.reservation.nightlyRate, 180);
  assert.equal(created.data.reservation.nights, 2);
  assert.equal(created.data.reservation.total, 402);
  assert.equal(created.data.reservation.status, "requested");
  assert.equal(created.data.reservation.paymentStatus, "not_collected");

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

test("only admins can update reservations and invalid booking data is rejected", async () => {
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
  assert.equal(updated.response.status, 200);
  assert.equal(updated.data.reservation.status, "confirmed");

  const invalidDateRange = await api("/client/bookings", {
    method: "POST",
    token: clientToken,
    body: {
      staySlug: "azure-breeze",
      checkIn: "2030-01-03",
      checkOut: "2030-01-02",
      guests: 2,
      guestName: "Jordan Guest",
      guestEmail: "jordan@example.test",
    },
  });
  assert.equal(invalidDateRange.response.status, 400);

  const blockedOrigin = await api("/health", { origin: "https://not-escapes.example" });
  assert.equal(blockedOrigin.response.status, 403);
});
