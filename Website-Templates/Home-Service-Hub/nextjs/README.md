# FixFlow Pro — Next.js

Native Next.js edition of FixFlow Pro. Route pages live under `app/`, and reusable screens and controls live under `components/`. It connects to the separate FixFlow API; it does not mount or import the Vite app.

## Run locally

```sh
npm install
npm run dev
```

Set `NEXT_PUBLIC_HOME_SERVICE_API_URL` if the API is not at `http://localhost:5200/api`. Start MongoDB and the API first; see `../backend/README.md`.

## Portals

- `/book-now` - authenticated client service request
- `/login` and `/signup` - client access
- `/dashboard` - client appointments, protected by the API's `client` role
- `/admin/login` - administrator sign-in; admin accounts are seeded from backend environment variables
- `/admin` - service operations workspace, protected by the API's `admin` role

The UI is shared with Vite; role enforcement is performed by the API on every protected request. Run `npm run build` and `npm run typecheck` to validate the Next.js app.
