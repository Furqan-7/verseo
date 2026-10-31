# CreatorOS

The AI operating system for creators: one place for a creator's inbox, brand deals, content, calendar and analytics.

```
Next.js UI (frontend/) ──sign in──▶ Supabase Auth
        │                                │
        │ Authorization: Bearer <access token>
        ▼                                │
Express API (backend/) ◀── verifies ─────┘
   │      │        │
   │      │        └─▶ Gemini (Groq fallback): drafts, sorting, captions, contracts, Copilot, embeddings
   │      └──────────▶ Google: Gmail, Calendar, YouTube · Resend: email · Supabase Storage: uploads
   │ Prisma (db/)
   ▼
Neon PostgreSQL + pgvector  ◀── worker: syncs, alerts, briefings, publishing, embeddings
```

| Folder | What it is |
|---|---|
| `frontend/` | Next.js 16: the marketing site (prerendered Framer pages), the plain-HTML auth pages and the `/dashboard` workspace. |
| `backend/` | Express 5 + TypeScript REST API and the background worker. |
| `db/` | Prisma 7 schema, migrations and the shared Prisma Client. |

A pnpm monorepo. The backend imports the client from `db`; the frontend imports the API's JSON types (`backend/src/types/api.ts`) as types only, so both sides are checked against one contract.

## Going live: what you need to do

Everything below is done once, by you, in web dashboards. Each step says where to click and what to copy. Steps 1–3 and 7–8 are needed to run the app at all. Steps 4–6 each switch on one feature, so skip any you don't want yet: the app tells users what isn't set up instead of pretending.

### 1. Neon (the database)

