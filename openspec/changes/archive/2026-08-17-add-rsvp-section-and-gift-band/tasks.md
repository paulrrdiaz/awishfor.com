## 1. Schema and migration

- [x] 1.1 Add `status RsvpStatus @default(pending)` to `model InviteExtraGuest` in `prisma/schema.prisma`
- [x] 1.2 Add `rsvpDeadline DateTime?` to `model Wishlist` in `prisma/schema.prisma`
- [x] 1.3 Run `pnpm prisma migrate dev` to generate the additive migration, and `pnpm prisma generate` to refresh `src/generated/prisma` — DEVIATION: `migrate dev` reports reproducible drift (FK/index ordering) on nearly every existing table, unrelated to this change; wrote the migration SQL by hand (matches Prisma's own generated conventions) and applied it with `migrate deploy` instead, which applies pending migrations without the shadow-db diff. `migrate status` is clean and the client regenerated correctly. Pre-existing drift is unresolved and out of scope — `migrate dev` will keep failing for the next person until it's addressed separately.

## 2. View models and mappers

- [x] 2.1 Change `PublicGuestExtraGuestViewModel` in `src/server/mappers/view-models.ts` to `{ id: string; name: string | null; status: string }`
- [x] 2.2 Add `rsvpDeadline: string | null` to `PublicWishlistViewModel` in `src/server/mappers/view-models.ts`
- [x] 2.3 Map extra-guest `id` and `status` in `resolvePersonalizedInvite` (`src/server/services/public-invite.service.ts`) instead of dropping to `{ name }`
- [x] 2.4 Carry `rsvpDeadline` through `mapPublicWishlist` in `src/server/mappers/public-wishlist.mapper.ts` (ISO string or null)
- [x] 2.5 Run `pnpm typecheck` and fix every construction site the new required `id` breaks (stories, tests, fixtures in `src/components/shared/story-data.ts`) — remaining errors confined to `guest-welcome-section.tsx`/stories, deleted in task 6

## 3. RSVP response API

- [x] 3.1 Extend the `invite.respond` input schema in `src/server/api/routers/invite.ts` to `{ wishlistSlug, guestSlug, status, extraGuests: { id, status }[] }`, rejecting any status outside `confirmed` | `declined`
- [x] 3.2 Reject a submission whose extra-guest id set does not exactly match the invite's extra guests
- [x] 3.3 Reject a submission once the wishlist's `eventDate` has passed, or once `rsvpDeadline` has passed when `eventDate` is null — cutoff logic factored into shared `src/lib/wishlist/rsvp-window.ts` (`isRsvpClosed`) after task 5 caught that comparing against the stored UTC-midnight instant directly closed RSVPs ~21h early; both server and client now share the exact same "end of that UTC calendar day" rule
- [x] 3.4 Write the invite status, every extra-guest status, and `respondedAt` in one `db.$transaction`; force all extras to `declined` server-side when the primary status is `declined`
- [x] 3.5 Allow a later response to overwrite an earlier one and update `respondedAt`
- [x] 3.6 Add service/router tests in `src/server/services/public-invite.service.test.ts` covering: whole-party confirm, mixed confirm, primary decline forcing extras, mismatched id set, invalid status, post-event rejection, and overwrite — `respondToInvite` moved from `invite.service.ts` into `public-invite.service.ts` (guest-facing domain), router tests in `invite.test.ts` updated to match

## 4. RSVP deadline editing surfaces

- [x] 4.1 Add `rsvpDeadline` to the wishlist create/update/publish Zod schemas in `src/server/api/routers/wishlist.ts`, validating that it does not fall after `eventDate` when one is set — the schemas actually wired to those flows are `updateWishlistSettingsSchema` (settings) and `saveDraftWishlistSchema`/`saveDraftDraftContentSchema` (wizard save+publish); `createWishlistSchema`/`updateWishlistSchema` are unused dead code and left untouched. Full round trip wired: wizard store, `draft-to-preview.ts`, `save-draft.ts`, `persisted-to-preview.ts`, `getById`
- [x] 4.2 Add an optional RSVP deadline date field next to the event date/time field in `src/components/features/wizard/details-step.tsx`, persisting it to the draft store — new shared `src/components/ui/date-picker.tsx` (date-only, mirrors `DateTimePicker`'s popover/calendar pattern)
- [x] 4.3 Add the same optional field next to the event date/time field in `src/components/features/dashboard/settings/wishlist-settings-form.tsx`
- [x] 4.4 Surface the "deadline after event date" validation error in both forms
- [x] 4.5 Add router tests for accepting, clearing, and rejecting `rsvpDeadline` in `src/server/api/routers/wishlist.test.ts` — plus schema-level tests in `wishlist-save-draft.schema.test.ts`

## 5. RsvpSection component

- [x] 5.1 Create `src/components/shared/rsvp-section.tsx` as a client component taking `{ guest, wishlistSlug, rsvpDeadline, eventDate, eventTime, eventLocation }`, returning null when `guest` is absent
- [x] 5.2 Build the pending form per design `3a`: notch dot, "Confirmación de asistencia" eyebrow, "¿Nos acompañas?" heading, party + deadline subline (deadline omitted when null), and the two primary choice buttons — pulled exact spec from `RSVP Section Proposals.dc.html` direction `3a` via the design MCP
- [x] 5.3 Keep the submit control disabled until the primary choice is made
- [x] 5.4 Render the extra-guest block (dashed rule, "Tu acompañante" eyebrow, one row per extra guest with `Viene` / `No viene` pills) defaulting every extra to attending; label unnamed extras "Acompañante N" by position
- [x] 5.5 Omit the extra-guest block entirely when the invite has no extra guests, and collapse it when the primary choice is "No podré ir"
- [x] 5.6 Wire the "Enviar confirmación" submit to the new `invite.respond` shape with pending state, error toast, and `router.refresh()`
- [x] 5.7 Build the responded summary: check circle, "Confirmado — <names>", event date/time line, and a "Cambiar" control that reopens the form with previous choices pre-selected — declined state gets its own muted "No podrás asistir" summary (design's 3a mockup only shows the confirmed case); confirmed summary line also appends `eventLocation` when present, mirroring direction `3b`'s confirmed-state copy
- [x] 5.8 Render the summary read-only (no "Cambiar") once `eventDate` has passed, or once `rsvpDeadline` has passed when `eventDate` is null — uses the identical `eventDate ?? rsvpDeadline` rule as the server (`respondToInvite`) so client and server never disagree
- [x] 5.9 Verify every color resolves from theme tokens (`--primary`, `--primary-fg`, `--card`, `--border`, `--muted`, `--muted-fg`, `--accent-fg`) with no hard-coded hex
- [x] 5.10 Add `rsvp-section.stories.tsx` covering: pending with companions, pending without companions, primary declined, unnamed companions, confirmed summary, and post-event read-only
- [x] 5.11 Add `rsvp-section.test.tsx` for submit-disabled-until-picked, extras defaulting to attending, decline collapsing the block, and the submitted payload shape

## 6. Layout integration

- [x] 6.1 Mount `<RsvpSection>` in `src/components/shared/public-wishlist-body.tsx` after the welcome message and immediately before the `#regalos` section, threading `guest` through from the view model
- [x] 6.2 Mount `<RsvpSection>` in the same relative position (after the welcome message, directly above the gift section) in the three self-contained layouts: `arch-trio-layout.tsx`, `collage-staggered-layout.tsx`, `split-image-right-layout.tsx`
- [x] 6.3 Remove every `<GuestWelcomeSection>` usage and import from all nine layouts under `src/components/layouts/public-wishlist/`: `arch-hero-party`, `arch-trio`, `carousel-hero`, `collage-staggered`, `magazine-editorial`, `overlap-duo`, `portrait-frame-split`, `scrapbook-polaroids`, `split-image-right` — also caught and fixed `collage-staggered-layout.tsx`'s hero subline, which printed `wishlist.guest?.primaryName` outside the guest section (a real 6.7 violation predating this task)
- [x] 6.4 Delete `src/components/shared/guest-welcome-section.tsx` and `guest-welcome-section.stories.tsx`
- [x] 6.5 Delete `src/components/shared/rsvp-control.tsx` (its behavior now lives in `RsvpSection`) and remove the `tone="on-photo"` branch along with it
- [x] 6.6 Add a registry-level test in `src/components/layouts/public-wishlist/public-wishlist-layouts.test.ts` asserting every layout renders the RSVP section when `guest` is present and omits it when absent — kept to the file's existing source-assertion style (no full render harness): confirms every layout wires `guest={wishlist.guest}` into `<RsvpSection>` (directly or via `PublicWishlistBody`), which combined with `RsvpSection`'s own unit-tested "returns null without a guest" behavior (task 5.11) covers the requirement
- [x] 6.7 Verify no layout renders the guest's name outside the RSVP section — added as a permanent regression test (see 6.6 note), not just a one-time check; fixed the one real violation found in `collage-staggered-layout.tsx`

Also discovered while wiring the layouts through: reviewing wizard test files (`review-step.test.tsx`) that render a wishlist preview through `PublicWishlistPage` → `PublicWishlistBody` needed `api.invite.respond.useMutation` added to their `@/trpc/react` mock, since `RsvpSection` calls the hook unconditionally (before its `guest`-absent early return).

## 7. Gift list band

- [x] 7.1 Add a shared full-bleed band wrapper (`bg-card`, `border-t border-border`, square corners, no side/bottom border) so the treatment is defined once — new `src/components/shared/gift-list-band.tsx`. It owns only the surface treatment; each call site supplies its own breakout `className` since the "how do I reach full width" mechanic genuinely differs per site (see 7.5)
- [x] 7.2 Apply it in `src/components/shared/public-wishlist-body.tsx:71`, keeping the inner `max-w-4xl px-6 py-12` content column and the `id="regalos"` anchor intact
- [x] 7.3 Apply it in `src/components/layouts/public-wishlist/arch-trio-layout.tsx:184`, preserving the existing scroll-margin on whichever element keeps `id="regalos"` — the `<section id="regalos">` is wrapped in place (not moved); the viewport-breakout math is self-correcting at any nesting depth as long as intervening ancestors are centered, so it works correctly even nested two levels inside the hero's own existing full-bleed wrapper. Added `mx-auto max-w-[1160px]` directly to the section since it previously relied on an ancestor div for that width, which the band wrapper now sits outside of
- [x] 7.4 Apply it in `src/components/layouts/public-wishlist/collage-staggered-layout.tsx:172`, same anchor/scroll-margin handling — same `mx-auto max-w-[1160px]` addition to the section, same reasoning
- [x] 7.5 Apply it in `src/components/layouts/public-wishlist/split-image-right-layout.tsx:150`, same anchor/scroll-margin handling — DEVIATION: this layout's gift section lives inside a persistent two-column grid (content + sticky image rail), so true viewport-width bleed would overlap the image column. The band instead bleeds to the edges of its own content column only (`-mx-6 sm:-mx-7` canceling the column's own padding, with matching `px-6 sm:px-7` restored on the inner section) rather than the full viewport
- [x] 7.6 Confirm the hero "Ver regalos disponibles" CTA still scrolls to the gift section in all four cases — `id="regalos"` and the anchor link (`href="#regalos"` in `hero-ctas.tsx`) are both unchanged at every site, verified by grep and by the registry test

## 8. Owner-facing party count

- [x] 8.1 Include per-extra-guest status in the `invite.list` payload in `src/server/api/routers/invite.ts` — `list` calls `mapDashboardInvite`, so `status` was added to `InviteExtraGuestViewModel` and threaded through the mapper rather than the router file itself
- [x] 8.2 Show the party confirmation count ("2 de 3 confirmados") on responded rows in `src/components/features/dashboard/guests/guest-row.tsx` / `rsvp-status-badge.tsx` — computed and rendered in `guest-row.tsx` (replaces the party-size line when responded); `rsvp-status-badge.tsx` needed no change, its single responsibility (status pill) was already correct
- [x] 8.3 Keep pending rows showing party size with no confirmation count

## 9. Validation

- [x] 9.1 Run `pnpm check` and fix any Biome findings — `pnpm exec biome check src` is 100% clean; the full `pnpm check` run reports 58 pre-existing errors confined to `public/assets/motif/joyful-unicorn.svg` and `public/assets/motif/surprised-unicorn.svg`, unrelated to this change and predating it
- [x] 9.2 Run `pnpm test` — 906/906 passing
- [x] 9.3 Run `pnpm typecheck` — clean
- [x] 9.4 Manually verify the personalized page at `/w/<slug>/<guestSlug>` on the ArchTrio layout with the Cielo Suave Rosa theme against design section `08 · ArchTrio · con RSVP 3a`, and confirm the plain `/w/<slug>` page renders no RSVP section — DEVIATION: dev DB was empty and seeding requires a Clerk-synced user, so per explicit user choice this was verified via Storybook instead of the live route. All 6 `rsvp-section.stories.tsx` stories (pending w/ and w/o companions, primary declined, unnamed companions, confirmed summary, post-event read-only) were rendered under the Cielo Suave Rosa theme and match design `3a`/`3b`: notch dot, eyebrow, heading, party+deadline subline, choice buttons, extras block with Viene/No viene pills, disabled-until-picked submit, confirmed/declined summaries, and "Cambiar" correctly hidden once the event date has passed. Not directly exercised: the section's placement inside the real ArchTrio page assembly and the plain-`/w/<slug>`-omits-RSVP routing behavior — the latter follows structurally from `mapPublicWishlist` never setting `guest` plus `RsvpSection`'s unit-tested "renders nothing without a guest" behavior (5.11), but neither was walked in a live browser
