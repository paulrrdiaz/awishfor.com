## Context

`purchase-gift-modal.tsx` already has a two-phase (`form` → `success`) flow. On success it stores `purchaseId` + `undoTokenStored`, shows generic copy, and renders `Deshacer` / `Cerrar`. The guest's entered `guestName` is still in component state during the success phase (only cleared on `resetAll` at close), so it is available for interpolation. The server undo token expires at 60s (`purchase-management`, unchanged).

Gaps vs brief 6.3: personalized copy, a live 8s countdown on `Deshacer`, and an expiry message.

## Goals / Non-Goals

**Goals:**
- Exact personalized thank-you copy.
- Live 8s countdown that visibly decrements on `Deshacer`.
- Replace `Deshacer` with "el tiempo para deshacer expiró" when the window closes.

**Non-Goals:**
- Server token / 60s expiry changes; form/validation changes.

## Decisions

### 8-second UI window, independent of the 60s server token
The UI enforces an 8s undo affordance (per brief), while the server token remains valid for 60s. The UI window being stricter than the server window is safe: an undo attempted within 8s always succeeds server-side. After 8s the UI hides `Deshacer` and shows the expiry message; the still-valid server token is simply no longer offered.

- **Why not 60s in the UI**: the brief specifies an 8s live countdown for a snappy, low-friction moment.
- **Why not shrink the server token to 8s**: out of scope and would weaken the server contract other flows rely on; UI-only is the minimal change.

### Countdown via a single interval started on entering success
Start an 8→0 countdown when `phase` becomes `success` (e.g. `useEffect` keyed on phase, `setInterval` 1s, cleared on unmount/close/undo). Label reflects remaining seconds (e.g. `Deshacer (8 s)`). At 0, set an `expired` flag that swaps the button for the expiry text. Reset the timer state in `resetAll`.

- **Alternative**: drive countdown off the token's `undoExpiresAt`. Rejected — that's the 60s server value; the UI window is a deliberate 8s product choice.

### Personalized copy with a graceful fallback
Use the trimmed `guestName`; if somehow empty, fall back to a non-personalized variant ("¡Gracias! Tu regalo fue marcado como comprado…") so the copy never renders "¡Gracias, !".

## Risks / Trade-offs

- [Timer keeps running after close/undo] → Clear the interval on unmount, on `Cerrar`, and on successful undo; reset timer fields in `resetAll`.
- [Guest expects undo after the 8s UI window] → The expiry message clearly states the window closed; this matches the brief and is the intended behavior even though the server token lingers.
- [Reduced-motion / no animation concerns] → Countdown is a text decrement, not motion; no `prefers-reduced-motion` handling needed.

## Migration Plan

UI-only, additive within one component plus tests. No schema/env/API changes. Rollback = revert the component change.

## Open Questions

- None blocking. (If product later wants the UI window to match the server token, change the single countdown constant.)
