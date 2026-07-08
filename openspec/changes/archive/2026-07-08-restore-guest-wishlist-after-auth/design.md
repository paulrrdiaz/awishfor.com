## Context

The creation wizard (`src/components/features/wizard/`) keeps its entire draft in a Zustand store persisted to `localStorage` (`src/stores/wishlist-wizard.store.ts`). Nothing is written to the database until an authenticated `publishWizard` or `saveDraft` tRPC mutation runs (`src/server/api/routers/wishlist.ts`), both `protectedProcedure` with a required, non-nullable `Wishlist.ownerId`.

When a signed-out user clicks "Publicar wishlist" (`publish-step.tsx:663` `handlePublishClick`) or "Guardar borrador" (`save-draft-controls.tsx:104` `handleSaveClick`), the component shows an in-wizard modal linking to `/sign-in?redirect_url=%2Fcreate%3Fstep%3Dpublish` or `/sign-in?redirect_url=%2Fcreate`. That `redirect_url` convention matches Clerk's *prebuilt* components, but this app uses fully custom forms (`sign-in-form.tsx`, `sign-up-form.tsx`) built on the headless `useSignIn`/`useSignUp` hooks, and they hardcode every post-auth destination to `/dashboard`:

- `sign-in-form.tsx:38,48` (password flow), `:61` (`signIn.sso({ redirectUrl: "/dashboard", ... })`)
- `sign-up-form.tsx:78` (email verify), `:88` (`signUp.sso({ redirectUrl: "/dashboard", ... })`)
- `src/app/(auth)/sso-callback/page.tsx:25` — the OAuth flow's *actual* final destination is decided here, in `decorateUrl("/dashboard")` inside the shared `navigate` callback, not by the `redirectUrl` passed to `signIn.sso`/`signUp.sso` (that param only drives the mid-flow provider redirect). `redirectCallbackUrl: "/sso-callback"` is where Google sends the browser back; today it carries no information about the original intent.
- `src/proxy.ts:21` — an already-authenticated user hitting `/sign-in`/`/sign-up` is also force-redirected to `/dashboard`.

Net effect: the guest's `localStorage` draft is never lost, but they're dropped on `/dashboard` instead of back on the wizard step they were trying to complete, so the manual publish/save click never happens.

**Simplification from an earlier draft of this design:** an earlier version of this change also added a "pending intent" mechanism to auto-resume the publish/save mutation without a click. That's dropped — it added a second `localStorage` key, TTL/expiry logic, and one-shot effects in two components for behavior the fix doesn't need: once `redirect_url` correctly returns the guest to `/create?step=publish` (or `/create`) with their draft intact, the existing manual "Publicar wishlist" / "Guardar borrador" button already does the job, identically to how any signed-in user publishes today.

## Goals / Non-Goals

**Goals:**
- Post-authentication, return the user to wherever `redirect_url` points (password sign-in, password sign-up + email verify, Google OAuth via both `useSignIn`/`useSignUp`, and the already-authenticated `/sign-in` redirect in `proxy.ts`), validated against open-redirect abuse.
- Land the guest back on the exact wizard step (e.g. the publish step) with their local draft intact, so a single manual click completes what they originally intended.

**Non-Goals:**
- No automatic re-submission of publish/save after auth. The user clicks the button once, same as any signed-in user — this keeps the change small and avoids surprising the user with a wishlist getting published without an explicit click.
- No server-side "guest draft" or ownerless `Wishlist` row, no claim/merge mutation, no `Wishlist.ownerId` nullability change.
- No cross-device recovery. A guest who signs up on a different device/browser than the one holding the `localStorage` draft is out of scope (pre-existing limitation, unrelated to this bug).
- No change to publish/save-draft validation, conflict handling, or readiness-checklist rules.

## Decisions

### 1. Centralized, validated `redirect_url` resolution
Add `src/lib/auth/safe-redirect.ts` exporting `resolveRedirectPath(rawValue: string | null | undefined, fallback = "/dashboard"): string`. It accepts only a same-origin relative path: must start with a single `/`, must not start with `//` or `/\` (protocol-relative), and must not contain `://`. Anything else falls back to `/dashboard`. This is the single choke point used by every call site below, so open-redirect validation logic lives in exactly one place instead of being duplicated per form.

Rejected alternative: validating inline in each component — duplicated logic, easy to miss a spot (there are 5 call sites).

### 2. Password flow: read `redirect_url` via `useSearchParams`
In `sign-in-form.tsx` and `sign-up-form.tsx`, call `useSearchParams().get("redirect_url")`, resolve it through `resolveRedirectPath`, and use the result in place of the hardcoded `"/dashboard"` at `sign-in-form.tsx:38,48` and `sign-up-form.tsx:78`.

### 3. Google OAuth flow: thread `redirect_url` through the callback URL
`redirectUrl` passed to `signIn.sso`/`signUp.sso` stays as `/dashboard` (it's Clerk's mid-flow provider redirect target, not ours to repurpose). Instead, append the resolved path as a query param on `redirectCallbackUrl` itself, e.g. `` `/sso-callback?redirect_url=${encodeURIComponent(resolveRedirectPath(...))}` ``, since that URL round-trips through the OAuth provider and back under our control. Update `src/app/(auth)/sso-callback/page.tsx:25` to read its own `redirect_url` search param and pass `resolveRedirectPath(...)` into `decorateUrl(...)` instead of the hardcoded `"/dashboard"`.

Rejected alternative: relying on Clerk's `redirectUrl` for the final destination — confirmed by reading `sso-callback/page.tsx` that this value is not what determines where `navigate()` sends the user; the callback page's own hardcoded string does.

### 4. `proxy.ts` already-authenticated redirect
At `src/proxy.ts:21`, replace the hardcoded `NextResponse.redirect(new URL("/dashboard", req.url))` with the same `resolveRedirectPath` helper reading `req.nextUrl.searchParams.get("redirect_url")`, for consistency with the client-side forms (e.g. a signed-in user who still has the `/create` tab open in another window and clicks a stale sign-in link).

### 5. No changes to the wizard components
`publish-step.tsx` and `save-draft-controls.tsx` already: show the auth-gate modal instead of calling the mutation when signed out, preserve the local draft through the prompt, and expose a manual publish/save button once signed in. With `redirect_url` fixed, the guest returns to that exact step already authenticated and simply clicks the button that's already there — no new state, storage key, or effect needed in the wizard.

## Risks / Trade-offs

- **Open redirect via a crafted `redirect_url`** → mitigated by `resolveRedirectPath`'s allowlist (single leading `/`, no `//`, no `://`), applied at every call site including `proxy.ts`.
- **User still has to click publish/save once more after authenticating** → accepted trade-off for simplicity; the alternative (auto-resume) was evaluated and dropped as unnecessary complexity for the actual bug (a broken redirect, not a missing auto-submit).
- **Google OAuth callback URL now carries a query param through the provider round-trip** → low risk (a common, provider-agnostic pattern); worth a manual test since Clerk's own callback params must coexist with ours on `/sso-callback`.

## Migration Plan

Pure application-code change, no data migration, no feature flag needed (low blast radius, additive behavior). Deploy as a normal release. Rollback is a plain revert — no persisted state format changes.

## Open Questions

None outstanding — proceed to specs/tasks.
