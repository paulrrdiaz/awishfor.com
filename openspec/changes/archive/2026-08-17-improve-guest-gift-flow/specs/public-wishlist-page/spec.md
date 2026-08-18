## ADDED Requirements

### Requirement: Product departure drawer

For an available or partially purchased gift with a product URL, the public wishlist page SHALL replace direct product navigation with a modal bottom drawer. The drawer SHALL warn that the guest is leaving A Wish For, identify the departure action, show delivery details and one copy action when the wishlist has a delivery address, remind the guest to return and mark the gift as purchased, and expose an `Ir a la tienda` action that opens the product URL in a new browser tab. Opening the drawer SHALL NOT itself navigate away from the wishlist.

The drawer SHALL use the same bottom-drawer presentation at every viewport width: full-width on narrow screens and centered with a constrained width on wider screens. It SHALL remain dismissible through an explicit close affordance, Escape, backdrop interaction, and downward swipe.

#### Scenario: Product action opens departure drawer

- **WHEN** a guest activates `Ver producto` for an available or partially purchased gift with a product URL
- **THEN** the product departure drawer opens over the current wishlist without navigating away
- **AND** the drawer shows `Vas a salir de A Wish For`, the return-and-mark reminder, and an `Ir a la tienda` action

#### Scenario: Store action opens a new tab

- **WHEN** the guest activates `Ir a la tienda` in the product departure drawer
- **THEN** the gift's product URL opens in a new browser tab with safe external-link behavior
- **AND** the A Wish For wishlist remains available in its original tab

#### Scenario: Store action returns a form-origin drawer to the purchase form

- **GIVEN** the guest entered purchase-form values and opened the product view through its `Ver producto` helper
- **WHEN** the guest activates `Ir a la tienda`
- **THEN** the gift's product URL opens in a new browser tab
- **AND** the original tab's same drawer returns to the purchase form with every entered value and selected quantity preserved

#### Scenario: Store action keeps a direct product drawer open

- **GIVEN** the guest opened the product view directly from a gift card's `Ver producto` action
- **WHEN** the guest activates `Ir a la tienda`
- **THEN** the product view remains open in the original tab until the guest explicitly closes it

#### Scenario: Product drawer shows delivery details

- **WHEN** the product departure drawer opens for a wishlist with a delivery address
- **THEN** it shows the composed delivery details in a contained block with one copy action

#### Scenario: Product drawer works without delivery details

- **WHEN** the product departure drawer opens for a wishlist without a delivery address
- **THEN** it omits the delivery introduction, delivery block, and copy action
- **AND** the departure warning, return-and-mark reminder, store action, and close affordance remain available

#### Scenario: Purchased gift has no departure action

- **WHEN** a gift is fully purchased
- **THEN** neither `Ver producto` nor the product departure drawer is available for that gift

#### Scenario: Purchase form helper switches drawer view

- **WHEN** a guest activates the small `Ver producto` helper from the purchase form
- **THEN** the same open drawer switches to the product departure view without nesting another drawer
- **AND** the guest can return to the purchase form with all entered values and selected quantity preserved

### Requirement: Guest purchase drawer

The public wishlist page SHALL allow a guest to open a modal purchase drawer from a non-purchased gift's primary action. The drawer SHALL require a guest name of 2 to 80 characters; accept an optional email validated when present and an optional message of at most 500 characters; omit phone collection; show a quantity selector only when the gift's remaining quantity is greater than one, constrained between one and the remaining quantity; display the exact guest consent copy "Al marcar este regalo como comprado, compartiremos tu nombre y los datos opcionales que ingreses con el creador de la lista."; and surface loading and error states while submitting.

The purchase view SHALL NOT show delivery details. When the gift has a product URL, it SHALL show a small `Ver producto` helper that switches the same drawer to the product departure view. The drawer SHALL use a bottom-drawer presentation at every viewport width, full-width on narrow screens and centered with a constrained width on wider screens, with a scrollable form body and a sticky primary action area.

#### Scenario: Guest opens the purchase drawer

- **WHEN** a guest activates the purchase action on a gift that is not fully purchased
- **THEN** the system opens the purchase drawer showing the required name field, optional email and message fields, consent copy, and a submit action
- **AND** no phone field or delivery block is shown

#### Scenario: Drawer presentation is consistent across viewports

- **WHEN** the purchase interaction opens at any supported viewport width
- **THEN** it renders as a bottom drawer rather than a centered dialog
- **AND** wider viewports constrain and center the drawer content while retaining its bottom edge

