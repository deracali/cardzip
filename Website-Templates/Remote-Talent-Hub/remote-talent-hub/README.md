# Remote.ly

A responsive remote-work marketplace built with React and Vite. It includes a jobs marketplace, job detail and application pages, candidate talent profiles, employer job-posting steps, pricing, account screens, and an order review/checkout preview.

## Run locally

```sh
npm install
npm run dev
```

Run `npm run build` for a production build and `npm run lint` for ESLint.

## Routes

- `/` — Remote jobs homepage
- `/jobs` and `/jobs/:jobId` — Job search and job details
- `/apply/:jobId` — Application form
- `/talent` and `/talent/:profileId` — Candidate directory and profiles
- `/post-job` — Four-step employer listing flow
- `/pricing` and `/checkout?plan=standard|featured` — Listing plans and checkout
- `/login`, `/signup`, `/reset-password` — Account screens
- `/about`, `/contact`, `/privacy`, `/terms`, `/security` — Information pages

## Integration notes

This is a front-end demonstration. Job data, application and account submissions, and newsletter delivery are not connected to a backend. Checkout does not collect card details or charge a payment method; connect a secure payment provider before publishing paid listings.
