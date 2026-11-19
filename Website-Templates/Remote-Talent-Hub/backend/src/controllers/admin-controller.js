import { publicUser } from "../auth.js";
import { httpError, safeApplication, safeJob } from "../utils/http.js";

const jobStatuses = new Set(["approved", "rejected", "closed"]);

export function createAdminController({ store }) {
  return {
    dashboard: async (_request, response, next) => {
      try {
        const [users, jobs, applications] = await Promise.all([
          store.listUsers(),
          store.listJobs(),
          store.listApplications(),
        ]);
        response.json({
          users: users.map(publicUser),
          jobs: jobs.map(safeJob),
          applications: applications.map(safeApplication),
        });
      } catch (error) {
        next(error);
      }
    },

    updateJob: async (request, response, next) => {
      try {
        const status = request.body.status;
        if (!jobStatuses.has(status)) {
          throw httpError(400, "Choose an approved, rejected, or closed status.");
        }
        const job = await store.updateJob(request.params.id, {
          status,
          reviewedAt: new Date().toISOString(),
          reviewedBy: request.user.id,
        });
        if (!job) throw httpError(404, "Job listing not found.");
        response.json({ job: safeJob(job) });
      } catch (error) {
        next(error);
      }
    },
  };
}
