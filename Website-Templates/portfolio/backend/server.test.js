import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import { createMemoryStore } from "./models/store.js";
import { createApp, ensureAdmin } from "./server.js";

const secret = "local-test-secret-with-at-least-thirty-two-characters";

async function startApi(t) {
  const store = createMemoryStore();
  await ensureAdmin(store, { email: "admin@example.com", password: "admin-password-123" });
  const server = createServer(createApp({
    store,
    secret,
    corsOrigins: ["http://localhost:5173", "http://localhost:3000"],
  }));
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
  return `http://127.0.0.1:${server.address().port}/api`;
}

async function post(baseUrl, path, body, token) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return { response, data: await response.json() };
}

test("clients can sign up and see only their own review requests", async (t) => {
  const baseUrl = await startApi(t);
  const firstSignup = await post(baseUrl, "/auth/signup", {
    name: "Avery Artist",
    email: "avery@example.com",
    handle: "avery-art",
    password: "client-password-123",
  });
  const secondSignup = await post(baseUrl, "/auth/signup", {
    name: "Jordan Designer",
    email: "jordan@example.com",
    handle: "jordan-design",
    password: "client-password-456",
  });
  assert.equal(firstSignup.response.status, 201);
  assert.equal(firstSignup.data.user.role, "client");
  assert.equal("passwordHash" in firstSignup.data.user, false);

  const created = await post(baseUrl, "/client/review-requests", {
    goal: "I would like feedback on my case study story and navigation.",
    portfolioUrl: "https://avery.example.com",
  }, firstSignup.data.token);
  assert.equal(created.response.status, 201);

  const dashboard = await fetch(`${baseUrl}/client/dashboard`, {
    headers: { Authorization: `Bearer ${secondSignup.data.token}` },
  });
  const dashboardData = await dashboard.json();
  assert.equal(dashboard.status, 200);
  assert.deepEqual(dashboardData.reviewRequests, []);
});

test("client tokens cannot access admin data, while admins can manage review requests", async (t) => {
  const baseUrl = await startApi(t);
  const signup = await post(baseUrl, "/auth/signup", {
    name: "Riley Designer",
    email: "riley@example.com",
    handle: "riley-design",
    password: "client-password-123",
  });
  const request = await post(baseUrl, "/client/review-requests", {
    goal: "I need a clear review of my portfolio case studies.",
  }, signup.data.token);
  const forbidden = await fetch(`${baseUrl}/admin/dashboard`, {
    headers: { Authorization: `Bearer ${signup.data.token}` },
  });
  assert.equal(forbidden.status, 403);

  const login = await post(baseUrl, "/auth/login", {
    email: "admin@example.com",
    password: "admin-password-123",
    role: "admin",
  });
  assert.equal(login.response.status, 200);
  const dashboard = await fetch(`${baseUrl}/admin/dashboard`, {
    headers: { Authorization: `Bearer ${login.data.token}` },
  });
  const dashboardData = await dashboard.json();
  assert.equal(dashboardData.stats.totalRequests, 1);
  const updated = await fetch(`${baseUrl}/admin/review-requests/${request.data.reviewRequest.id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${login.data.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: "confirmed" }),
  });
  assert.equal(updated.status, 200);
  assert.equal((await updated.json()).reviewRequest.status, "confirmed");
});

test("signup validates creator handles and prevents duplicate accounts", async (t) => {
  const baseUrl = await startApi(t);
  const invalid = await post(baseUrl, "/auth/signup", {
    name: "Taylor Artist",
    email: "taylor@example.com",
    handle: "invalid handle!",
    password: "client-password-123",
  });
  assert.equal(invalid.response.status, 400);

  const account = {
    name: "Taylor Artist",
    email: "taylor@example.com",
    handle: "taylor-art",
    password: "client-password-123",
  };
  assert.equal((await post(baseUrl, "/auth/signup", account)).response.status, 201);
  assert.equal((await post(baseUrl, "/auth/signup", { ...account, handle: "taylor-2" })).response.status, 409);
});
