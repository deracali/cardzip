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

Course media, learner progress, authentication, and payment processing are demo-only and are not connected to backend services. Photography is served from Unsplash.

## Validate

```sh
npm run lint
npm run build
```
