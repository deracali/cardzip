# Lumière Salon & Spa — Vite

The Vite application contains the salon storefront, service catalog, appointment request flow, and client/admin portals. Its API is a separate Express/MongoDB service.

## Run locally

1. Copy `.env.example` to `.env.local`.
2. Start MongoDB and the API as described in `../backend/README.md`.
3. Run `npm install` and `npm run dev`.

The API defaults to `http://localhost:5600/api`. Set `VITE_SALON_API_URL` if it is hosted elsewhere.

## Pages

- `/` — salon storefront and service list
- `/book` — authenticated client appointment requests
- `/login` and `/signup` — client access
- `/dashboard` — client-owned appointment requests
- `/admin/login` and `/admin` — administrator sign-in and studio dashboard

The API independently enforces roles on dashboard and booking routes. Public signup creates client accounts only; configure the initial administrator in the backend environment.

See the [buyer guide](../docs/buyer-guide.md) for product setup and limitations.
