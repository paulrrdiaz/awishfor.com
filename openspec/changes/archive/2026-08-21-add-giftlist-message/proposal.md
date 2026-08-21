## Why

The public wishlist page has no way for a host to add a short intro line above the gift list — something like "your presence is the best gift, but if you'd like to bring one, here's a list of options." The Claude Design reference (`PublicWishlistPages.dc.html`) shows this line on every artboard, but the app currently jumps straight from the RSVP section to the bare "Lista de regalos" heading. Hosts who want to soften or contextualize the gift list have no field for it today.

## What Changes

- Add an optional `giftListMessage` field to the `Wishlist` model (`String?`, same `optionalNullableTrimmedString(..., 2000)` validation convention as `welcomeMessage`/`thankYouMessage`).
- Thread the field through the existing settings/wizard save pipeline: Zod validators, `wishlist.service.ts`, dashboard/public mappers, and the `wishlist.updateSettings` / draft-save routers.
- Add a "Gift list message" input to the creation wizard's Event Details step, grouped with the welcome/thank-you copy fields, and to the dashboard settings form in the same grouping. The field is optional — no required-field validation, no event-type preset seeding.
- Add a small shared render component (mirroring `WishlistThankYou`'s `if (!message) return null` pattern, no variant system) that renders the message as centered italic text flanked by short hairlines, matching the design's single visual treatment.
- Wire that component into the three public layouts (`arch-trio`, `split-image-right`, `collage-staggered`) immediately before the "Lista de regalos" heading, and into the required section order / shared section components list.

## Capabilities

### New Capabilities
(none — this extends existing wishlist-content and layout capabilities rather than introducing a new one)

### Modified Capabilities
- `wishlist-settings`: "Edit core wishlist content" gains the optional gift list message field, grouped with welcome/thank-you copy.
- `creation-wizard`: the Event Details step gains the optional gift list message field alongside welcome/thank-you copy.
- `public-wishlist-layout`: the gift-list message renders immediately before the gift-list heading, per layout composition (arch trio, split image right) and in the shared section components / required section order requirements (covers `collage-staggered`, which composes through the shared list).

## Impact

- **Schema**: new nullable `Wishlist.giftListMessage` column + migration.
- **Validation**: `src/server/validators/wishlist.schema.ts` (new `wishlistGiftListMessageSchema`), `wishlist-save-draft.schema.ts`.
- **Server**: `src/server/services/wishlist.service.ts`, `src/server/mappers/dashboard-wishlist.mapper.ts`, `src/server/mappers/public-wishlist.mapper.ts`, `src/server/mappers/view-models.ts`, `src/server/services/public-wishlist.service.ts`, `src/server/api/routers/wishlist.ts`.
- **Wizard**: `src/components/features/wizard/details-step.tsx` (and its draft store field).
- **Settings**: `src/components/features/dashboard/settings/wishlist-settings-form.tsx`.
- **Public rendering**: new shared component (e.g. `src/components/shared/gift-list-message.tsx`) plus edits to `arch-trio-layout.tsx`, `split-image-right-layout.tsx`, `collage-staggered-layout.tsx`, and `public-wishlist-body.tsx` if it composes the same section for non-migrated layouts.
- No breaking changes; existing wishlists get `NULL` and render unchanged (line stays hidden).
