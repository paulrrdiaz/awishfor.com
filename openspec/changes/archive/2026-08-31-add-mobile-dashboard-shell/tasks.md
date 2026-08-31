## 0. Preconditions

- [x] 0.1 Confirm `redesign-dashboard-navigation-shell` has been applied, so the section model with badges, the wishlist switcher, and the status strip all exist. Verified present: `wishlist-sections.ts` (`navItemsFor`, `SectionBadges`, `hrefFor`, `activeSegmentFromPathname`), `wishlist-switcher.tsx`, `wishlist-status-strip.tsx`.
- [x] 0.2 Commit the `redesign-dashboard-navigation-shell` work before starting. Already committed as `9df00ce` (`feat: redesign dashboard navigation shell`).
- [x] 0.3 Settle the `Cuenta` destination with the user. Decided: point the tab at Clerk's `openUserProfile()` modal, matching the existing desktop sidebar's "Mi cuenta" item (`app-sidebar.tsx:104-115`), which already uses the same stopgap.

## 1. Chrome scaffolding

- [x] 1.1 Establish root, section, and editor chrome as three component trees selected by route.
- [x] 1.2 Gate the mobile and desktop trees with CSS (`md:hidden` / `hidden md:flex`), not with `useIsMobile`, so the server-rendered markup is correct at both breakpoints and no shell flashes on hydration.
- [x] 1.3 Suppress the desktop sidebar and its off-canvas sheet below `md`.
- [x] 1.4 Reserve bottom padding for the fixed bars so no list's last row is trapped underneath them. Implemented as flex-column siblings (not `fixed`), so each bar occupies its own space rather than overlapping content — no padding hack needed.

## 2. Bottom tab bar

- [x] 2.1 Build the fixed bottom tab bar, positioned above the safe-area inset, rendered in root and section chrome only.
- [x] 2.2 Render Inicio and Wishlists. Omit `Datos` — no analytics route exists and M7's `De dónde llegan` needs referrer data captured nowhere, so it becomes its own change. Render `Cuenta` per the decision taken in 0.3.
- [x] 2.3 Mark the tab matching the current route as active without relying on hover.
- [x] 2.4 Suppress the tab bar in editor chrome, so a pending edit cannot be abandoned by a stray tap.

## 3. Context bar, chips, and sections sheet

- [x] 3.1 Build the mobile context bar with a back affordance, the wishlist name with the switcher, a section-scoped context line, and an overflow control.
- [x] 3.2 Let a section declare its context line — publication status on Regalos, guest and invitation counts on Invitados — defaulting to the wishlist status when none is declared. Required adding `totalInvitations`/`totalGuests` to `wishlist.overview`'s metrics (not previously exposed).
- [x] 3.3 Render the chip row as a projection of `navItemsFor(isOwner)`: Regalos, Invitados, Resumen, Tema, with the subset and ordering expressed as data beside the section model rather than hardcoded in the component.
- [x] 3.4 Carry the desktop badge variants onto the chips, so a pending invitation count reads the same in both shells.
- [x] 3.5 Build the sections sheet listing every section available to the viewer with icon, label, and count, marking the current one, plus `Ver pública` and `Compartir` separated from the list. `Compartir` links to the full-screen share view built at 8.1 (whole-list mode, no `?guest=`).
- [x] 3.6 Compact the status strip below `md`: the draft variant shows the progress count and the publish action without the full readiness list, which stays reachable on Resumen. §9's section artboards omit the strip, but both show published wishlists, so they are not evidence against the draft variant.

## 4. Action bar

- [x] 4.1 Let a section declare an action bar of at most one primary action plus one optional secondary, pinned above the tab bar, with no bar rendered when a section declares none.
- [x] 4.2 Wire the primary actions for Regalos (`Agregar regalo`) and Invitados (`Agregar invitado`).
- [x] 4.3 Add the secondary reminder on Invitados above the primary action, naming the pending count and shown only when at least one invitation is pending. Navigates to the guest list filtered to pending invitations, since a bulk reminder has no single message to send — each guest needs their own personal link, reachable from there via that guest's own `Recordar` action (6.5).
- [x] 4.4 Build the editor-mode commit bar with a discard action and a save action, and wire it for Ajustes and Tema. Rendered from within `WishlistSettingsForm`/`WishlistDesignEditor` themselves (not the layout), since save/discard state is owned there — the layout only renders the back+title bar and suppresses chips/tab bar.

## 5. Row actions, swipe, and undo

- [x] 5.1 Replace hover-dependent row overflow menus below `md` with bottom action sheets that identify the row and place the destructive action last and visually apart, reusing the existing `GiftRowMenu` action set.
- [x] 5.2 Give non-destructive row actions immediate application with a five-second `sonner` undo, and keep the confirmation dialog for deletion. `duplicateGiftAction` now returns the new gift's id so duplication can be undone too.
- [x] 5.3 Add swipe-to-reveal on gift rows as an accelerator over the sheet, with a visible hint that the gesture exists and every swipe action also present in the sheet. Hand-rolled with pointer events (`pointerType === "touch"` only, so desktop mouse interaction is unaffected); reveals the same Editar action already in the sheet.
- [x] 5.4 Keep the swipe gesture clear of the screen edge so it does not fight the browser back-gesture. Guarded via an edge-zone check on drag start when the row is closed.

