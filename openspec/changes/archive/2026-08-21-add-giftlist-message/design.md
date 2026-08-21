## Context

See proposal.md - Why/What Changes. Relevant existing shape:

- `Wishlist.welcomeMessage` / `thankYouMessage` are the closest analogs: `String?`, validated by `optionalNullableTrimmedString(name, 2000)` in `src/server/validators/wishlist.schema.ts`, threaded through `wishlist.service.ts`, both mappers (`dashboard-wishlist.mapper.ts`, `public-wishlist.mapper.ts`), `view-models.ts`, `public-wishlist.service.ts`'s Prisma `select`, the wizard draft store (`wishlist-wizard.store.ts`), `save-draft.ts`, `draft-to-preview.ts`, `persisted-to-preview.ts`, `details-step.tsx`, and `wishlist-settings-form.tsx`.
- `WishlistThankYou` (`src/components/shared/wishlist-thank-you.tsx`) is the render-side analog: takes `message?: string | null`, returns `null` when absent, otherwise renders one of several variant presentations.
- Every layout ultimately renders its gift list through `GiftSection` (`src/components/shared/gift-section.tsx`): the 3 self-composing layouts (`arch-trio`, `split-image-right`, `collage-staggered`) call it directly; the other 6 layouts (`carousel-hero`, `scrapbook-polaroids`, `arch-hero-party`, `portrait-frame-split`, `overlap-duo`, `magazine-editorial`) call it indirectly through `public-wishlist-body.tsx`. `GiftSection` already exists specifically to make "structural, not a per-layout convention" composition possible (see its own doc comment).
- Only `arch-trio` and `split-image-right` currently render a "Lista de regalos" heading at all; `collage-staggered` and `public-wishlist-body` go straight into gift filters/grid with no heading. The design canvas shows the message line above that heading, but the message is a wishlist-level property independent of whether a given layout happens to print a heading.

## Goals / Non-Goals

**Goals:**
- One place to add the message to every layout, not nine.
- Match the `thankYouMessage` field/validation/plumbing shape exactly, so this reads as "the same kind of field" to future maintainers.
- Render nothing (not even a placeholder) when the field is empty, on every layout.

**Non-Goals:**
- No variant system (single visual treatment only — the design has no "Proposals" file for this element, unlike welcome/thank-you).
- No event-type preset seeding or `copyTouched` tracking in the wizard store (the field is opt-in, not a required piece of onboarded copy).
- No change to `GiftSection`'s existing `delivery`/`className` behavior.

## Decisions

**Insertion point: a new optional prop on `GiftSection`, not per-layout markup.** `GiftSection` is already the single component every layout (self-composing or shared-body) passes through on the way to the gift list. Adding a `giftListMessage?: string | null` prop there — rendered via a new `GiftListMessage` component just above `GiftListBand`'s children — means the 4 call sites (`arch-trio-layout.tsx`, `split-image-right-layout.tsx`, `collage-staggered-layout.tsx`, `public-wishlist-body.tsx`) each need one added line (`giftListMessage={wishlist.giftListMessage}`), instead of duplicating the message markup in up to 9 layout files. Rejected alternative: copy `WishlistThankYou`'s pattern of calling a standalone component from each layout individually — this is what `thankYouMessage` does, but only because the thank-you message's position (after the gift list, before the footer) isn't already funneled through one shared component the way the gift list's leading edge is via `GiftSection`.

**`collage-staggered` and the 6 shared-body layouts get the line too, even without a heading.** The message is a wishlist-level intro to the gift list section, not part of the heading itself. Since it renders through `GiftSection` uniformly, it appears consistently above the gift filters/grid in every layout, whether or not that layout also prints "Lista de regalos". This keeps the field's behavior layout-independent, matching how `delivery` already renders identically across all of them.

**New shared component `GiftListMessage`, no variants.** Signature: `{ message?: string | null; className?: string }`. Returns `null` when `message` is falsy (mirrors `WishlistThankYou`'s `if (!message) return null`). When present, renders centered italic serif text flanked by short hairlines (matching every instance of this element in `PublicWishlistPages.dc.html`) using theme tokens only, consistent with the rest of the shared section components.

**Validation and length: reuse `optionalNullableTrimmedString(..., 2000)` as-is.** Per the confirmed decision, no new length ceiling — same convention as welcome/thank-you.

**Wizard store: plain field, no preset machinery.** `giftListMessage: string` in the draft shape, default `""`, no entry in `copyTouched`, no `defaultGiftListMessage` on event-type presets. `draft-to-preview.ts` maps `""` to `null` the same way it already does for other optional strings.

**Placement in Details step / settings form: directly after the thank-you message field**, since both proposal answers ("grouped" with the other messages) point at the existing welcome/thank-you copy cluster rather than a new grouping.

## Risks / Trade-offs

- [Adding a line to every layout, not just the two shown in the design] → Mitigation: behavior stays opt-in (renders only when the host fills the field), so layouts that don't show it today are unaffected until a host opts in; visually consistent placement is preferable to a field that silently does nothing on 7 of 9 layouts.
- [`GiftSection` gains a new responsibility beyond "band + delivery"] → Mitigation: the prop is optional and additive; existing callers that don't pass it are unaffected, and the component's existing doc comment already frames it as the place structural gift-list composition belongs.

## Migration Plan

Additive nullable column (`giftListMessage String?` with no default) — standard `prisma migrate dev` migration, no backfill needed, existing rows read as `NULL` and render unchanged. No rollback complexity beyond the standard migration-down path.
