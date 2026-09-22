## 1. Persist Follow-Up State

- [x] 1.1 Add `InviteFollowUpKind`, nullable latest-kind/copy-time fields, and the paired-null invariant to the Prisma schema and migration.
- [x] 1.2 Regenerate the Prisma client and add migration/schema verification for existing invites defaulting to no copied follow-up.

## 2. Build the Reminder Domain

- [x] 2.1 Add pure calendar-day and view-recency classification helpers with boundary tests for 48 hours, 14 days, event stages, today, and past events.
- [x] 2.2 Implement the single-follow-up state projection for pending, confirmed, and declined invites, including prior-stage copy emphasis, with a complete state-matrix test suite.
- [x] 2.3 Implement friendly first-touch, RSVP, expired-deadline, and staged event message builders with tests for event types and every missing optional detail combination.
- [x] 2.4 Add privacy regression assertions proving generated messages never expose view tracking, view times/counts, or copy metadata.

## 3. Expose Owner-Only State and Mutation

- [x] 3.1 Extend dashboard invite types and mapping with nullable follow-up fields in the owner-only branch, with tests that collaborator and public projections omit them.
- [x] 3.2 Add and validate the owner-scoped record-follow-up-copy service operation that updates only the latest kind and copy time.
- [x] 3.3 Expose the record-follow-up-copy invite mutation and cover owner success, collaborator rejection, invalid kind, and cross-wishlist access in router/service tests.

## 4. Integrate the Invitados Page

- [x] 4.1 Derive one event-proximity state and per-invite follow-up projections from the existing wishlist overview and invite list without adding another query.
- [x] 4.2 Add the event-level proximity indicator for the 14-day, 7-day, tomorrow, today, and past-event states, with date-boundary component tests.
- [x] 4.3 Pass the same derived follow-up projection to every responsive presentation and keep it absent for non-owner collaborators.

## 5. Add Responsive Copy Actions

- [x] 5.1 Import the authoritative Claude Design project and map its existing Invitados card, badge, button, spacing, and feedback patterns to the new states.
- [x] 5.2 Build the reusable contextual follow-up copy control with clipboard-first sequencing, retryable clipboard failure, immediate copied state, and a distinct persistence-warning path.
- [x] 5.3 Update guest cards to show the human-readable last-view/recommendation indicator and one eligible contextual action while retaining personalized-URL copy.
- [x] 5.4 Replace the mobile pending-card reminder navigation with direct copy, keeping existing general and guest-specific share URLs functional as fallbacks.
- [x] 5.5 Cover desktop/mobile parity, recent-view de-emphasis, same-stage copied state, later-stage reactivation, and declined/ineligible omission in component tests.

## 6. Validate and Synchronize Tracking

- [x] 6.1 Run focused invite-follow-up, message, mapper, service/router, and guest-card tests and resolve failures.
- [x] 6.2 Run `pnpm check` and resolve Biome errors.
- [x] 6.3 Run `pnpm test` and resolve regressions.
- [x] 6.4 Run `pnpm typecheck` and resolve TypeScript errors.
- [x] 6.5 Add or update the corresponding contextual invite-reminder milestone entry in `docs/TASKS.md`, then mark it complete only after implementation and required validation pass.
