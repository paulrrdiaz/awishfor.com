## 1. RSVP persistence and domain logic

- [x] 1.1 Add nullable RSVP response-source and response-lock fields to the Prisma invite model; create and apply the migration, then regenerate Prisma client types.
- [x] 1.2 Extend invite and public guest view models/mappers with RSVP source and lock state without exposing guest contact data.
- [x] 1.3 Add owner-only RSVP domain operations that atomically record/correct a complete party response, validate the exact companion set, bypass the public deadline, and maintain the owner lock.
- [x] 1.4 Add the owner-only reopen operation that clears provenance and lock state while preserving attendance statuses.
- [x] 1.5 Update public RSVP persistence to set guest provenance when unlocked and reject owner-locked invitations before any writes.

## 2. Protected API and dashboard actions

- [x] 2.1 Add and validate protected owner RSVP record/correct and reopen inputs and router procedures.
- [x] 2.2 Enforce actual wishlist ownership in the new mutations, rejecting collaborators even when they can otherwise access the wishlist.
- [x] 2.3 Add server actions for dashboard RSVP record/correct and reopen flows, including guests-route revalidation.

## 3. Owner and guest experiences

- [x] 3.1 Pass owner capability from the guests page to invitation cards and keep RSVP controls absent for collaborators.
- [x] 3.2 Build the dashboard response control for primary and companion attendance, including the primary-declined behavior that records every companion as declined.
- [x] 3.3 Add locked-response labeling plus explicit owner correction and confirmed reopen interactions on guest cards.
- [x] 3.4 Update personalized RSVP summaries to identify owner-registered locked responses and remove all guest edit paths for them.
- [x] 3.5 Ensure the public RSVP form and mutation error state handle a response that becomes locked after the personalized page loads.

## 4. Tests and verification

- [x] 4.1 Add domain and API tests for ownership, whole-party validation, deadline bypass, locking, correction, reopening, and public locked-response rejection.
- [x] 4.2 Add dashboard and RSVP component tests for owner versus collaborator controls and locked versus reopened summaries.
- [x] 4.3 Run `pnpm check` and resolve reported issues.
- [x] 4.4 Run `pnpm test` and resolve or report failures.
- [x] 4.5 Run `pnpm typecheck` and resolve or report failures.
