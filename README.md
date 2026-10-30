# CreatorOS

The AI operating system for creators: one place for a creator's inbox, brand deals, content, calendar and analytics.

```
Next.js UI (frontend/)  ──sign in──▶  Supabase Auth
        │                                   │
        │  Authorization: Bearer <Supabase access token>
        ▼                                   │
Express API (backend/)  ◀── verifies token ─┘
        │
        │  Prisma Client (db/)
        ▼
Neon PostgreSQL
```

| Folder | What it is |
|---|---|
| `frontend/` | Next.js 16 app: the marketing site (prerendered Framer pages), the plain-HTML auth pages and the `/dashboard` workspace. |
| `backend/` | Node.js + Express 5 + TypeScript REST API. Verifies Supabase tokens, validates with Zod, and reads and writes through Prisma. |
| `db/` | Prisma 7 schema, migrations and the shared Prisma Client (PostgreSQL through `@prisma/adapter-pg`). |

The workspace is a pnpm monorepo (`pnpm-workspace.yaml`). The backend imports the client from the `db` package; the frontend imports the API's JSON types (`backend/src/types/api.ts`) as types only, so the contract is checked at compile time on both sides.

## Getting started

You need Node.js 22 and pnpm 10 (`corepack enable` gives you the pinned version).

### 1. Create the services

- **Neon**: create a project and a database. From **Connect**, copy the *pooled* connection string (host contains `-pooler`) and the *direct* one.
- **Supabase**: create a project. Only its Auth is used; the app's data lives in Neon.
  - **Authentication › Providers**: Email is on by default. To offer Google, enable it and paste the client ID and secret from Google Cloud (its authorized redirect URI is `https://<project>.supabase.co/auth/v1/callback`).
  - **Authentication › URL Configuration**: set **Site URL** to the frontend's origin and add these **Redirect URLs**: `<origin>/auth/confirm` and `<origin>/auth/google/callback` (for local development, `http://localhost:3000/...`).
  - **Project settings › API**: copy the project URL and the anon (publishable) key. The service-role key is never needed.

### 2. Environment files

Copy each `.env.example` and fill it in. Real values never go into git (`.env*` is ignored).

