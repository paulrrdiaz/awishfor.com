## Why

The panel is a desktop layout squeezed into a phone. The sidebar collapses into an off-canvas sheet that hides every destination behind a hamburger, the topbar packs a breadcrumb and three actions into 390px, and primary actions like `Agregar regalo` sit at the top of a long scroll where a thumb cannot reach them. Owners manage these lists from their phones, mostly while messaging guests on WhatsApp.

`Dashboard.dc.html` §9 (proposals A4 · A5 · A6, artboards M1–M11) defines a phone experience that stands on its own: a persistent bottom tab bar, a compact context bar, section chips with a full-section sheet, thumb-reachable primary actions, action sheets in place of hover menus, one-tap RSVP on guest cards, and an explicit reorder mode.

## What Changes

- Present the protected dashboard below the `md` breakpoint in one of three chrome modes chosen by route — root, section, and editor — rather than one desktop tree bent by responsive utilities.
- Add a bottom tab bar in root and section chrome. §9 designs four destinations — Inicio, Wishlists, Datos, Cuenta — but only those whose routes resolve are rendered: Inicio and Wishlists ship, `Datos` is omitted, and `Cuenta` depends on a decision still open. Editor chrome suppresses the bar so a pending edit is not lost to a stray tap.
- Replace the desktop topbar below `md` with a context bar carrying a back affordance, the wishlist name with its switcher, a section-scoped context line, and an overflow control.
- Present wishlist sections below `md` as a horizontally scrollable chip row that projects the shared section model in a mobile-specific order — Regalos, Invitados, Resumen, Tema — with the complete list, `Ver pública`, and `Compartir` in an overflow sheet.
- Pin each section's action bar above the tab bar, carrying one primary action and an optional secondary; editor chrome pins a discard/save commit bar instead.
- Replace hover-dependent row menus with action sheets, add swipe-to-reveal on gift rows as an accelerator, confirm destructive actions, and give non-destructive ones a five-second undo.
- Put the RSVP decision directly on guest cards as a one-tap choice, keeping reversal explicitly confirmed because it unlocks the guest's personal invitation link.
- Give drag-to-reorder an explicit mode with a 44px handle that takes over the screen, so dragging never competes with page scroll.
- Give `Compartir` a full-screen view with the per-guest message, template variants, and send targets.

Non-goals:

- Building `/dashboard/account` (§8, M8) and the analytics destination (M7). Where a destination does not yet exist, its tab is omitted rather than linking nowhere. M7's `De dónde llegan` needs referrer data that is captured nowhere.
- Any change to desktop layout at `md` and above.
- Redesigning section content beyond the chrome, the action bar, the action sheets, and the guest cards.
- QR generation, which has no implementation in the codebase.
- Offline support or install prompts.

## Capabilities

### New Capabilities

- `dashboard-mobile-shell`: how the protected dashboard presents itself below the `md` breakpoint.

## Impact

- New mobile chrome components under `src/components/layouts/dashboard/`, rendered below `md` and hidden at `md` and above via CSS gating rather than `useIsMobile`, which returns `false` on the server and first client render and would flash the desktop shell on every phone.
- `(protected)/layout.tsx` renders the tab bar and suppresses the desktop sidebar below `md`.
- `[id]/layout.tsx` swaps topbar and tabs for the context bar and chip row below `md`.
- The chip subset and ordering are added as data beside `wishlist-sections.ts`, so both shells stay derived from one model.
- Gift rows gain action sheets and swipe; the gift list gains a reorder mode; guest cards gain one-tap RSVP over the existing `recordOwnerRsvpAction` / `reopenOwnerRsvpAction`.
- Depends on `redesign-dashboard-navigation-shell` for the section model, switcher, and status strip this chrome reuses. That work is currently uncommitted and should be committed before this change is applied.
- No schema change, no new environment variables, no new dependencies — `sonner` already provides the undo affordance.
