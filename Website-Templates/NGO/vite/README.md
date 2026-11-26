# Kindred NGO — Vite

React + Vite frontend for the Kindred NGO template.

## Start

```powershell
npm install
npm run dev
```

This is a localStorage-only preview with clearly labeled static sample activity in the donor and admin dashboards. Demo sessions and real preview pledges stay in the current browser; it does not call the backend or process payments. Admin demo access is not secure authentication and must not be used for real accounts.

## Routes

- `/` and `/causes` — campaign discovery
- `/signin` and `/signup` — donor authentication
- `/checkout` — local demo pledge creation (no payment processing)
- `/dashboard` — donor's locally stored pledges
- `/admin/login`, `/admin/signup`, and `/admin` — local admin preview with sidebar, pledge review and payment-history explainer

Build with `npm run build`; run the project linter with `npm run lint`. Generate the buyer-guide PDF with `npm run docs:buyer-guide`.
