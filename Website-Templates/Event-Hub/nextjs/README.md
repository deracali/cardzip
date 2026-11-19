# PulseLive Event Hub - Next.js

Native Next.js edition of PulseLive. Route pages live under `app/`, reusable screens under `components/`, and API access in `lib/eventHubApi.ts`. The Express/MongoDB API remains a separate service.

## Run locally

```sh
npm install
npm run dev
```

Copy `.env.example` to `.env.local` if you need a non-default API URL. Set `NEXT_PUBLIC_EVENT_HUB_API_URL` when the API is not at `http://localhost:5400/api`. Start MongoDB and the API first; see `../backend/README.md`. Next.js authentication and booking workflows connect to the API by default.

Run `npm run build` for a production build and `npm run typecheck` to check the TypeScript app-router files.

## Pages

- `/` and `/events` - event discovery and search
- `/events/[slug]` and `/checkout/[slug]` - event details and demo-safe booking requests
- `/admin/login` and `/admin` - admin authentication and operations overview
- `/login`, `/signup`, `/dashboard` - attendee access and booking history
- `/organizer/dashboard` - organizer access after admin approval
- `/host`, `/schedule`, `/about` - organizer information and event content

These are native Next.js App Router routes and components; no Vite app is mounted by Next.js. The browser sends API requests to the separately deployed backend. Booking requests are not payments, and no real tickets are issued.

See the [buyer guide](../docs/buyer-guide.md) for the package overview, backend setup, and production limitations.
