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
- `/dashboard` — sample student dashboard
- `/pricing` — enrollment and subscription plans
- `/checkout?course=:courseId` or `/checkout?plan=:planId` — demo checkout
- `/login` and `/signup` — authentication UI

The React/Vite edition stores the sample admin workspace, enrollments, and lesson progress in localStorage. Its admin demo is not secure authentication and should not manage real learner accounts. The Next.js connected edition preserves the course catalog's NGN prices.

For authenticated student, instructor, and administrator accounts with MongoDB persistence, use the Next.js edition with the backend. See the [buyer guide](../docs/buyer-guide.md). In connected mode, Paystack or Stripe is offered only when its server-side secret, webhook secret, and explicit NGN account-support setting are configured. Payments use provider-hosted checkout; the backend verifies the provider transaction/session before granting a paid-course enrollment. If no configured account supports NGN, paid course checkout stays disabled. Free course enrollment remains available. Membership payments remain demo-only.

## Validate

```sh
npm run lint
npm run build
```
