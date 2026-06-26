## Why

The creation wizard foundation ships only the Event Type step; a user cannot yet describe their event, choose a design, or add gifts. Milestone 3 needs the three content-bearing steps (Event Details + slug, Design & Preview, Gifts) so the local draft holds everything required before the later DB-save (3.7) and publish (3.8) slices can persist it.

## What Changes

- Add the **Event Details + slug** step: title, display name, optional event date (Calendar + Popover), time normalized to `HH:mm`, and location; slug auto-generated from the title, editable, with a debounced availability check and Checking/Available/Taken/Invalid states and a past-date warning.
- Make slug availability checkable by **signed-out** users — the wizard is unauthenticated-first, so the slug availability check becomes a `publicProcedure` (it returns only available/taken/invalid, no private data).
- Add the **Design & Preview** step: theme, layout, font-pairing, and button-style selectors that write to the draft, plus an embedded live preview rendered with the existing public layout in `preview` mode (purchase actions disabled), using the preset `sampleGifts` until the user adds real gifts. Cover-image upload is a disabled placeholder (UploadThing arrives in Milestone 4).
- Add the **Gifts** step: a local gift-list editor with a manual gift form (name, optional product URL, image, price, category, quantity, priority, public/internal note, hide toggle). Gifts live in the wizard store as local draft gifts (no DB yet); a URL-import entry point is a placeholder for the Milestone 4 importer.
- Extend the wizard draft store with the new detail fields, design fields, and a local `gifts` array (plus add/update/remove/reorder actions), and extend the wizard shell with multi-step routing/navigation across `event-type → details → design → gifts`.
- Add `use-debounce` as a dependency.

## Capabilities

### New Capabilities
<!-- None: extends the existing creation-wizard capability. -->

### Modified Capabilities
- `creation-wizard`: Adds the Event Details + slug step, the Design & Preview step, the Gifts step, multi-step navigation, and the draft-store fields (details, design, local gifts) those steps require.

## Impact

- New code: `src/components/features/wizard/details-step.tsx`, `design-step.tsx`, `gifts-step.tsx`, `src/components/features/wishlist/gift-form.tsx`, a client draft→preview view-model mapper.
- Modified code: `src/stores/wishlist-wizard.store.ts` (new fields + gift actions), `src/components/features/wizard/wizard-shell.tsx` (step routing/nav), `src/server/api/routers/wishlist.ts` (slug check → public).
- Reuses `src/lib/slug.ts`, `src/config/public-themes.ts` / `public-layouts.ts` / `public-fonts.ts` / `public-button-styles.ts`, the public-wishlist layout components, and preset `sampleGifts`.
- New dependency: `use-debounce`.
- No DB schema, migration, or env changes (no DB persistence in this slice — that is 3.7).
