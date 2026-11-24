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
- `/dashboard` — student overview, with API-backed `/dashboard/courses`, `/dashboard/progress`, and `/dashboard/profile` pages
- `/instructor/dashboard` — tutor overview, with API-backed `/instructor/dashboard/courses`, `/instructor/dashboard/learners`, and `/instructor/dashboard/profile` pages
- `/admin` — authenticated platform administration
- `/pricing` — API-backed course prices, purchase terms, and course inclusions
- `/checkout?course=:courseId` — free enrollment or hosted NGN Paystack/Stripe checkout for one course

See `../backend/README.md` for Paystack/Stripe configuration and webhook setup. Students pay once per selected course; recurring memberships are not offered. Paid enrollment is activated only after server-side provider verification; if no provider has NGN configured, paid checkout is unavailable. The lesson text and video player are sample content and must be replaced with real materials before live sales.
