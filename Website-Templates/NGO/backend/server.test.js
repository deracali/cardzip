import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { after, before, test } from "node:test";
import { createApp } from "./server.js";

let server;
let baseUrl;
let tempDirectory;

before(async () => {
  tempDirectory = await mkdtemp(path.join(os.tmpdir(), "kindred-ngo-api-"));
  const app = createApp({
    env: {
      NODE_ENV: "test",
      ADMIN_SIGNUP_CODE: "test-private-invite-code",
      ALLOWED_ORIGINS: "http://localhost:5173,http://localhost:3000",
    },
    jwtSecret: "a-test-secret-long-enough-for-kindred-api-tests",
    dataFile: path.join(tempDirectory, "kindred.json"),
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
  if (tempDirectory) await rm(tempDirectory, { recursive: true, force: true });
});

async function api(pathname, { method = "GET", token, body, origin } = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
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

test("campaign browsing is public and client/admin portals require their own roles", async () => {
  const campaigns = await api("/public/campaigns");
  assert.equal(campaigns.response.status, 200);
  assert.equal(campaigns.data.campaigns.length, 3);
  assert.equal((await api("/client/dashboard")).response.status, 401);
  assert.equal((await api("/admin/dashboard")).response.status, 401);

  const client = await api("/auth/signup", {
    method: "POST",
    body: { name: "Kind Donor", email: "donor@example.test", password: "a-safe-password-123" },
  });
  assert.equal(client.response.status, 201);
  assert.equal(client.data.user.role, "client");
  assert.equal("passwordHash" in client.data.user, false);

  const clientDashboard = await api("/client/dashboard", { token: client.data.token });
  assert.equal(clientDashboard.response.status, 200);
  assert.equal(clientDashboard.data.user.email, "donor@example.test");
  assert.deepEqual(clientDashboard.data.donations, []);
  assert.equal((await api("/admin/dashboard", { token: client.data.token })).response.status, 403);

  const blockedAdminSignup = await api("/auth/admin-signup", {
    method: "POST",
    body: { name: "Site Admin", email: "admin@example.test", password: "a-safe-password-123", inviteCode: "wrong" },
  });
  assert.equal(blockedAdminSignup.response.status, 403);

  const admin = await api("/auth/admin-signup", {
    method: "POST",
    body: { name: "Site Admin", email: "admin@example.test", password: "another-safe-password-123", inviteCode: "test-private-invite-code" },
  });
  assert.equal(admin.response.status, 201);
  assert.equal(admin.data.user.role, "admin");
  assert.equal((await api("/client/dashboard", { token: admin.data.token })).response.status, 403);
  assert.equal((await api("/admin/dashboard", { token: admin.data.token })).response.status, 200);
});

test("donation pledges are role-checked, validated, and isolated by donor", async () => {
  const first = await api("/auth/login", {
    method: "POST",
    body: { email: "donor@example.test", password: "a-safe-password-123", expectedRole: "client" },
  });
  assert.equal(first.response.status, 200);

  const invalidGift = await api("/client/donations", {
    method: "POST",
    token: first.data.token,
    body: { amount: -5, frequency: "once", campaignSlug: "clean-water-schools" },
  });
  assert.equal(invalidGift.response.status, 400);

  const pledge = await api("/client/donations", {
    method: "POST",
    token: first.data.token,
    body: { amount: 25.5, frequency: "monthly", campaignSlug: "clean-water-schools", cardNumber: "must-not-be-saved" },
  });
  assert.equal(pledge.response.status, 201);
  assert.equal(pledge.data.donation.amount, 25.5);
  assert.equal(pledge.data.donation.paymentStatus, "Not processed");
  assert.equal(JSON.stringify(pledge.data).includes("must-not-be-saved"), false);

  const second = await api("/auth/signup", {
    method: "POST",
    body: { name: "Another Donor", email: "another@example.test", password: "a-safe-password-456" },
  });
  const isolated = await api("/client/dashboard", { token: second.data.token });
  assert.deepEqual(isolated.data.donations, []);

  const admin = await api("/auth/login", {
    method: "POST",
    body: { email: "admin@example.test", password: "another-safe-password-123", expectedRole: "admin" },
  });
  const dashboard = await api("/admin/dashboard", { token: admin.data.token });
  assert.equal(dashboard.data.metrics.pledges, 1);
  assert.equal(dashboard.data.metrics.pendingReview, 1);

  const update = await api(`/admin/donations/${pledge.data.donation.id}`, {
    method: "PATCH",
    token: admin.data.token,
    body: { status: "Acknowledged" },
  });
  assert.equal(update.response.status, 200);
  assert.equal(update.data.donation.status, "Acknowledged");

  const generalFundPledge = await api("/client/donations", {
    method: "POST",
    token: first.data.token,
    body: { amount: 10, frequency: "once", note: "General support" },
  });
  assert.equal(generalFundPledge.response.status, 201);
  assert.equal(generalFundPledge.data.donation.campaignTitle, "Kindred General Fund");
  assert.equal(generalFundPledge.data.donation.campaignSlug, null);
  assert.equal(generalFundPledge.data.donation.note, "General support");
});

test("CORS accepts only configured storefront origins", async () => {
  const allowed = await api("/health", { origin: "http://localhost:5173" });
  assert.equal(allowed.response.status, 200);
  assert.equal(allowed.response.headers.get("access-control-allow-origin"), "http://localhost:5173");
  const denied = await api("/health", { origin: "https://untrusted.example" });
  assert.equal(denied.response.status, 403);
});
