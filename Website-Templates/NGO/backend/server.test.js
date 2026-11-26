import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { after, before, test } from "node:test";
import { connectStoreWithDnsFallback, createApp } from "./server.js";

let server;
let baseUrl;
let tempDirectory;
const paymentTransactions = new Map();
const webhookSecret = "kindred-test-paystack-secret";
const fakePaystack = {
  currency: "USD",
  assertConfigured() {},
  async initializeTransaction({ email, amount, reference, metadata }) {
    paymentTransactions.set(reference, {
      status: "success",
      reference,
      amount: Math.round(amount * 100),
      currency: "USD",
      customer: { email },
      metadata,
    });
    return { authorizationUrl: `https://checkout.paystack.test/${reference}`, reference };
  },
  async verifyTransaction(reference) {
    return paymentTransactions.get(reference) || { status: "abandoned", reference, amount: 0, currency: "USD" };
  },
  verifyWebhookSignature(rawBody, signature) {
    if (!Buffer.isBuffer(rawBody) || typeof signature !== "string") return false;
    const expected = createHmac("sha512", webhookSecret).update(rawBody).digest();
    const received = Buffer.from(signature, "hex");
    return received.length === expected.length && expected.equals(received);
  },
};

before(async () => {
  tempDirectory = await mkdtemp(path.join(os.tmpdir(), "kindred-ngo-api-"));
  const app = createApp({
    env: {
      NODE_ENV: "test",
      ADMIN_SIGNUP_CODE: "test-private-invite-code",
      ALLOWED_ORIGINS: "http://localhost:5173,http://localhost:3000",
    },
    jwtSecret: "a-test-secret-long-enough-for-kindred-api-tests",
    paystack: fakePaystack,
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

async function api(pathname, { method = "GET", token, body, origin, headers = {} } = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(origin ? { Origin: origin } : {}),
      ...headers,
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

test("MongoDB Atlas connection retries with alternate DNS after an SRV resolver refusal", async () => {
  let attempts = 0;
  let configuredServers;
  const warnings = [];
  const store = {
    async connect() {
      attempts += 1;
      if (attempts === 1) {
        const error = new Error("DNS resolver refused SRV lookup");
        error.code = "ECONNREFUSED";
        error.syscall = "querySrv";
        throw error;
      }
    },
  };

  await connectStoreWithDnsFallback(store, {
    env: {},
    setDnsServers: (servers) => { configuredServers = servers; },
    warn: (message) => warnings.push(message),
  });

  assert.equal(attempts, 2);
  assert.deepEqual(configuredServers, ["1.1.1.1", "8.8.8.8"]);
  assert.equal(warnings.length, 1);
});

test("Paystack checkout is owner-scoped and payment status changes only after verification", async () => {
  const donor = await api("/auth/signup", {
    method: "POST",
    body: { name: "Paystack Donor", email: "paystack-donor@example.test", password: "a-safe-password-789" },
  });
  const initialized = await api("/client/payments/initialize", {
    method: "POST",
    token: donor.data.token,
    body: { amount: 25.5, frequency: "monthly", campaignSlug: "clean-water-schools", note: "Keep supporting schools" },
  });
  assert.equal(initialized.response.status, 201);
  assert.match(initialized.data.authorizationUrl, /^https:\/\/checkout\.paystack\.test\//);

  const pending = await api("/client/dashboard", { token: donor.data.token });
  const donation = pending.data.donations.find((item) => item.paymentReference === initialized.data.reference);
  assert.equal(donation.amount, 25.5);
  assert.equal(donation.currency, "USD");
  assert.equal(donation.frequency, "monthly");
  assert.equal(donation.paymentStatus, "Pending");

  const otherDonor = await api("/auth/signup", {
    method: "POST",
    body: { name: "Other Donor", email: "other-paystack@example.test", password: "a-safe-password-789" },
  });
  const blockedVerification = await api("/client/payments/verify", {
    method: "POST",
    token: otherDonor.data.token,
    body: { reference: initialized.data.reference },
  });
  assert.equal(blockedVerification.response.status, 404);

  const expectedTransaction = paymentTransactions.get(initialized.data.reference);
  paymentTransactions.set(initialized.data.reference, { ...expectedTransaction, amount: 1 });
  const wrongAmount = await api("/client/payments/verify", {
    method: "POST",
    token: donor.data.token,
    body: { reference: initialized.data.reference },
  });
  assert.equal(wrongAmount.response.status, 409);
  paymentTransactions.set(initialized.data.reference, expectedTransaction);

  const verified = await api("/client/payments/verify", {
    method: "POST",
    token: donor.data.token,
    body: { reference: initialized.data.reference },
  });
  assert.equal(verified.response.status, 200);
  assert.equal(verified.data.donation.paymentStatus, "Paid");

  const admin = await api("/auth/login", {
    method: "POST",
    body: { email: "admin@example.test", password: "another-safe-password-123", expectedRole: "admin" },
  });
  const dashboard = await api("/admin/dashboard", { token: admin.data.token });
  assert.equal(dashboard.data.metrics.payments, 1);
  assert.equal(dashboard.data.metrics.totalPaid, 25.5);
});

test("Paystack webhook signature is checked and successful charges are idempotently recorded", async () => {
  const donor = await api("/auth/signup", {
    method: "POST",
    body: { name: "Webhook Donor", email: "webhook-donor@example.test", password: "a-safe-password-789" },
  });
  const initialized = await api("/client/payments/initialize", {
    method: "POST",
    token: donor.data.token,
    body: { amount: 12, frequency: "once" },
  });
  const event = { event: "charge.success", data: { reference: initialized.data.reference } };
  const rawBody = Buffer.from(JSON.stringify(event));
  const signature = createHmac("sha512", webhookSecret).update(rawBody).digest("hex");

  const rejected = await api("/payments/paystack/webhook", { method: "POST", body: event, headers: { "x-paystack-signature": "invalid" } });
  assert.equal(rejected.response.status, 401);
  const accepted = await api("/payments/paystack/webhook", { method: "POST", body: event, headers: { "x-paystack-signature": signature } });
  assert.equal(accepted.response.status, 200);
  const repeated = await api("/payments/paystack/webhook", { method: "POST", body: event, headers: { "x-paystack-signature": signature } });
  assert.equal(repeated.response.status, 200);

  const dashboard = await api("/client/dashboard", { token: donor.data.token });
  assert.equal(dashboard.data.donations[0].paymentStatus, "Paid");
});
