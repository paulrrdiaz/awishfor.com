## 1. Section model and tabs

- [x] 1.1 Rename `NAV_ITEMS` labels in `wishlist-sections.ts` to `Tema` and `Ajustes`, leaving the `design` and `settings` segments and every existing helper unchanged.
- [x] 1.2 Extend the section model with an optional per-item badge descriptor so a tab can render a count or a pending-state badge without each consumer knowing the item order.
- [x] 1.3 Build `WishlistSectionTabs` rendering `navItemsFor(isOwner)` as a horizontal, horizontally scrollable row with label-first items, an inset active treatment derived from `activeSegmentFromPathname`, and badges that are omitted when the count is zero or unknown.
- [x] 1.4 Delete `wishlist-section-rail.tsx` and remove its usages.

## 2. Pending-invitation count

- [x] 2.1 Add a pending-invitation aggregate to the `wishlist.overview` resolver and expose it on the overview view model alongside the existing metrics.
- [x] 2.2 Pass the visible gift count and pending-invitation count from the detail layout into the tabs as badge values.

## 3. Topbar and wishlist switcher

- [x] 3.1 Build `WishlistSwitcher` as a popover listing the owner's non-archived wishlists with status dot, secondary summary line, and status pill, sourced from a `wishlist.list` client query fetched on first open.
- [x] 3.2 Add the switcher's filter input, `Nueva wishlist` action, and `Ver todas · archivadas` link to `/dashboard/wishlists`.
- [x] 3.3 Make switcher selection preserve the current section when that section exists for the target wishlist and fall back to the target's Resumen otherwise.
- [x] 3.4 Rework `WishlistTopbar` so the breadcrumb renders the switcher followed by the active section name, and remove the status badge from the topbar.

## 4. Status strip

- [x] 4.1 Build `WishlistStatusStrip` resolving exactly one variant from wishlist status: draft, published, or archived.
- [x] 4.2 Render the draft variant with the readiness items, a `n de m listos` progress indicator, and the publish action, reusing the readiness data already returned by `wishlist.overview`.
- [x] 4.3 Render the published variant with the public URL, view count, `Copiar enlace`, and `WhatsApp`, including the existing copy success and copy failure states.
- [x] 4.4 Render the archived variant with the archived notice and the restore action already offered by `WishlistActionsMenu`.
- [x] 4.5 Move `PublishReadinessChecklist` and `PublishButton` out of the Resumen page body and remove them from `[id]/page.tsx`.

## 5. Detail layout composition

- [x] 5.1 Recompose `[id]/layout.tsx` as topbar → status strip → title block → tabs → children, dropping the rail row and keeping the content pane as the only scroll container.
- [x] 5.2 Reduce `WishlistTitleBlock` to the serif `h1`, moving the public URL and copy affordance into the published status strip and keeping exactly one `h1` per route.

## 6. Global sidebar

- [x] 6.1 Reduce `AppSidebar` to Inicio, Mis wishlists with a count badge, Mi cuenta, and Ayuda y soporte, removing the owned and shared wishlist trees, the `Nueva wishlist` entry, and Analíticas.
- [x] 6.2 Make `Mis wishlists` link to `/dashboard/wishlists` and render active on any route beneath it, and wire `Mi cuenta` to the Clerk profile modal already mounted in the footer.
- [x] 6.3 Replace the sidebar header wordmark with the circular isotype treatment in both expanded and collapsed states.
- [x] 6.4 Remove the `api.wishlist.list()` fetch and its empty-sidebar fallback from `(protected)/layout.tsx` and drop the now-unused sidebar props.

## 7. Tests and verification

- [x] 7.1 Update `app-sidebar.test.tsx` for the four fixed destinations and the absence of the wishlist tree.
- [x] 7.2 Add tests for tab active-state resolution, including the `categories` alias resolving to Regalos and badge omission at zero.
- [x] 7.3 Add tests for status strip variant selection across draft, published, and archived, and for the copy success and copy failure states.
- [x] 7.4 Add switcher tests for filtering, section preservation on switch, and the Resumen fallback.
- [x] 7.5 Update `wishlist-detail-shell.stories.tsx` to the tabs-and-strip composition.
- [x] 7.6 Run `pnpm check` and resolve reported issues.
- [x] 7.7 Run `pnpm test` and resolve or report failures.
- [x] 7.8 Run `pnpm typecheck` and resolve or report failures.
