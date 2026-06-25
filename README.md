# sietch-init

Opinionated starter for spinning up a new app fast. Clone it, run one setup command, and start building.

**Stack:** [Next.js 16](https://nextjs.org) (App Router / RSC) · [React 19](https://react.dev) · [tRPC v11](https://trpc.io) · [Prisma 7](https://prisma.io) on [Neon](https://neon.tech) Postgres · [Clerk](https://clerk.com) auth (custom UI) · [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/Base UI](https://ui.shadcn.com) · TypeScript. Tooling: [pnpm](https://pnpm.io), [Biome](https://biomejs.dev), [Vitest](https://vitest.dev), [lefthook](https://lefthook.dev).

## Quickstart

> Requires Node `>=24` (see `.nvmrc`) and pnpm. Run `corepack enable` if you don't have pnpm.

1. **Create your repo** — click **"Use this template"** on GitHub (or clone this repo).
2. **Install dependencies:**
   ```bash
   pnpm install
   ```
3. **Run the setup wizard** — renames the project, scaffolds `.env`, and runs the first migration:
   ```bash
   pnpm bootstrap
   ```
   It prompts for the values it can't derive — your Neon `DATABASE_URL` and Clerk keys (see below). Press Enter to skip any and fill them into `.env` later.
4. **Start the dev server:**
   ```bash
   pnpm dev
   ```

### What you'll need

- **Neon database** — create a project at [console.neon.tech](https://console.neon.tech) and copy the **pooled** connection string into `DATABASE_URL`.
- **Clerk app** — create an app at [dashboard.clerk.com](https://dashboard.clerk.com), then:
  - copy the publishable + secret keys,
  - enable **Google** under _User & Authentication → Social Connections_ (the sign-in UI uses it),
  - register a webhook (for user sync — see below) and copy its signing secret.

All environment variables are validated at runtime in `src/env.ts`. Add any new var to both that schema and `.env.example`.

## Commands

| Command | Description |
| --- | --- |
| `pnpm bootstrap` | One-time project setup wizard (rename + env + migrate) |
| `pnpm dev` | Start the dev server (loads `.env`) |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm test` / `pnpm test:watch` | Run Vitest |
| `pnpm typecheck` | `tsc --noEmit` (also runs pre-push) |
| `pnpm check` / `pnpm check:write` | Biome lint + format (check / fix) |
| `pnpm tunnel` | ngrok tunnel for testing Clerk webhooks locally |
| `pnpm prisma migrate dev` / `studio` | DB migrations / GUI |

## Project structure

- `src/app/` — routes. Groups: `(auth)` (sign-in/up, sso-callback), `(protected)` (dashboard).
- `src/proxy.ts` — middleware (Next.js 16 renamed `middleware.ts`). Defines public vs. protected routes; Clerk runs here.
- `src/server/api/routers/` — tRPC routers. Register each in `src/server/api/root.ts`.
- `src/server/api/trpc.ts` — context + procedures.
- `src/components/` — `ui/` (shadcn/Base UI primitives), `features/auth/` (custom Clerk forms).
- `prisma/schema.prisma` — database models. The Prisma client is generated to `src/generated/prisma` (gitignored).

## Adding a feature

1. **Model** — add it to `prisma/schema.prisma`, then `pnpm prisma migrate dev`.
2. **Router** — create `src/server/api/routers/<name>.ts` and register it in `root.ts`. Use:
   - `publicProcedure` — open endpoints.
   - `protectedProcedure` — requires a signed-in Clerk user; throws `UNAUTHORIZED` otherwise and gives you `ctx.userId`. Prefer this for anything user-specific — page-level protection in `src/proxy.ts` does **not** guard the API layer.
3. **Consume it** — Server Components via `@/trpc/server`; Client Components via `@/trpc/react`.

## Auth & user sync

Clerk is the source of truth for identity; the local `User` table mirrors it. The webhook at `src/app/api/webhooks/clerk/route.ts` verifies the Svix signature and upserts/deletes the local user on `user.created|updated|deleted`. To test locally: `pnpm tunnel`, then point the Clerk dashboard webhook at the ngrok URL.

## Deploy

Deploy the Next.js app to [Vercel](https://vercel.com) (or any Node host) and point `DATABASE_URL` at your Neon production branch. Set every variable from `.env.example` in the host's environment, register the production Clerk webhook URL, and run `pnpm prisma migrate deploy` against the production database.
