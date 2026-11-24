const TOKEN_KEY = "remote-talent-hub-token";
const USERS_KEY = "remote-talent-hub-users";
const JOBS_KEY = "remote-talent-hub-jobs";
const APPLICATIONS_KEY = "remote-talent-hub-applications";
const SESSIONS_KEY = "remote-talent-hub-sessions";
const initialData = {
  [USERS_KEY]: [
    { id: "demo-employer-001", name: "Northstar Studio", email: "hiring@northstar.demo", role: "employer", primaryRole: "Hiring team", createdAt: "2026-10-12T15:00:00.000Z" },
    { id: "demo-candidate-001", name: "Avery Morgan", email: "avery@example.demo", role: "candidate", primaryRole: "Product Designer", createdAt: "2026-10-18T15:00:00.000Z" },
  ],
  [JOBS_KEY]: [
    { id: "demo-job-001", ownerId: "demo-employer-001", employerName: "Northstar Studio", title: "Senior Product Designer", category: "Design", type: "Full-time", workMode: "Remote", location: "Worldwide", currency: "USD", minSalary: 110000, maxSalary: 145000, description: "Shape clear, accessible product experiences for a distributed team.", skills: ["Product design", "Figma", "Research"], questions: "", plan: "featured", status: "pending_review", paymentStatus: "demo", createdAt: "2026-10-24T15:00:00.000Z" },
    { id: "demo-job-002", ownerId: "demo-employer-001", employerName: "Northstar Studio", title: "Frontend Engineer", category: "Engineering", type: "Full-time", workMode: "Remote", location: "North America", currency: "USD", minSalary: 125000, maxSalary: 165000, description: "Build reliable, responsive web applications alongside a collaborative product team.", skills: ["React", "TypeScript", "Accessibility"], questions: "", plan: "standard", status: "approved", paymentStatus: "demo", createdAt: "2026-10-20T15:00:00.000Z" },
  ],
  [APPLICATIONS_KEY]: [
    { id: "demo-application-001", candidateId: "demo-candidate-001", candidateName: "Avery Morgan", candidateEmail: "avery@example.demo", employerId: "demo-employer-001", jobId: "demo-job-001", jobTitle: "Senior Product Designer", message: "I bring six years of product design experience across collaborative remote teams.", portfolioUrl: "", status: "submitted", createdAt: "2026-10-25T15:00:00.000Z" },
  ],
  [SESSIONS_KEY]: [],
};
const demoAdmin = {
  id: "local-demo-admin",
  name: "Remote.ly Administrator",
  email: "admin@remotely.demo",
  role: "admin",
  password: "DemoAdmin123!",
};

function readList(key) {
  try {
    let stored = window.localStorage.getItem(key);
    if (stored === null && Object.prototype.hasOwnProperty.call(initialData, key)) {
      stored = JSON.stringify(initialData[key]);
      window.localStorage.setItem(key, stored);
    }
    const value = JSON.parse(stored || "[]");
    if (!Array.isArray(value)) throw new Error("Stored data is not a list.");
    return value;
  } catch (error) {
    throw new Error(`Could not read local ${key} data: ${error.message}`, { cause: error });
  }
}

