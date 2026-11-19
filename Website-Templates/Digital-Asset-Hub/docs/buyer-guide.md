# Digital Asset Hub buyer guide

This handover describes the Digital Asset Hub project under `Website-Templates/Digital-Asset-Hub`. It is an operations-dashboard template, not a financial service. The invoice and executed agreement determine which source files and rights are included in a buyer's package.

## 1. Product and package comparison

| Location | Role | Data behavior |
| --- | --- | --- |
| `digital-asset-hub/` | React + Vite admin demo | Stores sample records, statuses, reference rates and preferences in this browser's `localStorage`. |
| `nextjs/` | Next.js site and connected admin/client routes | Uses the API for connected accounts and persistent operations. |
| `backend/` | Express API | Connects to MongoDB for account data, operations and platform settings. |
| `docs/` | Buyer guide sources | Contains this guide, the standalone PDF generator and local approved image assets. |

Use the React edition for interface review. Use Next.js with the API for the server-backed workflows. These editions are separate. Check the purchase order to see whether it includes the frontend, API, deployment or any support.

## 2. Prerequisites and folder map

The connected edition requires Node.js and npm plus a MongoDB database that the backend can reach. The React demo does not need the database.

```text
Digital-Asset-Hub/
  digital-asset-hub/  React + Vite local demo
  nextjs/             Next.js app
  backend/            Express API and MongoDB models
  docs/               Markdown, PDF builder, assets/, PDF output
```

Keep the API and Next.js development server in separate terminals. Do not enter real customer or financial information into the local Vite workspace.

## 3. Backend configuration

Prepare the backend's private environment file:

```powershell
cd backend
Copy-Item .env.example .env
```

Set `MONGODB_URI`, a random `JWT_SECRET` of at least 32 characters, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and the exact `ALLOWED_ORIGINS`. The default API port is `5000`. Never commit `.env` or expose backend secrets through browser-visible variables.

Install packages and run the service:

```powershell
npm install
npm run dev
```

Check `http://localhost:5000/health` for service status. `SEED_DEMO_DATA` is false by default; enable it only for disposable local data, never for a production database.

## 4. Frontend startup

Next.js uses the API URL in `nextjs/.env.example`, defaulting to `http://localhost:5000/api`. Copy that file to `.env.local` if you are changing the address:

```powershell
cd nextjs
Copy-Item .env.example .env.local
npm install
npm run dev
```

For the browser-only version, open a separate terminal:

```powershell
cd digital-asset-hub
npm install
npm run dev
```

Visit `/admin` in the Vite version and select the demo workspace. Browser site-data clearing restores local sample data. That state does not synchronize with the Next.js database.

## 5. Client and account walkthrough

The connected Next.js application includes signup and login, a client dashboard and service-oriented pages such as bills, rates, virtual cards and checkout. In connected mode, client sessions and account records are handled through the backend; the dashboard is intended to show activity belonging to the signed-in account.

The screens are a product interface demonstration. The application does not connect to a payment processor, settle trades, pay bills, transfer money, issue a live card or source market rates. Checkout is not a real charge flow. Never accept or promise transactions using the sample pages.

The Vite demo is more limited: its data is browser-local and can be changed by that browser user. Use seeded/example values only.

## 6. Administration workflow

The console groups platform operations into Overview, Trades, Bills, Virtual cards, Customers, Support, Rates and Settings. Use the queues to search for records and review the current status before editing.

In the connected edition, authorized admin operations persist through the Express API. Client and admin roles are distinct. In the Vite edition, actions affect only browser `localStorage`; its demo workspace is not an authentication or authorization boundary.

Rate values are illustrative settings, not live quotes. Settings such as support contact and maintenance notice are platform display values. Check the public and client-facing screens after changing a setting.

## 7. Limitations, security and deployment

Before any real deployment, configure HTTPS, secure session settings, exact CORS origins, strong unique secrets, restricted MongoDB credentials, monitoring and tested backups. Review admin role access and database recovery.

The included application does not integrate bill providers, financial institutions, exchanges, payment processing, settlement or card issuance. A production financial operation would require separately approved providers, authorization controls, audit trails, reconciliation, customer disclosures, support procedures and an appropriate security/regulatory review.

Use non-sensitive demonstration records. The buyer is responsible for hosting, legal and regulatory assessment, applicable provider approvals, privacy terms and business policies. Review dependencies and third-party media licenses before use.

## 8. Buyer license summary

The buyer's accepted order and executed purchase agreement define which files, usage scope, support and services are included. This guide is informational and does not add a license grant or expand the purchase.

An ordinary template purchase does not automatically transfer copyright, exclusive rights or ownership. Do not redistribute the source as a standalone competing template. Cardzip's pre-existing materials and third-party packages or assets remain subject to their own ownership and license terms. The PDF signature image and blank purchase fields do not substitute for a buyer-specific signed agreement.

## Build the designed PDF

Run the local generator from this project directory:

```powershell
node docs/build-buyer-guide.mjs
```

It reads the logo and company signature from `docs/assets/`, writes `docs/CARDZIP-DIGITAL-ASSET-HUB-BUYER-GUIDE.pdf`, and prints the output path and page count. The designed guide is nine pages.
