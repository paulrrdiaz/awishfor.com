## Why

The design editor and the wizard's Design & Preview step list all 14 active layouts (+3 legacy) as a two-column thumbnail grid inside a 360px sidebar — roughly 800px of vertical space that pushes every other control far down the page. Owners also get no guidance on what image shape a layout expects: the cover-images hint only says how *many* photos are shown, so people upload portraits into full-bleed landscape heroes and get badly cropped results.

## What Changes

- **Modal layout picker.** Replace the inline layout grid with a compact trigger showing the *currently selected* layout (thumbnail + label + "Cambiar"). Clicking it opens a modal dialog containing the full layout grid (active + legacy). Selecting a layout inside the modal updates the design and closes it. Shared by both the dashboard design editor and the wizard.
- **Reorder cover images.** Move the "Imágenes de portada" section to sit directly under "Disposición" in both surfaces, so choosing a layout and providing its images are adjacent steps.
- **Per-layout image guidance.** Extend `PublicLayoutPreset` with recommended image guidance (aspect ratio + orientation, plus a centered-subject flag for circle crops). Surface it in the cover-images hint as text plus a small shape glyph — landscape `▭`, portrait `▯`, square `◻`. Circle-crop layouts (`arch-trio`, `diagonal-duo`) add a "centra el sujeto" note.
- **Soft aspect-ratio warning.** When an uploaded cover image's aspect ratio disagrees with the selected layout's recommendation, show a gentle, **non-blocking** note (e.g. "Esta foto es vertical; este diseño luce mejor en horizontal"). Never prevents upload or save.

Sourced per-layout recommendations (from the actual hero renderers): `hero-cinematic` 16:9, `carousel-hero` 16:9, `panoramic-band` 16:9+, `scrapbook-polaroids` 4:3, `split-image-right` 3:4, `portrait-frame-split` 3:4, `overlap-duo` 3:4, `arch-split` 2:3, `arch-hero-party` 2:3, `magazine-editorial` 1:1, `arch-trio` 1:1 (centered), `diagonal-duo` 3:4 (one circle crop), `collage-staggered` mixed → 3:4.

### Non-Goals

- **Not** fixing `wedding-formal`, which declares `heroImageSlots: 1` but its renderer draws no cover image. Documented as a known issue; behavior unchanged here.
- **Not** enforcing/blocking uploads by ratio, auto-cropping, or adding a crop tool — guidance and the warning are advisory only.
- **Not** changing which layouts exist or how they render on the public page.

## Capabilities

### New Capabilities

- `layout-picker`: A shared, modal-based layout selector used by the design editor and wizard — a compact current-selection trigger that opens a dialog of all layout thumbnails — together with the per-layout cover-image guidance display (ratio/orientation glyph + centered-subject note) and the soft aspect-ratio mismatch warning.

### Modified Capabilities

- `public-wishlist-layout`: `PublicLayoutPreset` gains recommended image-guidance metadata (aspect ratio, orientation, centered-subject flag) for each layout, resolvable alongside the existing preset fields.
- `creation-wizard`: The Design & Preview step selects a layout through the modal picker rather than an inline grid, and renders the "Imágenes de portada" section directly under "Disposición".

## Impact

- **Code:**
  - `src/config/public-layouts.ts` — add guidance fields to `PublicLayoutPreset` and populate every entry.
  - `src/components/features/wishlist/layout-picker.tsx` — refactor to trigger + modal (reusing the existing thumbnail map).
  - `src/components/features/dashboard/design/wishlist-design-editor.tsx` and `src/components/features/wizard/design-step.tsx` — section reorder, guidance hint, and warning wiring.
  - `src/components/features/wishlist/multi-image-upload.tsx` — surface guidance and the soft mismatch warning (needs uploaded-image aspect-ratio detection).
- **UI dependency:** modal uses the existing shadcn/Radix `Dialog` primitive; responsive (sheet-like on mobile, centered dialog on desktop).
- **No** database, API, env, or public-page rendering changes.
