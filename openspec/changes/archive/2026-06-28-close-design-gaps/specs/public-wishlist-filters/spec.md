## MODIFIED Requirements

### Requirement: Status filters with single active selection
The public wishlist SHALL provide four status filters — `Todos`, `Disponibles`, `Comprados`, and `Infaltables` — of which exactly one is active at any time, defaulting to `Todos`. Selecting a status filter SHALL deselect any previously active status or category filter.

`Disponibles` SHALL include gifts whose public status is `available` or `partial` (any gift with remaining units). `Comprados` SHALL include only gifts whose public status is `purchased`. `Infaltables` SHALL include only gifts whose priority is `high`. `Todos` SHALL include all visible gifts.

The filter chips SHALL render as a horizontally scroll-snapping toggle group. Each chip SHALL expose `aria-pressed` reflecting whether it is the active filter, and the active chip SHALL render inverted using `bg-foreground text-background`.

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

#### Scenario: Chips expose pressed state and inverted active styling
- **WHEN** a status filter is active
- **THEN** its chip has `aria-pressed="true"` and renders inverted with `bg-foreground text-background`
- **AND** every other chip has `aria-pressed="false"`

#### Scenario: Chips scroll-snap horizontally
- **WHEN** the chips overflow the available width
- **THEN** they remain in a single horizontally scroll-snapping row rather than wrapping

### Requirement: Empty filter states
When the active filter produces no gifts, the public wishlist SHALL display an empty state with the exact filter-appropriate copy below and a single corrective call to action that returns the guest to the `Todos` filter, instead of a blank list.

- `Disponibles` empty: "Todos los regalos disponibles ya fueron marcados como comprados." with CTA "Ver todos los regalos".
- `Comprados` empty: "Aún no hay regalos marcados como comprados." with CTA "Ver regalos disponibles".
- `Infaltables` empty: "No hay regalos marcados como infaltables en esta lista." with CTA "Ver todos los regalos".
- Empty category: "No hay regalos en esta categoría." with CTA "Ver todos los regalos".

#### Scenario: Disponibles empty state copy
- **WHEN** the `Disponibles` filter matches no gifts
- **THEN** the empty state shows "Todos los regalos disponibles ya fueron marcados como comprados."
- **AND** a CTA "Ver todos los regalos" resets the view to `Todos`

#### Scenario: Comprados empty state copy
- **WHEN** the `Comprados` filter matches no gifts
- **THEN** the empty state shows "Aún no hay regalos marcados como comprados."
- **AND** a CTA "Ver regalos disponibles" is shown

#### Scenario: Infaltables empty state copy
- **WHEN** the `Infaltables` filter matches no gifts
- **THEN** the empty state shows "No hay regalos marcados como infaltables en esta lista."
- **AND** a CTA "Ver todos los regalos" resets the view to `Todos`

#### Scenario: Empty category copy
- **WHEN** a category filter matches no gifts
- **THEN** the empty state shows "No hay regalos en esta categoría."
- **AND** a CTA "Ver todos los regalos" resets the view to `Todos`
