## Context

See [proposal.md](proposal.md) for the motivation. The current `Invite` model stores a primary RSVP and per-companion statuses. Public `invite.respond` writes those values while the RSVP window is open; dashboard invitation actions only create, edit, and delete invite identity data. Personalized pages receive the invite state through the public invite resolver, while the dashboard already receives `isOwner` from the wishlist overview.

## Goals / Non-Goals

**Goals:**

- Record a whole-party offline RSVP as an owner-authoritative, locked result.
- Keep the public RSVP route and mutation unable to change a locked result.
- Preserve a safe owner correction and intentional reopening path.
- Keep ownership enforcement server-side and independent of dashboard visibility.

**Non-Goals:**

- Separate response history, notifications, messaging, or guest authentication.
- Changing an unlocked guest RSVP's existing deadline rules.
- Changing the invitation's primary/companion model or RSVP filter semantics.

## Decisions

### Persist source and lock independently

Add nullable `responseSource` (`guest` or `owner`) and `responseLockedAt` fields to `Invite`. A new invitation has neither field. A self-service submission sets source to `guest` and leaves `responseLockedAt` null. An owner record or correction sets source to `owner`, refreshes `respondedAt`, and sets or refreshes `responseLockedAt`. Reopening clears both fields without changing the displayed RSVP statuses or `respondedAt`.

Keeping the lock as a separate timestamp makes the authorization decision unambiguous and retains when the host made the response authoritative. It is preferable to inferring lock state from a non-pending RSVP status, because self-service responses must remain editable under the current rules.

Existing records will remain nullable/unlocked after migration. This preserves their previous guest-editable behavior and avoids guessing whether a historical response came from the guest or host.

### Use an owner-specific server mutation

Add protected mutations/actions for recording and reopening a response. They load the invite, compare the authenticated local user to the wishlist's owner, then mutate the primary invitation and all current extra guests atomically. This differs from existing invite edit access, which is available to collaborators through shared wishlist access.

The record input contains a primary status plus every current extra-guest identifier and status. The service validates that identifier set exactly matches the invitation. If the primary guest declines, the service writes every companion as declined regardless of submitted companion values. Owner recording bypasses the self-service RSVP deadline because it represents an externally received answer.

An alternative was to extend the public response procedure with an authenticated mode. A distinct owner mutation keeps public-link authorization, deadline enforcement, and owner-only override behavior isolated.

### Enforce lock at both public boundaries

The personalized resolver exposes lock/source state needed to render the summary, and the public RSVP section suppresses its edit affordance for a locked response. The public response mutation also checks the lock before writing, so direct API calls cannot bypass the interface. A reopened invite returns to the existing self-service lifecycle.

### Keep dashboard controls minimal and explicit

Owner cards expose one response flow for pending or unlocked invitations, an edit/correct flow for locked invitations, and a distinct reopen action with confirmation. The page passes `isOwner` only to control presentation; the server remains authoritative. Locked cards carry a short owner-recorded label so their state is understandable without exposing contact details or audit data to collaborators.

## Risks / Trade-offs

- [A guest submits while an owner is recording a response] → The public mutation checks the persisted lock and the owner write is transactional; surface a normal save failure and refresh the dashboard if a concurrent change wins.
- [An owner accidentally locks a response] → Require a clear final save action and provide the deliberate reopen control.
- [Companion IDs change when the owner edits invite membership] → Validate against the current companion set and require the owner to choose attendance again after changing the party.
- [Historic responses have no source] → Render them as existing unlocked responses and do not make provenance claims.

## Migration Plan

1. Add nullable response-source and lock-timestamp columns, plus the response-source enum if represented as a Prisma enum; generate the Prisma client.
2. Deploy the migration with no backfill so pre-existing RSVP outcomes remain unlocked.
3. Deploy server mutations and public lock enforcement together, then release dashboard controls and personalized read-only copy.
4. Roll back application code safely by leaving the additive columns in place. If the migration itself must be reversed before data is relied on, remove the nullable columns and enum using the standard migration rollback process.

## Validation

- Unit-test service behavior for full-party writes, deadline bypass, correction, reopening, owner authorization, and exact companion-set validation.
- Test the public response service rejects a locked response and preserves existing self-service behavior when unlocked.
- Test dashboard and public RSVP states for owner, collaborator, locked, reopened, confirmed, and declined cases.
- Run `pnpm check`, `pnpm test`, and `pnpm typecheck` after implementation.
