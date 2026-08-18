## 1. Normalize Clerk API errors

- [x] 1.1 Add a shared pure auth utility that recognizes direct and wrapped `ClerkAPIResponseError` values, preserves every response message, maps email identifier and password parameter names, and returns unmatched messages for the general banner.
- [x] 1.2 Add focused unit tests covering direct responses, wrapped causes, multiple messages per field, simultaneous field/general errors, unknown parameter names, and non-response fallbacks.
- [x] 1.3 Translate known Clerk email/password response codes into Spanish while retaining messages for unknown codes.

## 2. Integrate login and sign-up forms

- [x] 2.1 Update the login password submission to clear stale server errors, preserve `session_exists` redirects, and apply normalized email, password, and general Clerk messages without changing successful login or OAuth behavior.
- [x] 2.2 Update the sign-up password submission to clear stale server errors and apply normalized email, password, and general Clerk messages without changing verification, resend, or OAuth behavior.
- [x] 2.3 Add jsdom component tests proving the login and sign-up forms render field-associated and general messages from rejected Clerk password attempts and remain on the form.
- [x] 2.4 Add coverage that proves translated Clerk password-attempt errors render in Spanish.
- [x] 2.5 Mount a single root Clerk provider and recover direct or wrapped `client_state_invalid` verification errors so the user can retry.
- [x] 2.6 Align the Clerk middleware matcher with `sietch-init` and Clerk's Next.js quickstart so the root provider receives state on every non-static page, API, and `/__clerk` request; add regression coverage for the matcher.

## 3. Verify the change

- [x] 3.1 Run focused auth tests and resolve any failures.
- [x] 3.2 Run `pnpm check` and resolve any Biome findings.
- [x] 3.3 Run `pnpm test` and resolve or explicitly report any failures.
- [x] 3.4 Run `pnpm typecheck` and resolve or explicitly report any failures.
- [x] 3.5 Reconcile any corresponding authentication-hardening item in `docs/TASKS.md` when marking this change complete.
