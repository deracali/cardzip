# Nexara API

The Node.js API uses a MongoDB database for website pages, plans, inquiries, and user accounts. The backend follows an MVC layout: MongoDB models in `models/`, request controllers in `controllers/`, API routing in `routes/`, and token authorization in `middleware/`. Passwords are stored as scrypt hashes.

## Configure and run

```powershell
Copy-Item .env.example .env
```

Set `MONGODB_URI` to your MongoDB connection string in `backend/.env` (for example, `mongodb://127.0.0.1:27017` for local MongoDB), and set `MONGODB_DB_NAME` if you want a database name other than `nexara`. Also configure `ADMIN_EMAIL`, `ADMIN_PASSWORD` (at least 12 characters), `AUTH_SECRET` (at least 32 characters), and the exact frontend origins in `ALLOWED_ORIGINS`. Never use the example admin credentials in a deployed environment.

For Atlas SRV DNS lookup failures, the backend retries using Cloudflare and Google DNS. If your network permits other resolvers instead, set `MONGODB_DNS_SERVERS` to a comma-separated list of DNS server IPs. If DNS queries are blocked by your network or VPN, allow outbound DNS or use Atlas's standard `mongodb://` driver connection string. Never share or expose the connection string.

```sh
npm install
npm run dev
```

The API listens on `http://127.0.0.1:5001` by default. Set `HOST=0.0.0.0` only when the deployment environment requires external binding. The MongoDB URL belongs only in the backend environment file; never expose it with a `NEXT_PUBLIC_` variable.

## API

- `GET /api/health`
- `GET /api/pages`, `GET /api/pages/:slug` — published website content
- `GET /api/plans` — published pricing data
- `POST /api/leads` — contact, demo, and plan inquiries
- `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`, `GET /api/auth/leads`
- `POST /api/admin/login`
- `GET|POST /api/admin/pages`, `PATCH|DELETE /api/admin/pages/:id`
- `GET|POST /api/admin/plans`, `PATCH|DELETE /api/admin/plans/:id`
- `GET|POST /api/admin/leads`, `PATCH|DELETE /api/admin/leads/:id`
- `GET /api/admin/users`, `PATCH|DELETE /api/admin/users/:id`

The admin dashboard at `/admin` manages pages, plans, inquiries, and accounts. Admins can update an inquiry's status and save a response; the response appears in `/dashboard` for the account that was signed in when the inquiry was submitted. For privacy, guests' inquiries are not attached to an account even if an account later registers with the same email; they can be answered through the inquiry's email contact. Replies are displayed in the dashboard and are not emailed.

There are no bundled page or plan records: add website pages and plans through the dashboard after connecting MongoDB. Public pages and navigation, pricing, sign-up/login, contact and plan inquiry submissions, and client inquiry responses are connected to MongoDB. Missing pages or plans show an empty state; backend connection failures are surfaced in the website rather than silently treated as saved.

`npm test` runs API CRUD, authentication, validation, and CORS tests against an isolated in-memory test store; application data is only persisted to MongoDB.
