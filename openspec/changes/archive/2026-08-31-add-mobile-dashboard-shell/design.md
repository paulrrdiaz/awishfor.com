## Context

Today the phone gets the desktop shell with responsive utilities: `Sidebar` becomes an off-canvas `Sheet`, the 55px topbar keeps all three actions, and the section rail becomes a scrolling strip. Nothing is thumb-reachable and every destination hides behind a hamburger.

`redesign-dashboard-navigation-shell` lands the section model, the wishlist switcher, and the status strip first. This change reuses all three and replaces only the chrome around them below `md`.

This design was revised after reading `Dashboard.dc.html` §9 (artboards M1–M11) directly. The first draft assumed the phone shell was one shape applied uniformly and that the chip row mirrored the desktop tabs. Neither holds. The revisions below record what the design actually shows.

## Goals / Non-Goals

Goals:
- Top-level destinations always visible while browsing, never behind a hamburger.
- Section switching in one thumb tap.
- Each section's primary action reachable without scrolling.
- Row actions, RSVP, and reordering that work by touch.

Non-Goals:
- New routes (`/dashboard/account` per §8, the analytics destination per M7).
- Desktop changes at `md` and above.
- Section content redesign beyond shell, action bar, sheets, and guest cards.

## Decisions

### Three chrome modes, not two shells

The first draft framed this as "two shells, one breakpoint". §9 shows three, because M5 and M6 drop the chip row and the tab bar entirely.

```
ROOT (M1·M7·M8)      SECTION (M2·M4)       EDITOR (M5·M6·M9)
┌───────────────┐    ┌───────────────┐     ┌───────────────┐
│ ● Inicio  +Nva│    │ ‹ Babyshower▾⋯│     │ ‹  Ajustes  Gu│
├───────────────┤    ├───────────────┤     ├───────────────┤
│               │    │Regalos·4│Invit│     │               │
│   content     │    ├───────────────┤     │    content    │
│               │    │   content     │     │               │
│               │    ├───────────────┤     │               │
│               │    │+ Agregar regal│     ├───────────────┤
├───────────────┤    ├───────────────┤     │Descartar│Guard│
│Inic Wish Dat C│    │Inic Wish Dat C│     └───────────────┘
└───────────────┘    └───────────────┘      no chips, no tabs
```

Editor mode exists because Ajustes and Tema hold a pending draft. A bottom tab bar there is a one-tap route to losing unsaved edits, so §9 removes it and replaces it with an explicit `Descartar` / `Guardar cambios` pair. Reorder mode (M9) is the same shape for the same reason. M11 (`Compartir`) is a fourth arrangement — full screen, tab bar retained, no chips — and is specified on its own rather than forced into a mode.

The modes are separate component trees chosen by route, not one tree bent by utilities. Rejected: keeping one tree with responsive utilities. It cannot express a persistent bottom tab bar, a pinned action bar, or a mode that deliberately removes both.

### Breakpoint selection must not be JavaScript

`src/hooks/use-mobile.ts` is the shadcn default: it initialises to `undefined` and coerces with `!!isMobile`, so it returns `false` on the server and on the first client render, flipping only after `useEffect`. Selecting the mobile tree with it means every phone paints the desktop shell first and then swaps — exactly the "breakpoint-switched trees can flash on hydration" risk the first draft flagged and left unresolved.

Decision: **select chrome with CSS, not with `useIsMobile`.** Both trees render and are gated by `md:hidden` / `hidden md:flex`, so the server-rendered markup is already correct for both breakpoints. The cost is dead markup on desktop, which the first draft rejected; the flash is the worse trade on the device this change exists to serve.

Note that `components/ui/sidebar.tsx` already uses the hook this way, so the same flash likely exists today for the off-canvas sidebar. Fixing it at the hook is out of scope here but worth recording.

### Chips project the section model, they do not mirror it

The first draft required the chip row to show "exactly the sections the desktop tabs would show, in the same order". §9 shows otherwise:

```
desktop tabs   Resumen · Regalos · Invitados · Tema · Colaboradores · Ajustes
M2 / M4 chips  Regalos·4 · Invitados·3 pend. · Resumen · Tema
```

Four chips, work-first ordering, Resumen demoted to third, Colaboradores and Ajustes absent. On a 390px viewport the chip row is a shortcut bar for the two sections an owner actually works in; completeness lives in the sections sheet (M3), which lists all six plus `Ver pública` and `Compartir`.

Decision: derive both the chip row and the sheet from `navItemsFor(isOwner)`, with the chip subset and its ordering expressed as data beside the model rather than hardcoded in the component. Membership and owner-only filtering then stay single-sourced; only the presentation order differs.

### The context line is section-scoped

The first draft specified the context bar's second line as "the wishlist's current status". §9 uses it differently per section — M2 reads `Publicada`, M4 reads `4 personas · 4 invitaciones`. The line answers "what am I looking at", and status is simply Regalos' answer. Sections declare their own line; the wishlist status is the default when they declare none.

### The action bar carries one or two buttons

The first draft said at most one primary action and recorded "the action bar is one row" as the bound on its cost. M4 stacks `Recordar a los 3 pendientes` (dark, secondary) above `+ Agregar invitado` (primary). Editor mode stacks a `Descartar` / `Guardar cambios` pair side by side, and M9 a `Cancelar` / `Guardar orden` pair.

