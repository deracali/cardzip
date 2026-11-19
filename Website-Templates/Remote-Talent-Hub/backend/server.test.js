import assert from "node:assert/strict";
import { once } from "node:events";
import { afterEach, beforeEach, test } from "node:test";
import { createApp } from "./src/app.js";
import { hashPassword } from "./src/auth.js";
import { createMemoryStore } from "./src/models/store.js";

const jwtSecret = "test-only-secret-that-is-long-enough-for-hmac";
let server;
let baseUrl;
let store;

beforeEach(async () => {
  store = createMemoryStore();
  server = createApp({ store, jwtSecret }).listen(0);
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
});

afterEach(async () => {
  if (server) {
    server.close();
    await once(server, "close");
    server = null;
  }
});

async function request(path, { token, method = "GET", body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, data: await response.json() };
}

async function signup(name, email, role) {
  const result = await request("/auth/signup", {
    method: "POST",
    body: { name, email, password: "a-secure-test-password", role },
  });
  assert.equal(result.status, 201);
  return result.data;
}

test("public signup rejects admin accounts and dashboard routes require authentication", async () => {
  const adminSignup = await request("/auth/signup", {
    method: "POST",
    body: { name: "Admin", email: "admin@example.com", password: "a-secure-test-password", role: "admin" },
  });
  assert.equal(adminSignup.status, 400);
  assert.equal((await request("/admin/dashboard")).status, 401);
  assert.equal((await request("/client/dashboard")).status, 401);
});

test("candidate applications and employer jobs are isolated and admin-only management is enforced", async () => {
  const candidate = await signup("Candidate One", "candidate@example.com", "candidate");
  const employer = await signup("Employer One", "employer@example.com", "employer");
  const otherEmployer = await signup("Employer Two", "other-employer@example.com", "employer");
  const admin = await store.insertUser({
    name: "Admin",
    email: "admin@example.com",
    passwordHash: await hashPassword("admin-test-password"),
    role: "admin",
    createdAt: new Date().toISOString(),
  });
  const adminLogin = await request("/auth/login", {
    method: "POST",
    body: { email: admin.email, password: "admin-test-password", role: "admin" },
  });
  assert.equal(adminLogin.status, 200);

  const deniedJob = await request("/client/jobs", {
    method: "POST",
    token: candidate.token,
    body: { title: "Test" },
  });
  assert.equal(deniedJob.status, 403);

  const createdJob = await request("/client/jobs", {
    method: "POST",
    token: employer.token,
    body: {
      title: "Remote product designer",
      category: "UX/UI Design",
      type: "Full-time",
      workMode: "Remote",
      location: "Worldwide",
      currency: "USD",
      minSalary: 90000,
      maxSalary: 120000,
      description: "Design a welcoming product experience for a distributed global team.",
      skills: "Figma, Research",
      plan: "standard",
    },
  });
  assert.equal(createdJob.status, 201);
  const jobId = createdJob.data.job.id;

  await store.updateJob(jobId, { paymentStatus: "paid" });
  const reviewed = await request(`/admin/jobs/${jobId}`, {
    method: "PATCH",
    token: adminLogin.data.token,
    body: { status: "approved" },
  });
  assert.equal(reviewed.status, 200);

  const application = await request("/client/applications", {
    method: "POST",
    token: candidate.token,
    body: {
      jobId,
      jobTitle: "A client supplied title that must not override the listing",
      message: "I have extensive experience building accessible remote-first products.",
      portfolioUrl: "https://example.com",
    },
  });
  assert.equal(application.status, 201);

  const candidateDashboard = await request("/client/dashboard", { token: candidate.token });
  const employerDashboard = await request("/client/dashboard", { token: employer.token });
  assert.equal(candidateDashboard.data.applications.length, 1);
  assert.equal("jobs" in candidateDashboard.data, false);
  assert.equal(employerDashboard.data.jobs.length, 1);
  assert.equal(employerDashboard.data.applications.length, 1);
  assert.equal(candidateDashboard.data.applications[0].jobTitle, "Remote product designer");

  const shortlisted = await request(`/client/applications/${application.data.application.id}`, {
    method: "PATCH",
    token: employer.token,
    body: { status: "shortlisted" },
  });
  assert.equal(shortlisted.status, 200);
  assert.equal(shortlisted.data.application.status, "shortlisted");
  const otherEmployerAccess = await request(`/client/applications/${application.data.application.id}`, {
    method: "PATCH",
    token: otherEmployer.token,
    body: { status: "rejected" },
  });
  assert.equal(otherEmployerAccess.status, 404);

  const blockedAdmin = await request("/admin/dashboard", { token: employer.token });
  assert.equal(blockedAdmin.status, 403);
  const adminDashboard = await request("/admin/dashboard", { token: adminLogin.data.token });
  assert.equal(adminDashboard.status, 200);
  assert.equal(adminDashboard.data.users.length, 4);
  assert.equal("passwordHash" in adminDashboard.data.users[0], false);

  const publicJobs = await request("/public/jobs");
  assert.equal(publicJobs.data.jobs.length, 1);
  assert.equal(publicJobs.data.jobs[0].ownerId, undefined);
});
