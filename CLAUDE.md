# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

`create-t3-app` scaffold: Next.js 16 (App Router, RSC) · React 19 · tRPC v11 · Prisma 7 (Postgres/Neon via the `pg` driver adapter) · Clerk auth · Tailwind CSS v4 · TypeScript. Package manager is **pnpm**; Biome is the linter/formatter.

## Design Reference

The visual source of truth is the Claude Design project file `A Wish For.dc.html`.
When implementing or reviewing UI, use the `claude_design` MCP to import the project:

- MCP endpoint: `https://api.anthropic.com/v1/design/mcp`
- Auth flow: `/design-login`
- Project URL: `https://claude.ai/design/p/10380ffb-0586-4cc7-aa3b-862f4fb0ab17?file=A+Wish+For.dc.html`
- Target file to implement: `A Wish For.dc.html`

Treat that imported design as authoritative for themes, layout, typography, copy, spacing, and interaction behavior unless a later product decision explicitly supersedes it.

## Commands

- `pnpm bootstrap` — one-time project setup wizard (`scripts/setup.mjs`, zx): renames the project, scaffolds `.env` from `.env.example`, and runs the first migration
- `pnpm dev` — start dev server (loads `.env` via `dotenv -e .env`)
- `pnpm build` / `pnpm start` — production build / serve
- `pnpm test` / `pnpm test:watch` — Vitest (`test` runs once; `test:watch` watches)
- `pnpm typecheck` — `tsc --noEmit` (also runs on pre-push)
- `pnpm check` — Biome lint + format check (read-only)
- `pnpm check:write` — Biome check with safe fixes applied
- `pnpm tunnel` — ngrok tunnel for testing Clerk webhooks locally
- DB: `pnpm prisma migrate dev`, `pnpm prisma studio`, `pnpm prisma generate`

Tests use **Vitest** (config in `vitest.config.ts`, mirrors the `@/*` alias). Tests are unit-level (e.g. `src/lib/utils.test.ts`); they are not wired into the pre-push hook.

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
- `src/server/api/trpc.ts` defines context (injects `db`), the superjson transformer, and two procedures: `publicProcedure` (open) and `protectedProcedure` (calls Clerk's `auth()`, throws `UNAUTHORIZED` if signed out, and injects `ctx.userId`). Page-level protection in `src/proxy.ts` does **not** guard the API layer — use `protectedProcedure` for anything user-specific.
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

- **Default style:** OpenSpec workflow responses use `/caveman` by default unless the user explicitly asks for normal mode.
- **Docs review:** During OpenSpec work, review relevant repo docs before acting. Use `docs/PRD.md`, `docs/TASKS.md`, and `docs/CLAUDE_DESIGN_PROMPT.md` when they apply. Review `.cursor/rules/codegraph.mdc` when structural code context matters.
- **CodeGraph:** Prefer CodeGraph over grep-first exploration for structural repo questions during OpenSpec work: symbol lookup, callers/callees, impact analysis, architecture tracing, and task scoping.
- **`opsx:propose`:** Read relevant repo context plus relevant docs before drafting artifacts. Run `/grill-me` only if ambiguity remains after repo and docs review, especially around scope, success criteria, tradeoffs, or conflicting constraints.
- **`opsx:apply`:** Read proposal, specs, design, tasks, and any relevant docs before coding. Use CodeGraph for structural repo analysis. Implement tasks in order. Run `pnpm check`, `pnpm test`, and `pnpm typecheck` before closing the apply session. Mark tasks complete only after the related work is done and required validation has passed, or after any validation failure is explicitly reported.
- **`opsx:archive`:** Review relevant change docs before archiving. If unchecked tasks remain, show them, ask for confirmation, then mark the remaining tasks complete before archiving. Assess delta specs against `openspec/specs` and sync when the change introduces real spec deltas. Forced task completion is administrative closure, not proof that validation passed.

## CodeGraph

This project has a CodeGraph MCP server (`codegraph_*` tools) — a tree-sitter knowledge graph of every symbol, edge, and file. The index lives in `.codegraph/` (gitignored) and is kept fresh by the post-commit `codegraph sync` hook. Full guide: `.cursor/rules/codegraph.mdc`.

- **Prefer codegraph over grep for structural questions** — what calls what, where a symbol is defined, its signature, what a change would break. Use grep/Read only for literal text (string contents, comments, log messages) or once a specific file is already open.
- Tool selection: `codegraph_context` (focused context for a task/area — start here) · `codegraph_search` (find a symbol by name) · `codegraph_callers` / `codegraph_callees` · `codegraph_trace` (whole call path from X→Y in one call) · `codegraph_impact` (what breaks if Z changes) · `codegraph_explore` (several symbols' source at once) · `codegraph_node` (one symbol's source/signature).
- **Trust codegraph results — don't re-verify with grep.** Don't delegate exploration to a sub-agent or grep+read loop; codegraph is the pre-built index. Typical answer is 2–3 calls.
- **Index lag:** if a response opens with a "⚠️ … edited since the last index sync" banner, Read those specific files directly; files not listed are authoritative.

## Caveman mode

The `caveman` skill (`/caveman [lite|full|ultra]`) is an ultra-compressed response style that cuts token usage ~75% while keeping all technical substance — drops articles/filler/pleasantries, fragments OK, no tool-call narration or decorative tables. Activate when the user says "caveman", "be brief", "less tokens", or invokes `/caveman`; it stays on every turn until "stop caveman" / "normal mode". Always preserve code, API/function names, CLI commands, commit-type keywords, and exact error strings verbatim, and keep the user's dominant language (compress the style, not the language).
