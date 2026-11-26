# FixFlow Pro — Next.js

Native Next.js edition of FixFlow Pro. Route pages live under `app/`, and reusable screens and controls live under `components/`. It connects to the separate FixFlow API; it does not mount or import the Vite demo.

## Run locally

```sh
npm install
npm run dev
```

Set `NEXT_PUBLIC_HOME_SERVICE_API_URL` if the API is not at `http://localhost:5200/api`. Start MongoDB and the API first; see `../backend/README.md`. The API reads the private `PAYSTACK_SECRET_KEY`; never place it in a `NEXT_PUBLIC_*` variable or browser code. Configure `PAYSTACK_CURRENCY=USD` to match the estimates shown in the UI and set `PAYSTACK_CALLBACK_URL` to this site's `/payment/return` URL. Paystack is optional until configured.

## Portals

- `/book-now` - authenticated client service request
- `/login` and `/signup` - client access
- `/dashboard` - client overview, requests, and profile; protected by the API's `client` role
- `/admin/login` - administrator sign-in; admin accounts are seeded from backend environment variables
- `/admin` - operations overview, requests, client directory, and settings; protected by the API's `admin` role
- `/services`, `/pricing`, `/service-area` - dedicated service, estimate, and coverage pages
- `/payment/return` - verifies a Paystack payment with the API after hosted checkout

The Next.js dashboard, client data, bookings, and admin operations are API-backed. Service estimates are calculated by the backend, and Paystack initializes and verifies payments server-to-server; card data is handled only by Paystack hosted checkout. Run `npm run build` and `npm run typecheck` to validate the Next.js app.
