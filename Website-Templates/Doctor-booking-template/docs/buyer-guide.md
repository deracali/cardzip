# Carewell Doctor Booking buyer guide

This guide covers the Carewell project at `Website-Templates/Doctor-booking-template`. It explains the directory, appointment-request and account workflows present in the code. Carewell is a scheduling template, not a medical-record or compliance product.

## 1. Product and package options

| Folder | Application | Current behavior |
| --- | --- | --- |
| `doctor-booking-template/` | React + Vite | Demonstrates doctor discovery, booking and admin pages with browser-local sample data. |
| `nextjs/` | Next.js | Provides connected patient, provider and admin flows. |
| `backend/` | Express + MongoDB | Stores accounts, provider approvals, appointment requests, doctor listing state and clinic settings. |
| `docs/` | Buyer documentation | Holds this guide, the PDF generator, local Cardzip assets and generated PDF. |

Use the React version to review visuals and sample interactions. For persisted accounts and role-protected operations, use Next.js with the API. Confirm from the buyer's order which edition, backend and services are included.

## 2. Prerequisites and folder map

Install Node.js and npm for either frontend. MongoDB must be reachable for the connected service. The backend and frontend run in separate terminals.

```text
Doctor-booking-template/
  doctor-booking-template/  React + Vite demo
  nextjs/                   Next.js application
  backend/                  Express API + MongoDB models
  docs/                     guide, PDF generator and assets/
```

Keep the server environment private. Do not copy diagnoses, treatment notes, insurance data, prescriptions or confidential attachments into the demo or connected starter.

## 3. Backend setup

Create the private environment file from the supplied example:

```powershell
cd backend
Copy-Item .env.example .env
```

Configure `MONGODB_URI`, a random `JWT_SECRET` of at least 32 characters, unique `ADMIN_EMAIL` and `ADMIN_PASSWORD` values, and `ALLOWED_ORIGINS` for the exact local origins. The API defaults to port `5200`.

```powershell
npm install
npm run dev
```

The health endpoint is `http://localhost:5200/health`. On startup, the backend seeds the starter doctor directory and initializes the admin from the private environment configuration. If it does not start, verify MongoDB and `.env` first.

## 4. Frontend setup

The connected edition's `nextjs/.env.example` sets `NEXT_PUBLIC_CAREWELL_API_URL` to `http://localhost:5200/api`. Copy it to `.env.local` if the API is at another address.

```powershell
cd nextjs
Copy-Item .env.example .env.local
npm install
npm run dev
```

Start the Vite version separately for a browser-only demo:

```powershell
cd doctor-booking-template
npm install
npm run dev
```

The Vite demo stores its appointments and admin edits in the current browser. Its demo login does not authenticate securely and should not be used to manage real patient or provider accounts.

## 5. Patient and provider walkthrough

Visitors can browse doctor profiles and specialties, select a provider, choose an available time and submit an appointment request. In connected mode, requests are stored by the backend and associated with the patient account.

Register as a patient at `/signup`, sign in at `/login`, and use `/dashboard` to review appointments for the signed-in patient. A connected appointment request requires a patient session.

People registering as doctors/providers begin in a pending state. An administrator must review the application, assign a doctor listing and approve access. Approved providers use `/provider/dashboard` to see appointments associated with their assigned doctor profile; a provider account without approval is not given that access.

## 6. Administrator workflow

The admin workspace supports review of appointments, provider applications, doctor listings, patient accounts and clinic preferences.

- **Appointments:** review patient, doctor, date and time details and update the request status.
- **Providers:** review applications, assign a doctor listing, then approve or reject access.
- **Doctors:** manage public listing visibility and the displayed visit fee.
- **Patients:** suspend or reactivate account access.
- **Settings:** maintain the clinic name, support email and appointment notice.

Provider permissions are tied to the assigned doctor profile. The React admin is localStorage-backed and editable by its browser user; use the Next.js/API role checks for persistent administration.

## 7. Limitations, security and deployment

Carewell is not an electronic health record, clinical decision tool, provider credentialing service, payment processor or compliance certification. The booking preview does not charge a payment method. Do not use the project to store sensitive medical information.

Before deploying, use HTTPS and strong unique secrets; restrict database access and allowed origins; protect admin credentials; maintain tested backups; and review patient/provider access controls. Add audit logging, data retention and deletion procedures, provider credential verification, notifications, support policies and appropriate privacy notices.

Configure production domain and API origins, MongoDB and monitoring. The buyer supplies infrastructure and any external provider services unless the purchase agreement expressly includes them. Review dependencies and third-party media terms.

## 8. Buyer license summary

The accepted purchase order and signed agreement establish the actual project files, usage rights, support and delivery scope. This guide is descriptive only and does not expand the rights agreed at purchase.

An ordinary template purchase does not automatically transfer copyright, exclusive rights or ownership. Do not redistribute the source as a standalone competing template. Cardzip's pre-existing materials and third-party components remain governed by their own ownership and license terms. The PDF signature image and purchase record are informational handover elements, not a replacement for the executed agreement.

## Build the designed PDF

From the project directory, run:

```powershell
node docs/build-buyer-guide.mjs
```

The builder uses the images in `docs/assets/`, writes `docs/CARDZIP-DOCTOR-BOOKING-BUYER-GUIDE.pdf`, and prints its output path and page count. The designed guide contains nine pages.
