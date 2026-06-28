## MODIFIED Requirements

### Requirement: Guest purchase success and undo state

After a guest's purchase is confirmed, the purchase modal SHALL replace its form with a success state that shows the personalized thank-you copy "¡Gracias, {nombre}! Tu regalo fue marcado como comprado. Gracias por tu cariño y por ser parte de este momento." (interpolating the guest's entered name, with a non-personalized fallback when the name is unavailable), a `Deshacer` action, and a `Cerrar` action. The `Deshacer` action SHALL display a live countdown over an 8-second undo window and SHALL undo the just-created purchase using the one-time undo token returned at purchase time. When the 8-second window elapses, the modal SHALL replace the `Deshacer` action with the message "el tiempo para deshacer expiró" while keeping `Cerrar`. The `Cerrar` action SHALL dismiss the modal and keep the purchase.

#### Scenario: Success state shown after purchase

- **WHEN** a guest's purchase request succeeds
- **THEN** the modal shows the personalized thank-you copy including the guest's name with a `Deshacer` action and a `Cerrar` action instead of the form

#### Scenario: Undo countdown ticks down

- **WHEN** the success state is shown
- **THEN** the `Deshacer` action displays a countdown that decrements from 8 seconds toward 0

#### Scenario: Guest undoes from the success state

- **WHEN** the guest activates `Deshacer` within the countdown window with a valid, unexpired undo token
- **THEN** the modal triggers the undo, the purchase is removed, and the modal reflects that the purchase was undone

#### Scenario: Undo window expires

- **WHEN** the 8-second undo window elapses without the guest activating `Deshacer`
- **THEN** the modal replaces the `Deshacer` action with the message "el tiempo para deshacer expiró"
- **AND** the `Cerrar` action remains available

#### Scenario: Guest closes the success state

- **WHEN** the guest activates `Cerrar` in the success state
- **THEN** the modal closes and the purchase is kept

#### Scenario: Undo failure is surfaced safely

- **WHEN** the undo request fails, for example because the window expired
- **THEN** the modal shows an error state and the purchase remains in place
