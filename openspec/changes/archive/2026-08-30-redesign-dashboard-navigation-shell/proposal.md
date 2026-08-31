## Why

Navigating the panel costs more than it should. Section names are hidden behind hover tooltips on a 60px icon rail, so an owner must hover each icon to find Invitados. Switching between wishlists requires walking the sidebar tree, which grows without bound as the owner creates lists. Publish readiness and the share link live only on Resumen, so an owner working in Regalos cannot see that the list is still a draft or copy its public URL without leaving the section.

The approved design (`Dashboard.dc.html`, proposals 1b · A1 · A2 · A3) resolves all four: named horizontal tabs, a fixed four-destination sidebar, a wishlist switcher in the breadcrumb, and a status strip persistent across every section.

## What Changes

- Replace the vertical icon rail with horizontal section tabs carrying visible names and live counts, placed under the wishlist title.
- Turn the breadcrumb's first level into a wishlist switcher offering search, per-list status, and a create action, so changing lists no longer depends on the sidebar tree.
- Add a status strip below the topbar, present on every wishlist section, rendering one of three states: draft with inline readiness progress and a publish action, published with the public URL and share actions, or unsaved-design-changes.
- Reduce the global sidebar to four fixed destinations — Inicio, Mis wishlists, Mi cuenta, Ayuda y soporte — removing the per-wishlist tree and the non-functional Analíticas entry.
- Rename section labels to match the design: `Diseño` becomes `Tema`, `Configuración` becomes `Ajustes`. Route segments are unchanged.
- Move the readiness checklist and publish control out of the Resumen page body into the status strip.

Non-goals:

- The mobile bottom tab bar, section chips, and action sheets (`add-mobile-dashboard-shell`).
- The Resumen page's metric cards and analytics panels (`redesign-wishlist-overview`).
- Building `/dashboard/account`; the sidebar's `Mi cuenta` entry opens the existing Clerk profile modal.
- A `⌘K` command palette. The switcher is pointer- and keyboard-navigable but not globally invocable.
- Any change to route segments, so existing links and bookmarks keep working.

## Capabilities

### New Capabilities

- `dashboard-app-navigation`: the global sidebar's fixed destinations and the wishlist switcher that replaces the sidebar tree.

### Modified Capabilities

- `dashboard-detail-chrome`: horizontal tabs replace the vertical rail, the topbar hosts the switcher instead of the status badge, and a persistent status strip carries publish state and share actions.

## Impact

- `src/components/layouts/dashboard/`: `wishlist-section-rail.tsx` removed, tabs and status strip added, `wishlist-topbar.tsx` and `wishlist-sections.ts` reworked.
- `src/components/features/dashboard/app-sidebar.tsx` loses the wishlist tree and Analíticas; `src/app/(protected)/layout.tsx` no longer needs `wishlist.list` for sidebar rendering.
- `src/app/(protected)/dashboard/wishlists/[id]/layout.tsx` gains tab counts and renders the status strip.
- `src/app/(protected)/dashboard/wishlists/[id]/page.tsx` loses `PublishReadinessChecklist` and `PublishButton`.
- `wishlist.overview` view model gains a pending-invitation count for the Invitados tab badge.
- Storybook story `wishlist-detail-shell.stories.tsx` updated; `app-sidebar.test.tsx` updated.
- No schema change, no new environment variables, no new dependencies.
