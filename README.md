# School Food Stock Management System

A modern, responsive stock management and food stock book web application for a
school to record and manage food received, released, used, destroyed, and
remaining — **GS NKUBI, Huye District**.

## Project structure

This is an **npm workspaces monorepo** split into two packages:

```
.
├── frontend/   # React (Vite) single-page app — the UI
└── backend/    # Express + TypeScript API — build your endpoints here later
```

### frontend

- React 19, Vite, Tailwind CSS v4, TanStack Router (file-based routing)
- Dark green primary color, clean professional dashboard, fully responsive
- All data currently lives in `localStorage` (see `frontend/src/lib/stock-store.ts`)
- shadcn/ui components under `frontend/src/components/ui`

### backend

- Express + TypeScript API, deployed on Render
- Routes in `backend/src`: `GET /api/health`, `POST /api/auth/login`, `POST /api/auth/register`
- Runs on port 5000 (`npm run dev:backend`)

## Getting started

You need Node.js and npm.

```sh
npm i
npm run dev:frontend   # UI at http://127.0.0.1:5173
npm run dev:backend    # API at http://127.0.0.1:5000
```

Or just `npm run dev` to start the frontend.

The frontend dev server proxies `/api` requests to the backend (port 5000),
so pages can call the API with relative URLs once you implement endpoints.

In production the frontend calls the backend at
`https://stock-wise-school.onrender.com` (override with `VITE_API_URL`).

## Scripts (run from the root)

| Command                 | What it does                          |
| ----------------------- | ------------------------------------- |
| `npm run dev`           | Start the frontend dev server         |
| `npm run dev:frontend`  | Start the frontend dev server         |
| `npm run dev:backend`   | Start the backend dev server          |
| `npm run build`         | Build the frontend                    |
| `npm run build:backend` | Compile the backend to `backend/dist` |
| `npm run typecheck`     | Typecheck frontend and backend        |
| `npm run lint`          | Lint the frontend                     |

## Feature overview

1. **Login page** — school logo, email/password, show/hide password, remember me,
   forgot password, sign up.
2. **Dashboard** — stat cards (received, released, destroyed, remaining), recent
   activity, stock summary and monthly movement charts, low-stock warnings,
   quick actions.
3. **Stock Records** — the full stock book table with search, filters, sort,
   pagination and export actions.
4. **Add Stock** — form that auto-calculates remaining stock:
   `Started With + Received − Provided − Destroyed − Thrown Away`.
5. **Food Released** — record food released for student feeding.
6. **Reports** — daily/weekly/monthly reports with charts and export buttons.
7. **School Information** — editable school details.
8. **Settings** — profile, password, notifications, dark mode, backup/restore.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://stock-wise-school.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/85cdb315-3054-4a00-817a-cf84001e25b3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.
