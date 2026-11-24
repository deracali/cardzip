# Remote.ly — Vite frontend

React + Vite local demo for the Remote Talent Hub. From this folder, install dependencies and start the development server with `npm install` and `npm run dev`. Accounts, job listings, applications, and moderation changes are stored in the browser's localStorage; no API configuration is needed.

The complete stack setup, API contract, account roles, and payment limitations are documented in the [project README](../README.md). The Next.js app remains API-connected.

Main routes include `/jobs`, `/jobs/:jobId`, `/apply/:jobId`, `/talent`, `/post-job`, `/pricing`, `/checkout`, `/login`, `/signup`, `/dashboard`, and `/admin`.

Use `npm run lint` and `npm run build` before deployment.

The local demo admin account is `admin@remotely.demo` / `DemoAdmin123!`. Browser storage is editable and cannot provide production authentication or authorization. The local checkout does not collect payment; demo listings are marked accordingly. Never use this demo setup for sensitive or production data.
