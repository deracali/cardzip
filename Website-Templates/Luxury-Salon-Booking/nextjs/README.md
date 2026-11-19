# Lumière Salon & Spa — Next.js

Standalone native Next.js App Router application. Route pages live under `app/`, salon-specific UI under `components/`, and API access in `lib/`. It does not import or mount the Vite app.

## Run locally

```sh
npm install
npm run dev
```

Set `NEXT_PUBLIC_SALON_API_URL` in `.env.local` if the API is not at `http://localhost:5600/api`. Start the API first; see `../backend/README.md`. Run `npm run build` for a production build and `npm run typecheck` for the TypeScript app.

## Pages

- `/` — salon storefront and service catalog
- `/book` — authenticated client appointment request
- `/login` and `/signup` — client authentication
- `/dashboard` — client-owned appointments
- `/admin/login` and `/admin` — administrator authentication and studio dashboard

The API independently enforces roles for dashboard and appointment endpoints. Appointment requests are not confirmed until the studio reviews them; online payments and live slot availability are not connected.

See the [buyer guide](../docs/buyer-guide.md) for product setup and limitations.
