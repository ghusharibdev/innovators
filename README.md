# NovaWorks CRM — AI Meeting-to-Project Manager

> Paste a client meeting transcript. AI extracts projects, tasks, owners, deadlines, and effort hours — then saves them to a role-based project management CRM.

**Live app:** https://novaworks-innovators.vercel.app/
**Demo video:** https://drive.google.com/file/d/163LlgiBz1Kjbhkm7Z0YLkHecTDC_yzA1/view?usp=drive_link

![Next.js](https://img.shields.io/badge/Next.js-16-000?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-087EA4?logo=react&logoColor=fff)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=fff)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![Gemini](https://img.shields.io/badge/Gemini-3.1%20Flash%20Lite-8E75B2?logo=google)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&logoColor=fff)

Built for **The Infinity Hack '26** — AI Project Manager challenge.

---

## Team

**NovaWorks Builders**

- **Ghusharib Najam**
- **Meesum Zaheer**

- **Repository:** `https://github.com/ghusharibdev/innovators.git`
- **Live deployment:** https://novaworks-innovators.vercel.app/

---

## What Works

- ✅ **Simple login / logout** with 10 pre-seeded demo accounts (no signup, no email verification).
- ✅ **Admin dashboard** — all project cards, stat row (projects / tasks / hours / team), **Create from Transcript** entry point.
- ✅ **AI transcript automation** — admin pastes the meeting transcript, Gemini returns structured JSON, the server validates it against the directory, and a single Prisma transaction creates **3 projects and 12 tasks (124 estimated hours)**. Invalid AI output saves **nothing** and lists every problem for correction.
- ✅ **Role-based access enforced in data requests** — not just by hiding buttons:
  - Admin → all projects and tasks
  - Manager → only projects where they are the manager
  - Agent → only tasks assigned to them, plus the name, client, and manager of the related project
- ✅ **Project detail** — client, manager, deadline, description, and a task table with assignee, deadline, and estimated hours.
- ✅ **Agent "My Tasks" view** — grouped by project, sorted by deadline, with overdue and due-soon badges.
- ✅ **Read-only team directory** — names, codes, roles, specializations, and skills.
- ✅ **Persistent storage** — projects and tasks survive a refresh (Neon PostgreSQL in production).
- ✅ **Idempotent seeder** — re-running never duplicates the 10 demo users.
- ✅ **Duplicate-safe** — create button is disabled while processing, and the save is transactional.

**Not implemented (intentionally out of scope):** editing/deleting created projects, signup, forgot password, user management screens, cost calculation, progress monitoring, charts.

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router) + React 19 + TypeScript 6 |
| **Styling** | Tailwind CSS 4 + shadcn/ui + lucide-react |
| **Animation** | motion 14 (`motion/react`) |
| **Backend** | Next.js Route Handlers (Node runtime) |
| **Database** | PostgreSQL (Neon serverless, free tier) |
| **ORM** | Prisma 6 |
| **AI** | Google Gemini — `gemini-3.1-flash-lite` with forced JSON response schema |
| **Authentication** | JWT (`jose`, HS256) in an httpOnly cookie + bcryptjs password hashing |
| **Validation** | Zod 4 (shape) + custom semantic validator (user codes, roles, deadline rules) |
| **Theme** | Light / Dark / System toggle via next-themes (persisted, no FOUC) |
| **Fonts** | Geist Sans (UI) + JetBrains Mono (codes, hours, transcript) — self-hosted, no Google Fonts at build time |

---

## Links

- **Live application:** https://novaworks-innovators.vercel.app/
- **Demo video:** https://drive.google.com/file/d/163LlgiBz1Kjbhkm7Z0YLkHecTDC_yzA1/view?usp=drive_link
- **Source repository:** `https://github.com/ghusharibdev/innovators.git`

The project is **deployed and publicly available** — it is not local-only. The live link is fully functional: the database is seeded and ready to use with the demo accounts below, so no setup is required to try it.

---

## Requirements

