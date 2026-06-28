## Why

The guest purchase undo works functionally, but the success state does not match the brief (Milestone 6.3). It shows generic copy ("Gracias, tu regalo ha sido registrado. Tienes 60 segundos para deshacerlo…") instead of the personalized thank-you, the `Deshacer` button has no live countdown, and there is no expiry message when the undo window closes. This is the last P0 gap in the guest purchase flow and the moment that should feel warm and reassuring.

## What Changes

- Replace the success copy with the brief's exact, personalized text: "¡Gracias, {nombre}! Tu regalo fue marcado como comprado. Gracias por tu cariño y por ser parte de este momento." (interpolating the guest's entered name).
- Add a live countdown on the `Deshacer` action that ticks down an 8-second undo window in the UI.
- When the 8-second window elapses (or the undo otherwise expires), replace the `Deshacer` affordance with the message "el tiempo para deshacer expiró" while keeping `Cerrar`.
- Keep the existing undo mutation, token handling, and page refresh unchanged.

### Non-goals

- No change to the server-side undo token or its 60-second expiry (`purchase-management`); this is the guest-facing UI window only.
- No change to the purchase form, validation, consent copy, or quantity behavior.
- No cross-device/session undo.

## Capabilities

### New Capabilities
<!-- None. -->

### Modified Capabilities
- `public-wishlist-page`: Refine the "Guest purchase success and undo state" requirement to specify the personalized thank-you copy, the live 8-second undo countdown, and the post-expiry message.

## Impact

- **Components**: `src/components/features/wishlist/purchase-gift-modal.tsx` (success-state copy, countdown timer, expiry state).
- **Tests**: `src/components/features/wishlist/purchase-gift-modal.test.tsx` (countdown, expiry message, personalized copy).
- **Config/env/schema/API**: none (UI-only; server mutation and token unchanged).
