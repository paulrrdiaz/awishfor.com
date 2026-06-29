## Context

Owner dashboard wrap content in Shadcn `Sidebar` (`src/components/ui/sidebar.tsx`) via `(protected)/layout.tsx` → `SidebarProvider` + `AppSidebar` + `SidebarInset`. Current `AppSidebar` (`src/components/features/dashboard/app-sidebar.tsx`) ship placeholder `Sparkles` icon header, default `collapsible="offcanvas"`, no tooltips. Design §6b ("Sidebar component — Shadcn-style · 3 states") want real brand logo + 3-state collapse. Brand logo at `public/assets/logo.svg` (wordmark "A Wish For", viewBox 916×204, dark-green stroke + lime accents).

DesignSync MCP returned no projects for this login, so §6b cannot be read verbatim; spec derived from the §6b title + Shadcn sidebar canonical states + docs/CLAUDE_DESIGN_PROMPT.md §4.

## Goals / Non-Goals

**Goals:**
- 3 working states: expanded (labels), collapsed icon-rail (tooltips), mobile sheet.
- Brand logo in header, legible in both expanded and collapsed-icon widths.
- Collapsed state stay usable: tooltips on nav buttons, footer adapts.
- Preserve current data wiring (`wishlist.list`), active-route highlight, Clerk footer, cookie persistence, Cmd/Ctrl+B shortcut.

**Non-Goals:**
- No edits to `src/components/ui/sidebar.tsx` (Shadcn primitive).
- No change to `WishlistDetailNav` tab bar, sidebar color tokens, tRPC, DB, or env.

## Decisions

**1. Collapse mode = `collapsible="icon"`.**
Set on `<Sidebar>` inside `AppSidebar`. Gives 3 states out-of-box: expanded ↔ icon-rail (desktop) + mobile sheet (auto via `useIsMobile`). Rejected: keep `offcanvas` (only 2 states, no icon rail — fails §6b "3 states"); `collapsible="none"` (no collapse at all).

**2. Logo render — inline SVG component, two variants keyed off sidebar state.**
Add a `BrandLogo` (full wordmark) and a compact mark for collapsed. Use `useSidebar()` `state` OR pure CSS via `group-data-[collapsible=icon]` utility classes on the header to swap: full logo `group-data-[collapsible=icon]:hidden`, compact mark `hidden group-data-[collapsible=icon]:block`. CSS-only swap preferred (no JS re-render, matches Shadcn pattern). Full logo = `next/image` of `/assets/logo.svg` sized to fit `--sidebar-width` header (h-8, w-auto). Compact mark = small square reusing the lime "wish" droplet/circle motif (render a trimmed inline SVG or the heart/circle node) sized `size-8` to fit `--sidebar-width-icon` (3rem). Rejected: single logo scaled — wordmark unreadable at 3rem rail.

**3. Header uses `SidebarMenuButton size="lg"` linking `/dashboard`**, keep current structure but replace icon+text block with logo variants. `[&>span:last-child]:truncate` already handles overflow.

**4. Tooltips for collapsed usability.**
Pass `tooltip="Inicio"` / `tooltip={wishlist.title}` to each `SidebarMenuButton`. Component already hides tooltip unless `state==="collapsed"` and not mobile (see `sidebar.tsx:543-548`). Group label "Mis listas" auto-hides in icon mode (`group-data-[collapsible=icon]:opacity-0`).

**5. Footer adapts to collapsed.**
Replace raw `<div>` footer with `SidebarMenu`/`SidebarMenuItem` wrapping Clerk `UserButton` + "Mi cuenta" label; label truncates/hides in icon mode using `group-data-[collapsible=icon]:hidden`. Keeps `UserButton` clickable as the rail item.

**6. Provider config unchanged.**
`SidebarProvider` already `defaultOpen` + cookie persistence + Cmd/Ctrl+B. `(protected)/layout.tsx` keeps `SidebarTrigger` in header to toggle. No layout edits needed beyond verification.

## Risks / Trade-offs

- [Logo SVG sizing in `next/image` needs explicit width/height] → import as static or set `width`/`height` props from viewBox ratio (916×204 ≈ 4.49:1); constrain with `className="h-7 w-auto"`.
- [Compact mark fidelity — trimming the full SVG may look off] → use a simple recognizable element (lime circle "wish" droplet) at size-8; acceptable as collapsed affordance, full brand shows on expand.
- [`next/image` with SVG may need `dangerouslyAllowSVG` or use plain `<img>`/inline] → prefer inline SVG React component to avoid config + enable CSS state swapping; no next.config change.
- [Icon-collapse changes default UX] → default stays expanded (`defaultOpen=true`); users opt-in via trigger, state persisted by cookie. Low risk, reversible by reverting `collapsible` prop.
