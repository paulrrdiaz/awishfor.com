## ADDED Requirements

### Requirement: Guest gift drawers preserve public theme scope

Every product, purchase, loading, error, success, and undo drawer view opened from a public gift SHALL mount within the `.public-theme` instance containing its trigger. Drawer surfaces, typography, semantic colors, borders, controls, focus treatments, and button styling SHALL resolve from that wishlist's scoped theme and SHALL NOT fall back to the dashboard/root palette or another public preview's theme.

#### Scenario: Gift drawer inherits triggering wishlist theme

- **WHEN** a guest opens a product or purchase drawer from a themed public wishlist
- **THEN** its portalled content is contained by that wishlist's `.public-theme` scope
- **AND** every drawer view uses that theme's semantic colors, fonts, focus treatment, and button style

#### Scenario: Multiple previews keep independent drawer themes

- **WHEN** two differently themed public wishlist previews exist on the same page and the second preview opens a gift drawer
- **THEN** the drawer inherits only the second preview's theme
- **AND** it does not mutate global values or inherit the first preview's theme

## MODIFIED Requirements

### Requirement: Button style applies to all public buttons

All public-page button surfaces — hero CTAs, gift card actions, guest gift drawer actions, and empty-state CTAs — SHALL consume the button-style variables (radius, border width, weight, variant) through a shared `.public-btn` treatment, so that changing the wishlist's `buttonStyle` visibly restyles every public button. The `outline` variant SHALL render a transparent background with a primary-colored border and text.

#### Scenario: Hero CTA reflects the button style

- **WHEN** a wishlist uses the `square` button style
- **THEN** the hero's `Ver regalos disponibles` CTA renders with the square radius and weight 600, not only the gift card buttons

#### Scenario: Gift drawer actions reflect the button style

- **WHEN** a guest opens a product, purchase, or success drawer view
- **THEN** its primary, secondary, and close actions use the wishlist's selected public button treatment

#### Scenario: Outline style renders transparent buttons

- **WHEN** a wishlist uses the `outline` button style
- **THEN** public buttons render transparent backgrounds with a 1.5px primary border and primary text

