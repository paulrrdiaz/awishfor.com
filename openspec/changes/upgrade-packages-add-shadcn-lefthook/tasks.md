## 1. Next.js 16 Codemod & Package Upgrades

- [x] 1.1 Run `npx @next/codemod@canary upgrade latest` to auto-migrate async `params`, `cookies()`, `headers()`, and `searchParams` usages
- [x] 1.2 Update `package.json` — bump `next` to `^16.x`, `react` and `react-dom` to latest, `@types/node` to `^26.x`, `@t3-oss/env-nextjs` to `^0.13.x`, `zod` to `^4.x`, `typescript` to `^6.x`
- [x] 1.3 Run `pnpm install` and confirm lockfile updates cleanly
- [x] 1.4 Remove any `experimental.turbopack` config from `next.config.js` (moved to top-level `turbopack` in Next.js 16); rename to `next.config.ts` if desired

## 2. TypeScript 6 Compatibility

- [x] 2.1 Add `"types": ["node"]` to `compilerOptions` in `tsconfig.json` (TS6 default is `[]`, auto-include is gone)
- [x] 2.2 Set `"module": "esnext"` and `"moduleResolution": "bundler"` explicitly if not already set (TS6 changes defaults)
- [x] 2.3 Add `"ignoreDeprecations": "6.0"` to `tsconfig.json` to suppress warnings for any deprecated options still in use
- [x] 2.4 Run `pnpm typecheck` and resolve any new type errors from TS6 strict defaults

## 3. Zod v4 Migration

- [x] 3.1 Update `src/env.js` — verify `@t3-oss/env-nextjs` 0.13.x zod v4 peer is satisfied; update any inline zod schemas using deprecated v3 APIs (`message` → `error`, `z.string().email()` → `z.email()`)
- [x] 3.2 Update `src/server/api/routers/post.ts` — replace any `z.string().min(..., { message: '...' })` with `z.string().min(..., { error: '...' })` and update string format methods to top-level equivalents
- [x] 3.3 Run `pnpm typecheck` after zod changes to confirm no residual v3 API usage

## 4. Add shadcn/ui

- [x] 4.1 Run `pnpm dlx shadcn@latest init` — choose `Default` style, CSS variables enabled, `src/` directory, TypeScript, App Router
- [x] 4.2 Verify `components.json` is created at project root with correct `aliases` (e.g., `components: "@/components"`)
- [x] 4.3 Verify `src/styles/globals.css` now contains shadcn `:root` CSS variable tokens without breaking existing styles
- [x] 4.4 Confirm `@/components/ui/` path resolves correctly by running `pnpm dlx shadcn@latest add button` as a smoke test
- [x] 4.5 Run `pnpm build` to ensure shadcn setup does not break the build

## 5. Add Lefthook & Git Hooks

- [x] 5.1 Install lefthook: `pnpm add -D lefthook`
- [x] 5.2 Create `lefthook.yml` at project root with `pre-commit` job (biome check on staged files with `stage_fixed: true`) and `post-commit` job (codegraph sync, non-blocking)
- [x] 5.3 Run `pnpm lefthook install` to register hooks in `.git/hooks/`
- [x] 5.4 Verify `.git/hooks/pre-commit` and `.git/hooks/post-commit` are present and executable
- [x] 5.5 Stage a file and run `git commit --dry-run` (or a real commit) to confirm biome pre-commit hook fires correctly

## 6. Final Verification

- [x] 6.1 Run `pnpm build` for a clean production build — confirm zero errors
- [x] 6.2 Run `pnpm typecheck` — confirm zero TypeScript errors
- [x] 6.3 Run `pnpm check` — confirm Biome passes with no issues
- [x] 6.4 Run `pnpm dev` and open the app — confirm the default page renders without runtime errors
