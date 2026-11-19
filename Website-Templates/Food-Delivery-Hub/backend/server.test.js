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

  const app = createApp({
    env: { NODE_ENV: "test", ALLOWED_ORIGINS: "http://localhost:5173,http://localhost:3000" },
    jwtSecret: secret,
    store,
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
});

test("client orders are validated and isolated from other client dashboards", async () => {
  const created = await api("/client/orders", {
    method: "POST",
    token: clientToken,
    body: {
      items: [{ dishId: "pizza", quantity: 2 }],
      address: "100 Greenwich Ave",
      phone: "212-555-0100",
      instructions: "Leave at the front desk.",
    },
  });
  assert.equal(created.response.status, 201);
  assert.equal(created.data.order.total, 29.97);

  const invalidOrder = await api("/client/orders", {
    method: "POST",
    token: clientToken,
    body: { items: [{ dishId: "unknown", quantity: 1 }], address: "100 Greenwich Ave", phone: "212-555-0100" },
  });
  assert.equal(invalidOrder.response.status, 400);

  const clientDashboard = await api("/client/dashboard", { token: clientToken });
  assert.equal(clientDashboard.response.status, 200);
  assert.deepEqual(clientDashboard.data.orders.map((order) => order.id), [created.data.order.id]);

  const adminDashboard = await api("/admin/dashboard", { token: adminToken });
  assert.equal(adminDashboard.response.status, 200);
  assert.equal(adminDashboard.data.metrics.orders, 1);
});
