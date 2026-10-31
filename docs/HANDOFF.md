# CreatorOS: handoff for a new chat

> **To the next Claude:** read this document and the root `README.md` (its "Going live" section is the setup guide) before changing anything. Confirm with the user which step to do next. Everything under "Done" is committed and pushed; don't rebuild it.

## 1. Snapshot

| | |
|---|---|
| **Repo** | `Furqan-7/verseo` |
| **Working branch** | `ccr-72183a31-hjsl8f`. The head is `4652603`. |
| **`main`** | Still at `da8d09a`, the old single-app layout. **Don't merge** until the user has set Vercel's Root Directory to `frontend` (see §8). The user previously asked for pushes to both the branch and `main`; since the move into `frontend/` we push to the branch only, for that reason. |
| **Commit author** | The local git config is `Furqan-7 <bodarnifurqan07@gmail.com>`. Keep it. |
| **Commit trailer** | End messages with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` and the `Claude-Session:` line. |
| **What it is** | CreatorOS, the "AI operating system for creators". A hackathon project that brings a creator's inbox, brand deals, Publish (video clips), calendar and analytics into one place. |
| **Commits since the frontend-only version** | `3f774ef` Express API and Prisma, with the frontend connected. `8bf31bf` AI, RAG, Google integrations, uploads and jobs. `4652603` the Neon agent skills in `.claude/skills` and `skills-lock.json`. |

## 2. Architecture

```
frontend/  Next.js 16.4 App Router (React 19). Marketing pages = prerendered Framer HTML via route handlers;
           auth pages = plain HTML (src/auth/pages.ts); /dashboard = React workspace.
backend/   Express 5 + TypeScript (CommonJS output, tsconfig module/moduleResolution "node16").
           REST API under /api + background worker (in-process when RUN_WORKER=true, or src/worker.ts).
db/        Prisma 7.10.1 ("prisma-client" generator, output db/generated/prisma, moduleFormat cjs),
           @prisma/adapter-pg, exports { prisma, ...enums/types }. Neon Postgres + pgvector.
