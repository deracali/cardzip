# Skillora learning platform buyer guide

This guide covers the Skillora project in `Website-Templates/E-Learning`. It describes the course, learner, instructor and administration flows currently represented by the project. Purchase scope and rights are determined by the buyer's order and executed agreement.

## 1. Product and package choices

| Location | Role | Data behavior |
| --- | --- | --- |
| `E-Learning/` | React + Vite | Course catalog, lesson, quiz and admin preview; sample progress and workspace data live in browser localStorage. |
| `nextjs/` | Next.js | Connected learning site with student, instructor and administrator sessions. |
| `backend/` | Express API | MongoDB-backed courses, accounts, enrollments, lesson progress, instructor approvals and platform settings. |
| `docs/` | Buyer documentation | Markdown guide, standalone PDF builder and local logo/signature images. |

The Vite and Next.js applications are separate modes. The React demo does not connect to the backend. Check the transaction record to confirm which frontend, API or other services are included in a purchase.

## 2. Prerequisites and folder map

Install Node.js and npm for either frontend. Connected operation requires MongoDB, private server environment settings and allowed frontend origins.

```text
E-Learning/
  E-Learning/  React + Vite preview
  nextjs/      Next.js connected edition
  backend/     Express API and Mongoose models
  docs/        guide, PDF generator, assets/ and output PDF
```

Replace sample courses, instructor details and media only with content you are permitted to distribute. Define learner support, privacy and data-retention policies before collecting real account information.

## 3. Backend setup

Copy the example environment file and enter private values:

```powershell
cd backend
Copy-Item .env.example .env
```

Configure `MONGODB_URI`, a random `JWT_SECRET` of at least 32 characters, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ALLOWED_ORIGINS`. The API listens on port `5300` by default. Keep `.env` out of source control and use server-side secrets.

Paid course prices keep their existing catalog amounts and use NGN. Enable Paystack with `PAYSTACK_SECRET_KEY`, `PAYSTACK_WEBHOOK_SECRET`, and `PAYSTACK_SUPPORTED_CURRENCIES=NGN`, or Stripe with `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `STRIPE_SUPPORTED_CURRENCIES=NGN`. Paystack uses its API secret to sign webhooks, so its webhook-secret setting must have the same value as its API key. Only list NGN after confirming the configured merchant account supports it; these settings are an explicit operator declaration, not an automatic account capability check. If a provider's credentials or NGN support are missing, it is not shown and paid enrollment is disabled. Set `SKILLORA_FRONTEND_URL` to the site origin and register `/api/webhooks/paystack` and/or `/api/webhooks/stripe` with the provider. Keep all keys in the backend's private `.env`; the example file intentionally leaves payment secrets blank.

```powershell
npm install
npm run dev
```

Visit `http://localhost:5300/health` to check the service. On first startup, the backend seeds the course catalog and creates the admin account from its configured environment.

## 4. Frontend setup

The Next.js environment example uses `NEXT_PUBLIC_SKILLORA_API_URL=http://localhost:5300/api`. Copy it to `.env.local` when an API override is needed.

```powershell
cd nextjs
Copy-Item .env.example .env.local
npm install
npm run dev
```

To explore the independent React demo:

```powershell
cd E-Learning
npm install
npm run dev
```

Use the address printed by Vite. Its local admin workspace and learner progress are stored in the browser and can be reset by clearing site data. That state is separate from MongoDB.

## 5. Learner and instructor walkthrough

Learners can browse course categories, search the catalog, inspect instructor pages, open course lessons and take quizzes. Register at `/signup` as a Student and sign in at `/login`; `/dashboard` shows connected enrollments and progress. Learning pages save completed modules through the API in connected mode.

Instructor applicants choose Instructor / Creator during registration. New applications remain pending until an administrator approves them. Approved instructors use `/instructor/dashboard` to see assigned courses and learner enrollment data. The Vite tutor dashboard shows local static demo records; Next.js loads the authenticated instructor data from the API.

Free courses can be enrolled in through the connected flow. For paid courses, select an enabled provider and complete its hosted checkout. Skillora reads the course amount from the database, then verifies the payment directly with the provider before activating the enrollment. Provider webhooks are signature-checked and also verified server-side; a success redirect by itself does not grant access. Skillora does not collect or store card numbers. If no provider account supports NGN, paid-course checkout is disabled. Students pay once for a selected course; recurring membership plans are not implemented. Course lesson and video content is sample material that must be replaced before taking live payments. Sample progress in the Vite version is not a real learner record and is not shared across browsers.

## 6. Administration workflow

The connected admin pages support:

- **Overview:** review summary counts for courses, students, instructors and enrollments.
- **Courses and lessons:** edit course information, assigned instructor, pricing, level, image, curriculum and publication state; inspect module lists.
- **Instructors:** review applications and approve or reject instructor access.
- **Students and enrollments:** review account access, enrollment status and progress.
- **Settings:** manage platform name, support email, instructor applications and announcement.

Use the Next.js admin login and backend role checks for persistent changes. The React admin demo uses localStorage and is not an access-control boundary. Confirm the public course page after publishing edits.

## 7. Limitations, security and deployment

Paid course enrollment is enabled only for each provider whose credentials and confirmed NGN account support are configured. In connected mode it uses hosted Paystack or Stripe checkout and server-side provider verification before enrollment. An unconfigured or NGN-incompatible provider is disabled. There is no recurring membership checkout. Never collect card data directly or grant paid access from a browser redirect.

Before production, configure HTTPS, exact CORS origins, strong unique secrets, protected MongoDB credentials, least-privilege access, monitoring and tested backups. Review role access in the deployed setup.

Use authorized educational content, publish privacy and retention terms, collect only required learner details, and establish support and account deletion/export procedures. Hosting, payment-provider onboarding, refunds, tax handling and legal compliance belong to the buyer unless expressly included in the purchase. Review package and media licenses independently.

## 8. Buyer license summary

The purchase-specific order and executed agreement establish the rights, files, usage scope, support and services included. This guide is an informational summary and cannot expand those terms.

An ordinary template purchase does not automatically transfer copyright, exclusive rights or ownership. Do not redistribute the source as a standalone competing template. Cardzip pre-existing work and third-party packages, course content, fonts and media remain subject to their own ownership and license terms. The PDF purchase record and signature image do not replace the agreement.

## Build the designed PDF

Run the generator from this project's root directory:

```powershell
node docs/build-buyer-guide.mjs
```

It reads the local files from `docs/assets/`, writes `docs/CARDZIP-E-LEARNING-BUYER-GUIDE.pdf`, and prints the output path and page count. The designed guide has nine pages.
