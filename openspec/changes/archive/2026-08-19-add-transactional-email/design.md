## Context

This repository has no email infrastructure and no background job infrastructure. Both absences shape every decision below.

What exists today that is relevant:

- `src/env.ts` validates environment through `@t3-oss/env-nextjs` with `emptyStringAsUndefined: true`. `BRIGHT_DATA_API_KEY` establishes the optional-secret pattern: `z.string().min(1).optional()` in the `server` block, mirrored in `runtimeEnv`.
- `src/lib/wishlist/share.ts` already owns per-event Spanish copy for WhatsApp and `mailto:` sharing, including an `EMAIL_SUBJECTS` map. That is client-side handoff copy, not server-sent mail, but it establishes where event-flavored Spanish strings live.
- Next.js 16 provides `after()` from `next/server`, which schedules work to run after the response is sent. This is the only out-of-band execution primitive available without adding a dependency.
- Vitest runs the unit suite. Nothing in it currently needs network isolation, because nothing makes outbound calls on a code path under test.

The consuming feature, `add-wishlist-collaborators`, needs exactly one email: an invitation to collaborate on a wishlist. Designing a general email platform for a single message would be over-building; designing a sender so narrow that the second message requires rewriting it would be under-building. The line this change draws is: own the *transport, configuration, and safety* generally; keep *content* trivial until a second message proves what the shared shape should be.

## Goals / Non-Goals

**Goals**

- One place in the codebase that talks to an email provider.
- The application boots, builds, typechecks, and tests with no API key present.
- A provider outage cannot fail a user's mutation.
- No developer or test run can email a real person.
- Callers can tell whether a send succeeded, without handling provider-specific errors.

**Non-Goals**

- Queueing, retry, backoff, or scheduled sending.
- Bounce and complaint handling.
- Email rendering frameworks, design systems for email, or preview tooling.
- Internationalization of email copy.
- Marketing email, list management, or unsubscribe handling.
- Storing a log of sent messages. Delivery bookkeeping belongs to the sending feature.

## Decisions

### 1. Resend as the provider

Chosen for a first-party TypeScript SDK, straightforward domain verification, and a free tier sufficient for invitation volume at this stage. The alternatives were considered and rejected:

- **Clerk's invitation API** would send the signup email for the no-account case without adding a provider at all. Rejected because it only covers that one branch — the collaboration change also emails people who already have accounts — and because it gives up control over Spanish copy and branding while coupling collaboration invitations to Clerk's invitation lifecycle. Using it would mean either accepting an inconsistent experience across the two branches or adding a second sender anyway.
- **Nodemailer against SMTP** is provider-agnostic but pushes deliverability, DKIM signing, and reputation management onto us.
- **AWS SES** is cheaper at volume that this product does not have, and costs more setup.

The decision is contained: every call site goes through `src/lib/email/`, so replacing the provider means rewriting one module.

### 2. A single sender module, provider type never escapes it

```
src/lib/email/
  client.ts      — lazily constructs the Resend client; returns null when unconfigured
  send.ts        — sendEmail(): the only exported send entry point
  templates/     — one module per message: (input) => { subject, html, text }
```

Callers import `sendEmail` and a template function. They never import from `resend`, and no Resend type appears in any signature outside `client.ts`. This is what makes decision 1 reversible and what keeps the no-op and non-production guards impossible to bypass — there is no second path to the network.

### 3. Unconfigured means no-op, not failure

`RESEND_API_KEY` is optional in the Zod schema, matching `BRIGHT_DATA_API_KEY`. When it is absent, `sendEmail` logs and returns a "skipped" result without constructing a client.

The alternative — requiring the key — would mean every developer needs a Resend account before `pnpm dev` starts, CI needs a secret to run unit tests, and a missing key in production becomes a boot failure rather than a degraded feature. Optional-with-no-op keeps the failure local to the feature that needs mail.

This has a consequence worth stating plainly: **a misconfigured production deployment silently sends nothing.** The mitigation is that the send result is structured (decision 5) and consuming features record it, so the state is visible in the collaborator UI as an unsent invitation rather than invisible.

### 4. Send after the response, never inside the mutation

```
mutation
  ├─ validate
  ├─ write to database  ─────► committed
  ├─ return to caller   ─────► user sees success
  └─ after(() => sendEmail(...))   ← runs post-response
```

