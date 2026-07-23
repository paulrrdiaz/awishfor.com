## 1. Layout image guidance metadata

- [x] 1.1 Add an `imageGuidance` field to `PublicLayoutPreset` in `src/config/public-layouts.ts` (`ratio`, `orientation`, optional `centeredSubject`, optional `mixed`)
- [x] 1.2 Populate `imageGuidance` for every layout entry using the sourced recommendations (16:9, 3:4, 2:3, 4:3, 1:1, mixed→3:4); flag `arch-trio` and `diagonal-duo` as circle crops, `collage-staggered` as mixed
- [x] 1.3 Add a small helper (glyph map `landscape ▭` / `portrait ▯` / `square ◻` and a guidance-hint string builder) so the editor and wizard share identical copy
- [x] 1.4 Leave a code comment on `wedding-formal` noting the known `heroImageSlots: 1` / no-render mismatch is intentionally out of scope

## 2. Modal layout picker

- [x] 2.1 Refactor `src/components/features/wishlist/layout-picker.tsx` into a compact trigger (selected thumbnail + label + "Cambiar") plus a `Dialog` containing the existing thumbnail grid; keep `LAYOUT_THUMBNAILS` and the active/legacy split unchanged
- [x] 2.2 Wire selection inside the dialog to call `onSelect` and close; ensure dismissing (escape/backdrop/close) leaves selection unchanged; resolve a default when `selected` is null/unknown
- [x] 2.3 Keep the public props (`options`, `selected`, `onSelect`) unchanged so both call sites need no signature change; verify responsive behavior at ~360px

## 3. Cover-image guidance + soft warning

- [x] 3.1 Extend `MultiImageUpload` (`src/components/features/wishlist/multi-image-upload.tsx`) to accept the layout's guidance (orientation/ratio) as an optional prop
- [x] 3.2 Detect each uploaded image's natural dimensions from the loaded image element and derive its orientation class
- [x] 3.3 Render a soft, non-blocking mismatch note when the detected orientation disagrees with the recommendation beyond tolerance (orientation-class comparison with a near-square deadband); never gate add/remove/save

## 4. Wire both surfaces + reorder

- [x] 4.1 In `src/components/features/dashboard/design/wishlist-design-editor.tsx`, move the "Imágenes de portada" section to directly under "Disposición", pass the resolved layout guidance to the hint and to `MultiImageUpload`
- [x] 4.2 In `src/components/features/wizard/design-step.tsx`, apply the same reorder and guidance wiring
- [x] 4.3 Confirm the guidance hint replaces the old "muestra N fotos" copy with count + orientation glyph + ratio (+ "centra el sujeto" for circle crops) on both surfaces

## 5. Validation

- [x] 5.1 Add/adjust unit tests for the guidance helper and orientation/mismatch logic (Vitest)
- [x] 5.2 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`; fix any issues
- [x] 5.3 Manually verify in the design editor and wizard: modal opens/selects/dismisses, cover section sits under layout, guidance + soft warning render, nothing blocks save
