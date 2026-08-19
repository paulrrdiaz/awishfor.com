## 1. Provision the provider

- [x] 1.1 Create the Resend account and API key, and record which sending domain will be used
- [x] 1.2 Add the SPF and DKIM DNS records for the sending domain and start verification — this has propagation lead time and blocks `add-wishlist-collaborators`, so begin it before writing code
- [x] 1.3 Record the verification status and the chosen `from` identity in `verification.md`

## 2. Configure environment

- [x] 2.1 Add `RESEND_API_KEY` to the `server` block of `src/env.ts` as `z.string().min(1).optional()`, matching the `BRIGHT_DATA_API_KEY` pattern, and mirror it in `runtimeEnv`
- [x] 2.2 Add `EMAIL_FROM` to the `server` block, validated as an email address and optional, and mirror it in `runtimeEnv`
- [x] 2.3 Add `EMAIL_DEV_REDIRECT_TO` to the `server` block, validated as an email address and optional, and mirror it in `runtimeEnv`
- [x] 2.4 Add all three variables to `.env.example` with commented guidance on where to obtain them and what the redirect address is for
- [x] 2.5 Verify the application starts with `pnpm dev` when none of the three variables are set

## 3. Build the sender

- [x] 3.1 Add the `resend` dependency with `pnpm`
- [x] 3.2 Create `src/lib/email/client.ts` that lazily constructs the provider client and returns `null` when `RESEND_API_KEY` or `EMAIL_FROM` is absent
- [x] 3.3 Define the `SendResult` discriminated union covering sent, skipped with reason, and failed with error description
- [x] 3.4 Create `src/lib/email/send.ts` exporting `sendEmail`, which resolves the client, applies the environment and redirect guards, dispatches, catches every error, and returns a `SendResult` — it must not be able to throw
- [x] 3.5 Apply the non-production guard: outside `NODE_ENV === "production"` with no redirect configured, log the rendered subject, recipient, HTML, and text, and return a skipped result without a network call
- [x] 3.6 Apply the redirect guard: when `EMAIL_DEV_REDIRECT_TO` is set outside production, rewrite every recipient to that address and preserve the original recipient in the log
- [x] 3.7 Define the template contract type producing `{ subject, html, text }` with all three required
- [x] 3.8 Confirm no module outside `src/lib/email/client.ts` imports from `resend`

## 4. Test the sender

- [x] 4.1 Add unit tests for the unconfigured path: skipped result returned, no client constructed, nothing thrown
- [x] 4.2 Add unit tests for the non-production guard, asserting no provider call is made under `NODE_ENV === "test"`
- [x] 4.3 Add unit tests for the redirect guard, asserting recipient rewriting and original-recipient preservation
- [x] 4.4 Add unit tests asserting provider errors and network failures both return a failed result rather than throwing
- [x] 4.5 Add a unit test asserting a rendered template produces a non-empty subject, HTML, and text, and that a URL present in the HTML also appears in the text

## 5. Verify delivery

- [x] 5.1 Add a temporary throwaway script or route that renders a sample template and calls `sendEmail`, run it with `EMAIL_DEV_REDIRECT_TO` set, and confirm arrival — then remove it
- [x] 5.2 Confirm inbox placement rather than spam placement for at least Gmail, and record the result in `verification.md`
- [x] 5.3 Confirm the plain-text alternative renders correctly in a client with HTML disabled
- [x] 5.4 Confirm domain verification is complete and record the final status in `verification.md`

## 6. Close out

- [x] 6.1 Run `pnpm check`
- [x] 6.2 Run `pnpm test` (2 pre-existing failures in `hero-ctas.test.tsx` / `public-wishlist-layout-rendering.test.tsx`, unrelated to this change — verified present on `main` before this change)
- [x] 6.3 Run `pnpm typecheck`
- [x] 6.4 Update `docs/FUTURE_IMPROVEMENTS.md` to reflect that transactional email infrastructure now exists, so future items reference it rather than re-proposing it