#### Scenario: Consent copy is exact

- **WHEN** the purchase drawer renders
- **THEN** it shows the consent copy "Al marcar este regalo como comprado, compartiremos tu nombre y los datos opcionales que ingreses con el creador de la lista."

#### Scenario: Guest name is required

- **WHEN** the guest submits the drawer with an empty name or a name outside 2 to 80 characters
- **THEN** the drawer shows a validation error and does not submit the purchase

#### Scenario: Optional fields are validated

- **WHEN** the guest provides an invalid email or a message longer than 500 characters
- **THEN** the drawer shows a validation error and does not submit the purchase

#### Scenario: Quantity selector visibility

- **WHEN** the gift's remaining quantity is greater than one
- **THEN** the drawer shows a quantity selector constrained between one and the remaining quantity

#### Scenario: Quantity selector hidden for single-unit gifts

- **WHEN** the gift's remaining quantity is one
- **THEN** the drawer does not show a quantity selector and submits a quantity of one

#### Scenario: Product helper is conditional

- **WHEN** the purchase drawer opens for a gift with a product URL
- **THEN** it shows a small `Ver producto` helper
- **AND WHEN** the gift has no product URL
- **THEN** the helper is absent and the rest of the form is unchanged

#### Scenario: Submission states

- **WHEN** the guest submits a valid purchase
- **THEN** the drawer shows a loading state while the request is in flight and an inline retryable error state if the request fails

#### Scenario: Drawer dismissal is accessible

- **WHEN** the guest dismisses the purchase drawer through its close control, Escape, backdrop interaction, or downward swipe
- **THEN** the drawer closes without submitting a purchase and focus returns to the action that opened it

### Requirement: Guest purchase success and undo drawer

After a guest's purchase is confirmed, the same drawer SHALL replace its form with a compact success state showing the eyebrow `ÉXITO`, the personalized headline `¡Gracias, {nombre}! Tu regalo quedó marcado.`, the supporting copy `Gracias por ser parte de este momento`, a plain `Deshacer` action, and an accessible drawer close affordance. This drawer success state SHALL be the only purchase-success feedback and SHALL NOT be duplicated by a separate success toast.

The `Deshacer` action SHALL remain available for the server-backed 60-second undo window without displaying a countdown. It SHALL undo the just-created purchase using the one-time undo token returned at purchase time. When the 60-second window elapses, the drawer SHALL remove the `Deshacer` action while keeping the success state dismissible.

#### Scenario: Success state replaces the form

- **WHEN** a guest's purchase request succeeds
- **THEN** the open drawer replaces the form with the compact personalized success treatment
- **AND** no separate purchase-success toast is shown

#### Scenario: Undo remains available without countdown

- **WHEN** the success state is shown during the first 60 seconds after purchase
- **THEN** it shows a plain `Deshacer` action without countdown text or a countdown ring

#### Scenario: Guest undoes from the success state

- **WHEN** the guest activates `Deshacer` within the 60-second window with a valid, unexpired undo token
- **THEN** the system removes the just-created purchase, refreshes the public gift state, and dismisses the drawer

#### Scenario: Undo window expires

- **WHEN** 60 seconds elapse without the guest activating `Deshacer`
- **THEN** the drawer removes the `Deshacer` action
- **AND** the personalized success state remains dismissible

#### Scenario: Guest closes the success state

- **WHEN** the guest dismisses the success drawer
- **THEN** the drawer closes and the purchase is kept

#### Scenario: Undo failure is surfaced safely

- **WHEN** the undo request fails, for example because the server window expired
- **THEN** the drawer shows an inline error and the purchase remains in place

## REMOVED Requirements

### Requirement: Guest purchase modal

**Reason**: Replaced by the all-viewport ShadCN/Vaul guest purchase drawer with a smaller public form, no delivery block, and an in-drawer product helper.

**Migration**: Existing purchase mutations and stored purchase data remain compatible. Public UI callers open the new drawer and stop collecting `guestPhone`; owner purchase surfaces and server-side optional phone support remain unchanged.

### Requirement: Guest purchase success and undo state

**Reason**: Replaced by the compact success drawer that uses the existing 60-second server window without an eight-second countdown or duplicate toast.

**Migration**: Existing purchase and undo mutations remain unchanged. Client success handling retains the purchase id and raw undo token, refreshes server-rendered gift state, and presents the replacement drawer state.
