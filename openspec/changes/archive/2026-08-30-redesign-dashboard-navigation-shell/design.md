## Context

The wishlist detail shell today stacks `WishlistTopbar` → (`WishlistSectionRail` | `WishlistTitleBlock` + children). The rail is a 60px icon column at `md`+ and a horizontally scrolling labeled strip below `md`. The global `AppSidebar` renders Inicio, a `Mis wishlists` tree of every owned and shared list, a shared group, then Analíticas / Configuración / Ayuda — of which only Inicio and the list links navigate anywhere.

`Dashboard.dc.html` §1 supersedes this with four interlocking decisions. They ship together because each removes the justification for part of another: the switcher (A2) is what makes it safe to delete the sidebar tree (A1), and the status strip (A3) is what makes it safe to move readiness out of Resumen.

## Goals / Non-Goals

Goals:
- Every section reachable in one click, with its name visible without hover.
- Switching wishlists costs one click from any section.
- Publish state and share actions visible from every section.
- Sidebar height independent of how many wishlists exist.

Non-Goals:
- Mobile-specific shell (bottom tabs, sheets) — separate change.
- Resumen page content — separate change.
- Command palette, `/dashboard/account` route, analytics destination.

## Decisions

### Target layout

```
┌─────────┬──────────────────────────────────────────────┐
│ Sidebar │ Topbar 55px  [◉ Babyshower ▾] / Regalos      │
│ (fixed  │              Ver pública · ⋯ · Crear wishlist│
│  4 dest)├──────────────────────────────────────────────┤
│         │ StatusStrip   draft │ published │ unsaved     │ ← every section
│ Inicio  ├──────────────────────────────────────────────┤
│ Mis w.·3│ h1 serif  Babyshower de Juliette             │
│ Mi cta  │ ═══ Resumen │ Regalos·4 │ Invitados·3 pend ══│ ← tabs
│ Ayuda   │     Tema │ Colaboradores │ Ajustes           │
│         ├──────────────────────────────────────────────┤
│ [iso]   │ children (own scroll container)              │
│ avatar  │                                              │
└─────────┴──────────────────────────────────────────────┘
```

### Tabs replace the rail

`WishlistSectionRail` is deleted rather than restyled — its icon-only + tooltip contract is exactly what the design rejects. A new `WishlistSectionTabs` renders `navItemsFor(isOwner)` as a horizontal, horizontally scrollable row with an inset bottom-border active treatment. Icons are retained in `NAV_ITEMS` for the mobile change's sheet, but tabs render label-first.

Counts ride on the tab: Regalos shows the visible gift count, Invitados shows a pending-RSVP count styled as a warning when non-zero. A tab with a zero or unknown count renders no badge rather than a `0`.

Rejected: keeping the rail at `md`+ and using tabs only below it. That preserves the hover-dependency the design set out to remove and leaves two navigation idioms to maintain.

### Topbar hosts the switcher, not the status badge

`WishlistTopbar`'s breadcrumb becomes `[switcher] / [section name]`. The status badge leaves the topbar entirely — it would duplicate the status strip directly beneath it.

`WishlistSwitcher` is a popover listing the owner's non-archived wishlists with a status dot, gift/RSVP summary, and status pill, plus a filter input, a `Nueva wishlist` action, and a `Ver todas · archivadas` link to `/dashboard/wishlists`. It preserves the current section when switching where that section exists for the target list, falling back to the target's Resumen.

The switcher needs the list the sidebar used to fetch. `wishlist.list` moves from the protected layout's server fetch into a client query inside the switcher, fetched on first open so the shell does not pay for it on every navigation.

Rejected: a native `<select>`. It cannot carry the status dot, secondary line, and create action the design specifies.

### Status strip

`WishlistStatusStrip` renders exactly one variant, resolved server-side in the layout:

| Condition | Variant | Content |
|---|---|---|
| `status === "draft"` | draft (amber) | readiness items, `n de m listos` progress, `Publicar` |
| `status === "published"` | published (green) | public URL, view count, `Copiar enlace` · `WhatsApp` · `QR` |
| `status === "archived"` | archived (muted) | archived notice, `Restaurar` |

The design's third variant — unsaved design changes on a dark surface — is specified here but rendered only when the design editor reports a dirty state. No dirty-tracking exists today, so this change renders the three status-derived variants and leaves the unsaved-changes variant to the Tema work.

`PublishReadinessChecklist` and `PublishButton` move from the Resumen page into the draft variant. Their existing props already come from `wishlist.overview.readiness`, which the layout also fetches, so no new query is needed.

`QR` is in the design's published strip but no QR generator exists in the codebase. This change renders `Copiar enlace` and `WhatsApp` only; `QR` is deferred with the two blocked Resumen panels.

### Title block

`WishlistTitleBlock` currently carries title + public URL + copy button. The URL and copy affordance move into the published status strip, leaving the block as the serif `h1` sitting directly above the tabs. It remains the route's only `h1`.

### Sidebar

`AppSidebar` drops the owned/shared trees, the `Nueva wishlist` link, and Analíticas. What remains:

- `Inicio` → `/dashboard`
- `Mis wishlists` → `/dashboard/wishlists`, with a count badge, active on any `/dashboard/wishlists*` route
- `Mi cuenta` → opens the Clerk `UserButton` profile modal already mounted in the footer
- `Ayuda y soporte` → placeholder, consistent with its current non-navigating state

The header swaps the wordmark for the circular isotype treatment. Because the sidebar no longer needs list data, `ProtectedLayout` stops calling `api.wishlist.list()` and its `try/catch` empty-sidebar fallback goes away.

### Labels

`NAV_ITEMS` labels change to `Tema` and `Ajustes`. Segments stay `design` and `settings`, so `hrefFor`, `activeSegmentFromPathname`, the `categories` alias, and every existing link are unaffected.

## Risks / Trade-offs

- **Deleting the sidebar tree before the switcher is proven.** Mitigated by shipping both in this change and keeping `/dashboard/wishlists` as a full-list fallback reachable from the sidebar.
- **Tab overflow.** Six tabs plus badges will overflow narrow desktop windows; the row scrolls horizontally, and the mobile change replaces it with chips and a sheet.
- **Extra query for the pending-invitation count.** Added to the existing `wishlist.overview` resolver as one aggregate rather than a separate round trip.
- **Status strip adds vertical chrome.** Roughly 44px above the fold on every section, accepted as the cost of making draft state impossible to miss.

## Migration Plan

No data migration. Route segments unchanged, so no redirects. `wishlist-detail-shell.stories.tsx` and `app-sidebar.test.tsx` are updated in step with the components.

## Open Questions

- Should `Ayuda y soporte` link somewhere concrete now, or stay inert until a help destination exists?
- Should the switcher list archived wishlists inline behind a filter, or keep them only behind `Ver todas · archivadas`?
