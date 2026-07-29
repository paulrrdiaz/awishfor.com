## Context

The wishlist detail route renders a two-part nav from a single 334-line client component, `src/components/layouts/dashboard/wishlist-detail-nav.tsx`: a slim breadcrumb bar, then a title row carrying the `h1`, status badge, public URL, and the `Ver pública` / `⋯` buttons, then a horizontal `Tabs` row whose active indicator is measured imperatively with `useLayoutEffect` plus a `ResizeObserver`. Below `md` the tab row is swapped for a `Select`.

The Claude Design canvas supersedes all of it. Sections `§6` (Resumen), `§6c` (Regalos), and `§6d` (Invitados) share byte-identical chrome:

```
+----------------+--------------------------------------------+
| AppSidebar 260 | TOPBAR  h:55  bg:#fff  border-b             |
|                |  Mis wishlists / Titulo [* Publicada]       |
|                |         [Ver publica] [...] [+ Crear]       |
|                +------+-------------------------------------+
|                | rail | h1 serif 22 + url 13 + [copiar]      |
|                |  60  |                                      |
|                | 40x40|  <- page content starts here         |
|                | r:11 |                                      |
+----------------+------+-------------------------------------+
```

Constraints discovered while grounding the design against the repo:

- `globals.css` already encodes the canvas app theme almost exactly — `--background` ≈ `#F7F8F1`, `--foreground` ≈ `#1E2A47`, `--primary` ≈ `#C3E63E`, `--border` ≈ `#E7EAEF`, `--muted-foreground` ≈ `#6B7384`, `--accent` ≈ `#EAF6EE`, `--accent-foreground` ≈ `#2E7D4F`, `--radius: 1rem` = the canvas `.acard` radius. The palette is not the problem; the components bypassing it are.
- `--radius-lg` is `1rem` (16px) and `--radius-xl` is `1.4rem` (22.4px). Cards currently using `rounded-xl` are 6px off the canvas.
- `SidebarInset` is already `flex w-full flex-1 flex-col`, so a fixed topbar plus a flexible row below it needs no wrapper changes.
- `TooltipProvider` is already mounted in `src/app/layout.tsx`.
- `archive` and `restore` already exist on the wishlist router.
- `--font-mono` resolves to generic `monospace`, not the loaded face (see Decision 8).
- No `next-themes`; the `.dark` block in `globals.css` is unreachable from dashboard routes.

## Goals / Non-Goals

**Goals:**

- Replace tab navigation with a rail that stays reachable regardless of content length.
- Make the topbar, rail, and title block match the canvas at the pixel level, sourcing every color from a token rather than an inline hex.
- Keep one implementation of the chrome shared by all five sections, so `Diseño` and `Configuración` inherit it without per-page work.
- Give the sub-`md` presentation labeled navigation, which an icon-only rail cannot provide on touch.

**Non-Goals:**

- Redesigning `app-sidebar.tsx` against canvas `§6b`.
- Redesigning `Diseño`, `Configuración`, or `categories` content.
- Repo-wide lucide import normalization.
- Dark-mode token values.

## Decisions

### 1. Chrome lives in `[id]/layout.tsx`, not a new dashboard layout

The topbar, rail, and title block are all rendered by `src/app/(protected)/dashboard/wishlists/[id]/layout.tsx`:

```tsx
<>
  <WishlistTopbar title={...} status={...} section={...} publicUrlPath={...} />
  <div className="flex min-h-0 flex-1">
    <WishlistSectionRail wishlistId={id} />
    <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
      <WishlistTitleBlock title={...} slug={...} />
      {children}
    </div>
  </div>
</>
```

*Alternative considered:* hoisting the topbar to a new `(protected)/dashboard/layout.tsx` so `/dashboard` and `/dashboard/wishlists` share it. Rejected for now — the topbar's content (breadcrumb, status badge, `Ver pública`, `⋯`) is entirely wishlist-scoped, so sharing it would require a client context or a slot API to push per-route data upward. That indirection buys nothing until a second route actually needs the bar.

The title block sits in the layout rather than in each page because the canvas markup for it is byte-identical across `§6`, `§6c`, and `§6d`. Each page's own heading (`Regalos · 16`, the Invitados metric row) renders *below* it, inside `{children}`.

### 2. Title block is chrome, page headers are content

The canvas nests two heading levels. The layout owns `h1` (the wishlist title); pages own their section heading at `font-weight:600;font-size:16px`. Pages must not render a second `h1` — `categories/page.tsx` currently does, and is corrected.

### 3. App-shell scroll model

`(protected)/layout.tsx` moves from `min-h-[calc(100svh-1rem)]` to a fixed height, and `min-h-0` is threaded down so only the content pane scrolls. This is what the canvas draws (`overflow:hidden` on the rail row) and the only model in which a vertical rail makes sense: with document scrolling, a 200-gift list leaves five icons stranded at the top of an 800px empty column and takes the topbar off screen.

*Trade-off:* this is a global shell change. `/dashboard` and `/dashboard/wishlists` currently rely on the document scrolling and will clip without their own `overflow-y-auto`. Both are updated in this change; that is not optional cleanup.

### 4. One rail component, two orientations

`WishlistSectionRail` renders the same five items in both presentations, switching by breakpoint:

| | `md` and up | below `md` |
|---|---|---|
| Layout | vertical, `w-[60px]` | horizontal, `overflow-x-auto` |
| Content | icon only | icon **and** label |
| Label delivery | `Tooltip` on hover | always visible |
| Active | `bg-primary text-primary-foreground` | same |

Labels must be visible below `md` because touch devices have no hover state, which would otherwise leave the navigation entirely unlabeled. In both orientations the accessible name comes from a `sr-only` span, so the tooltip is a visual enhancement rather than the only label.

