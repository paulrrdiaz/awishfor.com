## 1. Brand logo

- [x] 1.1 Add a `BrandLogo` inline-SVG React component (full "A Wish For" wordmark from `public/assets/logo.svg`, sized `h-7 w-auto`) under `src/components/features/dashboard/` (or `src/components/ui/`)
- [x] 1.2 Add a `BrandMark` compact variant (lime "wish" accent, `size-8`) for the collapsed icon rail

## 2. Sidebar header + collapse mode

- [x] 2.1 In `app-sidebar.tsx`, set `<Sidebar collapsible="icon">`
- [x] 2.2 Replace the `Sparkles` placeholder header block with `BrandLogo` (full) + `BrandMark` (compact), swapping via `group-data-[collapsible=icon]:hidden` / `hidden group-data-[collapsible=icon]:block`, keeping the `/dashboard` link and `size="lg"`

## 3. Collapsed usability

- [x] 3.1 Add `tooltip` prop to the Inicio `SidebarMenuButton` and each wishlist `SidebarMenuButton` (tooltip = item label / wishlist title)
- [x] 3.2 Rework the footer into `SidebarMenu`/`SidebarMenuItem` so Clerk `UserButton` stays on the rail and the "Mi cuenta" label hides with `group-data-[collapsible=icon]:hidden`

## 4. Verify

- [x] 4.1 Confirm `(protected)/layout.tsx` provider/trigger wiring still toggles; verify expanded↔collapsed, Cmd/Ctrl+B, cookie persistence, and mobile sheet
- [x] 4.2 Run `pnpm check`, `pnpm typecheck`, `pnpm test`

## 5. Claude Design fidelity corrections

- [x] 5.1 Align the protected dashboard shell to the Claude Design app frame: off-white canvas, bordered rounded app surface, sidebar-owned trigger, and no floating top trigger bar
- [x] 5.2 Align expanded sidebar navigation to the design: text wordmark, nested "Mis wishlists" section, wishlist status chips, "Nueva wishlist" action, utility links, and Clerk account footer details
- [x] 5.3 Preserve icon-collapse usability for the redesigned sidebar: compact brand mark, icon rail menu items, and tooltips for collapsed destinations
- [x] 5.4 Run `pnpm check`, `pnpm typecheck`, `pnpm test`
