## ADDED Requirements

### Requirement: Stateful feature-component state coverage in Storybook

The system SHALL colocate `*.stories.tsx` files with the canvas's stateful product components in `src/components/features/` and cover their full state matrices, previewable under the seven-theme toolbar. Coverage SHALL include at minimum: `PurchaseGiftModal` (`form · loading · success · undo-available · undo-expired · purchase-error`), the creation-wizard steps and auth gate, and the dashboard states (empty state, responsive `Tabs → Select` nav, slug-change warning, share copy success/error, archive/restore dialog). Stories SHALL render presentational states with stubbed handlers and SHALL NOT perform real network calls.

#### Scenario: Purchase modal story shows all six states

- **WHEN** the `PurchaseGiftModal` story is opened
- **THEN** it presents the `form`, `loading`, `success`, `undo-available`, `undo-expired`, and `purchase-error` states

#### Scenario: Dashboard state stories render under themes

- **WHEN** a dashboard-state story is viewed and a theme is selected in the toolbar
- **THEN** the state renders correctly under that theme's scoped variables

#### Scenario: Stories use stubbed handlers

- **WHEN** a stateful feature-component story renders
- **THEN** its actions are driven by stubbed handlers/args with no real tRPC network calls
