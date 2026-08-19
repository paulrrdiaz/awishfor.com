## Why

The product has no way to send an email. Nothing in `src/`, `package.json`, or `.env.example` references an email provider — the only mail that reaches a user today is Clerk's own authentication mail, which Clerk sends on its own infrastructure.

Every sharing path in the product is therefore a client-side handoff. `toWhatsAppShareUrl` builds a `wa.me` deep link and `toEmailShareUrl` builds a `mailto:` URL (`src/lib/wishlist/share.ts`), both of which hand the message to an app the user already has open. Even guest invites, which store a `primaryEmail` on the `Invite` model, are never actually emailed; the owner copies a link and delivers it themselves.

That works for sharing with people you already have a phone number for. It does not work for reaching someone who has no account yet, because there is nothing for them to be handed — the whole point is to tell them the product exists. `add-wishlist-collaborators` needs exactly that: when a wishlist owner shares with an email address that has no account, the invited person has to hear about it from the product itself.

This change builds that capability once, on its own, so the collaboration change consumes a working sender instead of standing up an email provider and a permissions model in the same diff. The capability is deliberately general: owner notifications when a gift is purchased and guest RSVP confirmations are both named in `docs/FUTURE_IMPROVEMENTS.md` and both need the same sender.

## What Changes

- Add Resend as the transactional email provider, wrapped behind a single internal sender module so no call site talks to the provider SDK directly.
- Validate `RESEND_API_KEY` and a sender identity through `src/env.ts` and add placeholders to `.env.example`, following the existing optional-key pattern used by `BRIGHT_DATA_API_KEY`.
- Degrade to a no-op when the provider is unconfigured, so the application boots, builds, and runs its test suite without an API key.
- Send outside the request/response path using `after()` from `next/server`, so a slow or failing provider cannot fail the mutation that triggered the email.
- Return a structured send result rather than throwing, so callers can record delivery state and offer a resend affordance instead of surfacing provider errors to users.
- Define email content as plain template functions returning a subject, an HTML body, and a required plain-text alternative — no email-rendering framework is added.
- Suppress delivery to real addresses outside production, so development and test activity cannot email a real person.

## Capabilities

### New Capabilities

- `transactional-email`: Defines provider configuration, the unconfigured no-op contract, the off-response-path send model, failure semantics, content structure including the plain-text requirement, and non-production delivery safety.

## Impact

- New runtime dependency: `resend`. No email-rendering framework (`@react-email/components` or equivalent) is added — see `design.md` for why.
- Affected files: `src/env.ts`, `.env.example`, and a new `src/lib/email/` module. No existing runtime code changes; this change adds a capability that nothing yet calls.
- **Operational precondition:** the sending domain must be verified with Resend (DNS records for SPF and DKIM) before any mail reaches a real inbox. Until that is done, Resend's shared test sender only delivers to the account owner's own address. This is a DNS task outside the codebase and must be completed before the collaboration change ships, not before this change merges.
- No Prisma schema, database migration, tRPC contract, or Clerk configuration change. Delivery bookkeeping (when a message was last sent, how many times) belongs to the feature that sends it, not to this capability.
- **This change ships no user-visible behavior.** It adds a sender that no code path calls yet. That is intentional: it keeps provider setup, environment validation, and delivery safety reviewable on their own, separately from the authorization model in `add-wishlist-collaborators`.

## Non-Goals

- **No delivery queue, retry, or backoff.** There is no job infrastructure in this repository — no Inngest, Trigger.dev, BullMQ, QStash, or cron. Adding one is a much larger change than this needs. A failed send is recorded and re-sent manually by the user; consuming features are required to expose a resend affordance rather than assume delivery.
- **No bounce, complaint, or webhook handling.** Resend can report these; consuming them requires an endpoint and a place to store the result, and no feature needs it yet.
- **No email-rendering framework.** Plain template functions are sufficient for the one email that exists after this change.
- **No internationalization.** There is no i18n framework in this codebase — all UI copy and error strings are hardcoded Spanish. Email copy follows that convention. The `Locale` enum on `Wishlist.language` is stored data with no translation layer behind it, and this change does not build one.
- **No marketing, bulk, or campaign email**, and therefore no unsubscribe management. This capability covers transactional mail triggered by a user action only.
