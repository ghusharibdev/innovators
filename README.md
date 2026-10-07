# NovaWorks CRM — AI Meeting-to-Project Manager

> An AI-powered Project Management CRM for **NovaWorks Technologies**. An administrator pastes a client meeting transcript; Gemini extracts the final agreed projects, tasks, owners, deadlines, and effort estimates; the system validates everything against the company directory and saves it in a single all-or-nothing transaction. Managers see only their projects. Agents see only their tasks.

**Team:** The Infinity Hack '26 · COMSATS University Islamabad, Lahore Campus · 7 October 2026

---

## Team

- **Team name:** `[YOUR TEAM NAME]`
- **Repository:** `[YOUR GITHUB URL]`
- **Members & responsibilities:**
  | Member | Role | Responsibility |
  |---|---|---|
  | `[Name 1]` | Frontend / UI | Next.js pages, shadcn components, framer-motion animations, design tokens |
  | `[Name 2]` | Backend / DB | Prisma schema, SQLite/Postgres, seed script, auth, access control |
  | `[Name 3]` | AI / Integration | Gemini prompt engineering, structured JSON schema, validation, retries |
  | `[Name 4]` | Product / Full-Stack | End-to-end integration, transaction logic, testing, demo + presentation |

---

## What Works

✅ **Simple login/logout** with 10 pre-seeded demo accounts (no signup, no email verification, no password reset).
✅ **Admin dashboard** — all project cards, stat row (projects / tasks / hours / team), Create from Transcript entry point.
✅ **AI transcript automation** — admin pastes the meeting transcript, Gemini returns structured JSON, the server validates it, and a Prisma transaction creates **3 projects + 12 tasks (124 estimated hours)**. Invalid AI output saves **nothing** and lists every problem for correction.
✅ **Role-based access enforced in data requests**, not just by hiding buttons:
  - Admin → all projects and tasks
  - Manager → only projects where they are the manager
  - Agent → only tasks assigned to them, plus the name/client/manager of the related project
✅ **Project detail** — client, manager, deadline, description, and a task table with assignee, deadline, and estimated hours.
✅ **Agent "My Tasks" view** — grouped by project, sorted by deadline, with overdue / due-soon badges.
✅ **Read-only team directory** — names, codes, roles, specializations, and skills.
✅ **Persistent storage** — projects and tasks survive a refresh (SQLite locally, PostgreSQL when deployed).
✅ **Idempotent seeder** — re-running never duplicates the 10 demo users.
✅ **Duplicate-safe** — the create button is disabled while processing, and the save is transactional.

⚠️ **Not implemented (out of scope per the challenge):** editing/deleting created projects or tasks, signup, forgot password, user management screens, cost calculation, progress monitoring, charts, timesheets.

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js `15.x` (App Router) + React 19 + TypeScript `5.x` |
| **Styling** | Tailwind CSS `3.4` + shadcn/ui + lucide-react |
| **Animation** | framer-motion `11.x` |
| **Backend** | Next.js Route Handlers (Node runtime) |
| **Database (dev)** | SQLite via Prisma `6.x` (`file:./dev.db`) |
| **Database (prod)** | PostgreSQL (Neon / Aiven free tier) |
| **ORM** | Prisma `6.x` |
| **AI** | Google Gemini — `gemini-2.5-flash` (fallback: `gemini-2.0-flash`) via the Generative Language REST API with a forced JSON response schema |
| **Authentication** | JWT (`jose`, HS256) stored in an **httpOnly** cookie + `bcryptjs` password hashing. No third-party auth provider. |
| **Validation** | Zod `3.x` (shape validation) + a semantic resolver that checks every user reference and date rule |
| **Toasts** | sonner |
| **Dates** | date-fns `3.x` |

**Why this stack?** One codebase for UI and API, a single ORM that swaps SQLite → Postgres by changing one line, a free AI provider with native structured output, and an auth layer small enough to explain line-by-line to judges.

---

## Links

- **Live application:** `[VERCEL URL]` *(or "Not deployed — see demo video")*
- **Demo video:** `[URL — required if running a local database]`
- **Repository:** `[GITHUB URL]`

---

## Requirements

