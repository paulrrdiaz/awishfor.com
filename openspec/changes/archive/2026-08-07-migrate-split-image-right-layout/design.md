## Context

Nine public wishlist layouts live in `src/components/layouts/public-wishlist/`, selected by id in `public-wishlist-page.tsx`. They fall into two generations:

- **Thin generation** — the component renders only a hero and hands the rest to `PublicWishlistBody`, which owns section order and gift rendering. Seven layouts, including today's `split-image-right` (59 lines).
- **Self-contained generation** — the component owns its full page: header chrome, a centered `<main>` wrapper, section composition from shared primitives, and footer. Only `collage-staggered` (228 lines) so far.

All eight thin layouts are migrating; this change moves the second one and establishes the shared structure the remaining seven will use. `split-image-right` is a deliberate choice for second: its design's defining behavior — a photo rail that stays fixed while a long text column scrolls past it — is a whole-page concern `PublicWishlistBody` cannot express from inside a hero slot, and it forces the shell to answer the per-mode viewport-offset question that every later sticky or overlay treatment will also ask.

**Design source of truth:** `PublicWishlistPages.dc.html`, block `02 · SplitImageRight`, in the Claude Design project. Its right column is a `340px` grid track containing two `flex:1` images over a `var(--border)` background with `gap:5px` and a `5px solid var(--card)` border per image. The static mock has no scrolling, so stickiness is a product decision layered on top of the mock, confirmed with the user.

**Render modes.** `PublicWishlistMode` is `"full" | "preview" | "compact"`. `full` is the real public route, `preview` is the unpublished-wishlist view, `compact` is an embedded preview (marketing example, wizard steps). The three differ in what occupies the top of the viewport, which directly determines the sticky offset.

## Goals / Non-Goals

**Goals:**

- Render `split-image-right` faithfully to design `02`, on the `collage-staggered` composition pattern.
- Keep the two-photo rail fixed in the viewport while the left column scrolls, at `lg` and above.
- Degrade to a readable single-column stack below `lg`.
- Reuse existing shared primitives rather than introducing layout-local variants of them.
- Keep the layout correct in all three render modes.

- Extract the page chrome into a shared shell, so the seven layouts still to migrate are composition work rather than seven more copies of the same header, wrapper and footer.

**Non-Goals:**

- Migrating the other seven thin layouts. Each gets its own change.
- Changing `PublicWishlistBody`, which those seven still depend on. It is deleted when the last one moves, not before.
- Any visual change to `collage-staggered`. Its move onto the shell must be output-identical.
- Any carousel/gallery affordance on `split-image-right`.
- Designing the shell for hypothetical needs. It absorbs what `collage-staggered` and `split-image-right` actually demonstrate; the next migration extends it if it must.

## Decisions

### 0. Extract the shell now, from two instances

Normally two instances is thin evidence for an abstraction. It is not thin here: all eight remaining layouts are migrating to this exact pattern, and every one of them needs the same header, the same centered wrapper, the same footer, and — once any of them positions something against the viewport — the same per-mode top offset. Extracting on the second migration means seven follow-ups are composition; extracting on the ninth means eight copies to reconcile.

The shell owns:

- the mode-dependent outer wrapper (full-bleed `ml-[calc(50%-50vw)] w-screen` plus header padding in `full`, plain otherwise)
- the page header — brand isotype, `● Publicada` badge, `Compartir` control and its share handler — `fixed` in `full` mode only
- the centered `<main className="mx-auto w-full max-w-[1160px]">` wrapper
- `WishlistFooter variant="compact"`, full-bleed, suppressed in `compact` mode
- **the per-mode sticky top offset**, published as a CSS custom property (see Decision 2)

The shell does **not** own section order, gift rendering, or anything between the wrapper and the footer. Layouts pass their body as children. Anything a single layout needs and no other does stays in that layout.

`collage-staggered` is refactored onto it in the same change. Refactoring it later would mean shipping the shell with exactly one consumer and no proof it actually fits the layout it was extracted from — the refactor *is* the verification.

**Rejected:** a config-driven shell that takes the layout's sections as props. That pushes per-layout structure into a shared component's prop surface and grows with every migration, which is the coupling the thin `PublicWishlistBody` generation already demonstrated.

### 1. Sticky rail: one sticky container, two `flex-1` images