*Alternatives considered:* keeping the existing `Select` (two unrelated navigation patterns in one view, and it hides the sibling sections until opened); keeping the rail vertical at all widths (unlabeled on touch, and 60px is 15% of a 390px viewport); nesting the sections inside the sidebar's mobile slide-over (two taps per navigation).

Canvas `§6` and `§6c` draw four rail items; `§6d` draws five including Invitados. `§6d` is the newer section and matches the five routes that exist, so five wins. The canvas card labelled `Mobile · tabs → select` predates the rail entirely and is treated as obsolete.

### 5. Icons: semantic lucide with the `Icon` suffix

`LayoutGridIcon · GiftIcon · UsersIcon · PaletteIcon · SettingsIcon` at `size-[17px]`.

The canvas draws the rail with Unicode characters (`⊞ ♡ ☰ ✎ ⚙`), which is the canvas improvising rather than specifying iconography. Rendering those literally would vary by operating system, would not respond to `currentColor` and stroke width the way the rest of the dashboard does, and would need `aria-hidden` plus `sr-only` anyway.

Two of the five deliberately depart from the glyph. The canvas uses `♡` for both "Mis wishlists" in the sidebar and "Regalos" in the rail, which sit 60px apart — `GiftIcon` removes the collision. `☰` for Invitados reads as "menu" rather than "people", so `UsersIcon` is used.

New files use the `Icon` suffix, and files this change already edits are normalized as they are touched. The rest of the repo is left mixed until its own change.

### 6. Status colors become tokens

`globals.css` gains:

```css
--status-published: #E4F3E8;  --status-published-foreground: #2F7D43;
--status-draft:     #F4F4F1;  --status-draft-foreground:     #77756E;
--status-archived:  #EAECEF;  --status-archived-foreground:  #71798A;
```

mapped through `@theme inline` and exposed as `badge.tsx` variants.

*Alternative considered:* reusing `bg-accent` / `bg-muted`. Rejected on two counts — `--accent` is `#EAF6EE` against the canvas `#E4F3E8`, close enough to look sloppy rather than intentional when the two sit side by side; and it would collapse draft and archived into the same treatment. Inline hexes were rejected because they perpetuate exactly the drift this change exists to remove, and because the same three pairs recur in the gift and RSVP badges that are also in scope.

Only light values are defined. There is no theme toggle, so dark values would be untestable speculation.

### 7. `categories` aliases to `gifts` for active state

`activeSegmentFromPathname` currently falls through to `""` for unrecognized segments, so `/[id]/categories` highlights *Resumen*. A `SEGMENT_ALIASES` map resolves `categories → gifts`, which is also true conceptually — categories group gifts. The route keeps working for anyone holding the link; it just stops lying about where the user is. Adding a sixth rail item was rejected because the canvas defines five and there is no reference icon for a sixth.

### 8. Fix `--font-mono` before claiming pixel fidelity

`src/app/layout.tsx` loads `JetBrains_Mono` with `variable: "--font-jetbrains-mono"` and applies it to `<html>`, but `globals.css:57` declares `--font-mono: JetBrains Mono, monospace` — the literal family name. `next/font` generates a hashed family, so `font-mono` currently resolves to the generic monospace fallback.

The canvas uses JetBrains Mono for the `copiar` chip (`.kbd`, 11px) and the uppercase column headers in the Regalos and Invitados tables. Those cannot match until `--font-mono` reads `var(--font-jetbrains-mono)`. This is a one-line fix but it changes every existing `font-mono` surface, so it is called out rather than slipped in.

### 9. The `⋯` menu

A `DropdownMenu` with Copiar enlace and Archivar, plus an `AlertDialog` using the canvas copy verbatim: *"¿Restaurar esta wishlist? Puedes restaurarla como borrador para editarla antes de compartirla, o publicarla nuevamente con el mismo enlace."* with `Restaurar publicada` / `Restaurar como borrador` / `Cancelar`.

The button exists in the canvas topbar but the canvas never defines its menu; the archive/restore dialog is drawn as a loose card in `§6`. Since the button is currently dead and is being relocated regardless, and both mutations already exist, wiring it costs little and removes a control that does nothing.

## Risks / Trade-offs

- **The app-shell change touches every protected route** → `/dashboard` and `/dashboard/wishlists` get their own scroll containers in this change, and both are verified manually at desktop and mobile widths before the change closes.
- **Deleting the nav removes the tab indicator's tested behavior** → the `dashboard-detail-tabs` spec is explicitly removed rather than left dangling, so no requirement silently loses coverage.
- **`--font-mono` affects surfaces outside this change** → the fix changes the rendered face anywhere `font-mono` is used, including the wizard and public pages. Called out as its own task so a visual check covers those surfaces, not just the dashboard.
- **`badge.tsx` and `globals.css` are shared** → new variants are additive; existing variants keep their current output so nothing outside the dashboard shifts.
- **`metric-card.tsx` loses `icon` and `description`** → it is consumed only by `overview/metric-cards.tsx` and its own story, so the blast radius is two files, but the story must be updated in the same commit or Storybook breaks.
- **Below `md` the rail strip adds ~48px of vertical chrome** on top of the topbar → accepted; it is the cost of labeled navigation on touch, and it scrolls away with the content pane rather than pinning.

## Open Questions

- Canvas `§6b` specifies three sidebar states including a 56px icon-only collapse with an active dot and badge count. Deferred here, but it overlaps the rail visually — worth confirming the two icon columns read as distinct once both are live.
- Content padding differs between sections in the canvas (`28px` in Resumen, `4px 28px 20px` in Regalos and Invitados). Followed literally, though the asymmetry may be canvas drift rather than intent.
