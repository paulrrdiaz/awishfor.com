## ADDED Requirements

### Requirement: Final publish step matches Claude Design step 5
The `/create?step=publish` final wizard step SHALL match the imported Claude Design `A Wish For.dc.html` step 5 frames for layout, typography, spacing, surfaces, visual hierarchy, and interaction states while preserving the existing publish behavior.

#### Scenario: Desktop final publish layout matches design
- **WHEN** the wizard is viewed at a desktop viewport width (`lg` and up) on `/create?step=publish`
- **THEN** the final step renders in the Claude Design step 5 desktop composition, including the designed wizard card treatment, two-pane preview/action layout, canvas backdrop, spacing, border radius, typography scale, and primary/secondary action hierarchy
- **AND** the embedded preview remains labeled "Vista previa de tu wishlist"

#### Scenario: Mobile final publish layout matches design
- **WHEN** the wizard is viewed at a mobile viewport width on `/create?step=publish`
- **THEN** the final step renders in the Claude Design step 5 mobile composition, including the designed single-column order, compact preview/action sections, sticky wizard navigation behavior, spacing, and touch target sizing

#### Scenario: Draft readiness states match design without changing rules
- **WHEN** the local draft is missing one or more publish readiness requirements
- **THEN** the final step shows the Claude Design blocked-readiness visual state
- **AND** publishing remains disabled or blocked until title, event type, available slug, language, currency, and at least one visible gift are satisfied

#### Scenario: Signed-out publish gate matches design
- **WHEN** a signed-out user activates publish from the final step
- **THEN** the auth gate appears in the Claude Design signed-out step 5 treatment
- **AND** the gate preserves the copy "tu progreso ya está guardado"
- **AND** no publish mutation is sent

#### Scenario: Success share state matches design
- **WHEN** publishing succeeds from the wizard
- **THEN** the final step stays on `/create?step=publish` and renders the Claude Design success/share treatment
- **AND** it includes the public URL and the exact actions "Copiar enlace", "Compartir por WhatsApp", "Descargar QR", "Ver lista pública", and "Gestionar en dashboard"

#### Scenario: Preview remains non-mutating
- **WHEN** the embedded final preview renders gifts on the final step
- **THEN** guest purchase actions remain disabled and no purchase mutation can be triggered from the preview
