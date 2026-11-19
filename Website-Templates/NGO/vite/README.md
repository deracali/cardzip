# Kindred NGO — Vite

React + Vite frontend for the Kindred NGO template.

## Start

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

Set `VITE_NGO_API_URL` to the backend `/api` URL if it is not `http://localhost:5000/api`. The API is a separate app in `../backend`; start it with a configured MongoDB connection before using sign-in, dashboards or pledge submission.

## Routes

- `/` and `/causes` — campaign discovery
- `/signin` and `/signup` — donor authentication
- `/checkout` — authenticated donor pledge creation (no payment processing)
- `/dashboard` — donor's own pledges
- `/admin/login`, `/admin/signup`, and `/admin` — invitation-gated admin portal

Build with `npm run build`; run the project linter with `npm run lint`. Generate the buyer-guide PDF with `npm run docs:buyer-guide`.
