## Why

The project was initialized with T3 stack defaults that are now several major versions behind: Next.js is at 15.x (latest 16.x), TypeScript at 5.x (latest 6.x), and Zod at 3.x (latest 4.x). Adding shadcn/ui establishes a production-ready component library, and lefthook wired to codegraph keeps the symbol index automatically in sync after every commit.

## What Changes

- **Upgrade Next.js** `^15.2.3` → `^16.x` — Turbopack stable as default bundler, Cache Components, `proxy.ts` replaces `middleware.ts`, async `params`/`cookies()`/`headers()` required
- **Upgrade TypeScript** `^5.8.2` → `^6.x` — new strict defaults, `module: esnext` default, `types: []` default; `tsconfig.json` will need adjustments
- **Upgrade Zod** `^3.24.2` → `^4.x` — unified `error` param replaces `message`/`invalid_type_error`; string format methods promoted to top-level (`z.email()` vs `z.string().email()`)
- **Upgrade `@types/node`** `^20.14.10` → `^26.x` — aligns with Node.js LTS
- **Upgrade `@t3-oss/env-nextjs`** `^0.12.0` → `^0.13.x` — minor; verify API compatibility
- **Add shadcn/ui** — initialize CLI, configure `components.json`, add `@/components/ui/` path; integrates with existing Tailwind CSS v4
- **Add lefthook** `^2.x` — git hooks manager; `pre-commit` runs biome check on staged files; `post-commit` triggers codegraph index sync

## Capabilities

### New Capabilities

- `shadcn-ui-setup`: Initialize shadcn/ui with Next.js App Router and Tailwind CSS v4, establishing the component library foundation
- `lefthook-git-hooks`: Configure lefthook with pre-commit linting and post-commit codegraph index sync

### Modified Capabilities

<!-- No existing spec-level requirements are changing -->

## Impact

- **`package.json`** — version bumps for all listed packages; `lefthook` added to `devDependencies`
- **`tsconfig.json`** — `types: ["node"]` required; `rootDir` may need explicit setting due to TS6 default changes
- **`next.config.js`** — may need updates for removed experimental flags; rename to `next.config.ts` optional
- **`src/env.js`** — verify `@t3-oss/env-nextjs` 0.13.x API is compatible; zod v4 integration
- **`src/server/api/routers/post.ts`** — zod v4 schema API changes (`z.email()`, unified `error` param)
- **`lefthook.yml`** — new config file at project root
- **`components/ui/`** — new directory created by shadcn init
- **`components.json`** — new shadcn config file at project root
