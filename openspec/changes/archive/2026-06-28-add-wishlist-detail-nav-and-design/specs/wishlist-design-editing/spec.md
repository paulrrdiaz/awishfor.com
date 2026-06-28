## ADDED Requirements

### Requirement: Edit wishlist design after creation

The design page (`[id]/design/page.tsx`) SHALL let the owner of a wishlist edit its design after creation. The page SHALL provide selectors for theme (all seven theme presets), layout, font pairing, and button style, and SHALL allow uploading and removing a cover image. The selectors SHALL be populated from the existing design catalogs (`public-themes`, `public-layouts`, `public-fonts`, `public-button-styles`) and the current values SHALL be initialized from the persisted wishlist.

#### Scenario: Owner opens the design page

- **WHEN** the owner opens `/dashboard/wishlists/[id]/design` for a wishlist they own
- **THEN** the design selectors are shown with the wishlist's current theme, layout, font, button style, and cover image preselected

#### Scenario: All seven themes available

- **WHEN** the owner opens the theme selector
- **THEN** all seven theme presets are selectable

#### Scenario: Cover image upload and remove

- **WHEN** the owner uploads a cover image
- **THEN** the new image is shown as the current cover
- **WHEN** the owner removes the cover image
- **THEN** the cover is cleared

### Requirement: Embedded design preview

The design page SHALL render an embedded preview of the public wishlist that reflects the currently selected design before it is saved.

#### Scenario: Preview reflects pending changes

- **WHEN** the owner changes any design selection (theme, layout, font, button style, or cover image)
- **THEN** the embedded preview updates to reflect that selection without requiring a save

### Requirement: Persist design changes

The system SHALL provide an `updateDesign` mutation that persists only the design fields (`themeId`, `layoutId`, `fontPairing`, `buttonStyle`, `coverImageUrl`) for an existing wishlist owned by the caller. The mutation SHALL work whether the wishlist is a draft or published, SHALL reject requests from non-owners, and SHALL cause the public wishlist page to reflect the updated design.

#### Scenario: Owner saves design changes

- **WHEN** the owner saves design changes on a wishlist they own
- **THEN** the design fields are persisted and the public wishlist page renders the updated design

#### Scenario: Published wishlist design update

- **WHEN** the owner of a published wishlist saves design changes
- **THEN** the changes are persisted and the live public page reflects them

#### Scenario: Non-owner is rejected

- **WHEN** a user who does not own the wishlist calls `updateDesign` for it
- **THEN** the mutation is rejected and no design fields are changed
