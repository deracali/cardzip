import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { connectStoreWithDnsFallback, createApp, seedAdmin } from "./server.js";
import { signPaymentProof } from "./middleware/payment-proof.js";
import { defaultStylists, services as defaultServices } from "./services/salon-data.js";

function createMemoryStore() {
  const users = [];
  const appointments = [];
  const services = defaultServices.map((service) => ({ ...service }));
  const stylists = defaultStylists.map((stylist) => ({ ...stylist }));
  return {
    async findUserByEmail(email) { return users.find((user) => user.email === email) || null; },
    async findUserById(id) { return users.find((user) => user.id === id) || null; },
    async createUser(user) { users.push(user); return user; },
    async countUsers(role) { return users.filter((user) => !role || user.role === role).length; },
    async listUsers(role) {
      return users.filter((user) => !role || user.role === role).map(({ passwordHash, ...user }) => user);
    },
    async createAppointment(appointment) { appointments.push(appointment); return appointment; },
    async findAppointmentByPaymentReference(reference) { return appointments.find((item) => item.paymentReference === reference) || null; },
    async listAppointments({ clientId, limit = 100 } = {}) {
      return appointments.filter((appointment) => !clientId || appointment.clientId === clientId).slice(0, limit);
    },
    async updateAppointment(id, changes) {
      const appointment = appointments.find((item) => item.id === id);
      if (!appointment) return null;
      Object.assign(appointment, changes);
      return appointment;
    },
    async countAppointments() { return appointments.length; },
    async countAppointmentsByStatus(status) { return appointments.filter((appointment) => appointment.status === status).length; },
    async listServices({ includeInactive = true } = {}) {
      return services.filter((service) => includeInactive || service.active !== false).map((service) => ({ ...service }));
    },
    async findServiceById(id) { return services.find((service) => service.id === id) || null; },
    async createService(service) { services.push(service); return service; },
    async updateService(id, changes) {
      const service = services.find((item) => item.id === id);
      if (!service) return null;
      Object.assign(service, changes);
      return { ...service };
    },
    async listStylists({ includeInactive = true } = {}) {
      return stylists.filter((stylist) => includeInactive || stylist.active !== false).map((stylist) => ({ ...stylist }));
    },
    async findStylistByName(name) { return stylists.find((stylist) => stylist.name === name && stylist.active !== false) || null; },
    async findStylistById(id) { return stylists.find((stylist) => stylist.id === id) || null; },
    async createStylist(stylist) { stylists.push(stylist); return stylist; },
    async updateStylist(id, changes) {
      const stylist = stylists.find((item) => item.id === id);
      if (!stylist) return null;
      Object.assign(stylist, changes);
      return { ...stylist };
    },
  };
}

const store = createMemoryStore();
const adminConfig = { ADMIN_EMAIL: "admin@lumiere.example", ADMIN_PASSWORD: "safe-test-password-2026" };
const paymentProofSecret = "test-payment-proof-secret-with-at-least-32-characters";
let baseUrl;
let server;
let clientToken;
let secondClientToken;
let adminToken;
let appointmentId;
let clientUserId;

