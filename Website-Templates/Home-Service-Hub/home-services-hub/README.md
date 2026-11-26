# FixFlow Pro

FixFlow Pro is a home-service booking experience for plumbing, HVAC, and repair requests. This Vite edition is a local interactive demo; its accounts, appointments, and dashboard state are stored in the browser's localStorage. It does not connect to the API.

See the [buyer guide](../docs/buyer-guide.md) for the full overview, setup steps, role access, and demo limitations.

## Run locally

```sh
npm install
npm run dev
```

The demo works without MongoDB, API credentials, or environment configuration. Demo sign-ins:

- Administrator: `admin@fixflow.demo` / `FixFlowDemo2026!`
- Client: `client@fixflow.demo` / `FixFlowDemo2026!`

New client accounts and all updates are saved to localStorage on that device. This is showcase-only authentication and must not be used for real accounts or production data.

## Portals

- `/book-now` - authenticated client service request
- `/login` and `/signup` - client access
- `/dashboard` - client overview, requests, and profile pages
- `/admin/login` - administrator sign-in
- `/admin` - administrator overview, requests, client directory, and settings
- `/services`, `/pricing`, `/service-area` - dedicated service, estimate, and coverage pages

The client portal is the only dashboard destination in the public navigation; admin access is available through the demo account or the private `/admin/login` route.

## Checks

```sh
npm run lint
npm run build
```
