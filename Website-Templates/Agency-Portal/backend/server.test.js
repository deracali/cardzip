import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { after, before, test } from "node:test";
import { createApp } from "./server.js";
import { formatMongoConnectionError } from "./models/store.js";

let server;
let baseUrl;
let tempDirectory;
let adminToken;
let clientToken;

before(async () => {
  tempDirectory = await mkdtemp(path.join(os.tmpdir(), "nova-agency-api-"));
  const app = createApp({
    env: {
      NODE_ENV: "test",
      ADMIN_SIGNUP_CODE: "test-invite-code",
      CLOUDINARY_CLOUD_NAME: "test-cloud",
      CLOUDINARY_API_KEY: "test-api-key",
      CLOUDINARY_API_SECRET: "test-api-secret",
      ALLOWED_ORIGINS: "http://localhost:5173,http://localhost:3000",
    },
    jwtSecret: "a-test-secret-long-enough-for-agency-api-tests",
    dataFile: path.join(tempDirectory, "agency.json"),
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

test("admin bootstrap, protected data, client signup, and reset flow work", async () => {
  const forbidden = await api("/admin/dashboard");
  assert.equal(forbidden.response.status, 401);

  const invalidInvite = await api("/auth/admin-signup", {
    method: "POST",
    body: { name: "Studio Owner", company: "NOVA", email: "owner@nova.test", password: "correct-horse-battery", inviteCode: "wrong-code" },
  });
  assert.equal(invalidInvite.response.status, 403);

  const adminSignup = await api("/auth/admin-signup", {
    method: "POST",
    body: { name: "Studio Owner", company: "NOVA Studio", email: "owner@nova.test", password: "correct-horse-battery" },
  });
  assert.equal(adminSignup.response.status, 201);
  adminToken = adminSignup.data.token;

  const missingInvite = await api("/auth/admin-signup", {
    method: "POST",
    body: { name: "Another Admin", company: "NOVA Studio", email: "other@nova.test", password: "correct-horse-battery" },
  });
  assert.equal(missingInvite.response.status, 403);

  const invitedAdmin = await api("/auth/admin-signup", {
    method: "POST",
    body: { name: "Another Admin", company: "NOVA Studio", email: "other@nova.test", password: "correct-horse-battery", inviteCode: "test-invite-code" },
  });
  assert.equal(invitedAdmin.response.status, 201);

  const dashboard = await api("/admin/dashboard", { token: adminToken });
  assert.equal(dashboard.response.status, 200);
  assert.equal(dashboard.data.metrics.activeProjects, 0);
  assert.deepEqual(dashboard.data.projects, []);

  const project = await api("/admin/projects", {
    method: "POST",
    token: adminToken,
    body: { name: "New brand system", client: "Northstar", service: "Branding" },
  });
  assert.equal(project.response.status, 201);
  assert.equal(project.data.project.progress, 0);

  const anonymousCaseStudies = await api("/public/case-studies");
  assert.equal(anonymousCaseStudies.response.status, 200);
  assert.deepEqual(anonymousCaseStudies.data.caseStudies, []);

  const anonymousCaseStudyCreate = await api("/admin/case-studies", {
    method: "POST",
    body: {},
  });
  assert.equal(anonymousCaseStudyCreate.response.status, 401);

  const uploadSignature = await api("/admin/case-studies/upload-signature", { token: adminToken });
  assert.equal(uploadSignature.response.status, 200);
  assert.equal(uploadSignature.data.cloudName, "test-cloud");
  assert.equal(uploadSignature.data.apiKey, "test-api-key");
  assert.equal(uploadSignature.data.signature, createHmac("sha1", "test-api-secret")
    .update(`folder=${uploadSignature.data.folder}&timestamp=${uploadSignature.data.timestamp}`)
    .digest("hex"));
  assert.equal(JSON.stringify(uploadSignature.data).includes("test-api-secret"), false);

  const caseStudy = await api("/admin/case-studies", {
    method: "POST",
    token: adminToken,
    body: {
      name: "Northstar Identity",
      client: "Northstar",
      type: "Brand identity",
      image: "https://res.cloudinary.com/test-cloud/image/upload/northstar-cover.jpg",
      images: ["https://res.cloudinary.com/test-cloud/image/upload/northstar-detail.jpg"],
      alt: "Northstar's updated brand identity",
      summary: "A distinct identity for a growing company.",
      description: "We created a flexible identity system for Northstar.",
      result: "40% increase in brand recognition",
      deliverables: ["Brand strategy", "Visual identity"],
    },
  });
  assert.equal(caseStudy.response.status, 201);
  assert.equal(caseStudy.data.caseStudy.slug, "northstar-identity");
  assert.deepEqual(caseStudy.data.caseStudy.images, ["/northstar-detail.jpg"]);

  const publicCaseStudies = await api("/public/case-studies");
  assert.equal(publicCaseStudies.data.caseStudies.length, 1);
  assert.equal(publicCaseStudies.data.caseStudies[0].name, "Northstar Identity");

  const editedCaseStudy = await api(`/admin/case-studies/${caseStudy.data.caseStudy.id}`, {
    method: "PATCH",
    token: adminToken,
    body: { result: "50% increase in brand recognition" },
  });
  assert.equal(editedCaseStudy.response.status, 200);
  assert.equal(editedCaseStudy.data.caseStudy.result, "50% increase in brand recognition");

  const deletedCaseStudy = await api(`/admin/case-studies/${caseStudy.data.caseStudy.id}`, {
    method: "DELETE",
    token: adminToken,
  });
  assert.equal(deletedCaseStudy.response.status, 200);
  const emptyCaseStudies = await api("/public/case-studies");
  assert.deepEqual(emptyCaseStudies.data.caseStudies, []);

  const anonymousInquiry = await api("/public/inquiries", {
    method: "POST",
    body: { name: "Impersonator", email: "alex@client.test", phone: "555-0101", project: "A new identity", budget: "$5k-$15k" },
  });
  assert.equal(anonymousInquiry.response.status, 401);
  const adminInquiry = await api("/client/inquiries", {
    method: "POST",
    token: adminToken,
    body: { project: "A new identity", budget: "$5k-$15k" },
  });
  assert.equal(adminInquiry.response.status, 403);

  const signup = await api("/auth/signup", {
    method: "POST",
    body: { name: "Alex Client", company: "Northstar", email: "alex@client.test", password: "client-password-123" },
  });
  assert.equal(signup.response.status, 201);
  clientToken = signup.data.token;

  const inquiry = await api("/client/inquiries", {
    method: "POST",
    token: clientToken,
    body: { name: "Impersonator", email: "other@client.test", company: "Spoofed", phone: "+1 555 0101", project: "A new identity", budget: "$5k-$15k" },
  });
  assert.equal(inquiry.response.status, 201);
  assert.equal(inquiry.data.inquiry.name, "Alex Client");
  assert.equal(inquiry.data.inquiry.userId, signup.data.user.id);
  assert.equal(inquiry.data.inquiry.email, "alex@client.test");
  assert.equal(inquiry.data.inquiry.company, "Northstar");
  assert.equal(inquiry.data.inquiry.phone, "+1 555 0101");
  assert.equal(inquiry.data.inquiry.status, "New");

  const deniedAdminAccess = await api("/admin/projects", { token: clientToken });
  assert.equal(deniedAdminAccess.response.status, 403);

  const clientDashboard = await api("/client/dashboard", { token: clientToken });
  assert.equal(clientDashboard.response.status, 200);
  assert.equal(clientDashboard.data.user.email, "alex@client.test");
  assert.deepEqual(clientDashboard.data.projects, []);
  assert.deepEqual(clientDashboard.data.messages, []);
  assert.equal(clientDashboard.data.inquiries.length, 1);
  assert.equal(clientDashboard.data.inquiries[0].id, inquiry.data.inquiry.id);

  const sentMessage = await api("/client/messages", {
    method: "POST",
    token: clientToken,
    body: { message: "Can we schedule a review?" },
  });
  assert.equal(sentMessage.response.status, 201);
  assert.equal(sentMessage.data.message.sender, "client");

  const inbox = await api("/admin/messages", { token: adminToken });
  assert.equal(inbox.response.status, 200);
  assert.equal(inbox.data.messages.length, 1);
  assert.equal(inbox.data.messages[0].body, "Can we schedule a review?");

  const markedRead = await api(`/admin/messages/${sentMessage.data.message.id}/read`, {
    method: "PATCH",
    token: adminToken,
  });
  assert.equal(markedRead.response.status, 200);
  assert.equal(markedRead.data.message.read, true);

  const reply = await api("/admin/messages", {
    method: "POST",
    token: adminToken,
    body: { clientEmail: "alex@client.test", message: "Thursday afternoon works." },
  });
  assert.equal(reply.response.status, 201);
  assert.equal(reply.data.message.sender, "admin");

  const clientMessages = await api("/client/messages", { token: clientToken });
  assert.equal(clientMessages.data.messages.length, 2);
  assert.equal(clientMessages.data.messages[1].body, "Thursday afternoon works.");

  const inquiryStatus = await api(`/admin/inquiries/${inquiry.data.inquiry.id}`, {
    method: "PATCH",
    token: adminToken,
    body: { status: "Accepted" },
  });
  assert.equal(inquiryStatus.response.status, 200);
  assert.equal(inquiryStatus.data.inquiry.status, "Accepted");

  const acceptedInDashboard = await api("/client/dashboard", { token: clientToken });
  assert.equal(acceptedInDashboard.data.inquiries[0].status, "Accepted");

  const inquiryReply = await api(`/admin/inquiries/${inquiry.data.inquiry.id}/reply`, {
    method: "POST",
    token: adminToken,
    body: { message: "We would be happy to discuss your new identity brief." },
  });
  assert.equal(inquiryReply.response.status, 201);
  assert.equal(inquiryReply.data.inquiry.response, "We would be happy to discuss your new identity brief.");
  assert.equal(inquiryReply.data.message.clientEmail, "alex@client.test");
  const dashboardWithInquiryReply = await api("/client/dashboard", { token: clientToken });
  assert.equal(dashboardWithInquiryReply.data.inquiries[0].response, inquiryReply.data.inquiry.response);
  assert.ok(dashboardWithInquiryReply.data.messages.some((message) => message.id === inquiryReply.data.message.id));

  const forgot = await api("/auth/forgot-password", {
    method: "POST",
    body: { email: "alex@client.test" },
  });
  assert.equal(forgot.response.status, 200);
  assert.ok(forgot.data.resetToken);

  const reset = await api("/auth/reset-password", {
    method: "POST",
    body: { token: forgot.data.resetToken, password: "new-client-password-456" },
  });
  assert.equal(reset.response.status, 200);

  const login = await api("/auth/login", {
    method: "POST",
    body: { email: "alex@client.test", password: "new-client-password-456", expectedRole: "client" },
  });
  assert.equal(login.response.status, 200);
  assert.equal(login.data.user.role, "client");

  const unknownEndpoint = await api("/admin/not-a-real-page", { token: adminToken });
  assert.equal(unknownEndpoint.response.status, 404);
});

test("CORS only accepts configured website origins", async () => {
  const allowed = await api("/health", { origin: "http://localhost:5173" });
  assert.equal(allowed.response.status, 200);
  assert.equal(allowed.response.headers.get("access-control-allow-origin"), "http://localhost:5173");

  const denied = await api("/health", { origin: "https://untrusted.example" });
  assert.equal(denied.response.status, 403);
});

test("runtime storage requires MongoDB instead of silently choosing JSON", async () => {
  assert.throws(
    () => createApp({ env: { NODE_ENV: "test" } }),
    /MONGODB_URI must be set/,
  );
});

test("Atlas SRV DNS refusal gives actionable startup guidance", () => {
  const cause = Object.assign(new Error("querySrv ECONNREFUSED"), {
    code: "ECONNREFUSED",
    syscall: "querySrv",
  });
  const formatted = formatMongoConnectionError(cause);
  assert.match(formatted.message, /SRV DNS lookup was refused/);
  assert.match(formatted.message, /standard mongodb:\/\//);
  assert.equal(formatted.cause, cause);
});
