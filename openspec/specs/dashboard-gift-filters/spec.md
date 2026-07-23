## ADDED Requirements

### Requirement: Dashboard gift search
The dashboard Regalos tab SHALL provide a text search that filters the owner's gifts by name and store, with the search term reflected in the URL query string.

#### Scenario: Owner searches gifts by text
- **WHEN** the owner types a term in the gift search field
- **THEN** the tab shows only gifts whose name or store contains the term (case-insensitive) and updates the URL query parameter for the search term

#### Scenario: Search input is debounced
- **WHEN** the owner types multiple characters quickly
- **THEN** the tab defers applying the filter until typing pauses, rather than refetching on every keystroke

#### Scenario: Empty search shows all gifts
- **WHEN** the owner clears the search field
- **THEN** the search query parameter is removed and every gift allowed by the active filter is shown

### Requirement: Dashboard gift status filter
The dashboard Regalos tab SHALL let the owner filter gifts by status using chips (`Todos`, `Disponibles`, `Comprados`, `★ Infaltables`, `Ocultos`), with the active filter reflected in the URL query string.

#### Scenario: Owner selects a status filter
- **WHEN** the owner selects a status chip other than `Todos`
- **THEN** the tab shows only gifts matching that status and records the selected filter in the URL query parameter

#### Scenario: Infaltables filter shows priority gifts
- **WHEN** the owner selects the `★ Infaltables` chip
- **THEN** the tab shows only gifts marked as high-priority (infaltable)

#### Scenario: Ocultos filter shows hidden gifts
- **WHEN** the owner selects the `Ocultos` chip
- **THEN** the tab shows only gifts whose visibility status is hidden

#### Scenario: Todos filter clears the status filter
- **WHEN** the owner selects the `Todos` chip
- **THEN** the status query parameter is removed and gifts of every status are shown

### Requirement: Dashboard gift sorting
The dashboard Regalos tab SHALL let the owner choose a sort order (at minimum manual order, name, and price), with the choice reflected in the URL query string, and SHALL default to manual order.

#### Scenario: Default sort is manual order
- **WHEN** the owner opens the Regalos tab with no sort query parameter
- **THEN** gifts are ordered by their saved manual sort order

#### Scenario: Owner sorts by a chosen field
- **WHEN** the owner selects a sort option
- **THEN** the tab reorders the gifts by that option and records the choice in the URL query parameter

#### Scenario: Manual sort enables drag-to-reorder
- **WHEN** the active sort is manual order
- **THEN** drag-to-reorder is available; when any other sort is active, reorder is not applied over the sorted view

### Requirement: Shareable and navigable filter state
Dashboard gift search, filter, and sort state SHALL live entirely in the URL query string so it is preserved across reloads, shareable by URL, and restored by browser back/forward navigation.

#### Scenario: Reload preserves filter state
- **WHEN** the owner reloads the tab with search, filter, or sort parameters in the URL
- **THEN** the tab renders with those same parameters applied

#### Scenario: Back navigation restores previous filter state
- **WHEN** the owner changes a filter and then navigates back
- **THEN** the tab restores the previous filter state from the URL

### Requirement: Filtered empty state
The dashboard Regalos tab SHALL show a dedicated empty state when the active search or filter matches no gifts, distinct from the wishlist-has-no-gifts empty state, offering a way to clear the filters.

#### Scenario: No gifts match the active filter
- **WHEN** the active search or filter matches no gifts but the wishlist has gifts
- **THEN** the tab shows a "no results" message with an action that clears the search and filters

#### Scenario: Wishlist has no gifts at all
- **WHEN** the wishlist has no gifts
- **THEN** the tab shows the empty-wishlist state prompting the owner to add the first gift, not the filtered "no results" state
