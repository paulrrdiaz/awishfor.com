## Why

A guest who opens a personalized invite link today gets RSVP as a small inline control tucked into the hero greeting: one click flips one enum, the companions on the invite have no say, and there is no deadline anywhere. Owners cannot see who in a party is actually coming, only whether the primary guest tapped a button. The design file settles this — `PublicWishlistPages.dc.html` section `08 · ArchTrio · Cielo Suave Rosa · Baby Shower · con RSVP 3a` promotes RSVP to its own themed section between hero and gift list, with a per-companion answer and a response deadline, and repaints the gift list as a full-bleed card band so the page reads as three distinct surfaces instead of one continuous tint.

## What Changes

- **BREAKING** — `GuestWelcomeSection` is removed and replaced by a new `RsvpSection`. The hero no longer greets the guest; guest identity moves into the RSVP card. The `tone="on-photo"` variant disappears with it, since the new section never sits over a photo.
- New `RsvpSection` renders directly above the gift list, after the welcome message, in all nine public layouts, only when the view model carries a `guest`. The plain `/w/<slug>` link never renders it.
- The section asks for a mandatory primary answer (submit stays disabled until "Sí, ahí estaré" or "No podré ir" is chosen), lists each named companion with a `Viene` / `No viene` toggle defaulting to `Viene`, and commits everything through one "Enviar confirmación" submit.
- Choosing "No podré ir" collapses the companion block and submits every companion as declined.
- After a response the section renders a compact confirmed card with a "Cambiar" link that re-opens the form. Once `eventDate` has passed the card is read-only.
- **BREAKING** — `invite.respond` changes shape from `{ wishlistSlug, guestSlug, status }` to a form submit carrying per-companion statuses.
- Per-companion RSVP status becomes real data: `InviteExtraGuest` gains a `status` column.
- A wishlist gains an optional `rsvpDeadline`, editable next to the event date in both the creation wizard and the settings form. When null, the deadline line is omitted from the section.
- The Invitados dashboard row shows a party count ("2 de 3 confirmados") so per-companion answers are visible to the owner.
- The gift list section becomes a full-bleed band painted `var(--card)` with a top border only, replacing today's untinted section that inherits the page background.

### Non-goals

- Proposals `3b` (sello + lista de asistentes) and `3c` (banda con foto y cinta) are not implemented. Only `3a` ships.
- The plain `/w/<slug>` link gains no RSVP affordance and no name-based guest lookup — the `guest-list-finder` capability's "No name-based search" requirement stands unchanged.
- Guest-name hero treatments from `Guest Name Hero Proposals.dc.html` (directions 1b/2a) remain an open, separate decision. This change removes the hero greeting; it does not choose a replacement hero treatment.
- No email or WhatsApp RSVP reminders, and no owner-facing RSVP notification.

## Capabilities

### New Capabilities

_None. The RSVP section extends the existing personalized-invite-page capability rather than introducing a new one._

### Modified Capabilities

- `personalized-invite-page`: the "Guest section in every layout" requirement is replaced by an RSVP section requirement — mandatory primary pick, per-companion toggles defaulting to attending, single submit, confirmed and read-only states, deadline line, and removal of the hero greeting. The "Public RSVP response" requirement changes to accept per-companion statuses. `PublicGuestViewModel` extra guests gain a stable `id` and a `status`.
- `guest-invite-management`: the invite data model requirement gains per-extra-guest RSVP status, and the Invitados management UI requirement gains the party confirmation count on each row.
- `public-wishlist-layout`: the "Required section order" requirement inserts the RSVP section between the welcome message and the gift list for personalized renders, and the gift list section gains its `var(--card)` full-bleed band treatment.
- `wishlist-settings`: the "Edit core wishlist content" requirement gains the optional RSVP deadline field.
- `creation-wizard`: the "Event Details step" requirement gains the optional RSVP deadline field.

## Impact

**Schema / migration**

- `prisma/schema.prisma`: `InviteExtraGuest.status RsvpStatus @default(pending)`; `Wishlist.rsvpDeadline DateTime?`. One additive migration, no backfill required (existing extra guests default to `pending`).

**API**

- `src/server/api/routers/invite.ts` — `respond` input and behavior.
- `src/server/api/routers/wishlist.ts` — `create` / `updateSettings` / `publish` schemas carry `rsvpDeadline`.

**Server**

- `src/server/services/public-invite.service.ts` — map extra-guest `id` and `status`.
- `src/server/mappers/view-models.ts` — `PublicGuestExtraGuestViewModel` gains `id` and `status`; `PublicWishlistViewModel` gains `rsvpDeadline`.
- `src/server/mappers/public-wishlist.mapper.ts` — carry `rsvpDeadline`.

**Components**

- New `src/components/shared/rsvp-section.tsx` (+ stories).
- Removed `src/components/shared/guest-welcome-section.tsx` and its stories; `src/components/shared/rsvp-control.tsx` is rewritten as the form body or absorbed.
- All nine layouts under `src/components/layouts/public-wishlist/` swap the import and move the section out of the hero.
- Gift band at four sites: `src/components/shared/public-wishlist-body.tsx`, `arch-trio-layout.tsx`, `collage-staggered-layout.tsx`, `split-image-right-layout.tsx`.
- `src/components/features/dashboard/guests/guest-row.tsx` and `rsvp-status-badge.tsx` — party count.
- `src/components/features/wizard/details-step.tsx` and `src/components/features/dashboard/settings/wishlist-settings-form.tsx` — deadline field.

**Not affected**

- No new environment variables. No new dependencies. Clerk, auth, and route protection unchanged — `invite.respond` stays a `publicProcedure` keyed by wishlist slug + guest slug, so the personalized URL remains the credential.
