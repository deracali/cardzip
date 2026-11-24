# Skillora learning platform

A responsive React and Vite learning platform UI with a course catalog, lesson player, instructor profiles, learner dashboard, quiz flow, pricing, and demo checkout.

## Run locally

```sh
npm install
npm run dev
```

## Routes

- `/` — landing page
- `/categories` and `/categories/:categorySlug` — category directory and category courses
- `/courses` — searchable course catalog
- `/learn/:courseId` — lesson player and course outline
- `/quiz/:courseId` — interactive course quiz
- `/instructors` and `/instructors/:instructorId` — instructor directory and profiles
- `/dashboard` — student overview, with separate `/dashboard/courses`, `/dashboard/progress`, and `/dashboard/profile` pages
- `/instructor/dashboard` — tutor overview, with separate `/instructor/dashboard/courses`, `/instructor/dashboard/learners`, and `/instructor/dashboard/profile` pages
- `/pricing` — course-by-course prices and exactly what each one-time purchase covers
- `/checkout?course=:courseId` — local demo checkout (no payment is processed)
- `/login` and `/signup` — authentication UI

The React/Vite edition stores demo accounts, enrollments, lesson progress, and workspace state in localStorage. Its demo login does not store or verify passwords, and the sample dashboards are not real learner or tutor records. The Next.js edition preserves the course catalog's NGN prices and loads dashboard data from the backend API.

For authenticated student, tutor/instructor, and administrator accounts with MongoDB persistence, use the Next.js edition with the backend. See the [buyer guide](../docs/buyer-guide.md). Students pay once for each selected course; there is no monthly or annual membership checkout. In connected mode, Paystack or Stripe is offered only when its server-side secret, webhook secret, and explicit NGN account-support setting are configured. Payments use provider-hosted checkout; the backend verifies the provider transaction/session before granting a paid-course enrollment. If no configured account supports NGN, paid course checkout stays disabled. Free course enrollment remains available. Course lesson/video materials are sample content in this template and should be replaced before accepting live payments.

## Validate

```sh
npm run lint
npm run build
```
