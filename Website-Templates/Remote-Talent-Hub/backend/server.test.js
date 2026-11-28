import assert from "node:assert/strict";
import { once } from "node:events";
import { afterEach, beforeEach, test } from "node:test";
import { connectStore } from "./server.js";
import { createApp } from "./src/app.js";
import { hashPassword } from "./src/auth.js";
import { createPaymentController } from "./src/controllers/payment-controller.js";
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

test("admins can suspend and restore users while protected accounts and access controls remain enforced", async () => {
  const candidate = await signup("Candidate One", "candidate@example.com", "candidate");
  assert.equal(candidate.user.status, "active");
  const admin = await store.insertUser({
    name: "Admin",
    email: "admin@example.com",
    passwordHash: await hashPassword("admin-test-password"),
    role: "admin",
    status: "active",
    createdAt: new Date().toISOString(),
  });
  const otherAdmin = await store.insertUser({
    name: "Other Admin",
    email: "other-admin@example.com",
    passwordHash: "unused",
    role: "admin",
    status: "active",
    createdAt: new Date().toISOString(),
  });
  const adminLogin = await request("/auth/login", {
    method: "POST",
    body: { email: admin.email, password: "admin-test-password", role: "admin" },
  });

  assert.equal((await request(`/admin/users/${candidate.user.id}`, {
    method: "PATCH",
    token: candidate.token,
    body: { status: "suspended" },
  })).status, 403);
  assert.equal((await request(`/admin/users/${candidate.user.id}`, {
    method: "PATCH",
    token: adminLogin.data.token,
    body: { status: "disabled" },
  })).status, 400);
  assert.equal((await request(`/admin/users/${admin.id}`, {
    method: "PATCH",
    token: adminLogin.data.token,
    body: { status: "suspended" },
  })).status, 400);
  assert.equal((await request(`/admin/users/${otherAdmin.id}`, {
    method: "PATCH",
    token: adminLogin.data.token,
    body: { status: "suspended" },
  })).status, 403);

  const suspended = await request(`/admin/users/${candidate.user.id}`, {
    method: "PATCH",
    token: adminLogin.data.token,
    body: { status: "suspended" },
  });
  assert.equal(suspended.status, 200);
  assert.equal(suspended.data.user.status, "suspended");
  assert.equal((await request("/client/dashboard", { token: candidate.token })).status, 401);
  assert.equal((await request("/auth/login", {
    method: "POST",
    body: { email: candidate.user.email, password: "a-secure-test-password" },
  })).status, 403);

  const restored = await request(`/admin/users/${candidate.user.id}`, {
    method: "PATCH",
    token: adminLogin.data.token,
    body: { status: "active" },
  });
  assert.equal(restored.status, 200);
  assert.equal(restored.data.user.status, "active");
  assert.equal((await request("/client/dashboard", { token: candidate.token })).status, 200);
});

test("development startup falls back to memory when MongoDB DNS fails", async () => {
  const warnings = [];
  let memoryStoreCreated = false;
  const store = await connectStore({
    mongoUri: "mongodb+srv://example.invalid/test",
    databaseName: "test",
    environment: "development",
    createMongoStoreImpl: async () => {
      const error = new Error("querySrv ECONNREFUSED");
      error.code = "ECONNREFUSED";
      throw error;
    },
    createMemoryStoreImpl: () => {
      memoryStoreCreated = true;
      return createMemoryStore();
    },
    logger: { warn: (message) => warnings.push(message) },
  });

  assert.equal(memoryStoreCreated, true);
  assert.match(warnings[0], /temporary in-memory data/);
  assert.equal(typeof store.createJob, "function");
});

test("production startup does not hide MongoDB connection failures", async () => {
  const connectionError = new Error("querySrv ECONNREFUSED");
  await assert.rejects(
    connectStore({
      mongoUri: "mongodb+srv://example.invalid/test",
      databaseName: "test",
      environment: "production",
      createMongoStoreImpl: async () => { throw connectionError; },
      logger: { warn: () => assert.fail("Production must not silently fall back.") },
    }),
    (error) => error === connectionError,
  );
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

  const adminJob = await request("/admin/jobs", {
    method: "POST",
    token: adminLogin.data.token,
    body: {
      employerName: "Remote.ly",
      title: "Platform Engineer",
      category: "Engineering",
      type: "Full-time",
      workMode: "Remote",
      location: "Worldwide",
      currency: "USD",
      minSalary: 130000,
      maxSalary: 165000,
      description: "Maintain dependable platform services for a global remote-first team.",
      skills: "Node.js, MongoDB",
      plan: "standard",
    },
  });
  assert.equal(adminJob.status, 201);
  assert.equal(adminJob.data.job.status, "pending_review");
  assert.equal(adminJob.data.job.paymentStatus, "not_required");
  const approvedAdminJob = await request(`/admin/jobs/${adminJob.data.job.id}`, {
    method: "PATCH",
    token: adminLogin.data.token,
    body: { status: "approved" },
  });
  assert.equal(approvedAdminJob.status, 200);
  const updatedAdminApplication = await request(`/admin/applications/${application.data.application.id}`, {
    method: "PATCH",
    token: adminLogin.data.token,
    body: { status: "reviewed" },
  });
  assert.equal(updatedAdminApplication.status, 200);
  assert.equal(updatedAdminApplication.data.application.status, "reviewed");
});

