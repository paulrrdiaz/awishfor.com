## ADDED Requirements

### Requirement: Purchase modal six-state machine

The system SHALL implement the `PurchaseGiftModal` as a six-state machine matching the canvas: `form`, `loading`, `success`, `undo-available`, `undo-expired`, and `purchase-error`. The `loading` and `purchase-error` states SHALL derive from the existing `markGiftPurchased` mutation lifecycle, and the `undo-available`/`undo-expired` states SHALL derive from the existing undo countdown, with no new server mutations introduced.

#### Scenario: Submitting shows the loading state

- **WHEN** the guest confirms a purchase and the mutation is pending
- **THEN** the modal renders the `loading` state ("Confirmando tu regalo…") with actions disabled

#### Scenario: Success then undo-available

- **WHEN** the mutation succeeds
- **THEN** the modal renders the `success` state with a thank-you message and an `undo-available` affordance counting down the undo window

#### Scenario: Undo window expires

- **WHEN** the undo countdown reaches zero without an undo
- **THEN** the modal renders the `undo-expired` state ("El tiempo para deshacer expiró")

#### Scenario: Purchase fails

- **WHEN** the mutation errors
- **THEN** the modal renders the `purchase-error` state with a retry affordance and no purchase recorded

### Requirement: GiftCard variant coverage including dashboard actions

The system SHALL render gift cards across the canvas variants `available`, `partial`, `purchased`, and `hidden`, where `purchased` is de-emphasized (reduced opacity + line-through name) and `hidden` shows the `Oculto` badge with owner `Mostrar`/`Editar` actions on dashboard surfaces.

#### Scenario: Hidden gift shows owner actions on dashboard

- **WHEN** a gift with `hidden` visibility renders on a dashboard surface
- **THEN** the card shows the `Oculto` badge and `Mostrar`/`Editar` actions

#### Scenario: Purchased gift is de-emphasized publicly

- **WHEN** a fully purchased gift renders on the public page
- **THEN** the card is de-emphasized (reduced opacity, line-through name) and exposes no purchase CTA

### Requirement: Dashboard component states

The system SHALL provide the canvas dashboard states as design-system-covered components: the wishlist-list empty state, the responsive `Tabs → Select` detail navigation (tabs on desktop/tablet, a `Select` below `md`), the settings slug-change warning callout for published wishlists, the share copy `success`/`error` states, and the archive/restore confirmation dialog.

#### Scenario: Detail nav collapses on mobile

- **WHEN** the wishlist detail navigation renders below the `md` breakpoint
- **THEN** the tabs collapse into a `Select` dropdown with the same destinations (Resumen · Regalos · Diseño · Configuración)

#### Scenario: Slug-change warning on published wishlist

- **WHEN** the owner edits the slug of a published wishlist in settings
- **THEN** the slug-change warning callout appears with the canvas copy about previous links/QR ceasing to work

#### Scenario: Share copy success and error

- **WHEN** copying the public link succeeds or fails
- **THEN** the share panel shows the `Enlace copiado` success state or the manual-copy error state respectively

#### Scenario: Archive/restore confirmation

- **WHEN** the owner restores an archived wishlist
- **THEN** a confirmation dialog offers `Restaurar publicada` and `Restaurar como borrador`

### Requirement: Creation-wizard step UI states

The system SHALL present the five creation-wizard steps (`event`, `details`, `design`, `gifts`, `publish`) and the pre-publish auth-gate state as design-system-covered UI, using the shared `StepProgress` for step indication.

#### Scenario: Auth gate before publish

- **WHEN** an unauthenticated user reaches the publish step
- **THEN** the auth-gate state renders with the "tu progreso ya está guardado" assurance and sign-in options
