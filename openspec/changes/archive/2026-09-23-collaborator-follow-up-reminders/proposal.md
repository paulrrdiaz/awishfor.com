## Why

Wishlist collaborators already manage the guest list day-to-day (view RSVP status, party sizes, guest contact info) but cannot use the contextual follow-up reminder feature added in the previous change — only the owner sees the recommended reminder and can copy it. For wishlists where the owner delegates guest-list follow-up to a co-host, this blocks the exact workflow the feature exists for. The restriction was a deliberate initial scope choice, not a technical necessity, and the owner has asked to lift it now that the feature has shipped.

## What Changes

- Collaborators (non-owner `WishlistMember`s) can now see the contextual follow-up recommendation and copy control on eligible invitation rows/cards, at desktop and mobile widths, the same as the owner.
- `recordFollowUpCopy` authorizes via wishlist ownership OR collaborator membership (reuses the existing collaborator-inclusive access check), instead of owner-only.
- The reminder recommendation continues to be computed from view-recency data, but the exact per-guest `viewCount` and `lastViewedAt` timestamp remain owner-only — collaborators get only the coarse recency category (never/recent/intermediate/stale) needed to pick the right reminder kind and indicator text, not the raw analytics values.
- RSVP recording, correcting, and reopening (`recordOwnerRsvp`, `reopenOwnerRsvp`) are **unchanged** and remain owner-only — out of scope for this change.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `contextual-invite-reminders`: the requirement restricting follow-up-copy recording to the wishlist owner changes to allow collaborators; the copy-recording scenario for collaborators changes from rejection to success.
- `guest-invite-management`: the requirement that collaborators receive no follow-up control or copy metadata changes to grant them the same follow-up control the owner has, on both desktop and mobile.

## Impact

- `src/server/services/invite.service.ts`: `recordFollowUpCopy` switches from `getOwnerInvite` (owner-only) to a collaborator-inclusive access check.
- `src/server/mappers/dashboard-invite.mapper.ts` / `src/server/api/routers/invite.ts`: the dashboard invite view model needs a way to convey view-recency to collaborators for reminder derivation without leaking `viewCount`/`lastViewedAt`, which stay gated by the existing owner-only analytics rule in `wishlist-view-models`.
- `src/app/(protected)/dashboard/wishlists/[id]/guests/page.tsx`, `src/components/features/dashboard/guests/guest-row.tsx`: drop the `isOwner` gate around the follow-up block; keep the separate raw view-count/last-viewed indicator owner-gated.
- Tests: `src/server/api/routers/invite.test.ts`, `src/server/services/invite.service.test.ts`, page/guest-row tests covering the previous owner-only behavior need updated expectations.
- `openspec/specs/contextual-invite-reminders/spec.md`, `openspec/specs/guest-invite-management/spec.md`: requirement text and scenarios updated to match.