test("Paystack checkout uses live NGN quotes and verifies the amount before marking a job paid", async () => {
  const paymentStore = createMemoryStore();
  const employer = await paymentStore.insertUser({
    id: "payment-employer",
    name: "Payment Employer",
    email: "payment-employer@example.com",
    role: "employer",
  });
  const job = await paymentStore.createJob({
    ownerId: employer.id,
    title: "Payment test role",
    plan: "standard",
    status: "pending_review",
    paymentStatus: "unpaid",
  });
  let initializedTransaction;
  let verifiedAmount = 15844900;
  const requests = [];
  const controller = createPaymentController({
    store: paymentStore,
    paystackSecret: "sk_test_only_for_tests",
    callbackUrl: "https://hub.example/checkout",
    fetchImpl: async (url, options = {}) => {
      const requestUrl = String(url);
      requests.push(requestUrl);
      if (requestUrl.includes("open.er-api.com")) {
        return Response.json({
          result: "success",
          rates: { NGN: 1600.5 },
          time_last_update_utc: "today",
        });
      }
      if (requestUrl.endsWith("/transaction/initialize")) {
        initializedTransaction = JSON.parse(options.body);
        return Response.json({
          status: true,
          data: { reference: "test-reference-123", authorization_url: "https://paystack.test/checkout" },
        });
      }
      if (requestUrl.endsWith("/transaction/verify/test-reference-123")) {
        return Response.json({
          status: true,
          data: {
            status: "success",
            reference: "test-reference-123",
            currency: "NGN",
            amount: verifiedAmount,
            metadata: initializedTransaction.metadata,
          },
        });
      }
      throw new Error(`Unexpected fetch URL: ${requestUrl}`);
    },
  });
  async function invoke(handler, request) {
    let result;
    let error;
    await handler(request, { json: (body) => { result = body; } }, (caught) => { error = caught; });
    if (error) throw error;
    return result;
  }

  const user = { id: employer.id, email: employer.email };
  const quote = await invoke(controller.quote, { query: { plan: "standard" } });
  assert.equal(quote.amount, 158450);
  assert.equal(quote.exchangeRate, 1600.5);

  await assert.rejects(
    invoke(controller.initialize, {
      user: { id: "another-employer", email: "other@example.com" },
      body: { jobId: job.id, plan: "standard" },
    }),
    /Job listing not found/,
  );
  const initialized = await invoke(controller.initialize, {
    user,
    body: { jobId: job.id, plan: "standard" },
  });
  assert.equal(initialized.amount, 158450);
  assert.equal(initializedTransaction.amount, 15845000);
  assert.equal(initializedTransaction.currency, "NGN");
  assert.equal(initializedTransaction.metadata.jobId, job.id);
  const resumedCheckout = await invoke(controller.initialize, {
    user,
    body: { jobId: job.id, plan: "standard" },
  });
  assert.equal(resumedCheckout.reference, initialized.reference);
  assert.equal(requests.filter((url) => url.endsWith("/transaction/initialize")).length, 1);

  await assert.rejects(
    invoke(controller.verify, {
      user,
      query: { reference: "test-reference-123" },
    }),
    /amount or plan does not match/,
  );
  assert.equal((await paymentStore.findJobById(job.id)).paymentStatus, "unpaid");

  verifiedAmount = 15845000;
  const verified = await invoke(controller.verify, {
    user,
    query: { reference: "test-reference-123" },
  });
  assert.equal(verified.status, "paid");
  assert.equal(verified.job.paymentStatus, "paid");
  assert.equal(verified.job.paymentReference, undefined);
  assert.equal(requests.filter((url) => url.includes("open.er-api.com")).length, 1);
});
