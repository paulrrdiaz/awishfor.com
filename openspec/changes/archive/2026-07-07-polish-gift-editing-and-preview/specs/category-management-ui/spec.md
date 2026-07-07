## ADDED Requirements

### Requirement: Wizard category chip actions use icon buttons with tooltips

The wishlist wizard lightweight category editing UI SHALL present category chip actions as compact icon buttons instead of visible text labels for rename and remove. Each icon button SHALL remain accessible through an action-specific accessible name and a Spanish tooltip.

#### Scenario: Category chip shows icon actions

- **WHEN** the Gifts step displays a draft category chip in its non-editing state
- **THEN** the rename and remove actions are shown as icon buttons
- **AND** the chip does not show the visible text labels `Renombrar` or `Quitar`

#### Scenario: Rename icon is accessible

- **WHEN** the user focuses or hovers the rename icon button for a category
- **THEN** the system exposes a tooltip with the Spanish rename action
- **AND** the button has an accessible label that includes the category name

#### Scenario: Remove icon is accessible

- **WHEN** the user focuses or hovers the remove icon button for a category
- **THEN** the system exposes a tooltip with the Spanish remove action
- **AND** the button has an accessible label that includes the category name

#### Scenario: Icon actions preserve existing category behavior

- **WHEN** the user activates the rename or remove icon for a draft category
- **THEN** the system performs the same draft category rename or remove behavior as before
