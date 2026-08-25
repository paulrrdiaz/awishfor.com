## Why

Wishlist owners with dozens of invitations cannot quickly find a specific guest or isolate the people who have not responded. Adding focused search and RSVP-status filters makes the existing Invitados view useful for day-to-day follow-up without turning it into an analytics surface.

## What Changes

- Add a guest-search field to the Invitados dashboard view that matches primary guest names, named companions, email addresses, and phone numbers.
- Make textual name and email matching case- and accent-insensitive, and make phone matching tolerant of formatting characters.
- Add invitation-level RSVP filter chips for `Todos`, `Pendientes`, `Confirmados`, and `No asistirán`, with counts derived from the complete invitation list.
- Persist the search term and RSVP filter in URL search parameters so refresh, browser navigation, and copied dashboard URLs retain the current view.
- Keep the existing header totals global while rendering only invitations that match both active controls.
- Add a dedicated filtered empty state with an action that clears the active search and status filter; preserve the existing zero-invitations empty state.
- Keep the toolbar responsive and visually aligned with the existing dashboard and gift-filter patterns.
- Explicitly exclude sorting, pagination, database/API-level filtering, bulk actions, and opened/unopened engagement filters from this change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `guest-invite-management`: Extend the Invitados management UI with URL-backed guest search, invitation-level RSVP filtering, stable global counts, and a filtered-results empty state.

## Impact

- Affected application areas include `/dashboard/wishlists/[id]/guests`, `src/components/features/dashboard/guests/*`, and a new guest filtering/search-parameter utility under the existing dashboard/lib conventions.
- The existing `invite.list` response already contains every field required for filtering; no tRPC contract, Prisma schema, migration, environment variable, or dependency change is expected.
- Tests will cover normalization and combined-filter behavior, URL parameter parsing, filter controls, counts, and empty-state behavior.
