# Skillora — Next.js

Next.js edition of the Skillora learning platform. It uses the shared Skillora React interface and connects student, instructor, and administrator workflows to the Express/MongoDB API.

## Run locally

```sh
copy .env.example .env.local
npm install
npm run dev
```

Set `NEXT_PUBLIC_SKILLORA_API_URL` if the API is not at `http://localhost:5300/api`. Start the API first; see `../backend/README.md`. Run `npm run build` for a production build and `npm run typecheck` to check the TypeScript app-router files.

## Pages

- `/` — Skillora landing page
- `/courses` — course catalog
- `/learn/:courseId` — enrolled course lesson player
- `/login` and `/signup` — student/instructor authentication
- `/dashboard` — authenticated student enrollments and progress
- `/instructor/dashboard` — approved instructor course and learner view
- `/admin` — authenticated platform administration
- `/checkout` — free enrollment or provider-hosted NGN paid-course checkout when a configured provider account supports NGN; memberships remain demo-only

See `../backend/README.md` for Paystack/Stripe configuration and webhook setup. Paid enrollment is activated only after server-side provider verification; if no provider has NGN configured, paid checkout is unavailable.