1. Sign up at [neon.tech](https://neon.tech) → **New project** (any name, the region nearest your users, Postgres 16 or newer).
2. On the project dashboard click **Connect**. Copy two connection strings:
   - with **Connection pooling** on: this is `DATABASE_URL` (its host contains `-pooler`);
   - with it off: this is `DIRECT_URL`.
3. Nothing else is needed. The migrations turn on `pgvector` themselves.

### 2. Supabase (sign-in)

1. Sign up at [supabase.com](https://supabase.com) → **New project**. Only its Auth and Storage are used; the app's data lives in Neon.
2. **Project settings → API keys**: copy the **Project URL**, the **anon / publishable** key, and the **service_role / secret** key. The secret key is only for the backend, never the frontend.
3. **Authentication → URL Configuration**:
   - **Site URL**: your site's address, for example `https://creatoros.vercel.app`.
   - **Redirect URLs**: add `https://<your site>/auth/confirm` and `https://<your site>/auth/google/callback`. For local development, also add `http://localhost:3000/auth/confirm` and `http://localhost:3000/auth/google/callback`.
4. **Authentication → Sign In / Providers → Email**: leave it on. "Confirm email" on is safer: new users click a link before they can sign in.
5. Optional, "Continue with Google" on the sign-in page: **Providers → Google** → on. Paste a Google OAuth client ID and secret (you make them in step 5). The redirect URI Google needs for this is shown on that same Supabase screen: `https://<project>.supabase.co/auth/v1/callback`.
6. Supabase's built-in email is rate-limited (a few emails an hour). For real users, set **Authentication → Emails → SMTP settings** to your email provider; Resend works (see step 6).

### 3. Env files and the first run (your computer)

```bash
cp db/.env.example db/.env                       # DATABASE_URL, DIRECT_URL from Neon
cp backend/.env.example backend/.env             # Neon + Supabase, and any optional keys
cp frontend/.env.example frontend/.env.local     # Supabase URL + anon key, NEXT_PUBLIC_API_URL
pnpm install
pnpm db:migrate      # creates the tables in Neon
pnpm dev             # site on http://localhost:3000, API on http://localhost:4000
```

Sign up at `http://localhost:3000/auth/signup`. Onboarding fills your new workspace with a sample creator's data, so every screen has something on it, and dates move to your today. **Settings → Plan and account → Reset** clears it.

### 4. Gemini and Groq (AI): optional, recommended

- Gemini: [aistudio.google.com/apikey](https://aistudio.google.com/apikey) → **Create API key** → `GEMINI_API_KEY`. This one key powers reply drafts, message sorting, captions, contract reading, video transcription, Copilot and search embeddings.
- Groq: [console.groq.com/keys](https://console.groq.com/keys) → **Create API key** → `GROQ_API_KEY`. Groq takes over text tasks when Gemini fails. It can't read files or make embeddings.
- Without either key: Copilot still answers its four suggested questions from your data, and sorting new mail uses keyword rules. Drafting, captions and contract reading say AI isn't set up.

### 5. Google Cloud (Gmail, Calendar, YouTube): optional

1. [console.cloud.google.com](https://console.cloud.google.com) → create a project.
2. **APIs & Services → Library**: enable **Gmail API**, **Google Calendar API**, **YouTube Data API v3** and **YouTube Analytics API**.
3. **APIs & Services → OAuth consent screen**: pick **External**, fill in the app name, support email and your site, and add the scopes `gmail.readonly`, `gmail.compose`, `calendar.events`, `youtube.readonly`, `yt-analytics.readonly`, `youtube.force-ssl` and `youtube.upload`. While the app is in **Testing**, add yourself (and anyone testing) under **Test users**.
4. **Credentials → Create credentials → OAuth client ID → Web application**:
   - **Authorized redirect URIs**: `https://<your API>/integrations/google/callback`, plus `http://localhost:4000/integrations/google/callback` for local use. If you want Google sign-in (step 2.5), also add Supabase's `https://<project>.supabase.co/auth/v1/callback`.
   - Copy the client ID and secret → `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
5. Make the token key: `openssl rand -base64 32` → `TOKEN_ENCRYPTION_KEY`. Keep it safe: changing it later means everyone has to reconnect Google.
6. **Before real users**: Gmail's scopes are "restricted", so Google must verify the app (**OAuth consent screen → Publish app**), and that includes a security assessment. Until then, only the test users you listed can connect. Videos uploaded through the API by an unverified app are locked to private.

### 6. Resend (the morning email): optional

[resend.com](https://resend.com) → **Domains → Add domain**, then add the DNS records it shows at your domain host. **API keys → Create** → `RESEND_API_KEY`. Set `EMAIL_FROM` to an address on that domain, like `CreatorOS <briefing@yourdomain.com>`.

### 7. Deploy the API (Render)

1. [render.com](https://render.com) → **New → Blueprint** → choose this repo. It reads `render.yaml`: one web service that also runs the worker. The build installs dev dependencies on purpose, migrations run before each deploy, and the health check is `/health`.
2. Fill in the variables it asks for: the same values as `backend/.env`, plus `DIRECT_URL`. Set:
   - `APP_URL` to the site's address;
   - `API_URL` to this service's own address (`https://creatoros-api.onrender.com`);
   - `CORS_ORIGIN` to the site's address.
3. Use a paid instance. A free one sleeps when idle, which stops syncs, alerts and briefings.
4. Uploads (Supabase Storage, which needs `SUPABASE_SERVICE_ROLE_KEY`): the free Supabase plan caps files at 50 MB. Raise **Storage → Settings → Upload file size limit** on a paid plan for longer videos (the app allows up to 2 GB).
5. Railway or Fly work too. Build with `pnpm install --frozen-lockfile --prod=false && pnpm --filter db build && pnpm --filter backend build`, run `pnpm db:deploy` before starting, and start with `node backend/dist/index.js`.

### 8. Deploy the site (Vercel)

1. **Settings → Build and Deployment → Root Directory**: `frontend`, with "Include files outside the root directory" on.
2. **Settings → Environment Variables**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL` (the Render address) and, optionally, `APP_URL`.
3. Deploy. Merge this branch into `main` after the Root Directory change, or production builds fail: the app moved into `frontend/`.

### 9. Check it works

- Sign up, confirm the email, finish onboarding.
- **Settings → Connected accounts → Connect** Gmail: your recent inbox mail appears in Inbox within a minute, sorted.
- **Approve** a reply on a real Gmail message, then open Gmail: it's in **Drafts**, in the same thread.
- **Settings → Daily briefing → Preview** shows your own data. The email arrives at your briefing time.
- Render's logs show one JSON line per request, with an `X-Request-Id` that matches the response header.

## How it works

**Sign-in.** The auth pages are plain HTML. Their forms post to Next.js route handlers, which call Supabase Auth through `@supabase/ssr`. `frontend/proxy.ts` refreshes the session on every `/dashboard` request. The browser sends Supabase's access token to the API, which verifies it with `getClaims()`: against the project's JWKS for asymmetric keys, or the Auth server for older shared-secret projects. The user is always taken from the token, never from the request, and every query is scoped to that user.

**AI.** `backend/src/lib/ai.ts` calls Gemini over REST and falls back to Groq. JSON answers are checked with Zod and retried once when they don't match. Copilot is a tool-calling loop: its tools are queries over the creator's own deals, invoices, deadlines, ideas and inbox, plus `search_workspace`.

**RAG.** Messages, approved replies, contracts and video transcripts are split into chunks (`Chunk`). The worker adds a Gemini embedding to each (`vector(768)`, pgvector). Search runs a vector query and a Postgres full-text query over the creator's own chunks and merges them with reciprocal rank fusion. Exact words like invoice numbers still match, and search works before embeddings exist. Drafts use the creator's past replies to match their voice.

**Integrations.** Google OAuth with a signed, 10-minute state. Refresh tokens are stored encrypted (AES-256-GCM).
- **Gmail:** sync every 10 minutes. New mail is sorted, linked to a deal by brand, indexed, and drafted when Settings allow it. An approved reply becomes a threaded Gmail draft; CreatorOS never sends mail.
- **Calendar:** syncs both ways every 15 minutes. Google events come in; CreatorOS events, deal deadlines and scheduled posts go out, tagged so they don't come back twice.
- **YouTube:** every 6 hours. Daily stats and the latest 50 videos feed Analytics, and new comments go to the Inbox. An approved reply is posted under the comment.
- **Instagram:** a CSV import, because Meta has no API for personal creator accounts.

**Publishing.** At a post's time, the worker cuts the clip with ffmpeg and stores it. A YouTube Short is uploaded through the YouTube API. Instagram and TikTok only allow posting through apps they've approved, so those posts are marked **ready to post**: the clip is cut and captioned, and the creator downloads it from Publish.

**Jobs.** A Postgres-backed queue (`Job`, `FOR UPDATE SKIP LOCKED`) with retries and backoff. A scheduler queues due work every minute. It runs inside the API (`RUN_WORKER=true`) or alone (`pnpm --filter backend start:worker`).

**Dates.** Each profile has an IANA time zone. "Today", deadlines, the briefing time and "this week" are worked out in it.

## Commands

| Command | Does |
|---|---|
| `pnpm dev` | Frontend on :3000 and the API (with the worker) on :4000 |
| `pnpm db:migrate` | `prisma migrate dev`: create and apply migrations in development |
| `pnpm db:deploy` | Apply pending migrations (production, CI) |
| `pnpm db:generate` | Regenerate the Prisma Client. Prisma 7's `migrate dev` no longer does it. |
| `pnpm typecheck` | Type-check all three packages and the tests |
| `pnpm --filter backend test` | The backend tests. They need `TEST_DATABASE_URL`: a throwaway Postgres with pgvector, see `backend/.env.test.example`. |
| `pnpm build` | Build `db`, `backend` and `frontend` |

CI (`.github/workflows/ci.yml`) runs migrations, type checks, the tests and the build on every push.

## API

Every route except `/health` and the Google OAuth callback needs a Supabase access token. Responses are `{ success, message, data }` (lists add `pagination`); errors are `{ success: false, message, error, details? }`.

| Area | Routes |
|---|---|
| Profile | `GET/PATCH /api/profile` · `PUT /api/profile/accounts/:provider` · `POST /api/profile/onboarding` · `POST /api/workspace/sample` · `DELETE /api/workspace` · `DELETE /api/account` |
| Inbox | `GET /api/messages` · `PATCH /api/messages/:id` · `POST /api/messages/:id/drafts` (AI) · `POST /api/messages/approve` |
| Deals | `GET/POST /api/deals` · `GET/PATCH /api/deals/:slug` · `PATCH /api/deals/:slug/deliverables/:id` · `POST /api/contracts/read` (PDF upload) |
| Today | `GET/POST /api/todos` · `PATCH/DELETE /api/todos/:id` · `GET/POST /api/ideas` · `GET /api/summary` |
| Calendar | `GET/POST /api/events` · `PATCH/DELETE /api/events/:id` |
| Publish | `GET /api/videos` · `POST /api/videos/uploads` · `POST /api/videos/:id/process` · `GET /api/videos/:id` · `PATCH /api/clips/:id` · `PATCH /api/clips/:id/captions/:platform` · `POST /api/clips/:id/captions/:platform/rewrite` (AI) · `POST /api/clips/:id/schedule` · `GET /api/posts` · `GET /api/posts/:id/download` |
| Integrations | `GET /api/integrations/google/:provider/connect` · `GET /integrations/google/callback` · `POST /api/integrations/:provider/sync` · `DELETE /api/integrations/:provider` · `POST /api/integrations/instagram/import` |
| Other | `GET /api/alerts` · `POST /api/alerts/read` · `GET /api/analytics` · `POST /api/copilot` · `GET /api/briefing/preview` · `GET /health` |

**Security.**
- **Headers and origins:** Helmet headers and a CORS allow-list.
- **Request IDs and logs:** every request gets an ID, and logs are structured JSON without tokens or bodies.
- **Limits:** a 100 kB body limit (3 MB for the CSV import, 15 MB for contracts, which are held in memory only). There's a per-IP rate limit, plus per-user limits on AI calls and uploads.
- **Validation:** Zod checks every input, and unknown keys are rejected.
- **Errors:** one central error handler. Prisma errors map to 404, 409 or 400, "not set up" is a 503 with a clear code, and anything unexpected is a generic 500 with the details only in the log.
- **Secrets:** the service-role key, the Google secrets and the token key stay on the server.

## What's still limited

- **Gmail at scale** needs Google's app verification (step 5.6). Until then, only listed test users can connect.
- **Instagram and TikTok posting** is manual: they don't let unapproved apps post. Applying for Meta's Instagram Graph API and TikTok's Content Posting API would allow automatic posting later.
- **Long videos:** Gemini can watch up to about an hour of video per request, and the free Supabase plan caps uploads at 50 MB.
- **Analytics benchmarks:** the format and posting-time charts in Analytics are fixed benchmarks. The daily stats and top posts are real once YouTube is connected or a CSV is imported.
