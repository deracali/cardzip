import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createMemoryStore } from "./models/memory-store.js";
import { formatMongoConnectionError } from "./models/mongo-store.js";
import { createAppServer } from "./server.js";

let app;
let baseUrl;
let adminToken;

before(async () => {
  app = createAppServer({
    port: 0,
    host: "127.0.0.1",
    origins: ["http://localhost:3000"],
    adminEmail: "admin@example.com",
    adminPassword: "a-secure-test-password",
    authSecret: "a-test-secret-that-is-at-least-thirty-two-characters",
    store: createMemoryStore(),
  });
  await app.ready;
  await new Promise((resolve) => app.server.listen(0, app.host, resolve));
  baseUrl = `http://127.0.0.1:${app.server.address().port}/api`;
  const login = await fetch(`${baseUrl}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@example.com", password: "a-secure-test-password" }),
  });
  adminToken = (await login.json()).token;
});

after(async () => {
  if (app) await app.close();
});

const adminHeaders = () => ({ Authorization: `Bearer ${adminToken}` });
const userHeaders = (token) => ({ Authorization: `${["Bea", "rer"].join("")} ${token}` });

test("Atlas SRV DNS failures include actionable fallback guidance", () => {
  const cause = Object.assign(new Error("querySrv ECONNREFUSED"), {
    code: "ECONNREFUSED",
    syscall: "querySrv",
  });
  const formatted = formatMongoConnectionError(cause);
  assert.match(formatted.message, /fallback DNS resolvers/);
  assert.match(formatted.message, /MONGODB_DNS_SERVERS/);
  assert.equal(formatted.cause, cause);
});

test("stores inquiries and supports admin read, update, and delete", async () => {
  const submitted = await fetch(`${baseUrl}/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "contact", name: "Alex Morgan", email: "alex@example.com", company: "Acme", message: "We need workflow automation." }),
  });
  assert.equal(submitted.status, 201);
  const lead = (await submitted.json()).data;
  assert.equal(lead.status, "new");

  const unauthorized = await fetch(`${baseUrl}/admin/leads`);
  assert.equal(unauthorized.status, 401);
  const listing = await fetch(`${baseUrl}/admin/leads?search=alex`, { headers: adminHeaders() });
  assert.equal(listing.status, 200);
  assert.equal((await listing.json()).data[0].id, lead.id);

  const update = await fetch(`${baseUrl}/admin/leads/${lead.id}`, {
    method: "PATCH",
    headers: { ...adminHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ status: "contacted", response: "We would be happy to discuss your workflow." }),
  });
  const updatedLead = (await update.json()).data;
  assert.equal(updatedLead.response, "We would be happy to discuss your workflow.");
  assert.equal(typeof updatedLead.respondedAt, "string");

  const invalidResponse = await fetch(`${baseUrl}/admin/leads/${lead.id}`, {
    method: "PATCH",
    headers: { ...adminHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ status: "contacted", response: "x".repeat(5001) }),
  });
  assert.equal(invalidResponse.status, 400);

  const deleted = await fetch(`${baseUrl}/admin/leads/${lead.id}`, { method: "DELETE", headers: adminHeaders() });
  assert.equal(deleted.status, 200);
  assert.deepEqual((await (await fetch(`${baseUrl}/admin/leads`, { headers: adminHeaders() })).json()).data, []);
});

