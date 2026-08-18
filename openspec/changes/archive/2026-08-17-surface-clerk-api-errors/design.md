## Context

See `proposal.md` for motivation. The custom login and sign-up forms currently use Clerk v7's future/signal hooks and inspect only the single `error` returned by a password method. Clerk can expose a structured API response containing several errors, each with an optional parameter name, but the forms currently render only one `longMessage` in the general banner.

The desired behavior comes from the latest `sietch-init` authentication change, but its helper checks the method-level error directly with `isClerkAPIResponseError`. Clerk v7 documents the method-level value as a `ClerkError` and can wrap the API response as its `cause`; the implementation must therefore support both a direct API response error and a wrapped API response error. No auth form currently has component-level error-handling coverage.

## Goals / Non-Goals

**Goals:**

- Normalize structured Clerk API errors once and reuse the behavior in both password forms.
- Preserve all messages from one API response and group known email/password messages by form field.
- Translate known Clerk email/password codes into Spanish before they reach the form.
- Keep a deterministic general fallback for runtime, malformed, or unassociated errors.
- Make the normalization behavior independently testable and verify each form consumes it.

**Non-Goals:**

- Changing OAuth, SSO callback, session finalization, redirect validation, or route protection.
- Extending structured field mapping to password recovery, email-code verification, OAuth errors, name, or terms acceptance.
- Changing Clerk instance configuration.

## Decisions

### Use a shared Clerk error normalizer

Add a small pure utility under `src/lib/auth/` that accepts the method-level Clerk error and returns grouped email messages, password messages, and general messages. Both forms will convert the grouped field messages into `react-hook-form` server errors and join multiple messages for the same display location without discarding any.

This is preferred over copying the upstream helper into both components because the parsing rules and fallbacks would otherwise drift. Keeping the utility independent of React also makes direct, exhaustive unit tests inexpensive.

### Recognize direct and wrapped API response errors

Use Clerk's exported `isClerkAPIResponseError` guard. First test the received value; if it is a method-level `ClerkError`, also test its `cause`. When a response error is found, flatten its `errors` array and use each entry's `longMessage`, falling back to `message`.

If no structured response is available, treat the method-level `longMessage` as one general error. Use the existing Spanish generic message only when Clerk supplies no user-facing message. This adapts the upstream intent to Clerk v7's documented signal error contract instead of assuming the returned object is always the API response itself.

### Translate known auth error codes

Translate the Clerk codes expected from the email/password flows in the shared normalizer. This includes account-not-found, existing-email, incorrect-password, invalid-email, and password-strength errors. The code is more stable than Clerk's English `longMessage`, keeping the Spanish UI consistent while unknown codes retain Clerk's message so no guidance is lost.

### Preserve and recover the Clerk client state

Mount `ClerkProvider` once in the root layout so every route observes one Clerk client. Match the same full non-static request surface used by `sietch-init` and Clerk's Next.js quickstart, including API routes and `/__clerk`, so every page rendered under that provider receives Clerk middleware state. Route protection remains opt-in inside the middleware; broad middleware coverage does not make marketing, creation, or public-wishlist pages private.

If email-code delivery reports `client_state_invalid` directly or through its API-response cause, reset the stale in-memory sign-up state and retain the form with a Spanish retry message. The next submit begins a new Clerk sign-up attempt instead of attempting to reuse the missing one.

### Map only the agreed login/sign-up fields

Map Clerk parameter names `email_address` and `identifier` to the email field, and `password` to the password field. Any unknown or absent parameter name goes to the general banner. Supporting both email parameter variants accounts for Clerk's sign-up email field and sign-in identifier field without expanding scope beyond email/password authentication.

Name and legal-acceptance errors remain general because this change is intentionally source-aligned to the agreed email/password delta. They can be mapped in a follow-up if product feedback shows a need.

### Preserve existing control-flow exceptions

The sign-in form's `session_exists` handling runs before normal error presentation so an already-active session still redirects. At the start of a new valid submission, each form clears its prior general banner and prior server-originated field errors; client-side Zod validation continues to run before Clerk is called.

Successful login, verification, redirects, and all social-provider paths remain byte-for-byte behaviorally unchanged.

### Validate at utility and form boundaries

Unit tests for the normalizer cover direct response errors, response errors wrapped as a cause, multiple messages for one field, simultaneous email/password/general messages, and non-response fallbacks. Focused jsdom component tests mock the Clerk hooks and verify that login and sign-up render returned messages at the expected field or general location while remaining on the form.

Project validation remains `pnpm check`, `pnpm test`, and `pnpm typecheck`.

## Risks / Trade-offs

- [Clerk changes its parameter names] → Keep the mapping centralized and send unknown names to the general banner so messages remain visible.
- [Clerk returns the same message through nested and wrapper errors] → Parse the structured response once and avoid additionally rendering the wrapper message when a response array is present.
- [Clerk introduces an unmapped error code] → Preserve Clerk's message until Spanish copy is added to the centralized map.
- [Manual server errors persist across attempts] → Clear server-originated field errors and the general banner before processing each new valid submission.
- [Stale Clerk client state] → Reset only on `client_state_invalid`, then let the user submit a new attempt.
- [Root provider outlives a narrowly matched route layout] → Run Clerk middleware for every non-static application request and Clerk frontend route while keeping authorization checks scoped to protected resources.

## Migration Plan

No data, API, environment, or dependency migration is required. Deploy the form and utility changes together. Rollback is a normal code revert to the existing general-banner behavior.
