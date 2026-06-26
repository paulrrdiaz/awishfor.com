## ADDED Requirements

### Requirement: Status filters with single active selection
The public wishlist SHALL provide four status filters — `Todos`, `Disponibles`, `Comprados`, and `Infaltables` — of which exactly one is active at any time, defaulting to `Todos`. Selecting a status filter SHALL deselect any previously active status or category filter.

`Disponibles` SHALL include gifts whose public status is `available` or `partial` (any gift with remaining units). `Comprados` SHALL include only gifts whose public status is `purchased`. `Infaltables` SHALL include only gifts whose priority is `high`. `Todos` SHALL include all visible gifts.

#### Scenario: Default filter shows all gifts
- **WHEN** a guest opens a published wishlist
- **THEN** the `Todos` filter is active and every visible gift is shown

#### Scenario: Disponibles shows purchasable gifts
- **WHEN** a guest selects `Disponibles`
- **THEN** only gifts with status `available` or `partial` are shown
- **AND** fully purchased gifts are excluded

#### Scenario: Comprados shows purchased gifts
- **WHEN** a guest selects `Comprados`
- **THEN** only gifts with status `purchased` are shown

#### Scenario: Infaltables shows high-priority gifts
- **WHEN** a guest selects `Infaltables`
- **THEN** only gifts with priority `high` are shown regardless of purchase status

#### Scenario: Only one filter active at a time
- **WHEN** a guest selects a filter while another filter is active
- **THEN** the previously active filter is deselected and only the newly selected filter is active

### Requirement: Category filters ordered by category sort order
The public wishlist SHALL render one filter per wishlist category, ordered by each category's `sortOrder` ascending. Selecting a category filter SHALL show only gifts whose `categoryId` matches that category and SHALL deselect any active status filter. Categories with no visible gifts SHALL NOT produce an empty result without an empty state.

#### Scenario: Category filters follow category sort order
- **WHEN** the wishlist has multiple categories
- **THEN** category filters are displayed in ascending `sortOrder`

#### Scenario: Selecting a category filters gifts
- **WHEN** a guest selects a category filter
- **THEN** only gifts assigned to that category are shown
- **AND** any active status filter is cleared

### Requirement: Sort dropdown with recommended default order
The public wishlist SHALL provide a sort dropdown whose default option is `recommended`. The recommended order SHALL place purchasable gifts (status `available` or `partial`) before fully purchased gifts, then order by priority (`high` before `medium` before `low`), then by gift `sortOrder` ascending. The dropdown SHALL also offer price ascending and price descending; gifts without a price SHALL sort after priced gifts in price modes. Sorting SHALL apply after the active filter.

#### Scenario: Recommended order places purchased gifts last
- **WHEN** the recommended sort is active
- **THEN** gifts with remaining units appear before fully purchased gifts

#### Scenario: Recommended order respects priority then sort order
- **WHEN** the recommended sort is active and gifts share purchase status
- **THEN** higher-priority gifts appear first, then gifts in ascending `sortOrder`

#### Scenario: Price sort orders priced gifts
- **WHEN** a guest selects price ascending
- **THEN** gifts are ordered by price low to high
- **AND** gifts without a price appear after priced gifts

#### Scenario: Sort applies within the active filter
- **WHEN** a filter is active and a sort option is selected
- **THEN** only the filtered gifts are sorted and displayed

### Requirement: Empty filter states
When the active filter produces no gifts, the public wishlist SHALL display an empty state with filter-appropriate copy and a call to action that returns the guest to the `Todos` filter, instead of a blank list.

#### Scenario: Empty filter shows copy and CTA
- **WHEN** the active filter matches no gifts
- **THEN** an empty state with explanatory copy is shown
- **AND** a call to action resets the view to `Todos`

### Requirement: Filters limited to full render mode
Filter and sort controls SHALL render only in `full` render mode. In `preview` and `compact` modes the controls SHALL be hidden and gifts SHALL render in the default recommended order.

#### Scenario: Preview mode hides controls
- **WHEN** the page renders in `preview` or `compact` mode
- **THEN** filter and sort controls are not shown
- **AND** gifts render in recommended order