async function post(path, body, token) {
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  if (path === "/client/appointments" && body.paymentReference) {
    headers["X-Payment-Proof"] = signPaymentProof(clientUserId, body, paymentProofSecret);
  }
  return fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

before(async () => {
  await seedAdmin(store, adminConfig);
  const app = createApp({ store, secret: "test-secret", env: { NODE_ENV: "test", PAYMENT_PROOF_SECRET: paymentProofSecret } });
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
});

test("public signup always creates clients and API roles protect each dashboard", async () => {
  const signup = await post("/auth/signup", {
    name: "Riley Client",
    email: "riley@example.com",
    password: "salon-client-password",
    role: "admin",
  });
  assert.equal(signup.status, 201);
  const client = await signup.json();
  clientToken = client.token;
  clientUserId = client.user.id;
  assert.equal(client.user.role, "client");

  const secondSignup = await post("/auth/signup", {
    name: "Jordan Client",
    email: "jordan@example.com",
    password: "another-client-password",
  });
  assert.equal(secondSignup.status, 201);
  secondClientToken = (await secondSignup.json()).token;

  assert.equal((await fetch(`${baseUrl}/client/dashboard`)).status, 401);
  assert.equal((await fetch(`${baseUrl}/admin/dashboard`, { headers: { Authorization: `Bearer ${clientToken}` } })).status, 403);

  const login = await post("/auth/login", { email: adminConfig.ADMIN_EMAIL, password: adminConfig.ADMIN_PASSWORD });
  assert.equal(login.status, 200);
  const admin = await login.json();
  adminToken = admin.token;
  assert.equal(admin.user.role, "admin");
  assert.equal((await fetch(`${baseUrl}/client/dashboard`, { headers: { Authorization: `Bearer ${adminToken}` } })).status, 403);
});

test("appointments are server-priced and visible only to their client", async () => {
  const unauthenticated = await post("/client/appointments", {});
  assert.equal(unauthenticated.status, 401);

  const created = await post("/client/appointments", {
    serviceId: "signature-silk-blowout",
    date: new Date().toISOString().slice(0, 10),
    time: "2:15 PM",
    stylist: "Maya R.",
    price: 0,
    notes: "",
    paymentReference: "test-payment-initial",
    paymentAmountMinor: 85000,
    paymentCurrency: "NGN",
    paidPriceUsd: 85,
  }, clientToken);
  assert.equal(created.status, 201);
  const appointment = (await created.json()).appointment;
  appointmentId = appointment.id;
  assert.equal(appointment.price, 85);

  const own = await fetch(`${baseUrl}/client/dashboard`, { headers: { Authorization: `Bearer ${clientToken}` } });
  assert.equal((await own.json()).appointments.length, 1);
  const other = await fetch(`${baseUrl}/client/dashboard`, { headers: { Authorization: `Bearer ${secondClientToken}` } });
  assert.equal((await other.json()).appointments.length, 0);

  const invalidDate = await post("/client/appointments", {
    serviceId: "signature-silk-blowout",
    date: "2026-02-31",
    time: "2:15 PM",
    stylist: "Maya R.",
    notes: "",
    paymentReference: "test-payment-invalid-date",
    paymentAmountMinor: 85000,
    paymentCurrency: "NGN",
    paidPriceUsd: 85,
  }, clientToken);
  assert.equal(invalidDate.status, 400);
});

test("only admins can change appointment status", async () => {
  const denied = await fetch(`${baseUrl}/admin/appointments/${appointmentId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${clientToken}` },
    body: JSON.stringify({ status: "Confirmed" }),
  });
  assert.equal(denied.status, 403);

  const updated = await fetch(`${baseUrl}/admin/appointments/${appointmentId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: "Confirmed" }),
  });
  assert.equal(updated.status, 200);
  assert.equal((await updated.json()).appointment.status, "Confirmed");
});

test("admin service price edits update the public catalogue and future appointments", async () => {
  const updated = await fetch(`${baseUrl}/admin/services/signature-silk-blowout`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ price: 99 }),
  });
  assert.equal(updated.status, 200);
  assert.equal((await updated.json()).service.price, 99);

  const catalog = await fetch(`${baseUrl}/services`);
  assert.equal(catalog.status, 200);
  const { services } = await catalog.json();
  assert.equal(services.find((service) => service.id === "signature-silk-blowout").price, 99);

  const created = await post("/client/appointments", {
    serviceId: "signature-silk-blowout",
    date: new Date().toISOString().slice(0, 10),
    time: "4:00 PM",
    stylist: "Maya R.",
    notes: "",
    paymentReference: "test-payment-after-price-change",
    paymentAmountMinor: 99000,
    paymentCurrency: "NGN",
    paidPriceUsd: 99,
  }, clientToken);
  assert.equal(created.status, 201);
  assert.equal((await created.json()).appointment.price, 99);
});

test("admin-added stylists appear in public booking data", async () => {
  const created = await fetch(`${baseUrl}/admin/stylists`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      name: "Renee Cole",
      role: "Senior colorist",
      bio: "Specializes in lived-in color and healthy, dimensional finishes.",
      image: "",
      active: true,
    }),
  });
  assert.equal(created.status, 201);

  const catalog = await fetch(`${baseUrl}/stylists`);
  assert.equal(catalog.status, 200);
  const { stylists } = await catalog.json();
  assert.ok(stylists.some((stylist) => stylist.name === "Renee Cole"));
});

test("retries MongoDB SRV DNS refusal with fallback resolvers", async () => {
  let attempts = 0;
  let configuredServers;
  const warnings = [];
  const store = {
    async connect() {
      attempts += 1;
      if (attempts === 1) {
        const error = new Error("DNS resolver refused the request");
        error.code = "ECONNREFUSED";
        error.syscall = "querySrv";
        throw error;
      }
    },
  };

  await connectStoreWithDnsFallback(store, {
    env: {},
    setDnsServers(servers) { configuredServers = servers; },
    warn(message) { warnings.push(message); },
  });

  assert.equal(attempts, 2);
  assert.deepEqual(configuredServers, ["1.1.1.1", "8.8.8.8"]);
  assert.equal(warnings.length, 1);
});

test("does not override configured DNS or retry unrelated connection failures", async () => {
  for (const { env, error } of [
    { env: {}, error: Object.assign(new Error("Connection refused"), { code: "ECONNREFUSED", syscall: "connect" }) },
    { env: { MONGODB_DNS_SERVERS: "10.0.0.1" }, error: Object.assign(new Error("DNS resolver refused the request"), { code: "ECONNREFUSED", syscall: "querySrv" }) },
  ]) {
    let attempts = 0;
    let dnsWasChanged = false;
    const store = {
      async connect() {
        attempts += 1;
        throw error;
      },
    };

    await assert.rejects(
      connectStoreWithDnsFallback(store, {
        env,
        setDnsServers() { dnsWasChanged = true; },
        warn() {},
      }),
      error,
    );
    assert.equal(attempts, 1);
    assert.equal(dnsWasChanged, false);
  }
});