- Node.js **20.9** or newer (required by Next.js 16)
- npm 10.x or newer
- A **Gemini API key** from [Google AI Studio](https://aistudio.google.com/apikey)
- A **PostgreSQL** database — the free tier at [Neon](https://neon.tech) is enough
- No local database server needed if you point at a Neon project

> **Note on SQLite:** the schema targets PostgreSQL. An earlier iteration ran on a local SQLite file, but SQLite does not persist on serverless hosts, so the provider was switched to `postgresql`. See [Running locally](#running-locally) for the current workflow.

---

## Running Locally

### 1. Clone and install

```bash
git clone https://github.com/ghusharibdev/innovators.git
cd innovators
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in `.env`:

```bash
DATABASE_URL="postgresql://user:password@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require"
SESSION_SECRET="<paste a 32+ character random string>"
GEMINI_API_KEY="<your Google AI Studio key>"
GEMINI_MODEL="gemini-3.1-flash-lite"
NEXT_PUBLIC_APP_NAME="NovaWorks CRM"
```

- `DATABASE_URL` → the **pooled** Neon string (hostname contains `-pooler`). Used at runtime.
- `DIRECT_URL` → the **direct** Neon string (no `-pooler`). Used by migrations.

Generate a session secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Create the database and apply schema

```bash
npx prisma generate
npx prisma migrate deploy
```

### 4. Seed the 10 demo users

```bash
npm run db:seed
```

This is idempotent — safe to run multiple times.

### 5. Start the app

```bash
npm run dev
```

Open **http://localhost:3000**.

### Useful scripts

```bash
npm run dev            # start dev server
npm run build          # prisma generate + production build
npm run start          # run production build
npm run lint           # ESLint
npm run db:seed        # seed/refresh the 10 demo users (idempotent)
npm run db:studio      # Prisma Studio GUI
npm run db:reset       # drop and re-apply all migrations
npm run db:reset-data  # wipe generated projects/tasks, keep users
```

---

## Environment Variables

| Variable | Purpose | Where configured |
|---|---|---|
| `DATABASE_URL` | Pooled PostgreSQL connection string. | Backend only |
| `DIRECT_URL` | Direct (non-pooled) PostgreSQL string used by Prisma migrations. | Backend only |
| `SESSION_SECRET` | HMAC key for signing the auth JWT. Minimum 32 characters. | Backend only |
| `GEMINI_API_KEY` | Google AI Studio credential used by `lib/ai.ts`. | Backend only |
| `GEMINI_MODEL` | Model ID, e.g. `gemini-3.1-flash-lite`. | Backend only |
| `NEXT_PUBLIC_APP_NAME` | Display name in the top bar. | Frontend (safe to expose) |

**Security notes**

- `.env` is git-ignored. Only `.env.example` (with placeholders) is committed.
- `GEMINI_API_KEY`, `DATABASE_URL`, `DIRECT_URL`, and `SESSION_SECRET` are never exposed to the browser.
- Passwords are hashed with bcrypt and are never sent to the AI. The directory payload given to Gemini contains only `code, name, role, specialization, skills`.

---

## Demo Login Accounts

These emails are **fictional login identifiers, not real mailboxes**. No signup, email verification, or password reset is needed.

| Role | Name | Code | Demo email | Password |
|---|---|---|---|---|
| Admin | Admin | `ADMIN` | `admin@novaworks.example` | `Demo123!` |
| Manager | Ayesha Khan | `PM01` | `ayesha@novaworks.example` | `Demo123!` |
| Manager | Bilal Ahmed | `PM02` | `bilal@novaworks.example` | `Demo123!` |
| Manager | Hina Malik | `PM03` | `hina@novaworks.example` | `Demo123!` |
| Agent | Ali Raza | `DEV01` | `ali@novaworks.example` | `Demo123!` |
| Agent | Hamza Shah | `DEV02` | `hamza@novaworks.example` | `Demo123!` |
| Agent | Sara Noor | `DEV03` | `sara@novaworks.example` | `Demo123!` |
| Agent | Usman Tariq | `DEV04` | `usman@novaworks.example` | `Demo123!` |
| Agent | Zain Abbas | `DEV05` | `zain@novaworks.example` | `Demo123!` |
| Agent | Maryam Asif | `DEV06` | `maryam@novaworks.example` | `Demo123!` |

The live database is already seeded, so you can log in immediately at https://novaworks-innovators.vercel.app/ without running anything. The login page also has one-click quick-login chips for Admin / Manager / Agent.

---

## How Judges Can Test

Test on the live deployment — no setup required. A screen-recorded walkthrough is also available in the [demo video](https://drive.google.com/file/d/163LlgiBz1Kjbhkm7Z0YLkHecTDC_yzA1/view?usp=drive_link).

### A. Happy path (≈3 minutes)

1. Open **https://novaworks-innovators.vercel.app/** and log in as **`admin@novaworks.example` / `Demo123!`** (or click the Admin quick-login chip).
2. Open **Create from Transcript**.
3. Click **Load sample transcript** — this fills the textarea with the supplied NovaWorks Client Delivery Planning meeting.
4. Click **Create from Transcript**. Watch the animated 3-step stepper: *Reading → Extracting with Gemini → Validating & saving*.
5. **Expect:** success panel reading **3 projects · 12 tasks · 124 h created**, followed by three project cards.
6. Open **UrbanCart Website** → expect manager **Ayesha Khan**, deadline **20 October 2026**, and **4 tasks**:

| Task | Owner | Deadline | Hours |
|---|---|---|---|
| Product catalog UI | Ali Raza | 12 Oct 2026 | 12 |
| Demo cart UI | Ali Raza | 15 Oct 2026 | 8 |
| Product and cart APIs | Hamza Shah | 14 Oct 2026 | 14 |
| Website integration and testing | Ali Raza | 19 Oct 2026 | 6 |

### B. Role-based access (≈2 minutes)

7. Log out. Log in as **`ayesha@novaworks.example`** → she sees only UrbanCart Website.
8. Log in as **`ali@novaworks.example`** → he sees only his 3 assigned tasks and the related UrbanCart project (no other agents' tasks).
9. Log in as **`hamza@novaworks.example`** → he sees his 2 API tasks across two projects.
10. **Direct-access check:** while logged in as Ali, navigate to a URL for a project he has no task in → expect a **redirect / access denied**.
11. Same via API: `curl https://novaworks-innovators.vercel.app/api/projects/<id> -H "Cookie: nw_session=..."` → `403` or `404`.

### C. Persistence & correctness (≈1 minute)

12. Refresh the dashboard → projects and tasks are still there (PostgreSQL persistence).
13. Log back in as admin → confirm **3 projects, 12 tasks**.

### D. Genuine AI conversion (≈2 minutes)

14. Modify the transcript (e.g. change *"Mobile integration and testing, Usman, 10 hours, 22 October"* to *"12 hours, 23 October"*).
15. Click **Create from Transcript** again → expect the generated task to show **12 h / 23 Oct**, while every other task stays unchanged.

### E. Failure handling (≈1 minute)

16. Paste `hello` and submit → expect a **422 validation panel listing errors**, and **zero projects saved**.
17. Double-click Create → only one set of projects is created.

### Resetting generated data between tests

Run the reset from the repository with the production database URL:

```bash
DATABASE_URL="<neon pooled url>" DIRECT_URL="<neon direct url>" npm run db:reset-data
```

This deletes all generated projects and tasks but keeps the 10 demo users. There is also an admin-only `POST /api/seed/reset` endpoint that does the same thing from the deployed app.

---

## Architecture Overview

```
Browser
  │
  ├─ proxy.ts (Edge)  ──► verifies the nw_session JWT, redirects to /login if absent/expired
  │
  ├─ Server Components  ──► lib/access.ts ──► Prisma ──► PostgreSQL
  │     (pages read only what the role may see)
  │
  └─ Route Handlers     ──► lib/auth.ts       (session + role guard)
        (all mutations)  ──► lib/access.ts     (scoping)
                         ──► lib/ai.ts         (Gemini, the only AI caller)
                         ──► lib/validate.ts   (Zod + semantic checks)
                         ──► prisma.$transaction (all-or-nothing save)
```

### Key files

| File | Responsibility |
|---|---|
| `proxy.ts` | Edge middleware — verifies the session JWT before protected routes render |
| `lib/access.ts` | `getVisibleProjects`, `getProjectForUser`, `getTasksForAgent` — single source of truth for permissions |
| `lib/ai.ts` | Gemini REST call (`gemini-3.1-flash-lite`), system prompt, JSON response schema, 12 s timeout + single retry |
| `lib/validate.ts` | Zod shape validation + semantic validation (user codes, roles, deadline rules) |
| `app/api/transcript/route.ts` | Admin-only orchestration: extract → validate → transactional save |
| `lib/auth.ts` | JWT create/verify, `requireUser`, `requireAdmin` |
| `lib/seed-data.ts` | The 10 demo users and the sample meeting transcript |
| `prisma/seed.ts` | Idempotent seeding of the 10 demo accounts |

Permissions are enforced inside `lib/access.ts` and every API route — hiding a button is a convenience, not the security boundary.

---

## Deployment

- **Live URL:** https://novaworks-innovators.vercel.app/ (public, no login needed to reach the login page)
- **Demo video:** https://drive.google.com/file/d/163LlgiBz1Kjbhkm7Z0YLkHecTDC_yzA1/view?usp=drive_link
- Frontend + backend: Vercel (Next.js 16 App Router, serverless functions, single origin)
- Database: Neon — serverless PostgreSQL, free tier
- Deployed branch: `main`

### Environment variables on Vercel

Set in **Settings → Environment Variables**:

- `DATABASE_URL` — Neon pooled connection string
- `DIRECT_URL` — Neon direct connection string
- `SESSION_SECRET` — 64-character hex secret
- `GEMINI_API_KEY` — Google AI Studio key
- `GEMINI_MODEL` — `gemini-3.1-flash-lite`
- `NEXT_PUBLIC_APP_NAME` — NovaWorks CRM

### How the deploy works

- `package.json` defines `"vercel-build": "prisma generate && prisma migrate deploy && next build"`, so Vercel applies migrations against `DIRECT_URL` before every production build.
- `"postinstall": "prisma generate"` ensures the client is always generated.
- The framework preset is Next.js — `vercel-build` is picked up automatically, no custom build command needed.
- The database is seeded via `npm run db:seed` against the production Neon URL. There is also an admin-only `POST /api/seed` bootstrap endpoint that seeds a fresh deployment; once any user exists it requires an admin session.

### Notes

- SQLite does not work on Vercel or any serverless host (ephemeral filesystem). PostgreSQL is required for a working live link — this is why the schema provider is `postgresql`.

---

## Known Limitations

- Projects and tasks cannot be edited or deleted from the UI after creation (a reset endpoint clears generated data).
- Very long transcripts may hit the 12-second AI timeout and return a retryable error.
- Free Gemini tiers are rate-limited; a 429 surfaces as a clear retry message rather than a partial save.
- No pagination — the UI is designed for demo-scale datasets.
- Signup, email verification, password reset, and user management are intentionally absent (out of scope).
- If `GEMINI_MODEL` is unavailable in your region, switch to another flash model via the `GEMINI_MODEL` env var.

---

## Submission Summary

- **Source repository:** `https://github.com/ghusharibdev/innovators.git`
- **Live link:** https://novaworks-innovators.vercel.app/ (deployed and publicly available)
- **Demo video:** https://drive.google.com/file/d/163LlgiBz1Kjbhkm7Z0YLkHecTDC_yzA1/view?usp=drive_link
- **Setup and seed commands:** `npm install` → `npm run db:seed` → `npm run dev`
- **Demo login accounts:** `admin@novaworks.example` / `Demo123!` (all 10 accounts use `Demo123!`)

### Features completed

- Simple login/logout with 10 seeded demo accounts
- Admin transcript-to-project AI automation (Gemini, structured JSON, 3 projects / 12 tasks / 124 hours)
- Two-stage validation (Zod shape + semantic directory + deadline rules) with transactional save
- Role-scoped dashboards for Admin, Manager, and Agent — enforced in data requests
- Project detail with full task breakdown (owner, deadline, estimated hours)
- Agent "My Tasks" view across projects
- Read-only team directory
- Persistent PostgreSQL storage on Vercel + Neon
- Modern, animated, minimal UI with light/dark theme (Geist Sans, semantic color tokens, hover micro-interactions, fully responsive mobile → desktop)