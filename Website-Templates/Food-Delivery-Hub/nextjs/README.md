# Sizzle&Smile Food Delivery - Next.js

This is a native Next.js App Router application with its own route pages under `app/`, reusable components under `components/`, and API client under `lib/`. The Vite storefront is a separate application; Next.js does not mount or import it. Both apps use the separate Food Delivery API.

See the [buyer guide](../docs/buyer-guide.md) for the product overview, backend setup, and demo-order limitations.

## Run locally

```sh
npm install
npm run dev
```

Set `NEXT_PUBLIC_FOOD_API_URL` in `.env.local` if the API is not at `http://localhost:5000/api`. Start MongoDB and the API first; see `../backend/README.md`.

## Protected portals

- `/admin/login` - administrator sign-in. Admin accounts are seeded from the backend environment; public signup cannot create admins.
- `/admin` - administrator dashboard, protected by the server API's `admin` role middleware.
- `/login` and `/signup` - client login and registration.
- `/dashboard` - client order dashboard, protected by the server API's `client` role middleware.
- `/` and `/restaurant` - dish discovery and restaurant menu
- `/checkout` - authenticated demo-order placement
- `/reserve` and `/track` - front-end-only reservation and tracking previews

The frontend checks the current session and redirects to the matching sign-in page. The API independently enforces roles on every dashboard request.

Run `npm run build` and `npm run typecheck` to validate the Next.js app.

See the [buyer guide](../docs/buyer-guide.md) for product setup and demo limitations.
