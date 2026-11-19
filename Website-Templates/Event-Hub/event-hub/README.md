# PulseLive Event Hub

A polished event platform with a local demo mode, authenticated admin access, and a live backend-ready API flow.

## Quick start

### Frontend demo mode

```sh
cd event-hub
npm install
npm run dev
```

The app runs in browser-local storage mode by default. Admin access is available from `/admin`, and bookings are kept in local storage.

### Live API mode

1. Start the backend API:

```sh
cd backend
cp .env.example .env
npm install
npm run dev
```

2. In the frontend, switch to the live API mode:

```sh
cd event-hub
npm install
VITE_API_BASE_URL=http://localhost:5400/api npm run dev
```

You can also open the app with `?mode=api` in the URL, and the frontend will keep that choice in local storage.

## Included flows

- `/` event discovery and featured listings
- `/events` searchable event catalogue
- `/events/:slug` event detail pages and checkout entry points
- `/schedule` agenda and speaker content
- `/checkout/:slug` ticket request flow with demo-safe payment messaging
- `/host` organizer inquiry form
- `/about` brand story and positioning
- `/login`, `/signup`, `/forgot-password` attendee and organizer access
- `/admin` administrator workspace for events, bookings, organizers, attendees, and settings
- `/dashboard` attendee account area
- `/organizer/dashboard` organizer studio with role restrictions

## Demo safety

This project intentionally does not issue real tickets or collect payments in local demo mode. Booking requests remain pending or demo-only until a production payment provider and ticketing integration are added.

## Buyer guide summary

PulseLive is a premium event discovery and administration platform designed for conferences, music festivals, creator-driven gatherings, and live community experiences. It includes a public browsing experience, secure admin console, demo-safe ticketing flow, organizer access, attendee management, and a backend structure ready to be connected to a real database and payment stack.

See the [full buyer guide](../docs/buyer-guide.md) for setup and deployment details. Generate its PDF with `node ../docs/build-buyer-guide.mjs` after installing the frontend dependencies.
