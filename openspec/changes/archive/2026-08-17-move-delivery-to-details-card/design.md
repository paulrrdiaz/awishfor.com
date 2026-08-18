## Context

See `proposal.md` — Why. What shapes the approach is where the pieces sit today:

- `composeDelivery` (`src/lib/format/delivery.ts`) returns `ComposedDelivery | null`, anchored on the address. It already splits the line into `recipientName` / `address` / `phone` parts plus the copyable `line`. Unchanged by this work.
- `DeliveryPostscript` lives inside `src/components/shared/wishlist-message.tsx` and is rendered by all three welcome variants (`Postcard`, `Handwritten`, `Avatars`). `WishlistMessage` receives `delivery` from **four** call sites that between them cover all nine layouts:

  | Call site | Layouts | Details band |
  |---|---|---|
  | `public-wishlist-body.tsx` | 6 (`arch-hero-party`, `carousel-hero`, `magazine-editorial`, `overlap-duo`, `portrait-frame-split`, `scrapbook-polaroids`) | `EventDetails` `block`, `sm:grid-cols-3` |
  | `collage-staggered-layout.tsx` | 1 | `EventDetails` `compact`, 3-col band |
  | `arch-trio-layout.tsx` | 1 | `EventDetails` `compact` forced to `sm:grid-cols-1 sm:w-72` — the single-column left panel |
  | `split-image-right-layout.tsx` | 1 | **no `EventDetails`** — inlines its own `grid-cols-2` `Fecha`/`Lugar` cards |

- `EventDetails` (`src/components/shared/event-details.tsx`) builds a `details` array from date / location / dress code and **returns `null` when that array is empty** (line 60).
- `split-image-right-layout.tsx:77-107` hand-rolls its band with the same card tokens `EventDetails` `compact` uses (`rounded-[14px] border border-border bg-card`, mono `text-[9px] uppercase tracking-[0.16em]` eyebrow). It is a details band for placement purposes even though it is not the shared component — so it needs no special-casing beyond a fourth call site.
- `CopyButton` (`src/components/shared/copy-button.tsx`) owns the clipboard write, the copied state, and the 1500 ms revert. Its only other consumer is the purchase drawer (`guest-gift-drawer.tsx`).
- `DeliveryItems` (`src/components/shared/delivery-items.tsx`) renders the 👤/📍/📱 rows. Also consumed by the purchase drawer, so it survives regardless.

## Goals / Non-Goals

**Goals:**

- One delivery presentation component, rendered from all three layout call sites, that looks native to the event-details card set in both the single-column and the horizontal-band arrangements.
- Clipboard behavior stays in exactly one place, so the card and the purchase drawer can never drift apart on confirmation or revert timing.
- The card's render condition depends only on the delivery address, never on whether event details exist.

**Non-Goals:**

- Refactoring `EventDetails` into a generic card primitive. The two components share visual tokens, not an abstraction.
- Touching the purchase drawer's delivery block, or the composed-line format.
- Introducing a layout-level slot system to place the card. Four explicit call sites is fewer moving parts than a slot API for one component.
- Refactoring `split-image-right`'s inlined details band onto the shared `EventDetails`. Tempting adjacent cleanup, but it would change that layout's card set (it deliberately omits dress code and uses two columns) — out of scope here.

## Decisions

### Sibling component, not a fourth `details` entry

`DeliveryCard` is its own component rendered next to `EventDetails`, not an item pushed into the `details` array.

Three reasons, in order of weight:

1. `EventDetails` short-circuits to `null` when date, location, and dress code are all absent. A delivery-only wishlist would silently lose the card — a spec violation, not a cosmetic one.
2. The card's content shape (eyebrow + intro line + three pictogram rows + a copy action) does not fit the uniform `label` / `value` cell that `details.map` renders.
3. Both grid arrangements are `sm:grid-cols-3`. A fourth cell orphans itself on a second row.

*Alternative considered:* extend `EventDetails` with an optional `delivery` prop and a `renderDelivery` escape hatch. Rejected — it makes a presentational component conditional on a second data shape and still leaves the `null` short-circuit to special-case.

### Placement is decided by the call site, not by the card

`DeliveryCard` takes a `className` and renders a card-shaped block; each of the four call sites positions it:

