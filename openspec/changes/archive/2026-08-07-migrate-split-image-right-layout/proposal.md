## Why

The nine public wishlist layouts are mid-migration between two generations. Eight still use the retired thin pattern: the component renders a hero and hands the rest of the page to `PublicWishlistBody`, which owns section order and gift rendering. Only `collage-staggered` has moved to the self-contained pattern, where the layout owns its full page — header chrome, centered wrapper, section composition, footer — and can therefore express whole-page behavior the shared body cannot.

All eight remaining layouts are migrating. This change moves the second one, `split-image-right`, and extracts the page chrome that `collage-staggered` currently inlines into a shared shell, so the remaining seven are composition work rather than seven more copies of the same header, wrapper and footer.

`split-image-right` goes second because its design has the highest chrome demands and will therefore stress the shell hardest: design `02 · SplitImageRight` (Jardín Verde / Nuevo hogar) specifies a two-photo rail that stays fixed in the viewport while a long text column scrolls past it. That requires the shell to expose a per-mode top offset, which every later sticky or overlay treatment will also need. Getting it wrong here is cheap; getting it wrong after seven more layouts depend on it is not.

## What Changes

- **Extract a shared public-layout shell** from `collage-staggered`. It owns the mode-dependent outer wrapper, the page header (brand isotype, published badge, share control and its handler), the centered `max-w-[1160px]` `<main>`, and the compact footer. It exposes the per-mode sticky top offset as a CSS custom property so layouts do not each re-derive it.
- **Refactor `collage-staggered` onto the shell.** Behavior-preserving — it currently inlines exactly this chrome.
- **Rewrite `split-image-right-layout.tsx`** as a self-contained layout on the shell. It stops delegating to `PublicWishlistBody`.
- Left column (`1fr`) holds the reading flow in the design's order: event-type eyebrow, title, event summary line, guest welcome, hero CTAs, a two-up Fecha/Lugar detail grid, a **centered countdown chip**, the quote block, a divider, the "Lista de regalos" heading, and the filtered gift list.
- Right column (fixed `340px`) becomes a **sticky, viewport-height rail holding two photos** split 50/50, framed in the design's card-colored inset border over a hairline background.
- The sticky rail is **`lg:` and above only**. Below `lg` the grid collapses to one column and the two photos render as a stacked pair at a fixed height above the text — a full-height sticky rail on a phone would consume the screen before any content is readable.
- **BREAKING (host-facing):** `split-image-right` gains a second required cover image (`heroImageSlots: 1 → 2`). Because `heroImageSlots` is what `evaluatePublishReadiness` uses as the required cover-image count, existing wishlists on this layout with exactly one image stop satisfying the images check until a second photo is added.
- Reconcile the "hero shows the wishlist title alone" requirement with what the design and the shipped `collage-staggered` layout actually do: an event summary line (host names · date · venue) renders under the title.

### Non-goals

- **Migrating the other seven layouts.** They keep rendering through `PublicWishlistBody`, which stays in place until the last one moves. Each gets its own change; all nine design blocks are already final in `PublicWishlistPages.dc.html`.
- Changing gift-card rendering or the purchase flow. The gift section reuses `PublicGiftFilters` with the same options `collage-staggered` passes.
- Any visual change to `collage-staggered`. Its move onto the shell is a refactor, and its rendered output should be identical.
- **One deliberate exception:** `PublicGiftFilters` initializes its column state to 3 while the grid toggle only offers 1 and 2, so the toggle's default may not match the design's 1-column row state. If confirmed, the fix belongs in `public-filters.tsx` and therefore also changes `collage-staggered`'s default column count. That shared correction is in scope; anything broader in the filter component is not.

## Capabilities

### New Capabilities

None. The shared shell is an implementation structure behind existing layout requirements, not a new user-facing capability.

### Modified Capabilities

- `public-wishlist-layout`: self-contained layouts are defined as composing a shared page shell rather than inlining their own chrome; the `split-image-right` variant's composition requirements change (two-slot sticky photo rail, `lg:`-only sticky behavior, countdown placement in the left column); its `heroImageSlots` count changes from 1 to 2; and the "hero shows the wishlist title alone" requirement is amended to permit the event summary line.

## Impact

**Code**
- `src/components/layouts/public-wishlist/public-layout-shell.tsx` — **new**; the extracted chrome.
- `src/components/layouts/public-wishlist/collage-staggered-layout.tsx` — refactored onto the shell, no visual change.
- `src/components/layouts/public-wishlist/split-image-right-layout.tsx` — full rewrite.
- `src/config/public-layouts.ts` — `split-image-right` preset: `heroImageSlots: 1 → 2`.
- `src/components/layouts/public-wishlist/public-wishlist-page.tsx` — the per-mode wrapper `className` is currently branched on `layout.id === "collage-staggered"`; replaced by a shared declaration of which layouts are self-contained, which the shell owns and each future migration appends to.
- `src/components/layouts/public-wishlist/new-layouts.stories.tsx` — stories for both touched layouts.

**Behavior fed by `heroImageSlots`** (all consume the preset, none need editing, but all shift for this layout):
- `src/lib/wishlist/publish-readiness.ts` — required cover-image count.
- `src/components/features/wizard/images-step.tsx` and `review-step.tsx` — shortfall prompts and the readiness summary line.
- `src/lib/wishlist/draft-to-preview.ts` — preview placeholder shortfall.
- `src/config/public-layouts.ts` `buildImageGuidanceHint` — the "Este diseño muestra N fotos" copy shown in the design editor.

**Tests**
- `src/config/public-layouts.test.ts` — asserts `split-image-right` has `heroImageSlots: 1`; must move to the two-slot group.
- `src/config/event-type-presets.test.ts` — asserts sample imagery can fill the largest `heroImageSlots` per orientation; verify the portrait sample pool still satisfies it.

**Working-tree collision**
- `src/components/features/dashboard/design/wishlist-design-editor.tsx` is already modified and uncommitted. It renders the image-guidance hint, so the `heroImageSlots` bump surfaces there — coordinate before editing.

**No impact**: database schema, tRPC routers, environment variables, dependencies.