test("creates and serves editable pages and plans from the data store", async () => {
  const pageInput = {
    slug: "/",
    title: "Test homepage",
    eyebrow: "TEST",
    description: "Content saved through the admin API.",
    showInNavigation: true,
    sections: [{ title: "Welcome", body: "Dynamic page copy." }],
  };
  const createdPage = await fetch(`${baseUrl}/admin/pages`, {
    method: "POST",
    headers: { ...adminHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(pageInput),
  });
  assert.equal(createdPage.status, 201);
  const page = (await createdPage.json()).data;
  const publicPage = await fetch(`${baseUrl}/pages/%2F`);
  assert.equal((await publicPage.json()).data.title, "Test homepage");
  assert.equal((await (await fetch(`${baseUrl}/pages`)).json()).data.length, 1);

  const planInput = { slug: "starter", name: "Starter", description: "Start here.", price: { monthly: 0, annual: 0 }, features: ["One feature"], cta: "Start" };
  const createdPlan = await fetch(`${baseUrl}/admin/plans`, {
    method: "POST",
    headers: { ...adminHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(planInput),
  });
  assert.equal(createdPlan.status, 201);
  assert.equal((await (await fetch(`${baseUrl}/plans`)).json()).data[0].slug, "starter");

  const updatedPage = await fetch(`${baseUrl}/admin/pages/${page.id}`, {
    method: "PATCH",
    headers: { ...adminHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ ...pageInput, title: "Updated homepage" }),
  });
  assert.equal((await updatedPage.json()).data.title, "Updated homepage");
  assert.equal((await fetch(`${baseUrl}/admin/pages/${page.id}`, { method: "DELETE", headers: adminHeaders() })).status, 200);
});

test("records signups, keeps password hashes private, and exposes user administration", async () => {
  const signup = await fetch(`${baseUrl}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Jamie Lee", email: "jamie@example.com", password: "a-secure-user-password" }),
  });
  assert.equal(signup.status, 201);
  const signupResult = await signup.json();
  assert.equal(signupResult.user.email, "jamie@example.com");
  assert.equal("passwordHash" in signupResult.user, false);
  const anonymousSubmission = await fetch(`${baseUrl}/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "contact", name: "Jamie Lee", email: "jamie@example.com", company: "Nexara team", message: "An unlinked inquiry." }),
  });
  assert.equal(anonymousSubmission.status, 201);
  const submitted = await fetch(`${baseUrl}/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...userHeaders(signupResult.token) },
    body: JSON.stringify({ type: "contact", name: "Jamie Lee", email: "jamie@example.com", company: "Nexara team", message: "I would like to discuss a plan." }),
  });
  const lead = (await submitted.json()).data;
  await fetch(`${baseUrl}/admin/leads/${lead.id}`, {
    method: "PATCH",
    headers: { ...adminHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ status: "contacted", response: "We would be happy to discuss a plan with you." }),
  });
  const accountLeads = await fetch(`${baseUrl}/auth/leads`, { headers: userHeaders(signupResult.token) });
  assert.equal(accountLeads.status, 200);
  const customerLeads = (await accountLeads.json()).data;
  assert.equal(customerLeads.length, 1);
  assert.equal(customerLeads[0].userId, undefined);
  assert.notEqual(customerLeads[0].id, (await anonymousSubmission.json()).data.id);
  assert.equal(customerLeads.find((item) => item.id === lead.id).response, "We would be happy to discuss a plan with you.");
  assert.equal((await fetch(`${baseUrl}/auth/leads`)).status, 401);

  const users = await fetch(`${baseUrl}/admin/users`, { headers: adminHeaders() });
  const user = (await users.json()).data[0];
  assert.equal(user.email, "jamie@example.com");
  const update = await fetch(`${baseUrl}/admin/users/${user.id}`, {
    method: "PATCH",
    headers: { ...adminHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Jamie L.", email: "jamie@example.com" }),
  });
  assert.equal((await update.json()).data.name, "Jamie L.");
  assert.equal((await fetch(`${baseUrl}/auth/me`, { headers: { Authorization: `Bearer ${signupResult.token}` } })).status, 200);
});

test("rejects malformed leads, invalid page content, and untrusted browser origins", async () => {
  const invalidLead = await fetch(`${baseUrl}/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "contact", name: "", email: "not-an-email" }),
  });
  assert.equal(invalidLead.status, 400);

  const invalidPage = await fetch(`${baseUrl}/admin/pages`, {
    method: "POST",
    headers: { ...adminHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ slug: "../bad", title: "Bad page" }),
  });
  assert.equal(invalidPage.status, 400);
  const forbiddenOrigin = await fetch(`${baseUrl}/health`, { headers: { Origin: "https://untrusted.example" } });
  assert.equal(forbiddenOrigin.status, 403);
});
