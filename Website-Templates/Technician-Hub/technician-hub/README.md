# PolarFlow HVAC

A responsive HVAC service website built with React and Vite. It includes a service catalog, per-service detail pages, an interactive estimate, a booking request and review flow, customer portal screens, and information pages.

## Run locally

```sh
npm install
npm run dev
```

Use `npm run build` to create a production build and `npm run lint` to run ESLint.

## Routes

- `/` — Home and estimate calculator
- `/services` and `/services/:serviceId` — Service catalog and details
- `/maintenance`, `/about`, `/contact`, `/privacy`, `/terms`, `/warranty` — Information pages
- `/book` — Appointment request
- `/checkout` — Request review and payment information
- `/booking-confirmation` — Saved request details
- `/portal/login`, `/portal/signup`, `/portal/reset-password` — Customer portal screens

## Integration notes

Appointment details are stored in the current browser only. The portal forms, dispatch notifications, and online card payments are interface previews and are not connected to backend services. The checkout does not collect card data or charge a payment method; connect a secure payment provider and appointment API before using this site for real bookings.
