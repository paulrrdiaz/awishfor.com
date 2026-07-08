## 1. Safe redirect resolution

- [x] 1.1 Add `src/lib/auth/safe-redirect.ts` exporting `resolveRedirectPath(rawValue, fallback = "/dashboard")`: accepts only a same-origin relative path (single leading `/`, no `//` or `/\` prefix, no `://`), else returns `fallback`
- [x] 1.2 Add unit tests (`src/lib/auth/safe-redirect.test.ts`) covering: valid relative path, absolute URL, protocol-relative URL, missing value, empty string

## 2. Sign-in / sign-up honor redirect_url (password + email verify)

- [x] 2.1 `src/components/features/auth/sign-in-form.tsx`: read `redirect_url` via `useSearchParams()`, resolve with `resolveRedirectPath`, use it in place of the hardcoded `/dashboard` in the password success path (`router.push`) and the `session_exists` branch (`router.replace`)
- [x] 2.2 `src/components/features/auth/sign-up-form.tsx`: same treatment for the email-verification success path (`onVerify` → `router.push`)

## 3. Google OAuth honors redirect_url

- [x] 3.1 In `sign-in-form.tsx` and `sign-up-form.tsx`, build `redirectCallbackUrl` as `` `/sso-callback?redirect_url=${encodeURIComponent(resolveRedirectPath(...))}` `` instead of the bare `/sso-callback`, passed to `signIn.sso`/`signUp.sso`
- [x] 3.2 `src/app/(auth)/sso-callback/page.tsx`: read `redirect_url` from its own search params, resolve with `resolveRedirectPath`, and use it inside `decorateUrl(...)` in place of the hardcoded `"/dashboard"` (all `navigate` call sites: `signIn.finalize`, `signUp.finalize`, `clerk.setActive`)

## 4. Already-authenticated redirect in middleware

- [x] 4.1 `src/proxy.ts`: when `isAuthRoute(req) && userId`, resolve `redirect_url` from `req.nextUrl.searchParams` via `resolveRedirectPath` and redirect there instead of the hardcoded `/dashboard`

## 5. Simplification cleanup

- [x] 5.1 Remove the pending-intent auto-resume mechanism from an earlier draft of this change: `setPendingWizardIntent`/`consumePendingWizardIntent` and the `wishlist-wizard-pending-intent` localStorage key in `src/stores/wishlist-wizard.store.ts`, the one-shot auto-resume effects and intent calls in `publish-step.tsx` and `save-draft-controls.tsx`, and the standalone `src/stores/wishlist-wizard-pending-intent.test.ts`
- [x] 5.2 Confirm no remaining references to the removed pending-intent symbols (`grep -rn "PendingWizardIntent" src/`)

## 6. Validation

- [x] 6.1 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`; report and fix any failures introduced by this change
- [x] 6.2 Manual-verify (reminder only, do not attempt in this session): as a signed-out guest, build a wishlist in `/create`, click "Publicar wishlist", sign up via email+password, confirm you land back on `/create?step=publish` with the draft intact, click "Publicar wishlist" again, and confirm it appears in `/dashboard/wishlists`; repeat for "Guardar borrador" and for Google OAuth sign-in
