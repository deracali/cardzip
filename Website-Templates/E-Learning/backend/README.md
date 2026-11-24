# Skillora Learning API

## Local setup

```powershell
copy .env.example .env
notepad .env
npm install
npm run dev
```

Set `MONGODB_URI`, a random `JWT_SECRET` of at least 32 characters, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (12 to 128 characters), and exact local website origins in `ALLOWED_ORIGINS`. Keep `.env` private and never expose payment secrets in browser code.

### Paid course checkout (NGN only)

Course prices remain in NGN at their existing numeric catalog amounts. Paid enrollment is available only when an account is explicitly confirmed to support NGN and all of that provider's server-only credentials are configured. To enable a provider, set its secret key, webhook secret, and supported currency list in this backend's private `.env`:

- Paystack: `PAYSTACK_SECRET_KEY`, `PAYSTACK_WEBHOOK_SECRET`, and `PAYSTACK_SUPPORTED_CURRENCIES=NGN`.
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `STRIPE_SUPPORTED_CURRENCIES=NGN`.

The supported-currency setting is an operator declaration, not an automatic capability check; only list NGN after confirming it is enabled for the specific merchant account. With missing credentials or without NGN in that list, the provider is not offered and paid enrollment remains disabled. Keep every secret blank in `.env.example`.

Paystack signs webhook requests with its API secret key; set `PAYSTACK_WEBHOOK_SECRET` to the same value as `PAYSTACK_SECRET_KEY`.

Set `SKILLORA_FRONTEND_URL` to the exact public Skillora site origin. Configure provider webhooks to:

- `POST /api/webhooks/paystack`
- `POST /api/webhooks/stripe`

The student checkout API reads course amount and currency from MongoDB, creates hosted provider checkout, and verifies a successful transaction/session against the provider API before granting enrollment. Signed webhooks use the same server-side verification and can safely retry. Card details stay on provider-hosted pages. Browser redirects alone never grant access. Free-course enrollment, login cookies and roles are unchanged. Checkout charges once for one course; recurring memberships are not implemented.

The API listens on port 5300 by default. Check `http://localhost:5300/health` for database status. If the machine's system DNS refuses MongoDB Atlas SRV or shard-host lookups, startup retries with the fallback resolvers in `MONGODB_DNS_SERVERS` (Cloudflare and Google DNS by default); override them with resolvers allowed by your network. On initial startup it seeds the Skillora course catalog and creates the administrator from the private environment values.

## Account roles and checkout

- Students register, browse published courses, enroll in free courses, and save lesson progress. Paid-course enrollment requires a configured Paystack or Stripe account with NGN support and a server-verified payment.
- Instructors apply through signup. An administrator must approve the application before instructor course/enrollment pages are available.
- Administrators manage course content, lesson curricula, instructors, students, enrollments, and platform settings.
- Sessions use HTTP-only cookies; passwords are stored as bcrypt hashes.
