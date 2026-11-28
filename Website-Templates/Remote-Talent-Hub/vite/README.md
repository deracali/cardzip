# Remote.ly — Vite frontend

React + Vite local demo for the Remote Talent Hub. From this folder, install dependencies and start the development server with `npm install` and `npm run dev`. Accounts, job listings, applications, and moderation changes are stored in the browser's localStorage; no API configuration is needed.

The complete stack setup, account roles, and Next.js payment integration are documented in the [project README](../README.md). Vite does not call the API and stays localStorage-only; the Next.js app remains API-connected.

Main routes include `/jobs`, `/jobs/:jobId`, `/apply/:jobId`, `/talent`, `/post-job`, `/pricing`, `/checkout`, `/login`, `/signup`, `/dashboard`, `/dashboard/applications`, `/dashboard/profile`, `/dashboard/jobs` (employers), and `/admin`.

Use `npm run lint` and `npm run build` before deployment.

The Vite `/admin/login` page displays a local demo admin account: `admin@remotely.demo` / `DemoAdmin123!`. It also allows creating additional admin users in this browser's localStorage. These accounts are separate from backend/Next.js admins and are only for demos: browser storage is editable and cannot provide production authentication or authorization. The local checkout does not collect payment; sample listings and accounts are illustrative. Never use this demo setup for sensitive or production data.
