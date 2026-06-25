## Context

The app is a Create-T3 stack (Next.js 16 App Router, React 19, tRPC v11, Tailwind v4, zod v4, Biome, pnpm). Clerk auth is already wired (`@clerk/nextjs`, `ClerkProvider`, `clerkMiddleware` in `src/proxy.ts`). There is **no database** today — Clerk is the only source of truth for users. Env vars are validated through `@t3-oss/env-nextjs` in `src/env.ts`. A `pnpm tunnel` script already exists (ngrok via `NGROK_URL`/`PORT`) for exposing the local server publicly.

This change introduces the persistence layer and a webhook that keeps a local `User` table consistent with Clerk. The database is **Neon Postgres** (a Neon MCP is available in this environment to provision it). Prisma is on **v7**, which changed several conventions versus v5/6.

## Goals / Non-Goals

**Goals:**
- Stand up Prisma 7 with Neon Postgres via the `@prisma/adapter-pg` driver adapter.
- Own a `User` model keyed by `clerkId`, with an initial migration.
- A single Prisma client singleton exposed on the tRPC context (`ctx.db`).
- A signature-verified Clerk webhook performing full create/update/delete sync.
- Type-safe env vars and a webhook route that is reachable unauthenticated.

**Non-Goals:**
- No domain models beyond `User` (posts, settings, etc. come later).
- No backfill of users created before the webhook existed (can follow with a one-off script or `clerkClient` sync).
- No soft-delete / audit history — hard delete on `user.deleted`.
- No changes to the existing auth UI/flow.
- No connection pooler tuning beyond Neon's pooled connection string.

## Decisions

- **Prisma 7 with the `prisma-client` generator + driver adapter.** Prisma 7 removes the bundled query engine path in favor of driver adapters and moves connection config into `prisma.config.ts`. We use `provider = "prisma-client"` (the new TS generator), output the client to `src/generated/prisma`, and connect through `@prisma/adapter-pg` (`PrismaPg`) over `pg`. Rationale: this is the supported v7 path and works well on serverless Next.js. Alternative — the legacy `prisma-client-js` generator with the embedded engine — is deprecated in v7.

- **`prisma.config.ts` holds the datasource URL; `schema.prisma` does not.** Per v7, `datasource db` declares only `provider = "postgresql"`; `DATABASE_URL` is read in `prisma.config.ts` via `env("DATABASE_URL")` (with `dotenv/config`). Keeps secrets out of the schema and matches CLI expectations.

- **Generated client lives in `src/generated/prisma` and is gitignored.** Keeps the repo clean and avoids committing generated code; `prisma generate` runs in `postinstall`/before build. Import the singleton from `src/server/db.ts`, never the generated path directly in feature code.

- **Prisma singleton on tRPC context.** Add `src/server/db.ts` exporting a `db` guarded by a `globalThis` cache (avoids exhausting connections under Next.js HMR), instantiated with the `PrismaPg` adapter. Inject `db` into `createTRPCContext` in `src/server/api/trpc.ts` so procedures use `ctx.db`. Matches the standard T3 pattern and the existing tRPC structure.

- **Webhook via `verifyWebhook` from `@clerk/nextjs/webhooks`.** Route handler at `src/app/api/webhooks/clerk/route.ts` (POST). `verifyWebhook(req)` reads `CLERK_WEBHOOK_SIGNING_SECRET` automatically, validates the Svix signature, and returns a typed `WebhookEvent`. Rationale: first-party helper, no need to add `svix` manually or hand-parse headers. Narrow on `evt.type` for type-safe `evt.data`.

- **Full sync semantics.** `user.created` and `user.updated` → `prisma.user.upsert({ where: { clerkId } })` (idempotent, and upsert on update tolerates races/missing rows). `user.deleted` → `deleteMany({ where: { clerkId } })` (no-throw when absent). Primary email = `email_addresses.find(e => e.id === primary_email_address_id)?.email_address ?? email_addresses[0]?.email_address`. `name` = joined `first_name`/`last_name` trimmed to `null` when empty.

- **Public webhook route in middleware.** Add `"/api/webhooks(.*)"` to `createRouteMatcher` public list in `src/proxy.ts` so `auth.protect()` is skipped; otherwise Clerk gets a 401/redirect and retries forever.

- **Env additions.** `DATABASE_URL` (server) and `CLERK_WEBHOOK_SIGNING_SECRET` (server) added to `src/env.ts`, `.env`, `.env.example`. `DATABASE_URL` validated as a URL; signing secret as a non-empty string.

- **Local testing via existing tunnel.** Reuse `pnpm tunnel` (ngrok) to expose the dev server; register `https://<ngrok-url>/api/webhooks/clerk` in the Clerk dashboard subscribed to the three user events; copy the signing secret into `.env`. Use the dashboard "Testing" tab to replay events.

## Risks / Trade-offs

- **Eventual consistency / dropped deliveries** → webhooks can lag or fail; returning non-2xx on DB error lets Clerk retry. Upserts make retries idempotent. A future backfill job can reconcile drift.
- **Body must be read raw for signature verification** → `verifyWebhook(req)` consumes the raw request; do not parse `req.json()` before calling it. Mitigation: pass the `NextRequest` straight to `verifyWebhook`.
- **Webhook route accidentally protected** → if not added to the public matcher, all deliveries 401. Mitigation: explicit public matcher entry + a task to verify an unauthenticated POST is not redirected.
- **Connection exhaustion under HMR / serverless** → `globalThis` singleton in dev; Neon pooled connection string in production. Mitigation: use the pooled URL for `DATABASE_URL`.
- **Prisma 7 API drift from older tutorials** → many guides target v5/6 (embedded engine, url in schema). Mitigation: follow v7 conventions (config file, driver adapter) as specified above; pin `prisma`/`@prisma/client` to the same major.
- **Email/name absent on payload** → guard with optional chaining and fallbacks so a sparse Clerk profile never crashes the handler.

## Migration Plan

1. Provision Neon project/branch; obtain pooled `DATABASE_URL`; set it in `.env`.
2. Add Prisma deps, `prisma.config.ts`, and `schema.prisma`; run `prisma migrate dev --name init` to create the `User` table and first migration.
3. Deploy applies migrations via `prisma migrate deploy`; `prisma generate` runs before build.
4. Register the production webhook endpoint in Clerk and store its signing secret as a deploy secret.
5. Rollback: the change is additive (new table, new route). To revert, remove the webhook endpoint in Clerk, drop the route, and optionally drop the `User` table — no existing behavior depends on it yet.

## Open Questions

- Backfill of pre-existing Clerk users — handle now via a one-off script, or defer until a feature needs it? (Currently deferred per Non-Goals.)
- Hard delete vs. soft delete on `user.deleted` — hard delete chosen for now; revisit if domain data later needs to outlive the user.