```
arch-trio-layout.tsx                  public-wishlist-body.tsx
(single-column left panel)            collage-staggered-layout.tsx
                                      (horizontal band)
┌──────────┬──────────────┐
│  FECHA   │              │           ┌───────┬───────┬───────┐
├──────────┤   «mensaje»  │           │ FECHA │ LUGAR │ DRESS │
│  LUGAR   │   countdown  │           └───────┴───────┴───────┘
├──────────┤              │           ┌───────────────────────┐
│  DRESS   │              │           │  ENVÍO A DOMICILIO    │
├──────────┤              │           └───────────────────────┘
│  ENVÍO   │              │           ┌───────────────────────┐
└──────────┴──────────────┘           │      «mensaje»        │
                                      └───────────────────────┘
```

In `arch-trio` the left column becomes a flex/`div` wrapper holding `EventDetails` then `DeliveryCard`, so the card inherits the `sm:w-72` width and stacks as the panel's last item. In the other three, `DeliveryCard` is a full-width sibling emitted **directly after the details band and before the countdown** — the band's other consumers all render `Countdown` next, and putting the card after it would separate it from the sibling cards it is meant to read with.

*Alternative considered:* a `slot` / `after` prop on `EventDetails`. Rejected as indirection for a single consumer shape.

### `CopyButton` gains a treatment, not a sibling component

Add a `treatment?: "button" | "link"` prop. `"button"` (default) keeps today's `variant="outline"` + `Copy`/`Check` icon exactly as the purchase drawer renders it. `"link"` maps to the Button `link` variant with the mono uppercase micro-type of the card set and no icon, so the resting label reads as `COPIAR` and the copied state as `COPIADO`.

The clipboard write, the `copied` state, and the `COPIED_REVERT_MS` revert stay in the one component — the spec requires both surfaces to confirm identically, and duplicating the state machine is exactly how that requirement rots.

*Alternative considered:* pass `className` and let the card restyle the existing outline button. Rejected — the icon and the `size="sm"` button padding would have to be unstyled away, and the intent (`this surface uses the text treatment`) would live in a class string.

### Card visual: peer of the detail cards, distinguished by border

Same radius, padding scale, and mono uppercase eyebrow as `EventDetails`' compact cells, so it reads as one set. It carries a primary-tinted border rather than the neutral `border-border` of its siblings — it is the one card with an action in it, and the tint is what marks it as actionable without adding a heading weight the other cards don't have. Content is left-aligned (the sibling cells are `text-center`, but three pictogram rows centered would ragged badly).

### `DeliveryItems` is reused as-is

The card renders `DeliveryItems` unchanged, including the phone row. The pictograms are already `aria-hidden`, and the composed `line` is what the copy action writes — so the emoji never reach the clipboard. No change needed to serve both surfaces.

### Deletion is total, not deprecation

`DeliveryPostscript` is deleted and `delivery` is removed from `WishlistMessage`'s `Props` and `VariantProps` in the same change, rather than left as an ignored optional prop. Four call sites, all in this repo, all updated here — a deprecated-but-accepted prop would just be a second way to render delivery that the specs no longer describe.

## Risks / Trade-offs

- **`arch-trio` vertical alignment shifts.** Its two-column wrapper is `sm:items-center` (`arch-trio-layout.tsx:127`); a fourth card makes the left column taller and re-centers both columns. → Visual check in the browser at desktop and at the `sm` breakpoint before closing; adjust the wrapper's alignment only if the message column visibly drops.
- **The card competes with the message for attention on the horizontal-band layouts.** It now sits between the details band and the welcome message, in the path of a guest reading top-to-bottom. → Accepted: that is the point of the move. Kept to one card with no elevation so it does not outweigh the message.
- **Two `CopyButton` treatments means two things to keep looking right.** → Mitigated by them sharing all behavior and differing only in Button variant + icon presence; a story covering both treatments pins the rendering.
- **Snapshot/story churn.** `wishlist-message.stories.tsx` has delivery-bearing stories that no longer make sense. → Move those cases to a new `delivery-card.stories.tsx` rather than deleting the coverage.

## Migration Plan

Presentation-only; no data, schema, or API migration. Ships in one commit — the postscript removal and the card addition must land together, or a wishlist with a delivery address renders it twice (or nowhere). Rollback is a revert.
