# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

`create-t3-app` scaffold: Next.js 16 (App Router, RSC) · React 19 · tRPC v11 · Prisma 7 (Postgres/Neon via the `pg` driver adapter) · Clerk auth · Tailwind CSS v4 · TypeScript. Package manager is **pnpm**; Biome is the linter/formatter.

## Commands

- `pnpm dev` — start dev server (loads `.env` via `dotenv -e .env`)
- `pnpm build` / `pnpm start` — production build / serve
- `pnpm typecheck` — `tsc --noEmit` (also runs on pre-push)
- `pnpm check` — Biome lint + format check (read-only)
- `pnpm check:write` — Biome check with safe fixes applied
- `pnpm tunnel` — ngrok tunnel for testing Clerk webhooks locally
- DB: `pnpm prisma migrate dev`, `pnpm prisma studio`, `pnpm prisma generate`

There is no test runner configured in this repo.

## Critical conventions

- **Middleware is `src/proxy.ts`, not `middleware.ts`.** Next.js 16 renamed the convention. This is where Clerk's `clerkMiddleware` runs and where public vs. protected routes are defined (`createRouteMatcher`).
- **The Prisma client is generated to `src/generated/prisma`** (see `prisma/schema.prisma` `output`), not `node_modules`. Import it from `@/generated/prisma/client`. `postinstall` runs `prisma generate`; this directory is gitignored, so regenerate after a fresh clone or schema change.
- **Use `pnpm`** (enforced via `packageManager`). Do not use npm/yarn.
- **Biome, not ESLint/Prettier.** Config is `biome.jsonc`. It also sorts Tailwind classes (treats `clsx`, `cva`, `cn` as class functions).
- **Validate env vars through `src/env.ts`** (`@t3-oss/env-nextjs`). Add any new env var to both the Zod schema and `runtimeEnv` there, and to `.env.example`.
- Path alias: `@/*` → `src/*`.

## Architecture

### tRPC
- Routers live in `src/server/api/routers/` and must be registered in `src/server/api/root.ts` (`appRouter`).
- `src/server/api/trpc.ts` defines context (injects `db`), the superjson transformer, and `publicProcedure` (the only procedure type — there is no auth-gated procedure yet; route protection is handled in `src/proxy.ts`).
- Two consumption paths:
  - **Server Components** → `import { api, HydrateClient } from "@/trpc/server"` (server-side caller).
  - **Client Components** → `import { api } from "@/trpc/react"` (React Query hooks).
- The HTTP handler is `src/app/api/trpc/[trpc]/route.ts`.

### Auth (Clerk)
- Uses **custom UI**, not Clerk's prebuilt `<SignIn />`/`<SignUp />`. Forms in `src/components/features/auth/` drive Clerk via `useSignIn`/`useSignUp` hooks (email/password + Google OAuth via `sso-callback`). Validation schemas in `schemas.ts`.
- Route protection: `src/proxy.ts` defines public routes; everything else calls `auth.protect()`. Signed-in users hitting `/sign-in`|`/sign-up` are redirected to `/dashboard`.
- Route groups: `src/app/(auth)/` (sign-in/up, sso-callback), `src/app/(protected)/` (dashboard).

### User data sync
- Clerk is the source of truth for identity; the local `User` table (`prisma/schema.prisma`) mirrors it.
- The webhook at `src/app/api/webhooks/clerk/route.ts` verifies the Svix signature (`CLERK_WEBHOOK_SIGNING_SECRET`) and upserts/deletes the local `User` on `user.created`/`updated`/`deleted`. To test locally, run `pnpm tunnel` and point the Clerk dashboard webhook at the ngrok URL.

### Database
- `src/server/db.ts` exports the singleton `db`, built with the `PrismaPg` driver adapter. `prisma.config.ts` wires the schema/migrations/datasource and loads `.env`.

## Git hooks (lefthook)

`lefthook.yml`: pre-commit runs Biome `--write` on staged files; pre-push runs `pnpm typecheck`; post-commit runs `codegraph sync`.

## Spec-driven workflow (OpenSpec)

Changes are tracked under `openspec/` (`changes/` for active proposals, `changes/archive/` for completed, `specs/` for current capability specs). Use the `opsx:propose` / `opsx:apply` / `opsx:archive` skills for this workflow.

## CodeGraph

This project has a CodeGraph MCP server (`codegraph_*` tools) — a tree-sitter knowledge graph of every symbol, edge, and file. The index lives in `.codegraph/` (gitignored) and is kept fresh by the post-commit `codegraph sync` hook. Full guide: `.cursor/rules/codegraph.mdc`.

- **Prefer codegraph over grep for structural questions** — what calls what, where a symbol is defined, its signature, what a change would break. Use grep/Read only for literal text (string contents, comments, log messages) or once a specific file is already open.
- Tool selection: `codegraph_context` (focused context for a task/area — start here) · `codegraph_search` (find a symbol by name) · `codegraph_callers` / `codegraph_callees` · `codegraph_trace` (whole call path from X→Y in one call) · `codegraph_impact` (what breaks if Z changes) · `codegraph_explore` (several symbols' source at once) · `codegraph_node` (one symbol's source/signature).
- **Trust codegraph results — don't re-verify with grep.** Don't delegate exploration to a sub-agent or grep+read loop; codegraph is the pre-built index. Typical answer is 2–3 calls.
- **Index lag:** if a response opens with a "⚠️ … edited since the last index sync" banner, Read those specific files directly; files not listed are authoritative.

## Caveman mode

The `caveman` skill (`/caveman [lite|full|ultra]`) is an ultra-compressed response style that cuts token usage ~75% while keeping all technical substance — drops articles/filler/pleasantries, fragments OK, no tool-call narration or decorative tables. Activate when the user says "caveman", "be brief", "less tokens", or invokes `/caveman`; it stays on every turn until "stop caveman" / "normal mode". Always preserve code, API/function names, CLI commands, commit-type keywords, and exact error strings verbatim, and keep the user's dominant language (compress the style, not the language).
