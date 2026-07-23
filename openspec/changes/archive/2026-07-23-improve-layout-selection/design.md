## Context

The layout selector lives in one shared component, `LayoutPicker` (`src/components/features/wishlist/layout-picker.tsx`), consumed by two surfaces with identical section structure:

- Dashboard design editor — `src/components/features/dashboard/design/wishlist-design-editor.tsx`
- Creation wizard, Design & Preview step — `src/components/features/wizard/design-step.tsx`

Today `LayoutPicker` renders an inline two-column grid of 14 active thumbnails plus a "Clásico" group of 3 deprecated ones — ~800px tall in a 360px sidebar. Layout presets come from `src/config/public-layouts.ts` (`PublicLayoutPreset`, `getAllLayouts`, `resolveLayout`, `DEFAULT_LAYOUT_ID`). Presets carry `heroImageSlots` and `supportsCarousel` but nothing about the *shape* each hero renderer crops images to. Cover images are managed by `MultiImageUpload` (`endpoint="coverImage"`), which already accepts a `hint` string; the hint currently only states the photo count.

Actual crop shapes were read from the hero renderers in `src/components/layouts/public-wishlist/*-layout.tsx` (e.g. `hero-cinematic` full-bleed band, `arch-split` `aspect-[2/3]`, `magazine-editorial` `aspect-square`, `scrapbook-polaroids` `aspect-[4/3]`, circle crops in `arch-trio`/`diagonal-duo`). These are the source of the per-layout recommendations.

## Goals / Non-Goals

**Goals:**
- Collapse the layout list to a compact, single trigger; move full browsing into a modal.
- Put "Imágenes de portada" immediately below "Disposición" on both surfaces.
- Give owners truthful, per-layout image-shape guidance at the point of upload.
- Warn — softly, never blocking — when an uploaded image's ratio fights the layout.
- Keep both surfaces behaviorally identical by concentrating logic in shared modules.

**Non-Goals:**
- Fixing `wedding-formal`'s `heroImageSlots: 1` / no-render mismatch (documented, untouched).
- Ratio enforcement, auto-cropping, or a crop UI.
- Any change to layout existence or public-page rendering.
- Persisting guidance/warning state — it is derived, not stored.

## Decisions

### 1. Modal picker via existing Dialog primitive
`LayoutPicker` becomes: a **trigger** (selected thumbnail + label + "Cambiar") and a **`Dialog`** (existing shadcn/Radix primitive already in the repo) housing the current grid. Selecting inside the dialog calls `onSelect` and closes it. The existing `LAYOUT_THUMBNAILS` map and active/legacy split are reused verbatim inside the dialog body — no thumbnail rework.

- *Why:* smallest refactor that reclaims ~750px; Dialog is already a dependency, responsive, and accessible (focus trap, escape).
- *Alternatives rejected:* inline "show 4 + ver todos" (still consumes sidebar, arbitrary first-4); horizontal carousel (poor discoverability on a vertical sidebar, fiddly paging); 3-col dense grid (thumbnails too small at 360px). Chosen in exploration.
- Keep `LayoutPicker`'s public props (`options`, `selected`, `onSelect`) unchanged so both call sites need no signature change.

### 2. Image guidance as preset metadata
Add optional fields to `PublicLayoutPreset` and populate all entries:
```ts
imageGuidance: {
  ratio: string;                              // "16:9" | "3:4" | "2:3" | "4:3" | "1:1"
  orientation: "landscape" | "portrait" | "square";
  centeredSubject?: boolean;                  // circle crops
  mixed?: boolean;                            // collage-staggered — recommend safe 3:4
}
```
A small resolver (e.g. `resolveImageGuidance(layout)` or a plain field read) feeds both the hint text and the warning comparison. Glyph mapping: `landscape → ▭`, `portrait → ▯`, `square → ◻`.

- *Why colocate with the preset:* the recommendation is intrinsic to how the layout crops; one source of truth for hint + warning; avoids a second lookup table drifting from `public-layouts.ts`.
- *Alternatives rejected:* separate guidance map keyed by id (drift risk); computing ratio from thumbnail markup (fragile, indirect).

### 3. Guidance + warning live in the cover-images section
The hint string passed to `MultiImageUpload` is extended to `"{n} fotos · {orientation} {ratio}"` with the glyph, plus "· centra el sujeto" when `centeredSubject`. For the **soft warning**, `MultiImageUpload` reads each uploaded image's natural dimensions (via the loaded `<img>` / an `Image` object) and compares its aspect ratio to the layout recommendation within a tolerance band; on mismatch it renders a muted, inline note. It never blocks add/remove or gates save.

- *Why in MultiImageUpload:* it already owns the uploaded URLs and the `hint` slot; dimension detection needs the image element it already renders.
- *Tolerance:* compare orientation class first (landscape/portrait/square) with a deadband near 1:1 so near-square images don't nag. Exact band decided in apply; default ~15%.
- The component gains an optional prop carrying the layout's guidance (ratio/orientation) so it stays presentation-only and testable; the editor/wizard pass it from the resolved layout.

### 4. Section reorder is local to the two surfaces
Move the "Imágenes de portada" block to directly follow "Disposición" in both `wishlist-design-editor.tsx` and `design-step.tsx`. Pure JSX reordering; no shared component change.

## Risks / Trade-offs

- **Untruthful ratios mislead more than no guidance** → recommendations were sourced directly from each hero renderer's crop classes, not guessed; the mixed layout (`collage-staggered`) recommends a single safe 3:4 rather than pretending precision.
- **Warning nags on intentional choices** → warning is soft, dismissible-by-ignoring, orientation-class based with a deadband; never blocks.
- **Aspect detection cost/fl?** → dimensions come from the already-loaded image element; no extra network fetch; compute on load only.
- **Two surfaces drift** → logic concentrated in `LayoutPicker`, `public-layouts.ts`, and `MultiImageUpload`; the two pages only reorder JSX and pass props.
- **`wedding-formal` still shows an upload box with a photo count while rendering nothing** → explicitly out of scope; note left in code/spec so it is not mistaken for this change's regression.
- **Modal adds a click to change layout** → acceptable: layout is chosen rarely, and the trigger keeps the current choice visible without scrolling.