The right grid cell holds a single `sticky` element sized to the viewport, containing a flex column of two images that each take `flex-1`.

**Rejected:** each image `h-screen`, so the guest scrolls through photo one then photo two. This reads as a scrollytelling gallery, contradicts the design's `flex:1` 50/50 stack, and would need 200vh of left-column content to work at all.

**Rejected:** `position: fixed` on the rail. Fixed escapes the `max-w-[1160px]` wrapper's coordinate space, so the rail would need manual left-offset math that breaks at every breakpoint and when a scrollbar appears.

Two constraints from the mock must be **dropped**, not translated:

- The mock's `overflow:hidden` on the rail container. Any ancestor with `overflow` other than `visible` silently disables `position: sticky` on its descendants. Clip per-image instead (`overflow-hidden` on the individual image wrappers, which are not sticky ancestors).
- The mock's `min-height:380px` per image and `min-height:780px` on the column. Together they exceed a typical viewport, so `flex-1` could never split the container. Each image needs `min-h-0` so flex is allowed to shrink it below content size.

The sticky ancestor chain is clean today: `PublicThemeProvider` sets no `overflow`, and `collage-staggered`'s full-bleed wrapper uses `ml-[calc(50%-50vw)] w-screen` without clipping. Verify this holds after the rewrite rather than assuming it.

### 2. Sticky offset is per-mode, not a constant

The three modes pin different things to the top of the viewport. Critically, `collage-staggered` makes its page header `fixed` **only in `full` mode** (`collage-staggered-layout.tsx:64`); in `preview` and `compact` the header sits in normal flow and scrolls away. So the offsets are:

| Mode | What actually pins to the top | Sticky offset | Rail height |
|---|---|---|---|
| `full` | the layout's own `fixed` header | 53px (matches `collage-staggered`'s `pt-[53px]`) | `calc(100svh - 53px)` |
| `preview` | the `sticky top-0 z-50` amber "vista previa" banner **only** — the header scrolls away | banner height | viewport minus banner |
| `compact` | nothing; the layout is embedded in a host page | `0` | `100%` of the embedded box |

The two non-zero offsets come from **different sources**: `full`'s is a layout constant that must stay in step with the header's own height, while `preview`'s is content-derived from the banner's `px-6 py-3` + `text-sm`, with no token behind it. That divergence — not a sum — is the reason to funnel both through a single CSS custom property: the `top-*` value and the height expression then cannot drift apart, and neither hardcodes a number in two places. The property is set by the **shell** (Decision 0), not by this layout, because the shell is what knows the header's height and its own mode; every later layout that pins anything to the viewport reads the same property instead of re-deriving it.

In `compact` the rail should not use viewport units at all — an embedded preview sized to `100svh` would overflow its host box. Gate the viewport-height expression on `mode !== "compact"`.

### 3. `lg:`-only sticky, confirmed with the user

Below `lg` the grid is one column. A `100svh` sticky photo rail there would fill the screen before any text is reachable. Below `lg`: two stacked images at a fixed height (`h-56 sm:h-72`, matching what the current component already does), no sticky, no viewport units. All sticky and height rules carry the `lg:` prefix.

### 4. Gift section reuses `PublicGiftFilters` unchanged — no `giftCardStyle` config change

`public-filters.tsx` (lines 326–339) shows that when `showGridToggle` is passed, `layout.giftColumns` is bypassed entirely (`giftColumns={showGridToggle ? gridColumns : layout.giftColumns}`) and the 1-column state **forces** `giftCardStyle="collage-row"` — horizontal rows. That is exactly design `02`'s gift treatment, and the design's 1-col/2-col toggle icons match `showGridToggle`'s control.

So the layout passes the same `PublicGiftFilters` props `collage-staggered` does, and the preset's `giftCardStyle: "card"` / `giftColumns: 2` only ever apply in the 2-column state — a reasonable second state for this layout. **No config change needed here.**

One caveat to verify during apply: `gridColumns` initializes to `3` while the toggle only offers `1` and `2`. Design `02` shows the 1-column (rows) state as active by default. If the initial render is wrong, it is wrong for `collage-staggered` too, so fix it in `public-filters.tsx` rather than working around it locally.

### 5. Countdown sits in the left column, not the filter toolbar

