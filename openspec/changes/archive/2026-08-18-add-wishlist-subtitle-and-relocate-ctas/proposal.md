## Why

Wishlist heroes currently jump from the event label to a large title, leaving hosts no concise place to add supporting context. The hero CTA group also competes with that title, especially in expressive layouts such as `arch-trio`; placing the actions with the required welcome message gives the hero more breathing room and introduces the actions when guests have enough context to use them.

## What Changes

- Add a nullable, owner-editable wishlist `subtitle` with a 160-character limit. Empty or whitespace-only values are stored as absent.
- Add the optional subtitle to the creation wizard beside the wishlist name and seed new wizard drafts with `Una lista creada con cariño para celebrar juntos.` The wizard explains that the value can be personalized now, changed later in Settings, or cleared.
- Add subtitle editing to wishlist Settings so saved and published wishlists remain editable after the wizard.
- Carry the subtitle through draft persistence, save/publish inputs, Prisma storage, owner/public view models, live previews, and public rendering.
- Render a present subtitle directly beneath the wishlist title in every public layout and omit both the element and its spacing when absent.
- Move the shared `Ver regalos disponibles` / optional `Cómo funciona` CTA group out of every hero title block and place it with the welcome-message content in every non-compact layout—after the welcome message and any countdown colocated in that region—while preserving its existing behavior and theme styling.
- Preserve existing wishlists with a null subtitle and migrate older locally persisted wizard drafts safely to the new draft shape.
- Non-goals: changing the wishlist title's dashboard/public identity, changing CTA labels or destinations, changing welcome-message content or variants, introducing event-specific/AI-generated subtitle copy, or using the subtitle for social metadata in this change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `creation-wizard`: Collect, seed, preview, persist, restore, and allow clearing the optional subtitle while explaining later editability.
- `wishlist-settings`: Let owners edit or clear the subtitle after creation through the owner-scoped settings mutation.
- `wishlist-view-models`: Expose the nullable subtitle through owner and public wishlist view models without changing title semantics.
- `public-wishlist-layout`: Render the optional subtitle beneath the title in every layout and relocate the shared CTA group from the hero to the welcome-message content region.

## Impact

- **Schema:** nullable `Wishlist.subtitle` column plus a Prisma migration; existing rows require no content backfill.
- **Validation/API:** wishlist create/update, wizard save/publish, conflict recovery, and settings inputs gain an optional normalized subtitle capped at 160 characters.
- **Wizard state:** the persisted Zustand draft shape and version migration gain `subtitle`; draft/save/preview mappers and focused tests change accordingly.
- **View models:** public and dashboard projections/mappers gain `subtitle` so both public rendering and Settings receive it.
- **UI:** the Details step, its live header preview, Settings, all nine public layout heroes, the shared public body, and the three self-contained layouts are affected.
- **Testing:** validator, service, mapper, store migration, wizard/settings, and cross-layout rendering/CTA-placement coverage must be updated.
- **Dependencies/config:** no new package, environment variable, or runtime service is required.
