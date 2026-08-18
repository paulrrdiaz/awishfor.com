## Why

Clerk can return several structured API errors from one login or sign-up attempt, but the current forms collapse the response into one general message. Users therefore lose field-specific guidance—such as an existing email or rejected password—and cannot see all problems they must correct.

## What Changes

- Classify Clerk API response errors submitted through the login and sign-up password forms.
- Display every error associated with `email_address` or `password` beneath the corresponding field through `react-hook-form`.
- Preserve unassociated Clerk errors in the form-level error banner instead of dropping them.
- Translate known Clerk email/password error codes into the Spanish copy used by the custom auth UI.
- Keep the current Spanish auth UI, validation, redirect behavior, password verification, Google and Microsoft OAuth, password recovery, and route protection unchanged.
- Preserve Clerk's client state across routes with one root `ClerkProvider` and recover stale sign-up state before the user retries.
- Add focused automated coverage for single-field, multi-field, and unassociated Clerk API error responses.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `authentication`: Refine login and sign-up rejection behavior so structured Clerk API errors are exhaustively routed to their associated fields or the general form banner.

## Impact

- Affected code: `src/app/layout.tsx`, `src/components/providers/app-providers.tsx`, `src/components/features/auth/sign-in-form.tsx`, `src/components/features/auth/sign-up-form.tsx`, and focused auth error-handling tests or a shared auth utility introduced to support them.
- No changes to Clerk configuration, environment variables, dependencies, Prisma schema, tRPC APIs, middleware, OAuth callback handling, or public/protected route boundaries.
- User-visible impact is limited to clearer error feedback during email/password login and sign-up submissions.
