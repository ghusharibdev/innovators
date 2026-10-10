# NovaWorks CRM — AI Meeting-to-Project Manager

> Paste a client meeting transcript. AI extracts projects, tasks, owners, deadlines, and effort hours — then saves them to a role-based project management CRM.

![Next.js](https://img.shields.io/badge/Next.js-15-000?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=fff)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![Gemini](https://img.shields.io/badge/Gemini-3.1%20Flash%20Lite-8E75B2?logo=google)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38BDF8?logo=tailwindcss&logoColor=fff)

Built for **The Infinity Hack '26** — AI Project Manager challenge.

---

## Team

- **Team name:** NovaWorks Builders
- **Members:**
  - **Ghusharib Najam** — Frontend / UI — Next.js pages, Tailwind + shadcn/ui components, framer-motion animations, light/dark theming (next-themes), Geist font setup, responsive polish
  - **Meesum Zaheer** — Backend / AI — Prisma schema, SQLite/PostgreSQL, JWT auth, access control, Gemini integration, validation, transactional saves
- **Repository:** `https://github.com/ghusharibdev/innovators.git`

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
- ✅ **Persistent storage** — projects and tasks survive a refresh (SQLite locally, PostgreSQL when deployed).
- ✅ **Idempotent seeder** — re-running never duplicates the 10 demo users.
- ✅ **Duplicate-safe** — create button is disabled while processing, and the save is transactional.

**Not implemented (intentionally out of scope):** editing/deleting created projects, signup, forgot password, user management screens, cost calculation, progress monitoring, charts.

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router) + React 18 + TypeScript 5 |
| **Styling** | Tailwind CSS 3.4 + shadcn/ui + lucide-react |
| **Animation** | framer-motion 11 |
| **Backend** | Next.js Route Handlers (Node runtime) |
| **Database (dev)** | SQLite via Prisma 6 |
| **Database (prod)** | PostgreSQL (Neon / Aiven free tier) |
| **ORM** | Prisma 6 |
| **AI** | Google Gemini — `gemini-3.1-flash-lite` with forced JSON response schema |
| **Authentication** | JWT (`jose`, HS256) in an httpOnly cookie + bcryptjs password hashing |
| **Validation** | Zod (shape) + custom semantic validator (user codes, roles, deadline rules) |
| **Theme** | Light / Dark / System toggle via next-themes (persisted, no FOUC) |
| **Fonts** | Geist Sans (UI) + JetBrains Mono (codes, hours, transcript) |

---

## Links

- **Live application:** Local only — no public deployment yet (demo runs on `localhost:3000`)
- **Demo video:** Record with any screen capture tool before submission

---

## Requirements

