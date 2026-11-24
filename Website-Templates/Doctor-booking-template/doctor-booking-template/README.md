# Carewell Doctor Booking - React + Vite

Carewell is a doctor directory and appointment-request template with provider profiles, specialty and location filters, appointment selection, patient sign-up, and confirmation screens.

## Run locally

```powershell
npm install
npm run dev
```

Visit the Vite URL printed in the terminal. Patient pages are `/dashboard`, `/dashboard/appointments`, and `/dashboard/profile`. Provider pages are `/provider/dashboard`, `/provider/dashboard/schedule`, `/provider/dashboard/patients`, and `/provider/dashboard/profile`. Open `/admin` for the localStorage operations demo.

The Vite edition uses static sample appointments for its patient and provider dashboards. Providers can add a photo and public doctor details from `/provider/dashboard/profile`; the listing is saved to browser storage and appears in that browser's doctor directory. Demo accounts, local booking requests, reviews, and admin edits also stay in the current browser only. Demo sign-in does not verify passwords, and passwords are never stored. This is not real authentication and must not be used for real patient or provider data. Reviews are unverified demo content; Vite does not connect to MongoDB or process payments. For the connected, API-backed experience and setup details, see the [buyer guide](../docs/CARDZIP-DOCTOR-BOOKING-BUYER-GUIDE.pdf).