The rejected alternative is awaiting the send inside the mutation. That couples a database write the user cares about to a third-party HTTP call they do not: a Resend timeout would surface as a failed invitation even though the grant was already persisted, and the user's natural response — retry — would then hit a uniqueness constraint on a row that already exists.

Ordering matters and is non-negotiable: **persist first, then schedule the send.** Never the reverse, or a failed write emails someone about access they do not have.

`after()` is not durable. If the serverless instance dies between response and send, the mail is lost with no retry. This is accepted, and it is precisely why decision 5 requires consuming features to expose a resend affordance — with no queue in the repository, the user's resend button *is* the retry mechanism.

### 5. Structured result, never a thrown provider error

```ts
type SendResult =
  | { status: "sent"; id: string }
  | { status: "skipped"; reason: "unconfigured" | "non-production" }
  | { status: "failed"; error: string };
```

`sendEmail` catches everything. It cannot throw, because it runs inside `after()` where a rejection is an unhandled promise rejection in a request that has already been answered — invisible in logs that matter and unattributable to the user action that caused it.

Returning a discriminated result also lets consuming features distinguish "we deliberately did not send" from "we tried and failed," which are different things to show a user.

### 6. Non-production sends never reach a real address

Two independent guards, because either one alone has a failure mode:

1. **Environment guard.** Outside `NODE_ENV === "production"`, `sendEmail` logs the full rendered message to the console and returns `{ status: "skipped", reason: "non-production" }` without a network call. A developer testing the invitation flow locally sees the subject, HTML, text, and recipient in their terminal.
2. **Explicit dev override.** A `EMAIL_DEV_REDIRECT_TO` variable, when set, sends real mail but rewrites every recipient to that single address. This is the escape hatch for actually verifying rendering and deliverability without the risk of a seeded database emailing strangers.

The environment guard alone would make real delivery untestable before production. The redirect alone would fail open — forget to set it and development emails real users. Together, the default is safe and the override is deliberate.

Note that Resend's own shared test sender is additionally restricted to the account owner's address until the domain is verified, which is a third layer during initial setup but not something to rely on afterwards.

### 7. Plain template functions, no rendering framework

Each template is a function returning `{ subject, html, text }`. Inline styles, table-based layout where structure is needed, no build step.

`@react-email/components` is the obvious alternative and this is a React codebase, so the pull is real. Rejected for now because it is a substantial dependency plus a rendering step serving exactly one message, and because the JSX-to-email-HTML pipeline is a category of bug this change does not need to own yet. The template signature is deliberately the same shape React Email would produce, so adopting it later means changing template bodies without touching `sendEmail` or any call site.

**`text` is required, not optional.** An HTML-only message is a spam-filter signal, and the invitation email exists specifically to reach someone who has never heard of this product and has no reason to fish it out of a spam folder.

### 8. Copy is hardcoded Spanish

There is no i18n framework in this repository. UI copy and server error messages are Spanish string literals throughout — `"Ese slug ya está en uso por otra lista"`, `"El motivo elegido no está disponible para este tipo de evento"`. The `Locale` enum on `Wishlist.language` is persisted data with no translation layer behind it.

Email copy follows the same convention. Building a translation layer for one email would be the only i18n in the codebase, and it would be i18n for the *email* while the application it links to remains monolingual Spanish — the invitee would read a translated email and land on a Spanish dashboard.

This is recorded as a known limitation. When the product internationalizes, email is one of the surfaces to translate, and it is not a special case.

## Risks

- **Domain verification is a DNS task with real lead time.** SPF and DKIM records for the sending domain must propagate before any mail reaches a real inbox. This blocks the *collaboration* change from shipping, not this one, but it needs starting early because it is outside the codebase and outside the repository's control.
- **Deliverability of a first-ever sending domain is unproven.** A domain with no sending history lands in spam more often. The plain-text alternative, a real reply-to address, and low initial volume all help; nothing eliminates it. Task 5.2 verifies inbox placement against at least Gmail before the collaboration change depends on it.
- **`after()` is not durable.** Accepted, mitigated by the resend affordance in consuming features. Revisit if a future email has no plausible manual retry — payment receipts would be an example.
- **No bounce handling means invalid addresses are silently discarded.** In the collaboration flow this shows up as an invitation that stays pending forever with no explanation. Acceptable at this scale; the collaborator UI showing pending state is the visible signal.
- **Unit tests must never make a network call.** The environment guard already prevents it under `NODE_ENV === "test"`, but tests should assert the guard holds rather than trusting it, since a regression there is silent and expensive.
