# Greenfield College Suite

A TypeScript school portal suite with separate Expo student and staff apps, a responsive public website, and a responsive administration dashboard.

## Projects

- `student-app/` — Expo app for student announcements, fees, results, timetable, and profile.
- `staff-app/` — Expo app for teacher attendance, class results, announcements, and profile.
- `website/` — responsive public school website and admissions pages.
- `admin/` — web operations dashboard for students, fees, scratch PINs, attendance, results, broadcasts, and settings.

## Commands

Run from this directory:

- `npm run dev:website` — public website at `http://localhost:5173`.
- `npm run dev:admin` — admin dashboard at `http://localhost:5174`.
- `npm run start:student` / `npm run start:staff` — Expo development servers.
- `npm run typecheck` — type-check all four projects.
- `npm run build:web` — production-build the website and admin dashboard.
- `npm run export:student:android`, `npm run export:student:ios`, `npm run export:staff:android`, `npm run export:staff:ios` — Expo bundle exports.

All submitted payments, logins, attendance, results, and messages are local demonstrations. No real credentials, payment provider, school records service, or messaging service is connected.
