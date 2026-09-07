## Why

The guest dashboard reports total people and total invitations but does not show the person-level confirmed attendance that hosts need for venue planning, while declined responses use a neutral archived treatment that is easy to overlook. Hosts also have no quick way to copy the complete confirmed roster for hotel or reception staff.

## What Changes

- Replace the header's redundant total-invitation summary with unfiltered operational counts: total people, confirmed people, and pending invitations.
- Add a responsive `Copiar confirmados` action that copies every confirmed person from the complete guest list, independent of active search or RSVP filters.
- Format the copied roster as privacy-conscious plain text for WhatsApp and similar channels, grouped by invitation and retaining useful labels for unnamed companions.
- Give declined RSVP badges a dedicated muted red treatment while keeping confirmed green and pending neutral.
- Add focused tests for mixed primary/companion statuses, filter independence, unnamed companions, pluralization, clipboard feedback, and declined badge styling.
- Keep direct WhatsApp launching, CSV/PDF export, contact-data export, RSVP workflow changes, and database changes out of scope.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `guest-invite-management`: Add person-level attendance summary and complete confirmed-roster copy behavior to the guest dashboard.
- `design-system`: Add a dedicated semantic status treatment for declined RSVP badges.

## Impact

- Affects the protected guest-list page, guest header controls, RSVP status badges, guest-list utilities, and their colocated Vitest coverage.
- Uses the existing protected invitation view models and browser Clipboard API; no new API endpoint, dependency, environment variable, Prisma schema, or migration is required.
- Authorized collaborators may copy the roster because they already receive the same guest names and RSVP states; owner-only RSVP mutation permissions remain unchanged.
- Exact color and spacing must be checked against `A Wish For.dc.html` when the `claude_design` MCP is available.
