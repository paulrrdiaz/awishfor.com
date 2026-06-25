## 1. Database Provisioning

- [x] 1.1 Provision a Neon Postgres project/branch (via the Neon MCP) and capture the pooled connection string
- [x] 1.2 Add `DATABASE_URL` to `.env` (pooled Neon URL) and a placeholder to `.env.example`

## 2. Prisma Setup (v7)

- [x] 2.1 Install deps: `pnpm add @prisma/client @prisma/adapter-pg pg` and `pnpm add -D prisma tsx @types/pg`
- [x] 2.2 Run `pnpm exec prisma init --datasource-provider postgresql --output ../src/generated/prisma`
- [x] 2.3 Write `prisma.config.ts`: `defineConfig` with `schema`, `migrations.path`, and `datasource.url = env("DATABASE_URL")` (import `dotenv/config`)
- [x] 2.4 Edit `prisma/schema.prisma`: `generator client { provider = "prisma-client"; output = "../src/generated/prisma" }`, `datasource db { provider = "postgresql" }` (no url)
- [x] 2.5 Define the `User` model: `id` (autoincrement), `clerkId String @unique`, `email String @unique`, `name String?`, `imageUrl String?`, `createdAt`, `updatedAt @updatedAt`
- [x] 2.6 Add `src/generated/` to `.gitignore`
- [x] 2.7 Run `pnpm exec prisma migrate dev --name init` to create the table + initial migration, then `prisma generate`
- [x] 2.8 Add a `postinstall` script running `prisma generate`

## 3. Prisma Client & tRPC Context

- [x] 3.1 Create `src/server/db.ts`: `PrismaPg` adapter from `DATABASE_URL` + `PrismaClient` singleton guarded by a `globalThis` cache (dev only)
- [x] 3.2 Inject `db` into `createTRPCContext` in `src/server/api/trpc.ts` so procedures access `ctx.db`

## 4. Environment Validation

- [x] 4.1 Add `DATABASE_URL` (server, `z.string().url()`) and `CLERK_WEBHOOK_SIGNING_SECRET` (server, `z.string()`) to `src/env.ts` schema and `runtimeEnv`
- [x] 4.2 Add `CLERK_WEBHOOK_SIGNING_SECRET` to `.env` and `.env.example`

## 5. Clerk Webhook Handler

- [x] 5.1 Create `src/app/api/webhooks/clerk/route.ts` with a `POST` that calls `verifyWebhook(req)` from `@clerk/nextjs/webhooks` (no `req.json()` before it)
- [x] 5.2 Extract primary email (match `primary_email_address_id`, fallback first) and `name` (trimmed `first_name`/`last_name`, `null` if empty)
- [x] 5.3 Handle `user.created` and `user.updated` → `ctx db.user.upsert({ where: { clerkId } })` with email/name/imageUrl
- [x] 5.4 Handle `user.deleted` → `db.user.deleteMany({ where: { clerkId } })` (no-throw when absent)
- [x] 5.5 Return 200 on success / unsubscribed types; return 400 on verification failure and non-2xx on DB error so Clerk retries
- [x] 5.6 Add `"/api/webhooks(.*)"` to the public `createRouteMatcher` list in `src/proxy.ts`

## 6. Clerk Dashboard & Local Testing

- [x] 6.1 Start `pnpm dev` + `pnpm tunnel`, register `https://<ngrok-url>/api/webhooks/clerk` in the Clerk dashboard subscribed to `user.created`, `user.updated`, `user.deleted`
- [x] 6.2 Copy the endpoint's signing secret into `CLERK_WEBHOOK_SIGNING_SECRET`
- [x] 6.3 Use the dashboard "Testing" tab to send each event and confirm rows are created/updated/deleted (verify with `prisma studio` or a query)

## 7. Verify

- [x] 7.1 Run `pnpm typecheck` and `pnpm check` (Biome) and fix issues
- [x] 7.2 Confirm an unauthenticated POST to `/api/webhooks/clerk` is not redirected/401'd by middleware
- [x] 7.3 Confirm a real Clerk sign-up creates a matching `User` row end-to-end