function writeList(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function createId(prefix) {
  return `${prefix}_${window.crypto.randomUUID()}`;
}

async function passwordHash(password) {
  const digest = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function publicUser(user) {
  const safeUser = { ...user };
  delete safeUser.passwordHash;
  return safeUser;
}

function createSession(user) {
  const token = createId("local");
  writeList(SESSIONS_KEY, [...readList(SESSIONS_KEY), { token, userId: user.id }]);
  saveToken(token);
  return { token, user: publicUser(user) };
}

function userForToken(token) {
  if (!token) throw new Error("Sign in to continue.");
  const session = readList(SESSIONS_KEY).find((item) => item.token === token);
  const user = session && readList(USERS_KEY).find((item) => item.id === session.userId);
  if (!user) throw new Error("Your local session has expired. Sign in again.");
  return user;
}

function requireRole(token, role) {
  const user = userForToken(token);
  if (user.role !== role) throw new Error(`This action requires a ${role} account.`);
  return user;
}

function allJobs() {
  return readList(JOBS_KEY);
}

async function authenticate(body) {
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const role = body.role;
  let users = readList(USERS_KEY);
  if (role === "admin" && email === demoAdmin.email && password === demoAdmin.password) {
    let admin = users.find((user) => user.email === demoAdmin.email);
    if (!admin) {
      admin = {
        id: demoAdmin.id,
        name: demoAdmin.name,
        email: demoAdmin.email,
        role: "admin",
        passwordHash: await passwordHash(demoAdmin.password),
      };
      users = [...users, admin];
      writeList(USERS_KEY, users);
    }
    return createSession(admin);
  }
  const hash = await passwordHash(password);
  const user = users.find((record) => record.email === email && record.passwordHash === hash);
  if (!user || (role && user.role !== role)) throw new Error("The email, password, or account type is incorrect.");
  return createSession(user);
}

async function register(body) {
  const email = String(body.email || "").trim().toLowerCase();
  const name = String(body.name || "").trim();
  const password = String(body.password || "");
  const role = body.role;
  if (!email || !name || password.length < 8 || !["candidate", "employer"].includes(role)) {
    throw new Error("Enter your name, a valid email address, and choose a candidate or employer account.");
  }
  const users = readList(USERS_KEY);
  if (users.some((user) => user.email === email)) throw new Error("An account with this email already exists.");
  const user = {
    id: createId("user"),
    name,
    email,
    role,
    primaryRole: String(body.primaryRole || "").trim(),
    passwordHash: await passwordHash(password),
    createdAt: new Date().toISOString(),
  };
  writeList(USERS_KEY, [...users, user]);
  return createSession(user);
}

function publicJobList() {
  return allJobs().filter((job) => job.status === "approved" && job.paymentStatus === "demo");
}

export function getToken() {
  return typeof window === "undefined" ? "" : window.localStorage.getItem(TOKEN_KEY) || "";
}

export function saveToken(token) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  const token = getToken();
  writeList(SESSIONS_KEY, readList(SESSIONS_KEY).filter((session) => session.token !== token));
  window.localStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest(path, { method = "GET", body, token = getToken() } = {}) {
  const normalizedPath = path.replace(/\/+$/, "") || "/";
  const cleanBody = body || {};
  const verb = method.toUpperCase();

  if (normalizedPath === "/auth/signup" && verb === "POST") return register(cleanBody);
  if (normalizedPath === "/auth/login" && verb === "POST") return authenticate(cleanBody);

  if (normalizedPath === "/public/jobs" && verb === "GET") return { jobs: publicJobList() };
  const publicJobMatch = normalizedPath.match(/^\/public\/jobs\/([^/]+)$/);
  if (publicJobMatch && verb === "GET") {
    const job = publicJobList().find((item) => item.id === decodeURIComponent(publicJobMatch[1]));
    if (!job) throw new Error("This job listing is not available.");
    return { job };
  }

  if (normalizedPath === "/client/dashboard" && verb === "GET") {
    const user = userForToken(token);
    const jobs = allJobs().filter((job) => job.ownerId === user.id);
    const applications = readList(APPLICATIONS_KEY);
    if (user.role === "employer") {
      return {
        user: publicUser(user),
        jobs,
        applications: applications.filter((application) => application.employerId === user.id),
      };
    }
    return {
      user: publicUser(user),
      applications: applications.filter((application) => application.candidateId === user.id),
    };
  }

  if (normalizedPath === "/client/applications" && verb === "POST") {
    const user = requireRole(token, "candidate");
    const application = {
      id: createId("application"),
      candidateId: user.id,
      candidateName: user.name,
      candidateEmail: user.email,
      jobId: String(cleanBody.jobId || ""),
      jobTitle: String(cleanBody.jobTitle || ""),
      message: String(cleanBody.message || ""),
      portfolioUrl: String(cleanBody.portfolioUrl || ""),
      status: "submitted",
      createdAt: new Date().toISOString(),
    };
    const job = allJobs().find((item) => item.id === application.jobId);
    if (job) {
      if (job.status !== "approved" || job.paymentStatus !== "demo") {
        throw new Error("Applications are not open for this job listing.");
      }
      application.employerId = job.ownerId;
      application.jobTitle = job.title;
    }
    if (application.message.trim().length < 20) throw new Error("Please add at least 20 characters about your experience.");
    writeList(APPLICATIONS_KEY, [...readList(APPLICATIONS_KEY), application]);
    return { application };
  }

  const clientApplicationMatch = normalizedPath.match(/^\/client\/applications\/([^/]+)$/);
  if (clientApplicationMatch && verb === "PATCH") {
    const user = requireRole(token, "employer");
    const id = decodeURIComponent(clientApplicationMatch[1]);
    let updated;
    const applications = readList(APPLICATIONS_KEY).map((application) => {
      if (application.id !== id || application.employerId !== user.id) return application;
      if (!["reviewed", "shortlisted", "rejected"].includes(cleanBody.status)) {
        throw new Error("Choose a reviewed, shortlisted, or rejected application status.");
      }
      updated = { ...application, status: cleanBody.status, reviewedAt: new Date().toISOString() };
      return updated;
    });
    if (!updated) throw new Error("Application not found for your job listings.");
    writeList(APPLICATIONS_KEY, applications);
    return { application: updated };
  }

  if (normalizedPath === "/client/jobs" && verb === "POST") {
    const user = requireRole(token, "employer");
    const minimumSalary = Number(cleanBody.minSalary);
    const maximumSalary = Number(cleanBody.maxSalary);
    if (!Number.isFinite(minimumSalary) || !Number.isFinite(maximumSalary) || minimumSalary < 0 || maximumSalary < minimumSalary) {
      throw new Error("Enter a valid salary range.");
    }
    if (!["standard", "featured"].includes(cleanBody.plan)) throw new Error("Choose a valid job listing plan.");
    const job = {
      ...cleanBody,
      id: createId("job"),
      ownerId: user.id,
      employerName: user.name,
      minSalary: minimumSalary,
      maxSalary: maximumSalary,
      skills: typeof cleanBody.skills === "string" ? cleanBody.skills.split(",").map((skill) => skill.trim()).filter(Boolean) : [],
      status: "pending_review",
      paymentStatus: "demo",
      createdAt: new Date().toISOString(),
    };
    writeList(JOBS_KEY, [...allJobs(), job]);
    return { job };
  }

  if (normalizedPath === "/admin/jobs" && verb === "POST") {
    const user = requireRole(token, "admin");
    const minimumSalary = Number(cleanBody.minSalary);
    const maximumSalary = Number(cleanBody.maxSalary);
    if (!Number.isFinite(minimumSalary) || !Number.isFinite(maximumSalary) || minimumSalary < 0 || maximumSalary < minimumSalary) {
      throw new Error("Enter a valid salary range.");
    }
    if (!["standard", "featured"].includes(cleanBody.plan)) throw new Error("Choose a valid job listing plan.");
    const job = {
      ...cleanBody,
      id: createId("job"),
      ownerId: user.id,
      employerName: "Remote.ly",
      minSalary: minimumSalary,
      maxSalary: maximumSalary,
      skills: typeof cleanBody.skills === "string" ? cleanBody.skills.split(",").map((skill) => skill.trim()).filter(Boolean) : [],
      status: "pending_review",
      paymentStatus: "demo",
      createdAt: new Date().toISOString(),
    };
    writeList(JOBS_KEY, [...allJobs(), job]);
    return { job };
  }

  if (normalizedPath === "/admin/dashboard" && verb === "GET") {
    requireRole(token, "admin");
    return {
      users: readList(USERS_KEY).map(publicUser),
      jobs: allJobs(),
      applications: readList(APPLICATIONS_KEY),
    };
  }

  const adminJobMatch = normalizedPath.match(/^\/admin\/jobs\/([^/]+)$/);
  if (adminJobMatch && verb === "PATCH") {
    requireRole(token, "admin");
    const id = decodeURIComponent(adminJobMatch[1]);
    if (!["approved", "rejected", "closed"].includes(cleanBody.status)) {
      throw new Error("Choose an approved, rejected, or closed status.");
    }
    let updated;
    const jobs = allJobs().map((job) => {
      if (job.id !== id) return job;
      updated = { ...job, status: cleanBody.status, reviewedAt: new Date().toISOString() };
      return updated;
    });
    if (!updated) throw new Error("Job listing not found.");
    writeList(JOBS_KEY, jobs);
    return { job: updated };
  }

  const adminApplicationMatch = normalizedPath.match(/^\/admin\/applications\/([^/]+)$/);
  if (adminApplicationMatch && verb === "PATCH") {
    requireRole(token, "admin");
    const id = decodeURIComponent(adminApplicationMatch[1]);
    if (!["reviewed", "shortlisted", "rejected"].includes(cleanBody.status)) {
      throw new Error("Choose a reviewed, shortlisted, or rejected application status.");
    }
    let updated;
    const applications = readList(APPLICATIONS_KEY).map((application) => {
      if (application.id !== id) return application;
      updated = { ...application, status: cleanBody.status, reviewedAt: new Date().toISOString() };
      return updated;
    });
    if (!updated) throw new Error("Application not found.");
    writeList(APPLICATIONS_KEY, applications);
    return { application: updated };
  }

  throw new Error(`Local demo does not support ${verb} ${normalizedPath}.`);
}
