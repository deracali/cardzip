import { httpError, requiredText, safeApplication, safeJob } from "../utils/http.js";
import { publicUser } from "../auth.js";

export function createClientController({ store }) {
  return {
    publicJobs: async (_request, response, next) => {
      try {
        const jobs = await store.listJobs({ status: "approved", paymentStatus: "paid" });
        response.json({ jobs: jobs.map(safeJob) });
      } catch (error) {
        next(error);
      }
    },

    publicJob: async (request, response, next) => {
      try {
        const job = await store.findJobById(request.params.id);
        if (!job || job.status !== "approved" || job.paymentStatus !== "paid") {
          throw httpError(404, "This job listing is not available.");
        }
        response.json({ job: safeJob(job) });
      } catch (error) {
        next(error);
      }
    },

    dashboard: async (request, response, next) => {
      try {
        if (request.user.role === "candidate") {
          const applications = await store.listApplications({ candidateId: request.user.id });
          return response.json({
            user: publicUser(request.user),
            applications: applications.map(safeApplication),
          });
        }
        const jobs = await store.listJobs({ ownerId: request.user.id });
        const applications = await store.listApplications({ employerId: request.user.id });
        response.json({
          user: publicUser(request.user),
          jobs: jobs.map(safeJob),
          applications: applications.map(safeApplication),
        });
      } catch (error) {
        next(error);
      }
    },

    createApplication: async (request, response, next) => {
      try {
        const jobId = requiredText(request.body.jobId, "Job ID", 1, 120);
        const requestedJobTitle = requiredText(request.body.jobTitle, "Job title", 2, 200);
        const job = await store.findJobById(jobId);
        if (job && (job.status !== "approved" || job.paymentStatus !== "paid")) {
          throw httpError(409, "Applications are not open for this job listing.");
        }
        const application = await store.createApplication({
          candidateId: request.user.id,
          candidateName: request.user.name,
          candidateEmail: request.user.email,
          ...(job ? { employerId: job.ownerId } : {}),
          jobId,
          jobTitle: job?.title || requestedJobTitle,
          message: requiredText(request.body.message, "Application message", 20, 5000),
          portfolioUrl: typeof request.body.portfolioUrl === "string"
            ? request.body.portfolioUrl.trim().slice(0, 500)
            : "",
          status: "submitted",
          createdAt: new Date().toISOString(),
        });
        response.status(201).json({ application: safeApplication(application) });
      } catch (error) {
        next(error);
      }
    },

    updateApplication: async (request, response, next) => {
      try {
        const status = request.body.status;
        if (!["reviewed", "shortlisted", "rejected"].includes(status)) {
          throw httpError(400, "Choose a reviewed, shortlisted, or rejected application status.");
        }
        const application = await store.updateApplication(
          request.params.id,
          { employerId: request.user.id },
          { status, reviewedAt: new Date().toISOString() },
        );
        if (!application) throw httpError(404, "Application not found for your job listings.");
        response.json({ application: safeApplication(application) });
      } catch (error) {
        next(error);
      }
    },

    createJob: async (request, response, next) => {
      try {
        const minimumSalary = Number(request.body.minSalary);
        const maximumSalary = Number(request.body.maxSalary);
        if (!Number.isFinite(minimumSalary) || !Number.isFinite(maximumSalary) ||
            minimumSalary < 0 || maximumSalary < minimumSalary) {
          throw httpError(400, "Enter a valid salary range.");
        }
        const plan = request.body.plan;
        if (!["standard", "featured"].includes(plan)) throw httpError(400, "Choose a valid job listing plan.");
        const job = await store.createJob({
          ownerId: request.user.id,
          employerName: request.user.name,
          title: requiredText(request.body.title, "Job title", 2, 200),
          category: requiredText(request.body.category, "Job category", 2, 120),
          type: requiredText(request.body.type, "Employment type", 2, 80),
          workMode: requiredText(request.body.workMode, "Work type", 2, 80),
          location: requiredText(request.body.location, "Location", 2, 200),
          currency: requiredText(request.body.currency, "Currency", 3, 3),
          minSalary: minimumSalary,
          maxSalary: maximumSalary,
          description: requiredText(request.body.description, "Job description", 30, 5000),
          skills: typeof request.body.skills === "string"
            ? request.body.skills.split(",").map((skill) => skill.trim()).filter(Boolean).slice(0, 10)
            : [],
          questions: typeof request.body.questions === "string" ? request.body.questions.trim().slice(0, 2000) : "",
          plan,
          status: "pending_review",
          paymentStatus: "unpaid",
          createdAt: new Date().toISOString(),
        });
        response.status(201).json({ job: safeJob(job) });
      } catch (error) {
        next(error);
      }
    },
  };
}
