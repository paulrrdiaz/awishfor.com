## Why

Clerk is currently the sole source of truth for user identity, so the app has no local representation of users to join against, query, or attach domain data to. To build any user-owned features (posts, settings, relationships) we need a database and a User record we own, kept in lockstep with Clerk via webhooks.

## What Changes

- Add **Prisma 7** (latest) as the ORM: `prisma` + `@prisma/client`, the `prisma-client` generator, and `prisma.config.ts`.
- Add a **Neon Postgres** database using the `@prisma/adapter-pg` driver adapter; provision a Neon project/branch and wire `DATABASE_URL`.
- Define a `User` model keyed by Clerk's user id (`clerkId @unique`) plus `email`, `name`, `imageUrl`, and timestamps; create the initial migration.
- Add a Prisma client singleton (`src/server/db.ts`) and expose it through the existing tRPC context so routers/server code can query the DB.
- Add a **Clerk webhook** route handler at `src/app/api/webhooks/clerk/route.ts` using `verifyWebhook` from `@clerk/nextjs/webhooks`, verified with `CLERK_WEBHOOK_SIGNING_SECRET`.
- **Full sync** of Clerk users: handle `user.created` and `user.updated` (upsert) and `user.deleted` (delete) so the `User` table stays consistent with Clerk.
- Mark `/api/webhooks(.*)` public in `src/proxy.ts` so Clerk can reach the endpoint unauthenticated.
- Add typed `DATABASE_URL` and `CLERK_WEBHOOK_SIGNING_SECRET` to `src/env.ts`, `.env`, and `.env.example`; document Clerk dashboard webhook setup and local testing via the existing `pnpm tunnel` (ngrok) script.

## Capabilities

### New Capabilities
- `user-data-sync`: A persisted `User` record owned by the app, kept eventually consistent with Clerk through a signature-verified webhook that handles user create/update/delete, plus a Prisma data-access layer (Neon Postgres) available to server code via tRPC context.

### Modified Capabilities
<!-- None — no existing specs. The `authentication` capability is unchanged; this builds alongside it. -->

## Impact

- **Dependencies**: add `prisma`, `@prisma/client`, `@prisma/adapter-pg`, `pg` (and `@types/pg`, `tsx` dev). No new auth deps — `verifyWebhook` ships with `@clerk/nextjs`.
- **Config**: new `prisma.config.ts`, `prisma/schema.prisma`, `prisma/migrations/`; `src/env.ts` (+`DATABASE_URL`, `CLERK_WEBHOOK_SIGNING_SECRET`); `.env`/`.env.example`; `.gitignore` for the generated client.
- **Code**: new `src/server/db.ts` (Prisma singleton), updated tRPC context in `src/server/api/trpc.ts`, new `src/app/api/webhooks/clerk/route.ts`, updated `src/proxy.ts` (public webhook route).
- **External**: a Neon Postgres project/branch; a Clerk webhook endpoint subscribed to `user.created`, `user.updated`, `user.deleted` with its signing secret. Local delivery uses the existing ngrok `pnpm tunnel` script.
