## 1. Design-system foundation

- [x] 1.1 Fix `--font-mono` in `src/styles/globals.css` to read `var(--font-jetbrains-mono)` with a `monospace` fallback, so `font-mono` resolves to the face `src/app/layout.tsx` actually loads
- [x] 1.2 Visually check existing `font-mono` surfaces outside the dashboard (wizard slug field, public pages) for regressions from 1.1
- [x] 1.3 Add `--status-published`, `--status-draft`, `--status-archived` and their `-foreground` pairs to `globals.css` with the canvas values, and map them through `@theme inline`
- [x] 1.4 Add `published`, `draft`, and `archived` variants to `src/components/ui/badge.tsx` sourcing the tokens from 1.3, leaving existing variants byte-identical in output

## 2. Chrome components

- [x] 2.1 Create `src/components/layouts/dashboard/wishlist-topbar.tsx` — fixed `h-[55px]`, card surface, bottom border; breadcrumb plus status badge on the left, `Ver pública` / `⋯` / `+ Crear wishlist` on the right
- [x] 2.2 Add the third breadcrumb segment for non-Resumen sections and omit it on Resumen
- [x] 2.3 Create `src/components/layouts/dashboard/wishlist-section-rail.tsx` with the five sections, `LayoutGridIcon · GiftIcon · UsersIcon · PaletteIcon · SettingsIcon` at `size-[17px]`, `40x40` items at `rounded-[11px]`, active item on `bg-primary text-primary-foreground`
- [x] 2.4 Give every rail item an `sr-only` accessible name plus a `Tooltip` at `md` and up (the root `TooltipProvider` already exists — do not add another)
- [x] 2.5 Add the sub-`md` orientation to the rail: horizontal, `overflow-x-auto`, icon **and** visible label, same active treatment
- [x] 2.6 Add `SEGMENT_ALIASES` mapping `categories → gifts`, and derive both the rail's active item and the breadcrumb's third segment from it
- [x] 2.7 Create `src/components/layouts/dashboard/wishlist-actions-menu.tsx` — `DropdownMenu` with Copiar enlace and Archivar, wired to the existing `archive` mutation behind an `AlertDialog`
- [x] 2.8 Add the archived branch to 2.7: Restaurar opens the canvas dialog (`¿Restaurar esta wishlist?`) with `Restaurar publicada` / `Restaurar como borrador` / `Cancelar`, wired to `restore`
- [x] 2.9 Extract the title block — `h1` serif 22px, public URL 13px, `copiar` chip using the `.kbd` spec (`font-mono`, 11px, `rgba(0,0,0,.05)`, `2px 7px`, `radius:5px`) — with success and failure states on copy

## 3. Layout wiring and scroll model

- [x] 3.1 Change `src/app/(protected)/layout.tsx` from `min-h-[calc(100svh-1rem)]` to a fixed viewport height and thread `min-h-0` down so the shell no longer grows with content
- [x] 3.2 Rewrite `src/app/(protected)/dashboard/wishlists/[id]/layout.tsx` to compose topbar → `flex min-h-0 flex-1` → rail + scrollable content pane holding the title block and `{children}`
- [x] 3.3 Give `/dashboard` its own scroll container so it is not clipped by 3.1
- [x] 3.4 Give `/dashboard/wishlists` its own scroll container so it is not clipped by 3.1
- [x] 3.5 Delete `src/components/layouts/dashboard/wishlist-detail-nav.tsx` and remove every import of it
- [x] 3.6 Confirm no section page renders a second `h1`; demote the heading in `[id]/categories/page.tsx` and drop its `max-w-3xl px-4 py-8` wrapper in favour of the layout's padding

## 4. Section content to canvas

- [x] 4.1 Set content padding per canvas — `28px` on Resumen, `4px 28px 20px` on Regalos and Invitados
- [x] 4.2 Rework `src/components/shared/metric-card.tsx` to the canvas card: drop `icon` and `description`, `padding:18px`, `rounded-lg` (16px), label 12px muted, value serif 30px
- [x] 4.3 Update `src/components/shared/metric-card.stories.tsx` for the removed props
- [x] 4.4 Update `overview/metric-cards.tsx` — four columns at `gap-14px`, progress bar 6px on `--border` filled with `--primary`, no icons, no descriptions
- [x] 4.5 Change the Resumen two-column grid to `1.3fr / 1fr` at an 18px gap
- [x] 4.6 Align `overview/recent-purchases.tsx`, `publish-readiness-checklist.tsx`, and `overview-share.tsx` to the canvas cards (`padding:20px`, `rounded-lg`, 15px semibold headings)
- [x] 4.7 Align the Regalos toolbars and rows to `§6c`, moving status badges onto the badge variants from 1.4
- [x] 4.8 Align the Invitados metric row, toolbar, and table to `§6d`, moving RSVP badges onto the badge variants from 1.4
- [x] 4.9 Replace every off-palette hex in the files touched above with the matching semantic token

## 5. Conventions and validation

- [x] 5.1 Normalize lucide imports to the `Icon` suffix in every file this change edits; leave untouched files alone
- [x] 5.2 Run `pnpm check`, `pnpm typecheck`, and `pnpm test`
- [x] 5.3 Verify the five sections at desktop width: topbar and rail stay fixed, only the content pane scrolls, and the active rail item matches the route including `/categories`
- [x] 5.4 Verify below `md`: the rail strip shows labels, scrolls horizontally, and the active item is identifiable without hover
- [x] 5.5 Verify `/dashboard` and `/dashboard/wishlists` are not clipped after 3.1
- [x] 5.6 Verify the `⋯` menu end to end — archive with confirmation, then restore as published and as draft, checking the topbar badge updates each time
