## Why

Guests sometimes communicate attendance by WhatsApp or phone rather than through their personalized invite link. Owners currently cannot record those answers, leaving RSVP totals incomplete and allowing the guest link to later overwrite an owner-confirmed offline response.

## What Changes

- Let the wishlist owner record a complete RSVP for an invited primary guest and each companion from the Invitados dashboard.
- Make an owner-recorded RSVP authoritative: lock the personalized public link so a guest cannot submit or change that response.
- Let the owner correct a locked RSVP while keeping it locked, or deliberately reopen it to restore guest self-service RSVP.
- Persist RSVP source and lock state so dashboard and personalized invite views can represent the authoritative response consistently.
- Preserve existing guest self-service behavior for invitations that the owner has not locked.

Non-goals:

- Sending RSVP notifications or contact messages.
- Creating guest accounts or authentication for personalized links.
- Adding a history of every individual RSVP revision.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `guest-invite-management`: owners can record, correct, and reopen authoritative RSVP responses from the guest dashboard.
- `personalized-invite-page`: public RSVP behavior respects owner-locked responses and presents them read-only.

## Impact

- Prisma `Invite` data model and migration for response provenance and lock state.
- Invite service, protected tRPC/server-action mutations, validators, view models, and owner authorization.
- Guest dashboard RSVP controls and personalized RSVP rendering/public mutation guard.
- Focused service, router/action, and component tests; no new environment variables or external dependencies.
