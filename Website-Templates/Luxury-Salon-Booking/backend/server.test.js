import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createApp, seedAdmin } from "./server.js";

function createMemoryStore() {
  const users = [];
  const appointments = [];
  return {
    async findUserByEmail(email) { return users.find((user) => user.email === email) || null; },
    async findUserById(id) { return users.find((user) => user.id === id) || null; },
    async createUser(user) { users.push(user); return user; },
    async countUsers(role) { return users.filter((user) => !role || user.role === role).length; },
    async listUsers(role) {
      return users.filter((user) => !role || user.role === role).map(({ passwordHash, ...user }) => user);
    },
    async createAppointment(appointment) { appointments.push(appointment); return appointment; },
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
  };
}

const store = createMemoryStore();
const adminConfig = { ADMIN_EMAIL: "admin@lumiere.example", ADMIN_PASSWORD: "safe-test-password-2026" };
let baseUrl;
let server;
let clientToken;
let secondClientToken;
let adminToken;
let appointmentId;

async function post(path, body, token) {
  return fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

before(async () => {
  await seedAdmin(store, adminConfig);
  const app = createApp({ store, secret: "test-secret", env: { NODE_ENV: "test" } });
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
