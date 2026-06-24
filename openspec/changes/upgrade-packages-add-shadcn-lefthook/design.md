## Context

`sietch-init` is a T3-stack Next.js starter (App Router, tRPC v11, Tanstack Query v5, Tailwind CSS v4, Biome). All dependencies are currently on their initial scaffolded versions. The primary change driver is keeping the stack current with three simultaneous major-version ecosystem jumps (Next.js 15→16, TypeScript 5→6, Zod 3→4) while layering in shadcn/ui and lefthook as foundational developer tooling.

## Goals / Non-Goals

**Goals:**
- Upgrade all dependencies to their latest stable versions, including major version bumps
- Add shadcn/ui initialized and ready for component installs
- Add lefthook with pre-commit Biome check on staged files and post-commit codegraph index sync
- Ensure the app compiles and `pnpm dev` works after all changes

**Non-Goals:**
- Installing any specific shadcn components beyond the CLI setup
- Migrating to `proxy.ts` (Next.js 16 deprecation, not yet removed)
- Adopting Next.js 16 Cache Components or React Compiler (opt-in features)
- Database changes or tRPC router changes beyond Zod v4 compatibility

## Decisions

### 1. Upgrade order: dependencies first, then tooling additions

Upgrade all packages together in a single pass, then add shadcn and lefthook. Rationale: avoids shadcn's init script fighting with mixed Tailwind or TypeScript versions. Doing it the other way risks shadcn pinning older peers.

**Alternative considered**: Add shadcn first, then upgrade. Rejected because shadcn's `init` command resolves and pins peer versions, making the subsequent upgrade noisier.

### 2. TypeScript 6 opt-in compat shim

TypeScript 6 changes defaults aggressively (`strict: true`, `module: esnext`, `types: []`). Rather than fully adopting all new defaults immediately, we explicitly set the values `tsconfig.json` previously relied on implicitly, then add `"ignoreDeprecations": "6.0"` as a bridge for any deprecated options still in use.

**Alternative considered**: Full TS6 migration (remove all deprecated options). Rejected for this change — the scope is an upgrade, not a rewrite. Full TS6 adoption can be a separate change after verifying build correctness.

### 3. Zod v4 migration scope

Zod v4 has breaking API changes in error handling and string format methods. The current codebase uses zod only in `src/env.js` (via `@t3-oss/env-nextjs`) and `src/server/api/routers/post.ts`. The migration is limited to these two files; no widespread usage exists.

**Key changes required:**
- `z.string().email()` → `z.email()` (promoted to top-level)
- `message` option → `error` option in refinements
- Verify `@t3-oss/env-nextjs@0.13.x` ships with zod v4 peer support (0.13.x does)

### 4. Lefthook over Husky

Lefthook chosen because: zero dependencies, single binary, native YAML config, parallel job support, supports both `npm` and `pnpm` ecosystems without additional wrapper scripts. The project already uses biome (not eslint), making Husky's `lint-staged` integration less relevant.

**Alternative considered**: Husky + lint-staged. Rejected — more moving parts, shell script wrappers, and no built-in parallel execution.

### 5. Codegraph sync hook placement: `post-commit`

Codegraph index lags file-watcher updates by ~1 second. Running sync on `post-commit` (after the commit is recorded) ensures the index reflects the committed state, which is more useful for CI-like correctness. Running on `pre-commit` would index files that might not match what was committed.

**Lefthook config:**
```yaml
pre-commit:
  jobs:
    - name: biome-check
      run: pnpm biome check --write {staged_files}
      stage_fixed: true

post-commit:
  jobs:
    - name: codegraph-sync
      run: npx codegraph sync 2>/dev/null || true
```

### 6. shadcn/ui with Tailwind CSS v4

shadcn's latest `init` command supports Tailwind v4 natively (CSS-based config, no `tailwind.config.js`). The project already has `@tailwindcss/postcss` and `tailwindcss@^4`. shadcn init will create `components.json` and add CSS variable tokens to `globals.css`. No `tailwind.config.js` will be created.

## Risks / Trade-offs

- **Next.js 16 async params** → All usages of `params`, `cookies()`, `headers()` must be awaited. The current scaffold has minimal route usage; scan and update all occurrences. Mitigation: `@next/codemod upgrade latest` automates most of these.
- **TypeScript 6 `types: []` default** → Auto-included `@types/*` packages no longer apply. Mitigation: explicitly add `"types": ["node"]` to `tsconfig.json`.
- **Zod v4 peer resolution with @t3-oss/env-nextjs** → 0.13.x supports both zod 3 and 4 via peer flexibility. If resolution fails, pin `@t3-oss/env-nextjs` zod peer explicitly.
- **shadcn CSS vars conflicting with existing globals.css** → shadcn appends its own `:root` block. Mitigation: review diff after `shadcn init` and ensure no duplicate custom property names.
- **`pnpm` workspaces not in use** → No monorepo flag needed for shadcn init.

## Migration Plan

1. Run `npx @next/codemod@canary upgrade latest` to auto-migrate Next.js 16 async APIs
2. Update `package.json` versions and run `pnpm install`
3. Fix `tsconfig.json` for TypeScript 6 compatibility
4. Migrate Zod v4 APIs in `src/env.js` and `src/server/api/routers/post.ts`
5. Run `pnpm dlx shadcn@latest init` (non-interactive, pick sensible defaults)
6. Install lefthook via `pnpm add -D lefthook` and create `lefthook.yml`
7. Run `lefthook install` to register git hooks
8. Run `pnpm build` to confirm clean build

**Rollback**: all changes are local file edits and package.json version changes. `git checkout .` and `pnpm install` restores to prior state.