`collage-staggered` passes `<Countdown variant="chip" />` as `toolbarLeading` to `PublicGiftFilters`. Design `02` places the countdown chip **centered in the left column, above the quote block** — a different position with different meaning (part of the event summary, not a filter-bar affordance). Render `Countdown variant="chip"` directly in the left column and pass no `toolbarLeading`.

### 6. `heroImageSlots: 1 → 2` accepted with its publish-readiness consequence

`evaluatePublishReadiness` (`publish-readiness.ts:41`) uses `resolveLayout(layoutId).heroImageSlots` as the required cover-image count. Raising it to 2 means a wishlist already on this layout with one image reports `checks.images: false`.

**Rejected:** decoupling "slots the composition displays" from "images required to publish" by adding a separate `requiredImageCount` field. That is a broader refactor touching the wizard, readiness, and preview paths, and it would weaken a currently honest invariant — a layout that displays two photos genuinely looks unfinished with one.

Accepted as-is. The rail's second slot falls back to the theme's tinted placeholder via `HeroImageSlot`, so an under-filled wishlist still renders coherently; it just is not publish-ready. This is consistent with how `collage-staggered` (3 slots) and `overlap-duo` (2 slots) already behave.

### 7. Event summary line under the title contradicts a current spec requirement

`openspec/specs/public-wishlist-layout/spec.md` states "Hero shows the wishlist title alone" and "the hero renders no subtitle line". Design `02` shows `Lucía & Marco · 20 de octubre, 2025` under the title, and the shipped `collage-staggered` layout already renders exactly that via its `eventSummary` const — so the spec is already stale against main.

Follow the design and amend the requirement, rather than shipping a layout that contradicts its own reference and its sibling. The delta spec narrows the requirement to what it was actually protecting: no *duplicate* name/heading line, while a single muted summary line is permitted.

### 8. Generalize the layout-id branch in `public-wishlist-page.tsx`

That file currently branches its wrapper `className` on `layout.id === "collage-staggered"` to give self-contained layouts `bg-background` and to suppress `min-h` in non-full modes. `split-image-right` needs identical treatment. Replace the string equality with a `SELF_CONTAINED_LAYOUT_IDS` set exported alongside the shell, so each of the seven remaining migrations is a one-line addition next to the component it describes rather than a growing ternary in the page shell.

The set shrinks to nothing useful once all nine have migrated — at that point the branch is unconditional and both it and `PublicWishlistBody` are deleted. That is the migration's exit condition, not something to design around now.

## Risks / Trade-offs

- **A future ancestor gains `overflow`, silently killing sticky** → Sticky failure is invisible in unit tests. Add a Storybook story with enough left-column content to scroll, and check the rail visually in `full`, `preview`, and `compact` before closing the change.
- **`preview` mode's banner height is content-derived and can drift** → Drive the offset from one CSS custom property per mode rather than repeating a literal in both the `top-*` and the height expression.
- **`100vh` on mobile browsers is unreliable (dynamic URL bar)** → Irrelevant below `lg` where sticky is off, but use `svh` rather than `vh` for consistency with `PublicThemeProvider`'s existing `min-h-svh`.
- **Publish-readiness regression for existing hosts on this layout** → Expected and accepted (Decision 6). Before merging, check how many wishlists use `split-image-right` with one cover image; if non-trivial, the readiness UI copy should name the second photo explicitly rather than showing a generic shortfall.
- **Long left column vs. short rail on sparse wishlists** → When a wishlist has few gifts, the left column may be shorter than the viewport and the rail never scrolls, so stickiness is unobservable. This is correct behavior, not a bug; just do not use a sparse fixture as the visual check.
- **Working-tree collision on `wishlist-design-editor.tsx`** → Already modified and uncommitted. Confirm its state before touching the image-guidance path.

## Migration Plan

No data migration. Deployment is a code change; rollback is a revert. The only stateful consequence is publish-readiness for existing `split-image-right` wishlists with one cover image — those become blocked from re-publishing until a second photo is added, and reverting restores them.

## Open Questions

- Should the readiness/wizard copy call out the second photo specifically for this layout ("esta plantilla usa 2 fotos"), or is the existing generic shortfall message sufficient? Deferred — the generic message is already driven by `heroImageSlots` and will be accurate, just less pointed.