So the bar is at most one primary plus one optional secondary, and in editor mode a commit pair. The vertical-space risk is larger than first recorded: on Invitados the tab bar plus a two-row action bar can consume roughly 170px of a 390×844 viewport.

### Row actions: sheet and swipe, not sheet alone

M10 is the gift action sheet — it identifies the gift, lists `Editar regalo`, `Marcar como infaltable`, `Ocultar de la lista pública`, `Copiar enlace de la tienda`, and `Eliminar` last in red. That maps closely onto the existing `GiftRowMenu` items, so the sheet is a presentation change over actions that already exist.

M2 additionally shows a swipe-revealed `Editar` panel and the hint `Desliza para acciones`. Swipe is an accelerator layered over the sheet, never the only route to an action — a gesture with no affordance cannot be the sole path. `sonner` is already a dependency, so the five-second undo needs no new library.

### One-tap RSVP conflicts with the existing reopen flow

§9 M4 is A6: guest cards carry the RSVP decision inline — `✓ Asistirá` / `✕ No podrá` on an unopened invitation, `Confirmar` / `No asistirá` on a pending one, and on an answered card the provenance line `Registrado por ti hace 2 h · Deshacer`.

The backend exists. `add-owner-managed-rsvp` shipped `recordOwnerRsvpAction` and `reopenOwnerRsvpAction`. But `owner-rsvp-controls.tsx` implements a different interaction: recording is an `editing`-state form with a save step, and reversing opens an `AlertDialog` titled `¿Reabrir respuesta?` because recording sets `responseLockedAt`, which locks the guest's personal invitation link.

§10's blanket rule — every action leaves a five-second `Deshacer`, only deletion confirms — cannot absorb this. Reopening is not destructive in the delete sense, but it unlocks a public link, and a mis-tapped toast dismissal would leave the link open silently.

Decision: **recording is one tap; reversing keeps its confirmation.** M4's inline `Deshacer` is specified as the entry point to that confirmed reversal, not as a bare five-second undo. This is the one place the spec deliberately departs from §10's generic rule, and the reason is recorded here so it is not "corrected" later.

### The status strip keeps its compact variant

§9's section artboards (M2, M4) show no status strip at all, which reads at first as evidence it is desktop-only below `md`. It is not: both artboards show a published wishlist, and the strip's mobile value was always the *draft* variant — the progress count and the publish action, without the full readiness list, which stays reachable on Resumen. The original decision stands.

### The per-guest share message does not exist yet

M11's message is addressed to a named guest over their personal invitation link, with the purpose variants `Invitación`, `Recordatorio`, and `Gracias`. What exists is `src/lib/wishlist/share.ts`: `whatsAppMessageForEvent` selects a Spanish template by `eventType` and builds it over the whole-list canonical URL, consumed by `share-panel.tsx`, `overview-share.tsx`, and the wizard publish step.

So M11 needs a second axis — purpose variant crossed with event type — and guest-level personalisation over the invite token that `personalized-invite-page` already produces. That is real work, not a presentation change, and section 8 of the tasks reflects it. If it outgrows this change it splits into one extending `whatsapp-share-templates`.

### Badge treatment differs between shells

Desktop marks pending invitations with `variant: "warning"` (amber). The M3 sheet renders Invitados' `3 pendientes` in the neutral `b-pend` grey and Regalos' `4` in green. Treated as a design-side inconsistency rather than an intentional divergence: the chips and sheet reuse the desktop badge variants, so a pending count reads the same in both shells.

## Risks / Trade-offs

- **Three modes to maintain.** Bounded by sharing the section model, switcher, and status strip; only chrome is duplicated.
- **CSS-gated shells ship dead markup on desktop.** Accepted to remove the hydration flash. Keep the mobile tree cheap — no data fetching that the desktop tree does not already do.
- **Fixed bars stack.** Tab bar plus a two-row action bar approaches 170px on Invitados. Watch the empty state, where the bars can dominate the screen.
- **Swipe competes with browser back-gesture.** iOS Safari uses an edge swipe for back; the reveal gesture must not start at the screen edge.
- **Undo needs per-action reversal.** Each undoable action needs an inverse; actions without one keep confirmation instead. RSVP reversal is the documented exception.
- **Editor mode hides navigation.** An owner deep in Tema has no tab bar; the back affordance is the only way out and must always land somewhere sensible.

## Migration Plan

No data migration, no route changes. The mobile chrome renders below `md` only; desktop is untouched. Ships after `redesign-dashboard-navigation-shell`, whose work should be committed first — it currently sits uncommitted in the working tree, which makes stacking a second change on top hard to unwind.

## Open Questions

- **Blocking (task 0.3).** Does `Cuenta` point at Clerk's `openUserProfile()` modal as a stopgap, or stay omitted until `/dashboard/account` exists? §8 and M8 both design a real settings list — Perfil, Idioma y moneda, Notificaciones, Sesión y seguridad, Ayuda y soporte, Cerrar sesión, Eliminar cuenta — which the modal does not match. This is the user's call; it changes what the tab bar renders.
- Does the compact status strip stay pinned below the context bar, or scroll away with the content? That it renders at all is settled above; only its scroll behaviour is open.
- M3 labels the settings entry `Ajustes de la lista` while the desktop tab reads `Ajustes`. Keep the longer label in the sheet, where there is room and no wishlist context in view?

Settled since the first draft: `Datos` stays omitted and becomes its own change — no analytics route exists, and M7's `De dónde llegan` needs referrer data captured nowhere, which `redesign-wishlist-overview` already deferred for the same reason.
