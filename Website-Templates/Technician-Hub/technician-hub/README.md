# PolarFlow HVAC — Vite

Vite storefront for PolarFlow HVAC. The Vite demo stores accounts, service requests, and pending plan enrollments in this browser's localStorage. The separate MVC API remains available for production integrations and is used by the Next.js app.

## Run locally

1. Run `npm install` and `npm run dev`.

Run `npm run lint` and `npm run build` to validate the frontend.

## Main routes

- `/` — Service overview and estimate calculator
- `/services` and `/services/:serviceId` — Service catalog and details
- `/technicians` — Static sample technician roster
- `/maintenance` and `/membership/checkout` — Annual membership information and local demo enrollment (no payment)
- `/book`, `/checkout`, `/booking-confirmation` — Appointment request and confirmation
- `/portal/login`, `/portal/signup`, `/portal/dashboard` — Customer account and dashboard overview
- `/portal/dashboard/requests`, `/portal/dashboard/membership` — Separate customer dashboard pages
- `/admin/login`, `/admin/signup`, `/admin/dashboard` — Invitation-only administrator access and operations dashboard

The Vite demo uses seeded sample accounts, service requests and membership data stored only in localStorage. Choose “Explore sample customer dashboard” or “Explore sample admin dashboard” on the corresponding sign-in page to preview the static dashboards and sample requests without creating an account. New bookings and account changes stay in this browser. The invitation code on local admin signup is only a form check; browser storage is editable and provides no real authentication or authorization. Do not use the Vite demo for real customer data or production admin access. Membership enrollment is saved as pending and does not collect payment or activate a plan. The Next.js app remains connected to the API for production workflows.

See `../docs/BUYER-GUIDE.md` and the generated PDF for setup, API, payment, deployment and buyer information.