```

- **Monorepo:** pnpm workspaces (`pnpm-workspace.yaml`, with `onlyBuiltDependencies` including `ffmpeg-static`). pnpm is 10.28.0 and Node 22.
- **Auth:** Supabase Auth through `@supabase/ssr` in the Next route handlers.
  - `frontend/proxy.ts` (Next 16's replacement for middleware) refreshes the session on `/dashboard/*`.
  - The browser sends the Supabase access token as `Authorization: Bearer` to the API.
  - `backend/src/middleware/auth.ts` verifies it with `supabase.auth.getClaims(token)`, then sets `res.locals.userId`, `email` and `name`.
  - `Profile.id` is the Supabase user id (a uuid). No passwords or sessions are stored.
- **Shared contract:** `backend/src/types/api.ts` holds the DTO types only, with no runtime imports. The frontend imports it as `import type … from "@api-types"`, a tsconfig path alias to `../backend/src/types/api.ts`.
- **Response shape:** `{ success, message, data }`; lists add `pagination`; errors are `{ success:false, message, error: CODE, details? }`.
- **Request flow:** route → `requireAuth` → `validate({body,query,params})` (Zod 4, `.strict()`, parsed query in `res.locals.query`) → controller → service → Prisma. All errors go through `middleware/error.ts`.
- **Frontend data layer:**
  - `app/dashboard/_shell/api.ts` is the fetch client.
  - `_shell/model.ts` maps API objects to view types, and settings to and from the profile.
  - `_shell/AppShell.tsx` loads the whole workspace once, sends onboarding-less users to onboarding, and applies changes optimistically. Saves go through a serialized queue (`save(() => api.x(), touched, onSaved)`) and reload on failure. Profile saves are debounced by 500 ms.
- **Dates:** each profile has an IANA `timezone`.
  - Backend: `utils/dates.ts` (`todayIn`, `minutesNowIn`, `zonedToUtc`, `weekStartIso`) and `services/clock.service.ts`.
  - Frontend: `data.ts` exports a live `let TODAY_ISO`, set by `setWorkspaceClock(tz)` in AppShell after the profile loads, plus `nowMinutes()` and `localParts()`.

### Backend layout (`backend/src`)

| Folder | Contents |
|---|---|
| `config/` | `env.ts`: Zod-validated env and `features` flags (`ai`, `embeddings`, `google`, `storage`, `email`) |
| `lib/` | `ai.ts` (Gemini REST, falling back to Groq; `generateText`, `generateJson`, `runWithTools`, `embed`, `uploadGeminiFile`), `google.ts` (OAuth, scopes, token refresh, `googleFetch`, `revoke`), `storage.ts` (Supabase Storage admin: signed upload/download, `removePrefix`), `email.ts` (Resend), `ffmpeg.ts` (`probe`, `cutClip`), `supabase.ts` |
| `middleware/` | `auth`, `validate`, `error`, `limits` (per-user `aiLimit`, `uploadLimit`), `requestLog` (X-Request-Id, JSON access log) |
| `jobs/` | `queue.ts` (Postgres queue, `FOR UPDATE SKIP LOCKED`, backoff, `requeueStale`, `pruneFinished`), `handlers.ts` (job types), `scheduler.ts` (`tick()` every minute, `startBackground()`) |
| `services/` | profile, workspace (seed and reset), `sample.data` + `sample.localize` (the sample workspace and date shifting), messages, `drafts` (AI drafts and triage), `inbox.ingest`, deals, `dealHealth`, contracts, today, events, publish (clips, captions, rewrite), `videos` (upload and processing), `publishing` (posting scheduled clips), alerts, `alerts.job`, analytics, `briefing`, copilot, rag, summary, account, mappers, clock; `integrations/` holds gmail, calendar, youtube, instagram and the integrations service |
| `email/` | `briefing.ts`: the HTML/text template, moved from the frontend |
| `utils/` | `AppError`, `response`, `dates`, `crypto` (AES-256-GCM `encrypt`/`decrypt`, HMAC `sign`/`verify`), `logger` |
| other | `routes/*`, `controllers/*`, `schemas/*` (Zod), `types/api.ts` and `express.d.ts`, `index.ts` (server plus optional worker), `worker.ts` |

### Database (`db/prisma/schema.prisma`, migrations `20261030081542_init` and `20261030120000_ai_rag_integrations_jobs`)

- **Models:**
  - People and connections: `Profile` (with settings, `timezone`, `briefingSentOn`), `ConnectedAccount` (status, `externalId`, `syncCursor`, `syncedAt`, `lastError`), `GoogleConnection` (encrypted tokens, scopes).
  - Inbox: `Message` (with `externalId`, `threadId`, `replyExternalId`; unique on `[profileId, source, externalId]`), `MessageDraft`.
  - Deals: `Deal`, `DealTerm`, `DealRisk`, `Deliverable` (`googleEventId`).
  - Today and calendar: `Todo`, `Idea`, `CalendarEvent` (`source` creatoros or google, `googleEventId`).
  - Publish: `Video` (`status`, `storagePath`), `TranscriptLine`, `Clip` (`suggestedStartSec`/`EndSec`), `ClipCaption`, `ScheduledPost` (`status`: scheduled, publishing, published, needs_manual or failed; `clipPath`, `externalUrl`).
  - Alerts and analytics: `Alert` (`dedupeKey`), `ChannelDay`, `ContentPost` (`externalId`).
  - Search and jobs: `Document`, `Chunk` (`embedding Unsupported("vector(768)")`), `Job`.
- **Extension:** `previewFeatures = ["postgresqlExtensions"]`, `extensions = [vector]`.
- **Raw SQL** is used only where Prisma can't express it: vector reads and writes and search, and the job claim with `SKIP LOCKED`.

## 3. Features: current implementation state

| Feature | State |
|---|---|
| Supabase auth (sign-up, sign-in, Google sign-in, forgot and reset, email confirm) | Done. Routes: `app/auth/{session,register,google,google/callback,forgot,confirm,reset,signout}`. |
| Every dashboard screen on the API | Done. State persists across reloads. |
| Sample workspace | Seeded at onboarding as the user's own rows, with dates shifted to the user's today. Text tokens like `{{2026-10-30:F}}` are rendered by `sample.localize.ts`. |
| AI | Drafts (`POST /api/messages/:id/drafts`), triage of synced mail, caption rewrite, contract read (`POST /api/contracts/read`, multer, `unpdf`; scans go to Gemini), Copilot with tools and history. |
| RAG | Indexing on seed, ingest, approve, contract and transcript. The `rag.embed` job; hybrid search with reciprocal rank fusion. |
| Gmail | Sync every 10 minutes, ingest, approved reply → `gmail.draft` job (a threaded draft). |
| Calendar | Two-way sync every 15 minutes, including deal deliverables and scheduled posts. |
| YouTube | Every 6 hours: stats → `ChannelDay`, uploads → `ContentPost`, comments → Inbox; approved reply → `youtube.reply` job. |
| Instagram | CSV import (`POST /api/integrations/instagram/import`). |
| Uploads | Signed Storage upload → `POST /api/videos/:id/process` → `video.process` job (ffmpeg probe, then Gemini Files API transcript and clips). |
| Publishing | `post.publish` job: ffmpeg cut → Storage → YouTube Shorts upload. Reel and TikTok become `needs_manual` with an alert and a download link (`GET /api/posts/:id/download`). |
| Jobs and scheduler | Syncs, hourly alerts (overdue, deadline tomorrow, weekly on Sunday), briefing email at the local briefing time (Resend), due posts, embeddings. |
| Account | `DELETE /api/account` (storage, Google revoke, profile cascade, Supabase admin delete). `DELETE /api/workspace` resets. |
| Hardening | Request ids, JSON logs, CI (`.github/workflows/ci.yml` with `pgvector/pgvector:pg16`), `render.yaml`, README setup guide. |
| Tests | 43 passing (`backend/test`: unit, api, integrations, jobs, media). `node --import tsx --test`, `TEST_DATABASE_URL` required. A fake network intercepts `globalThis.fetch` for non-localhost hosts (`test/helpers/setup.ts`) and signs ES256 Supabase tokens served from a fake JWKS. |
| Verified | `pnpm typecheck`, `pnpm build`, 43/43 tests. Playwright: the full sign-up → screens → reload → sign-out flow, honest "not set up" messages, no horizontal overflow at 1440, 1024 and 390px. |

**Not verified with real services.** Gemini, Groq, Google, Resend and Supabase Storage were only exercised against fakes. Full video processing was tested in parts: real ffmpeg on a generated video, and the Gemini upload protocol against a fake.

## 4. Frontend files changed (beyond the move into `frontend/`)

| Area | Changes |
|---|---|
| `_shell/` | `api.ts`, `model.ts` (new); `AppShell.tsx`, `settings.ts`, `Notifications.tsx`, `states.tsx` (`ReconnectBanner` now shows only when `sync[id].lastError` is set), `session.ts`. |
| `data.ts` | Demo arrays removed; view types and helpers only. `suggestedSlot()` is now a function. |
| Screens | `Dashboard.tsx`, Inbox, Deals (plus `ContractUpload.tsx`, `contract.ts`), Calendar, Publish (`useVideoUpload`, `FirstUpload`, `PostStatus`), Analytics (and its `data.ts`), Settings (connect, disconnect, sync, CSV, time zone, delete account), Onboarding. |
| Auth | `src/auth/supabase.ts` (new); `src/auth/demo.ts` and `google.ts` deleted; `src/auth/pages.ts` (new "reset" page and notices). |
| Other | `app/dashboard/email/briefing/route.ts` (now proxies `GET /api/briefing/preview`), `proxy.ts`, `next.config.ts` (Turbopack and tracing root moved to the workspace root), `tsconfig.json` (the `@api-types` path), `package.json`. |

## 5. Known issues and limits

1. **Google verification.** Gmail's scopes are restricted, so Google must verify the app (including a security review) before real users can connect. Until then only listed test users can, and unverified YouTube uploads are private.
2. **Instagram and TikTok can't auto-post.** Those posts are `needs_manual` by design.
3. **Storage size.** Supabase's free plan caps files at 50 MB (the app allows up to 2 GB). Gemini handles about an hour of video.
4. **The sample vlog upload is still simulated** in the browser ("Use the sample vlog"). Real uploads need `SUPABASE_SERVICE_ROLE_KEY`.
5. **The contract preview duplicates the server's scoring.** `frontend/.../deals/contract.ts` `assess()` previews the score on screen; the authoritative score comes from `backend/src/services/dealHealth.ts`.
6. **Fixed Analytics charts.** "Best formats" and the posting-time heatmap are fixed benchmarks (`frontend/.../analytics/data.ts`).
7. **Render's free plan sleeps,** which stops the worker. Use a paid plan.
8. **The 404 status.** Unknown `/dashboard/*` pages return HTTP 200 (the streaming `notFound`). Carried over from before.
9. **Leftovers carried over:**
   - Landing: the hero headline isn't chosen, Annual pricing still has Verseo's values, and the hero image date is wrong.
   - Legal: the pages are drafts, and Terms still says "[Your Jurisdiction]".
   - Contact: the details are placeholders.
   - Cleanup: `!important` rules in the CSS modules, and the unused `frontend/creatoros/index.html`.

## 6. Errors hit and their causes

- **Vercel "No Next.js version detected".** The Root Directory was still the repo root after the move. Fix: Root Directory = `frontend`, with "Include files outside the root directory" on.
- **`prisma migrate dev` refused** to run non-interactively, and `migrate reset` is blocked for AI agents without explicit user consent. Don't fake consent. Workaround: create a new empty database, `migrate deploy`, then `prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script > <new migration>/migration.sql`, then deploy.
- **Prisma 7 specifics:**
  - `migrate dev` no longer runs `generate`: run `pnpm db:generate`.
  - The CLI's `datasource.url` lives in `db/prisma.config.ts` (it uses `DIRECT_URL`).
  - There's no `directUrl` field.
- **npm "latest" for `prisma` is an 8.0 release candidate.** Stay on 7.10.1.
- **`getClaims()` throws on malformed JWTs** rather than returning an error. Wrapped with `.catch` → 401.
- **Zod 4:** `z.record(enum, …)` requires every key. Use `z.partialRecord`.
- **`unpdf` is ESM-only** and the backend is CommonJS. Use `module: node16` and a dynamic `await import("unpdf")`. The tests' `tsconfig.test.json` uses `module: preserve` and `moduleResolution: bundler`.
- **Killing processes:** `pkill`, or patterns that appear in the shell's own command, kill the shell (exit 144). List PIDs from `/proc/*/cmdline` first, then `kill <pid>` in a separate command.
- **Old processes holding ports** (4000, 3100) gave stale behaviour after schema changes. Restart them after `prisma generate`.
- **The postgres user can't read the scratchpad.** Local Postgres data lives in `/var/tmp/creatoros-pg` (port 5433, socket `/tmp`). pgvector came from `apt-get install postgresql-16-pgvector`.
- **The rate limit tripped during tests.** It was raised to 3000 per 15 minutes per IP; one page load makes about 10 calls.
- **CSS modules:** a selector like `.app .x` in a screen's module doesn't hit the shell's `.app`. Use plain local classes.

## 7. Decisions already made (keep them)

- **AI providers:** Gemini, with Groq as the fallback. Plain `fetch`, no SDKs; models are configurable through env (`GEMINI_MODEL`, `GROQ_MODEL`, `GEMINI_EMBEDDING_MODEL`). Embeddings are Gemini-only at 768 dimensions and L2-normalised.
- **Honesty:** never fake output. A missing key → a 503 with a code (`AI_NOT_CONFIGURED`, `GOOGLE_NOT_CONFIGURED`, `STORAGE_NOT_CONFIGURED`, `EMAIL_NOT_CONFIGURED`); the UI says what isn't set up. Fallbacks are data-based only: Copilot's rule answers and keyword triage. Approve labels follow `delivery` (gmail_draft, youtube_reply or none).
- **Nothing is sent without approval.** Gmail gets drafts only. YouTube replies are posted only after approval.
- **RAG design:** exact cosine search per profile, with no HNSW index (Prisma can't describe one, so it would cause migration drift), plus full-text search and reciprocal rank fusion.
- **Jobs:** own Postgres queue, no Redis or pg-boss. Handlers must be idempotent; keys dedupe.
- **The sample workspace stays,** seeded as the user's own rows. Onboarding always sends `sampleWorkspace: true`.
- **Neon via `@prisma/adapter-pg`** with the pooled `DATABASE_URL`; migrations use `DIRECT_URL`.
- **Frontend:** auth and marketing pages stay plain HTML or Framer. No app-wide `app/layout.tsx`. Never restructure the Framer section TSX. No redesign of the dashboard.
- **Tests don't add test-only env vars to production code.** The network is faked by overriding `globalThis.fetch` in `test/helpers/setup.ts`.

## 8. Next steps

**User actions** (the README's "Going live" has the exact clicks):

1. Neon: project → `DATABASE_URL` (pooled) and `DIRECT_URL`.
2. Supabase: project → URL, anon key, service_role key. Add redirect URLs `<site>/auth/confirm` and `<site>/auth/google/callback`. Optionally set up SMTP.
3. Fill in `db/.env`, `backend/.env` and `frontend/.env.local`, then run `pnpm install`, `pnpm db:migrate`, `pnpm dev`.
4. Optional keys: Gemini and Groq; Google Cloud (4 APIs, OAuth client, redirect `<API_URL>/integrations/google/callback`, `TOKEN_ENCRYPTION_KEY`, test users, then verification); Resend with a verified domain.
5. Deploy the API on Render with `render.yaml` (paid plan).
6. Vercel: Root Directory `frontend`, plus the `NEXT_PUBLIC_*` env vars. **Then merge the branch to `main`** (fast-forward).

**Claude work, once the user has the services:**

1. Smoke-test with real keys:
   - Gemini drafts, contract read and Copilot;
   - Gmail connect → sync → approve → draft in Gmail;
   - Calendar and YouTube sync;
   - a real video upload and processing run;
   - the briefing email.

   Fix whatever the real APIs differ on.
2. Then decide with the user: the remaining landing leftovers (§5.9), automatic Instagram posting (Meta Graph API app review), real format and heatmap analytics from YouTube data, and a dashboard 404 that returns a real 404.

## 9. Do NOT redo

- The monorepo move, the Prisma schema and migrations, the Express API and its route list, Supabase auth, the frontend wiring, the AI, RAG, integrations, uploads, jobs, the date/time-zone work, the tests, CI, `render.yaml`, the README guide, and the Neon skills install. All of it is committed.
- Don't write a fresh "initial" migration or reset the user's database. Add new migrations with the diff workaround in §6.
- Don't switch to the npm "latest" Prisma (8.0 release candidate), to Supabase as the app database, or to custom JWT auth.
- Don't push to `main` before the Vercel Root Directory change.
