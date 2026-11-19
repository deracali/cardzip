# FixFlow Pro

FixFlow Pro is a home-service booking experience for plumbing, HVAC, and repair requests. Vite and Next.js each have their own frontend pages and components and connect to the same separate Express/MongoDB API.

See the [buyer guide](../docs/buyer-guide.md) for the full overview, setup steps, role access, and demo limitations.

## Run locally

```sh
npm install
npm run dev
```

Set `VITE_HOME_SERVICE_API_URL` in `.env.local` if the API is not at `http://localhost:5200/api`. Start MongoDB and the API first; see [`../backend/README.md`](../backend/README.md).

## Portals

- `/book-now` - authenticated client service request
- `/login` and `/signup` - client access
- `/dashboard` - client appointment history
- `/admin/login` - administrator sign-in
- `/admin` - administrator service-request workspace

The UI may redirect users for convenience, but the API independently enforces client and administrator roles for protected requests.

## Checks

```sh
npm run lint
npm run build
```