| File | Variables |
|---|---|
| `db/.env` | `DATABASE_URL` (pooled), `DIRECT_URL` (direct, used by migrations) |
| `backend/.env` | `NODE_ENV`, `PORT`, `CORS_ORIGIN`, `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` |
| `frontend/.env.local` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`, optional `APP_URL` |

The API checks its variables at start-up and exits with a list of anything missing.

### 3. Install, migrate, run

```bash
pnpm install        # also generates the Prisma Client (db's postinstall)
pnpm db:migrate     # prisma migrate dev: applies db/prisma/migrations to Neon
pnpm dev            # frontend on :3000 and the API on :4000
```

Other scripts, from the repo root:

| Command | Does |
|---|---|
| `pnpm db:generate` | Regenerate the Prisma Client after editing `schema.prisma`. In Prisma 7, `migrate dev` no longer does this for you. |
| `pnpm db:deploy` | Apply pending migrations without prompting (production and CI). |
| `pnpm db:studio` | Open Prisma Studio. |
| `pnpm typecheck` | Type-check all three packages. |
| `pnpm build` | Build `db`, then `backend` (to `backend/dist`), then `frontend`. |

## How sign-in works

- The auth pages stay plain HTML. Their forms post to Next.js route handlers in `frontend/app/auth/*`, which call Supabase Auth through `@supabase/ssr`: sign-up, password sign-in, Google (PKCE), forgot and reset password, and email links (`/auth/confirm`).
- The Supabase session lives in Supabase's own cookies. `frontend/proxy.ts` refreshes it on every `/dashboard` request and sends signed-out visitors to sign-in.
- In the browser, `frontend/app/dashboard/_shell/api.ts` reads the access token from that session and sends it to the API as `Authorization: Bearer <token>`.
- The API's `requireAuth` middleware verifies the token with `supabase.auth.getClaims()`. With Supabase's asymmetric signing keys this checks the signature against the project's JWKS locally; older projects with a shared secret are checked against the Auth server. The user's id (`sub`) goes on `res.locals.userId`.
- Every query is scoped by that id. A user id sent in a body or URL is never trusted, and other users' rows answer `404`.
- No passwords, sessions or tokens are stored in Neon. `Profile.id` *is* the Supabase user id; the profile holds only the app's own settings.

New accounts go through onboarding, which saves the creator's choices and fills the workspace with a sample creator's inbox, deals, clips and stats. That sample is real rows in the account's own tables, so every screen works end to end before Gmail, Calendar and YouTube are connected. **Settings › Plan and account › Reset** deletes it all and starts onboarding again.

## Data model

All tables hang off `Profile` and cascade when it is deleted.

| Model | Holds |
|---|---|
| `Profile` | Supabase user id and email, name, channel, niche, goals, briefing, reply and notification settings, `onboardedAt` |
| `ConnectedAccount` | One row per provider (Gmail, Calendar, YouTube, Instagram, TikTok) and its status |
| `Message`, `MessageDraft` | The sorted inbox: category, sender, body, summary, one drafted reply per tone, plus the creator's tone, edit, read, archived and approved state |
| `Deal`, `DealTerm`, `DealRisk`, `Deliverable` | The pipeline: stage, fee, Deal Health parts, invoice and reminder, extracted terms, risks and deliverables |
| `Todo`, `Idea` | Today's to-do list and ideas (an idea added to today links to its to-do) |
| `CalendarEvent` | Filming blocks, calls and other events. Deal deadlines and posts are shown from `Deal` and `ScheduledPost`, not copied. |
| `Video`, `TranscriptLine`, `Clip`, `ClipCaption`, `ScheduledPost` | Publish: the video, transcript, clips (current and suggested range), caption options and edits, scheduled posts |
| `Alert` | Notifications and their read state |
| `ChannelDay`, `ContentPost` | Analytics: daily views and followers per channel, and top posts. Brand income is summed from paid and invoiced `Deal`s. |

## API

Every route except `/health` needs a Supabase access token. Responses look like:

```json
{ "success": true, "message": "Deals fetched", "data": [] }
{ "success": true, "message": "Messages fetched", "data": [], "pagination": { "page": 1, "limit": 50, "total": 7, "totalPages": 1 } }
{ "success": false, "message": "Some fields are missing or invalid", "error": "VALIDATION_ERROR", "details": [{ "path": "tone", "message": "Invalid option" }] }
```

| Method and path | Purpose |
|---|---|
| `GET /health` | Liveness check |
| `GET /api/profile` | The profile, settings and accounts (created on the first call) |
| `PATCH /api/profile` | Change settings |
| `PUT /api/profile/accounts/:provider` | Set an account's status |
| `POST /api/profile/onboarding` | Finish onboarding (and fill the sample workspace) |
| `POST /api/workspace/sample` | Add the sample workspace to an empty account |
| `DELETE /api/workspace` | Delete all workspace data and restart onboarding |
| `GET /api/summary` | Minutes saved this week |
| `GET /api/messages?category&q&archived&page&limit` | The inbox, paginated |
| `PATCH /api/messages/:id` | Read, archive, tone, ask for a draft, edit the reply |
| `POST /api/messages/approve` | Approve one or more replies |
| `GET /api/deals?stage` · `GET /api/deals/:slug` | Deals with terms, risks and deliverables |
| `POST /api/deals` | Add a deal from contract terms (scored on the server) |
| `PATCH /api/deals/:slug` | Add to calendar, change stage |
| `PATCH /api/deals/:slug/deliverables/:deliverableId` | Tick a deliverable |
| `GET/POST /api/todos` · `PATCH/DELETE /api/todos/:id` | Today's to-do list |
| `GET/POST /api/ideas` | Ideas |
| `GET /api/events?from&to` · `POST /api/events` · `PATCH/DELETE /api/events/:id` | Calendar events |
| `GET /api/videos?page&limit` | Videos with transcript, clips, captions and posts |
| `PATCH /api/clips/:id` | Trim, skip, hashtags |
| `PATCH /api/clips/:id/captions/:platform` | Pick a caption option or save an edit |
| `POST /api/clips/:id/schedule` | Schedule a clip's posts |
| `GET /api/posts?from&to` | Scheduled posts |
| `GET /api/alerts` · `POST /api/alerts/read` | Notifications |
| `GET /api/analytics?range=7\|30\|90` | Daily stats, top posts, brand income |
| `POST /api/copilot` | Answer a question from the workspace's data |

**Security.** The API uses Helmet headers and a CORS allow-list (`CORS_ORIGIN`). JSON bodies are capped at 100 kB. There is a per-IP rate limit, plus a tighter one on Copilot. Zod validates every body, query and route param, and unknown keys are rejected. Errors are answered by one central handler: Prisma's not-found, unique and foreign-key errors become 404, 409 and 400, and anything unexpected is logged and returned as a generic 500, with no SQL, stack traces or connection details.

## Deploying

- **Database**: run `pnpm db:deploy` (with `DIRECT_URL` set) whenever migrations change.
- **API** (Render, Railway, Fly or any Node host): build with `pnpm install --frozen-lockfile && pnpm --filter db build && pnpm --filter backend build`, then start with `node backend/dist/index.js`. Set the `backend/.env` variables in the host, with `NODE_ENV=production` and `CORS_ORIGIN` set to the site's origin.
- **Frontend** (Vercel): set the project's **Root Directory** to `frontend` (the app moved there from the repo root), keep pnpm as the package manager, and set the `frontend/.env.local` variables, with `NEXT_PUBLIC_API_URL` pointing at the deployed API.

## Still to come

These parts of the product still behave as a demo, and the screens say so where it matters:

- Gmail, Google Calendar and YouTube aren't connected yet. "Connect" in Settings and onboarding only records the status, and the data is the sample workspace.
- Video upload and transcription in Publish, and contract reading in Deals, are simulated in the browser. The terms the creator reviews are saved and scored for real.
- "Regenerate" on drafts and captions picks the next written option; there is no AI model call yet. The plan is Gemini, with Groq as a fallback.
- Emails (the morning briefing) are previewed but not sent. Password-reset and confirmation emails are sent by Supabase.
- The workspace's "today" is fixed at Wed 28 Oct 2026 to match the sample data. The format and posting-time benchmarks in Analytics are fixed values.
