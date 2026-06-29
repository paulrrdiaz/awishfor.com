## Why

Dashboard desktop sidebar today use placeholder `Sparkles` icon + hardcoded "a wishfor" text, and only offcanvas collapse. Design (§6b · Sidebar component — Shadcn-style · 3 states) want real brand logo + proper 3-state Shadcn sidebar (expanded / collapsed-to-icon / mobile sheet) so owner can shrink nav and keep more room for wishlist detail content.

## What Changes

- Swap `Sparkles` placeholder in `AppSidebar` header for real brand logo (`public/assets/logo.svg`), via Next `Image` / inline SVG. Logo render correct in expanded vs collapsed-icon state (full wordmark expanded, compact mark when icon-collapsed).
- Enable icon-collapse: set `Sidebar` `collapsible="icon"` so 3 states exist — **expanded** (full width, labels), **collapsed** (icon rail, tooltips), **mobile** (offcanvas sheet, already provided by component).
- Add tooltips to nav menu buttons (Inicio, Mis listas items) so collapsed-icon state stay usable.
- Keep existing tRPC `wishlist.list` data wiring, route-active highlighting, and Clerk `UserButton` footer; footer adapt to collapsed state.
- Sidebar state persist across reload (cookie already handled by `SidebarProvider`); confirm default open + keyboard shortcut (Cmd/Ctrl+B) work.

Non-goals: redesign wishlist-detail tab nav (`WishlistDetailNav`), mobile bottom-nav, theme/colors of sidebar tokens, or any tRPC/data changes.

## Capabilities

### New Capabilities
- `dashboard-sidebar`: desktop/mobile owner-dashboard navigation sidebar — brand logo header, wishlist nav list, account footer, and the 3 Shadcn collapse states (expanded / icon / mobile).

### Modified Capabilities
<!-- none — no existing spec governs the sidebar -->

## Impact

- Code: `src/components/features/dashboard/app-sidebar.tsx` (rewrite header + collapse mode + tooltips), `src/app/(protected)/layout.tsx` (provider/inset wiring stays, verify `collapsible` pass-through).
- Assets: consume `public/assets/logo.svg`.
- Components: reuse `src/components/ui/sidebar.tsx` (Shadcn) — no edits expected.
- No DB, env, tRPC, or API changes.
