## 1. Success-state copy

- [x] 1.1 Replace the generic success `DialogDescription` in `purchase-gift-modal.tsx` with the personalized copy "¡Gracias, {nombre}! Tu regalo fue marcado como comprado. Gracias por tu cariño y por ser parte de este momento." using the trimmed `guestName`, with a non-personalized fallback when the name is empty.

## 2. Undo countdown + expiry

- [x] 2.1 Add an 8-second countdown started when `phase` becomes `success` (interval cleared on unmount, on `Cerrar`, and on successful undo; reset in `resetAll`).
- [x] 2.2 Show the remaining seconds on the `Deshacer` button label while the window is open.
- [x] 2.3 When the countdown reaches 0, replace `Deshacer` with the message "el tiempo para deshacer expiró", keeping `Cerrar` available.

## 3. Tests

- [x] 3.1 Update `purchase-gift-modal.test.tsx`: assert personalized copy renders with the guest name.
- [x] 3.2 Add tests for the countdown decrement and that the expiry message replaces `Deshacer` after the window (use fake timers).

## 4. Validation

- [x] 4.1 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`; fix any issues.
- [x] 4.2 Manually verify: success copy shows the entered name, the countdown ticks 8→0, `Deshacer` undoes within the window, and the expiry message appears after it.