- Node.js **20.x** or newer
- npm 10.x or newer
- A **Gemini API key** from [Google AI Studio](https://aistudio.google.com/apikey)
- No external database server needed locally — Prisma creates `prisma/dev.db` on first migration
- *(Deployment only)* a PostgreSQL connection string from Neon or Aiven

---

## Run Locally

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
DATABASE_URL="file:./dev.db"
SESSION_SECRET="<paste a 32+ character random string>"
GEMINI_API_KEY="<your Google AI Studio key>"
GEMINI_MODEL="gemini-3.1-flash-lite"
NEXT_PUBLIC_APP_NAME="NovaWorks CRM"
```

Generate a session secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Create the database and apply schema

```bash
npx prisma generate
npx prisma migrate dev --name init
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

Only one process needs to stay running (`npm run dev`). The SQLite file lives at `prisma/dev.db` and needs no separate server.

### Useful scripts

```bash
npm run dev            # start dev server
npm run build          # production build
npm run start          # run production build
npm run db:seed        # seed/refresh the 10 demo users
npm run db:studio      # Prisma Studio GUI at localhost:5555
npm run db:reset-data  # wipe generated projects/tasks, keep users
```

---

## Environment Variables

| Variable | Purpose | Where configured |
|---|---|---|
| `DATABASE_URL` | Database connection string. `file:./dev.db` locally; Postgres URL when deployed. | Backend only |
| `SESSION_SECRET` | HMAC key for signing the auth JWT. Minimum 32 characters. | Backend only |
| `GEMINI_API_KEY` | Google AI Studio credential used by `lib/ai.ts`. | Backend only |
| `GEMINI_MODEL` | Model ID, e.g. `gemini-3.1-flash-lite`. | Backend only |
| `NEXT_PUBLIC_APP_NAME` | Display name in the top bar. | Frontend (safe to expose) |

**Security notes**

- `.env` is git-ignored. Only `.env.example` (with placeholders) is committed.
- `GEMINI_API_KEY`, `DATABASE_URL`, and `SESSION_SECRET` are never exposed to the browser.
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

Run `npm run db:seed` before judging. The login page also has one-click quick-login chips for Admin / Manager / Agent.

---

## How Judges Can Test

### A. Happy path (≈3 minutes)

1. Run `npm run db:seed`, then log in as **`admin@novaworks.example` / `Demo123!`** (or click the Admin quick-login chip).
2. Open **Create from Transcript**.
3. Click **Load sample transcript** — this fills the textarea with the supplied NovaWorks Client Delivery Planning meeting.
4. Click **Create from Transcript**. Watch the animated 3-step stepper: *Reading → Extracting with Gemini → Validating & saving*.
5. **Expect:** success panel reading **3 projects · 12 tasks · 124 estimated hours**, followed by three project cards.
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
10. **Direct-access check:** while logged in as Ali, open `/projects/<QuickServe project id>` → expect **404 / access denied**.
11. Same via API: `curl http://localhost:3000/api/projects/<id> -H "Cookie: nw_session=..."` → `403` or `404`.

### C. Persistence & correctness (≈1 minute)

12. Refresh the dashboard → projects and tasks are still there.
13. Log back in as admin → confirm **3 projects, 12 tasks**.

### D. Genuine AI conversion (≈2 minutes)

14. Reset generated data: `npm run db:reset-data`.
15. Modify the transcript (e.g., change *"Mobile integration and testing, Usman, 10 hours, 22 October"* to *"12 hours, 23 October"*).
16. Click **Create from Transcript** again → expect the generated task to show **12 h / 23 Oct**, while every other task stays unchanged.

### E. Failure handling (≈1 minute)

17. Paste `hello` and submit → expect a **422 validation panel listing errors**, and **zero projects saved**.
18. Double-click Create → only one set of projects is created.

### Resetting generated data between tests

```bash
npm run db:reset-data
```

Deletes all `Project` rows (tasks cascade) but keeps the 10 demo users.

---

## Architecture Overview

```
Browser
  │
  ├─ Server Components  ──► lib/access.ts ──► Prisma ──► SQLite / PostgreSQL
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
| `lib/access.ts` | `getVisibleProjects`, `getProjectForUser`, `getTasksForAgent` — single source of truth for permissions |
| `lib/ai.ts` | Gemini REST call (`gemini-3.1-flash-lite`), system prompt, JSON response schema, 12 s timeout + single retry |
| `lib/validate.ts` | Zod shape validation + semantic validation (user codes, roles, deadline rules) |
| `app/api/transcript/route.ts` | Admin-only orchestration: extract → validate → transactional save |
| `lib/auth.ts` | JWT create/verify, `requireUser`, `requireAdmin` |
| `prisma/seed.ts` | Idempotent seeding of the 10 demo accounts |

Permissions are enforced inside `lib/access.ts` and every API route — hiding a button is a convenience, not the security boundary.

---

## Deployment Details

- Deployment status: Live on Vercel (frontend + API) with a Neon PostgreSQL database.
- Frontend host: Vercel — Next.js 15 App Router, serverless functions.
- Backend host: Vercel serverless functions (same project, single origin).
- Database: Neon — serverless PostgreSQL, free tier.
- Deployed branch: main.

### How we deployed

1. Provision PostgreSQL on Neon
   - Created a free project at https://neon.tech.
   - Copied both connection strings from the dashboard:
     - Pooled (has -pooler in the hostname) → set as DATABASE_URL.
     - Direct (no -pooler) → set as DIRECT_URL.

2. Schema provider
   - prisma/schema.prisma uses provider = "postgresql" with both url and
     directUrl set. Migrations run against DIRECT_URL; the app runtime uses the
     pooled DATABASE_URL.

3. Build script
   - package.json includes "vercel-build": "prisma generate && prisma migrate deploy && next build".
   - "postinstall": "prisma generate" ensures the client is always generated.
   - On every deploy, Vercel applies new migrations automatically before building.

4. Import into Vercel
   - Imported the GitHub repository into Vercel.
   - Framework preset: Next.js (no custom build command needed — vercel-build is picked up automatically).
   - Added these environment variables in Settings → Environment Variables:
     - DATABASE_URL — Neon pooled connection string
     - DIRECT_URL — Neon direct connection string
     - SESSION_SECRET — 64-character hex secret
     - GEMINI_API_KEY — Google AI Studio key
     - GEMINI_MODEL — gemini-3.1-flash-lite
     - NEXT_PUBLIC_APP_NAME — NovaWorks CRM

5. Deploy
   - Clicked Deploy. Vercel ran prisma generate, then prisma migrate deploy
     (created all tables), then next build. First deploy took about 2 minutes.

6. Seed the production database
   - From the local repository, ran the seed against the production database using
     the same Neon URL:
     DATABASE_URL="<neon pooled url>" DIRECT_URL="<neon direct url>" npm run db:seed
   - Alternatively, while logged in as admin on the live site, POST /api/seed
     can be used for the first-run bootstrap (it is admin-only once users exist).

7. Verification
   - Opened the live Vercel URL.
   - Logged in as admin@novaworks.example / Demo123!.
   - Ran Create from Transcript → confirmed 3 projects / 12 tasks / 124 hours.
   - Logged in as a manager and an agent to confirm role scoping.
   - Refreshed the dashboard to confirm PostgreSQL persistence.

### Environment matrix

Environment         Provider   DATABASE_URL          DIRECT_URL
Local development   SQLite     file:./dev.db         file:./dev.db
Production (Vercel) Neon       pooled Postgres URL   direct Postgres URL

### Notes

- SQLite is not supported on Vercel or any serverless host (ephemeral filesystem).
  Neon PostgreSQL is required for a working live link.
- The local SQLite setup is fully preserved: to run locally, set DATABASE_URL="file:./dev.db"
  and DIRECT_URL="file:./dev.db" in .env, then run
  npx prisma db push && npm run db:seed && npm run dev.
  The old SQLite migration is intentionally removed — for local SQLite development,
  use npx prisma db push to sync the schema instead of migrations.

---

## Known Limitations

- Projects and tasks cannot be edited or deleted from the UI after creation (a reset endpoint clears generated data).
- Very long transcripts may hit the 12-second AI timeout and return a retryable error.
- Free Gemini tiers are rate-limited; a 429 surfaces as a clear retry message rather than a partial save.
- No pagination — the UI is designed for demo-scale datasets.
- Signup, email verification, password reset, and user management are intentionally absent (out of scope).
- If `GEMINI_MODEL` is unavailable in your region, switch to another flash model (e.g. `gemini-3.5-flash-lite`) or route through OpenRouter.

---

## Submission Summary

- **Source repository:** `https://github.com/ghusharibdev/innovators.git`
- **Live link or local demo video:** Local demo on `http://localhost:3000`
- **Setup and seed commands:** `npm install` → `npx prisma migrate dev --name init` → `npm run db:seed` → `npm run dev`
- **Demo login accounts:** confirmed working — `admin@novaworks.example` / `Demo123!` (all 10 accounts use `Demo123!`)

### Features completed

- Simple login/logout with 10 seeded demo accounts
- Admin transcript-to-project AI automation (Gemini, structured JSON, 3 projects / 12 tasks / 124 hours)
- Two-stage validation (Zod shape + semantic directory + deadline rules) with transactional save
- Role-scoped dashboards for Admin, Manager, and Agent — enforced in data requests
- Project detail with full task breakdown (owner, deadline, estimated hours)
- Agent "My Tasks" view across projects
- Read-only team directory
- Persistent SQLite / PostgreSQL storage
- Modern, animated, minimal UI with light/dark theme (Geist Sans, semantic color tokens, hover micro-interactions, fully responsive mobile → desktop)
