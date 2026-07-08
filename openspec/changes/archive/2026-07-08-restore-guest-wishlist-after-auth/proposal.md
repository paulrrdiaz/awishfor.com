## Why

A guest who builds a wishlist in the creation wizard, then signs in or signs up when prompted to publish, loses their work: the custom sign-in/sign-up forms ignore the `redirect_url` the wizard attaches to the auth link and always redirect to `/dashboard` instead. Because the wizard draft lives only in `localStorage` and is never persisted to the database until the publish/save mutation runs on the final step, and the user is dropped on `/dashboard` instead of back on that step, the mutation never fires. No `Wishlist` row is created, and the user lands on an empty "My Wishlists" with no indication their draft still exists (it's intact in `localStorage` on that browser).

## What Changes

- `SignInForm` and `SignUpForm` (`src/components/features/auth/sign-in-form.tsx`, `sign-up-form.tsx`), the Google OAuth callback (`src/app/(auth)/sso-callback/page.tsx`), and `src/proxy.ts`'s already-authenticated redirect all honor the `redirect_url` search param as the post-authentication destination, validated as a same-origin relative path, falling back to `/dashboard` when absent or invalid.
- This makes the wizard's existing auth-gate links (`/sign-in?redirect_url=%2Fcreate%3Fstep%3Dpublish` from the publish step, `/sign-in?redirect_url=%2Fcreate` from save-draft) work as originally intended: a guest who signs in or signs up from the wizard lands back on that exact step with their local draft still in place.
- No change to the wizard's publish/save behavior itself: the user still clicks "Publicar wishlist" (or "Guardar borrador") themselves once back on the step, same as any signed-in user today. Landing back on the correct step with the draft intact is sufficient — no automatic re-submission is added, keeping this a small, low-risk redirect fix.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `authentication`: sign-in and sign-up SHALL honor an explicit, validated `redirect_url` post-authentication destination instead of always redirecting to `/dashboard`, across the password, Google OAuth, and already-authenticated-redirect paths.

## Impact

- Code: `src/lib/auth/safe-redirect.ts` (new validation helper), `src/components/features/auth/sign-in-form.tsx`, `src/components/features/auth/sign-up-form.tsx`, `src/app/(auth)/sso-callback/page.tsx`, `src/proxy.ts`.
- No changes needed to `src/components/features/wizard/publish-step.tsx`, `save-draft-controls.tsx`, or `src/stores/wishlist-wizard.store.ts` — the wizard already preserves the local draft through the auth prompt and already exposes a manual publish/save action; it was only ever missing a correct return trip.
- No Prisma schema changes: guest drafts never become DB rows before auth; this is a redirect-continuation fix, not a data-merge/claim mechanism. `authenticated-draft-saving` mutations are reused as-is.
- Security: `redirect_url` must be validated as a same-origin relative path before use (open-redirect prevention) in both the auth forms/callback and `src/proxy.ts`.
- UX: guest lands back exactly where they left off (e.g. the publish step) instead of an unrelated dashboard, and can complete the action they already intended with one click.
