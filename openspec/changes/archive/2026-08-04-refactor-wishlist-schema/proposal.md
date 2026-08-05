## Why

The `Wishlist Wizard.dc.html` design collapses the three name fields creators juggle today (`title`, `displayName`, `heroTitle`) into a single "Nombre de tu wishlist", and requires cover images to be classified by orientation so each layout can request the photo shapes it actually renders. Neither is expressible against the current schema: orientation is detected in the browser and thrown away, and the layout/theme catalogs have drifted to roughly double the options the design ships.

Doing this as a data-layer change first keeps the existing five-step wizard working end to end while the schema, catalogs and view models move underneath it. The eight-step wizard redesign then lands on a foundation that already fits it.

## What Changes

- **BREAKING** — Collapse `Wishlist.title` / `displayName` / `heroTitle` into `title` alone. `title` stops being an internal-only label and becomes the name guests see. `displayName` and `heroTitle` are dropped.
- **BREAKING** — Replace `Wishlist.coverImageUrl` and `coverImageUrls` with a `WishlistImage` model carrying `url`, `width`, `height`, `orientation` and `sortOrder`, plus an `ImageOrientation` enum.
- **BREAKING** — Drop `Wishlist.fontPairing`, superseded by `headingFont` / `bodyFont` in the store's v1 migration and unused by the design.
- Trim the layout catalog from 17 presets to the 9 the design ships (`carousel-hero`, `scrapbook-polaroids`, `portrait-frame-split`, `arch-hero-party`, `arch-trio`, `overlap-duo`, `split-image-right`, `collage-staggered`, `magazine-editorial`).
- Trim the theme catalog from 12 presets to the 7 the design ships.
- Public hero compositions render `title` only. The existing `EventDetails` block — today wired to `grid`, `editorial` and `minimal`, all three retired — is wired into all nine surviving layouts so date, time, venue and dress code keep a home.
- Add per-event-type sample cover images (`sampleCoverImages`, grouped by orientation) to `EVENT_TYPE_PRESETS`, mirroring the existing `sampleGifts` convention. They back the realistic previews the redesigned wizard needs.
- Persist detected image dimensions and orientation at upload time instead of using them only for a transient client-side warning.
- Rebuild `DEMO_WISHLIST`, which currently depends on a retired layout (`grid`) and all four dropped columns.
- Migration is destructive and single-phase: there is no production data to preserve.

### Non-goals

- The eight-step wizard, the segmented stepper, sample-image previews in the wizard UI, and layout-driven image minimums. Those belong to the follow-up `redesign-wishlist-wizard` change; this change leaves the current five steps working.
- Adding an `images` check to publish readiness. That gate arrives with the redesigned review step.
- Moving gift edit/hide/reorder out of the wizard.

## Capabilities

### New Capabilities

- `wishlist-cover-images`: cover images as first-class records with persisted dimensions, orientation classification and explicit ordering, replacing the mirrored URL columns, including how view models expose them.

### Modified Capabilities

- `image-upload`: uploads persist width, height and derived orientation rather than discarding them after the client-side mismatch warning; the `coverImageUrl` mirror is gone.
- `layout-picker`: the catalog is the nine design layouts; the deprecated legacy grouping disappears with the layouts it grouped.
- `public-theme-config`: seven theme presets and nine layout presets; the legacy `fontPairing` resolution mapping is removed.
- `public-wishlist-layout`: nine layout variants; hero compositions show `title` only and no longer render a `displayName` subtitle; every layout renders the shared event-details block; the hero gallery consumes image records.
- `event-type-presets`: presets carry sample cover images grouped by orientation, and their default layout and theme ids must resolve within the trimmed catalogs — `birthday` and `wedding` currently point at retired layouts.
- `wishlist-settings`: the settings form edits a single name and drops the removed fields.
- `creation-wizard`: the details step collects one name; the design step's cover-image section works against image records.

`authenticated-draft-saving` and `wishlist-view-models` are deliberately absent: their requirements are field-agnostic, so the payload and mapper changes are implementation detail rather than requirement changes.

## Impact

- **Schema / migration**: `prisma/schema.prisma` (`Wishlist` columns, new `WishlistImage` model, new `ImageOrientation` enum), one destructive migration.
- **Config**: `src/config/public-layouts.ts`, `public-themes.ts`, `event-type-presets.ts`, `demo-wishlist.ts`.
- **Validators**: `src/server/validators/wishlist.schema.ts`, `wishlist-save-draft.schema.ts`.
- **Server**: `src/server/api/routers/wishlist.ts`, `src/server/services/wishlist.service.ts`, `src/server/mappers/` (`public-wishlist.mapper.ts`, `dashboard-wishlist.mapper.ts`, `view-models.ts`).
- **Client state**: `src/stores/wishlist-wizard.store.ts` — draft shape changes and the persisted store version goes 1 → 2.
- **Preview/render**: `src/lib/wishlist/draft-to-preview.ts`, `persisted-to-preview.ts`, `cover-images.ts`, the nine surviving files in `src/components/layouts/public-wishlist/`, `src/components/shared/event-details.tsx`.
- **UI**: `src/components/features/wizard/details-step.tsx` and `design-step.tsx`, `src/components/features/wishlist/multi-image-upload.tsx`, `src/components/features/dashboard/settings/wishlist-settings-form.tsx`.
- **Deletions**: eight layout components under `src/components/layouts/public-wishlist/` and five theme presets, plus their tests and stories.
- **Tests**: every touched module's Vitest suite, plus Storybook stories referencing removed fields (`wizard-states.stories.tsx`, `story-data.ts`, `wishlist-footer.stories.tsx`).