- **Node.js** `20.x` or newer
- **npm** `10.x` or newer (or pnpm / yarn)
- **A Gemini API key** — free from [Google AI Studio](https://aistudio.google.com/apikey)
  - *Alternative:* OpenRouter (`https://openrouter.ai`) with a free model, if Gemini is unavailable
- **No external database server needed for local development** — Prisma creates `dev.db` automatically
- *(Deployment only)* a PostgreSQL connection string from Neon or Aiven

---

## Run Locally

### 1. Clone and install

```bash
git clone [YOUR_REPOSITORY_URL]
cd novaworks-crm
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in at minimum:

```bash
DATABASE_URL="file:./dev.db"
SESSION_SECRET="<paste a 32+ char random string>"
GEMINI_API_KEY="<your Google AI Studio key>"
GEMINI_MODEL="gemini-2.5-flash"
NEXT_PUBLIC_APP_NAME="NovaWorks CRM"
```

Generate a session secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Create the database and schema

```bash
npx prisma generate
npx prisma migrate dev --name init
```

*(Fast alternative if migrations misbehave under time pressure: `npx prisma db push`)*

### 4. Seed the 10 demo users

```bash
npm run db:seed
```

This is **idempotent** — run it as many times as you like; it upserts by `code` and never creates duplicates.

### 5. Start the app

```bash
npm run dev
```

Open **http://localhost:3000**

> Only one process needs to stay running: `npm run dev`. The SQLite file lives at `prisma/dev.db` and needs no separate server.

### 6. Useful scripts

```bash
npm run dev            # start dev server
npm run build          # production build
npm run start          # run production build
npm run db:seed        # seed/refresh the 10 demo users
npm run db:studio      # Prisma Studio GUI at localhost:5555
npm run db:reset       # wipe + re-migrate + re-seed (dev only)
```

---

## Environment Variables

| Variable | Purpose | Where configured |
|---|---|---|
| `DATABASE_URL` | Database connection string. `file:./dev.db` locally; Postgres URL when deployed. | `backend only` |
| `SESSION_SECRET` | HMAC key for signing the auth JWT. Minimum 32 characters. | `backend only` |
| `GEMINI_API_KEY` | Google AI Studio credential used by `lib/ai.ts`. | `backend only` |
| `GEMINI_MODEL` | Model ID, e.g. `gemini-2.5-flash`. | `backend only` |
| `NEXT_PUBLIC_APP_NAME` | Display name in the top bar. | `frontend (safe to expose)` |

**Security notes**
- `.env` is git-ignored. Only `.env.example` (with placeholders) is committed.
- `GEMINI_API_KEY`, `DATABASE_URL`, and `SESSION_SECRET` are **never** exposed to the browser — no `NEXT_PUBLIC_` prefix.
- Passwords are hashed with bcrypt and are **never** sent to the AI. The directory payload given to Gemini contains only `code, name, role, specialization, skills`.

---

## Demo Login Accounts

These emails are **fictional login identifiers, not real mailboxes**. There is no signup, email verification, or password reset.

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

**To load them:** run `npm run db:seed` before judging (or `POST /api/seed`). The login page also has one-click quick-login chips for Admin / Manager / Agent.

---

## How Judges Can Test

### A. Happy path (≈3 minutes)

1. Run `npm run db:seed`, then open the app and log in as **`admin@novaworks.example` / `Demo123!`** (or click the **Admin** quick-login chip).
2. Go to **Create from Transcript**.
3. Click **Load sample transcript** — this fills the textarea with the supplied NovaWorks Client Delivery Planning meeting.
4. Click **Create from Transcript**. Watch the animated 3-step stepper: *Reading → Extracting with Gemini → Validating & saving*.
5. **Expect:** a success panel reading **3 projects · 12 tasks · 124 estimated hours**, followed by three project cards.
6. Open **UrbanCart Website** → expect manager **Ayesha Khan**, deadline **20 October 2026**, and **4 tasks**:

   | Task | Owner | Deadline | Hours |
   |---|---|---|---|
   | Product catalog UI | Ali Raza | 12 Oct 2026 | 12 |
   | Demo cart UI | Ali Raza | 15 Oct 2026 | 8 |
   | Product and cart APIs | Hamza Shah | 14 Oct 2026 | 14 |
   | Website integration and testing | Ali Raza | 19 Oct 2026 | 6 |

### B. Role-based access (≈2 minutes)

7. Log out. Log in as **`ayesha@novaworks.example` / `Demo123!`** → she sees **only UrbanCart Website**.
8. Log in as **`ali@novaworks.example` / `Demo123!`** → he sees **only his 3 assigned tasks** and the related UrbanCart project (no other agents' tasks).
9. Log in as **`hamza@novaworks.example` / `Demo123!`** → he sees **2 tasks across two projects**: *Product and cart APIs* (UrbanCart) and *Booking and account APIs* (QuickServe).
10. **Direct-access check:** while logged in as Ali, open `http://localhost:3000/projects/<QuickServe project id>` → expect **404 / access denied**, not the project.
11. Same via API: `curl http://localhost:3000/api/projects/<id> -H "Cookie: nw_session=..."` → `403` or `404`.

### C. Persistence & correctness (≈1 minute)

12. Refresh the dashboard → projects and tasks are still there.
13. Log back in as admin → confirm the full set: **3 projects, 12 tasks**.

### D. Genuine AI conversion (not a prefilled answer) (≈2 minutes)

14. Reset the generated data (see below).
15. In the transcript, change the QuickServe line to: *"Mobile integration and testing, Usman, **12 hours**, due **23 October**."*
16. Click **Create from Transcript** again → expect the generated task to show **12 h / 23 Oct**, while every other task stays unchanged.

### E. Failure handling (≈1 minute)

17. Paste `hello` and submit → expect a **422 validation panel listing errors**, and **zero** projects saved.
18. Double-click the create button → only one set of projects is created (button is disabled while processing).

### Resetting generated demo data between tests

Users are never deleted. Only the generated projects and tasks are cleared.

```bash
npm run db:reset-data        # deletes all Project + Task rows (cascades), keeps the 10 demo users
```

Or via the API while logged in as admin:

```bash
curl -X POST http://localhost:3000/api/seed/reset -H "Cookie: nw_session=<token>"
```

Prisma Studio alternative: `npm run db:studio` → delete all `Project` rows (tasks cascade).

---

## Architecture Overview

```
Browser
  │
  ├─ Server Components  ──► lib/access.ts ──► Prisma ──► SQLite / PostgreSQL
  │     (pages read only what the role may see)
  │
  └─ Route Handlers     ──► lib/auth.ts    (session + role guard)
        (all mutations)  ──► lib/access.ts  (scoping)
                         ──► lib/ai.ts      (Gemini, the ONLY AI caller)
                         ──► lib/validate.ts(Zod + semantic checks)
                         ──► prisma.$transaction (all-or-nothing save)
```

**Key files**

| File | Responsibility |
|---|---|
| `lib/access.ts` | `getVisibleProjects`, `getProjectForUser`, `getTasksForAgent` — the single source of truth for permissions |
| `lib/ai.ts` | Gemini REST call, system prompt, JSON response schema, timeout + retry |
| `lib/validate.ts` | Zod shape validation + semantic validation (user codes exist, roles match, task deadline ≤ project deadline) |
| `app/api/transcript/route.ts` | Admin-only orchestration: extract → validate → transactional save |
| `lib/auth.ts` | JWT create/verify, `requireUser`, `requireAdmin` |
| `prisma/seed.ts` | Idempotent seeding of the 10 demo accounts |

**Security model in one line:** *permissions are enforced inside `lib/access.ts` and every API route, so hiding a button is a convenience — not the security boundary.*

---

## Deployment Details

- **Deployment status:** `[Live / Local only]`
- **Frontend host:** `[Vercel — URL]`
- **Backend host:** `[Vercel serverless functions, same project as the frontend]`
- **Database:** `[Neon / Aiven PostgreSQL — free tier]`
- **Deployed branch / commit:** `[main @ <SHA>]`

### How We Deployed

1. **Provision PostgreSQL** on Neon (or Aiven free tier). Copy the pooled connection string.
2. **Switch the Prisma provider:** in `prisma/schema.prisma` change `provider = "sqlite"` → `"postgresql"`.
3. **Apply the schema to the hosted database:**
   ```bash
   DATABASE_URL="<postgres url>" npx prisma migrate deploy
   DATABASE_URL="<postgres url>" npm run db:seed
   ```
4. **Import the repository into Vercel** (framework preset: Next.js, no custom build command needed).
5. **Configure environment variables in Vercel** (names only — values stay private):
   `DATABASE_URL`, `SESSION_SECRET`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `NEXT_PUBLIC_APP_NAME`
6. **Deploy.** Vercel runs `prisma generate && next build` automatically.
7. **Verify:** open the live URL, log in as `admin@novaworks.example`, run the transcript flow once, then log in as a manager and an agent to confirm scoping.
8. No cross-origin configuration is needed — the frontend and API share one origin.

> **Note:** SQLite does not persist on serverless platforms. A hosted PostgreSQL database is required for a working live link.

---

## Known Limitations

- Projects and tasks cannot be edited or deleted from the UI after creation (a reset endpoint clears generated data).
- Very long transcripts may hit the 12-second AI timeout and return a retryable error.
- Free Gemini tiers are rate-limited; a `429` surfaces as a clear retry message rather than a partial save.
- No pagination — the UI is designed for demo-scale datasets.
- Signup, email verification, password reset, and user management are intentionally absent (out of scope).
- If `GEMINI_MODEL` is unavailable in your region, switch to `gemini-2.0-flash` or route through OpenRouter.

---

## Submission Summary

- **Source repository:** `[GITHUB URL]`
- **Live link or local demo video:** `[URL]`
- **Setup and seed commands:** `npm install` → `npx prisma migrate dev --name init` → `npm run db:seed` → `npm run dev`
- **Demo login accounts:** confirmed working — `admin@novaworks.example` / `Demo123!` (all 10 accounts use `Demo123!`)
- **Features completed:**
  - Simple login/logout with 10 seeded demo accounts
  - Admin transcript-to-project AI automation (Gemini, structured JSON, 3 projects / 12 tasks / 124 hours)
  - Two-stage validation (Zod shape + semantic directory + deadline rules) with all-or-nothing transactional save
  - Role-scoped dashboards for Admin, Manager, and Agent — enforced in data requests
  - Project detail with full task breakdown (owner, deadline, estimated hours)
  - Agent "My Tasks" view across projects
  - Read-only team directory
  - Persistent SQLite/PostgreSQL storage
  - Modern, animated, minimal dark UI with framer-motion

---

**Build. Demo. Explain.**