# Repository Guidelines

## Project Structure & Module Organization

This is a pnpm-managed Next.js 16 App Router project with TypeScript, tRPC, Prisma, Clerk, Tailwind CSS v4, and shadcn/Base UI.

- `src/app/` contains routes, layouts, and API handlers. Auth pages live in `src/app/(auth)`, protected pages in `src/app/(protected)`, and webhooks/API routes under `src/app/api`.
- `src/components/` contains UI. Put primitives in `src/components/ui` and feature components in `src/components/features`.
- `src/server/api/` contains tRPC setup and routers. Register routers in `src/server/api/root.ts`.
- `src/lib/` contains shared utilities and colocated tests.
- `prisma/` contains schema and migrations. Prisma generates client files into `src/generated/prisma`; do not edit generated files.
- `public/` contains static assets.

## Build, Test, and Development Commands

- `pnpm install` installs dependencies and runs `prisma generate`.
- `pnpm bootstrap` runs the setup wizard for env and migration tasks.
- `pnpm dev` starts the local Next.js dev server using `.env`.
- `pnpm build` creates a production build; `pnpm start` serves it.
- `pnpm preview` builds and starts the production server.
- `pnpm test` runs Vitest once; `pnpm test:watch` runs Vitest interactively.
- `pnpm typecheck` runs `tsc --noEmit`.
- `pnpm check` runs Biome checks; `pnpm check:write` applies safe fixes.
- `pnpm tunnel` starts ngrok for Clerk webhook testing.

## Coding Style & Naming Conventions

Use TypeScript with strict checks enabled. Prefer the `@/` alias for imports from `src`. Route files use Next.js names like `page.tsx` and `route.ts`; components and utilities use kebab-case filenames such as `sign-in-form.tsx`. Biome handles formatting, import organization, sorted JSX attributes, and Tailwind class sorting for `clsx`, `cva`, and `cn`.

## Testing Guidelines

Vitest is configured for Node and discovers `src/**/*.{test,spec}.{ts,tsx}`. Keep tests close to the code, as in `src/lib/utils.test.ts`. Add focused tests for shared utilities, server logic, and behavior that can regress without UI review.

## Commit & Pull Request Guidelines

Recent history uses Conventional Commits, for example `feat: enhance project setup and testing capabilities`, `refactor: rename setup command to bootstrap for clarity`, and `docs: add design and future improvements documentation`. Use the same `type: summary` pattern.

Pull requests should include a short description, linked issue or OpenSpec change when applicable, test results, and screenshots for visible UI changes. Note any new environment variables and update both `.env.example` and `src/env.ts`.

## Security & Configuration Tips

Never commit secrets. Keep local values in `.env`; use `.env.example` only for placeholders. Clerk, Neon, and webhook configuration are runtime-sensitive, so update validation in `src/env.ts` whenever configuration changes.