## 6. One-tap RSVP on guest cards

- [x] 6.1 Present the RSVP decision directly on the guest card below `md`, with the choices offered depending on the invitation's state and absent once a response is recorded.
- [x] 6.2 Make recording a response a single tap on `recordOwnerRsvpAction`, without the intermediate editing-and-save step the desktop control uses. All extra guests are recorded with the same status as the primary tap (no per-companion step, matching "single tap").
- [x] 6.3 Show the provenance line naming who recorded the response and how long ago, via `date-fns`'s `formatDistanceToNowStrict` with the `es` locale.
- [x] 6.4 Keep reversal explicitly confirmed via `reopenOwnerRsvpAction`, since it clears `responseLockedAt` and unlocks the guest's personal link. The card's inline affordance opens that confirmation; it is not a bare five-second undo.
- [x] 6.5 Offer the per-guest reminder action on unopened and unanswered cards. Now links into the share view (`?guest=<id>&purpose=reminder`) with the personalized, purpose-variant message from 8.2/8.3, superseding the earlier interim `toWhatsAppShareUrl` wiring.

## 7. Reorder mode

- [x] 7.1 Enter reorder mode from a control in the gift list toolbar. `@dnd-kit` was already a dependency (used by the existing always-on desktop manual-sort drag) — no new dependency needed, contrary to the design doc's stated risk.
- [x] 7.2 Have reorder mode take over the screen — suppress the chip row, the tab bar, and other row actions, and report in the bar that reordering is in progress. Implemented as a `fixed inset-0 z-50` full-screen overlay with its own `DndContext`, independent of the always-on desktop drag, rather than threading mode state up through the layout tree.
- [x] 7.3 Give each row a drag handle with a touch target of at least 44px, and state that the order is saved on confirmation.
- [x] 7.4 End the mode with save or cancel, restoring the previous order on cancel. The overlay holds its own local copy of the order and only calls `reorderGiftsAction` on save, so cancel simply discards local state without ever touching the persisted order.
- [x] 7.5 Ensure vertical dragging scrolls the page whenever reorder mode is not active. Already true today — `useSortable`'s drag listeners are only attached to the grip-handle button, not the row, both on desktop and in the new mobile overlay.

## 8. Share view

- [x] 8.1 Build the full-screen share view reached from the sections sheet, retaining the tab bar and rendering no chip row. Implemented as a real route (`[id]/share/page.tsx`) rather than a client-side overlay, so it participates in the existing layout tree and the tab bar (rendered by the outer protected layout) stays visible for free — no cross-tree state needed.
- [x] 8.2 Extend message building for the per-guest case. Added `guestWhatsAppMessage`/`toGuestWhatsAppShareUrl` to `share.ts`, addressed to the guest by name over their personal invite link (`toCanonicalWishlistUrl(/w/{slug}/{invite.slug})`), computed server-side in the share page from `?guest=<inviteId>`.
- [x] 8.3 Add the purpose variants `Invitación`, `Recordatorio`, and `Gracias` as a second axis over the existing event-type templates, and let the view switch between them. 15 templates (3 purposes × 5 event types) added to `share.ts`; `ShareGuestMessage` is a client component with a tab switcher and live-updating message/WhatsApp link.
- [x] 8.4 Offer the send targets, led by WhatsApp, reusing `toWhatsAppShareUrl`, plus the whole-list section with the public link. Also added Correo (`toEmailShareUrl`, already existed in `share.ts` but was unused) as a second send target for the whole-list case.
- [x] 8.5 Omit any send target or artifact with no implementation rather than rendering it inert — QR has no generator in the codebase.
- [x] 8.6 Reassessed and completed inline (per user direction) rather than split into a separate change: guest-name personalization and the 15-template purpose-variant matrix are now in `share.ts`, consumed by the share view and by the guest card's "Recordar" action (`?guest=<id>&purpose=reminder`).

## 9. Tests and verification

- [x] 9.1 Add tab bar tests for active-route marking, for omitting tabs whose destinations do not resolve, and for suppression in editor chrome.
- [x] 9.2 Add tests that the chip row and the desktop tabs derive from the same model — same membership after owner-only filtering, same badge variants, mobile-specific ordering.
- [x] 9.3 Add context bar tests covering the section-scoped context line and its wishlist-status default.
- [x] 9.4 Add sections sheet tests covering completeness, navigation, and the share and public-view actions.
- [x] 9.5 Add action sheet tests for destructive confirmation and for the undo window on non-destructive actions.
- [x] 9.6 Add guest card tests for one-tap recording, for state-dependent choices, and for reversal remaining confirmed.
- [x] 9.7 Add reorder mode tests for entering, saving, and cancelling. Scroll-not-captured-outside-the-mode is verified by inspection (drag listeners are scoped to the grip-handle button, not the row, in both the always-on desktop path and the new mobile overlay) rather than an automated test — this was pre-existing behavior, not something this change altered.
- [x] 9.8 Run `pnpm check` and resolve reported issues.
- [x] 9.9 Run `pnpm test` and resolve or report failures.
- [x] 9.10 Run `pnpm typecheck` and resolve or report failures.
