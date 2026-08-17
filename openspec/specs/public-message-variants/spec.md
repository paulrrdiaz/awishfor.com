# public-message-variants Specification

## Purpose
Defines the selectable presentation variants for the public wishlist's countdown, welcome message, and thank-you message — their catalog and ids, theme-token-only styling, cross-layout consistency, single-renderer ownership per component, graceful degradation when backing data is absent, the countdown progress-bar's elapsed-time math, and the owner-facing variant pickers in the settings form.
## Requirements
### Requirement: Message variants selectable by id

The system SHALL expose a catalog of variants for three public wishlist components — countdown, welcome message, and thank-you message — each variant identified by a stable kebab-case id and resolved through a config module in the same shape as theme, layout, and button-style presets.

The countdown catalog SHALL contain `filled-pill`, `outline-pill`, and `progress-bar`. The welcome catalog SHALL contain `postcard`, `handwritten`, and `avatars`. The thank-you catalog SHALL contain `spotlight`, `handwritten`, and `social-proof`.

#### Scenario: Resolving a stored variant id

- **WHEN** a wishlist stores a recognized variant id for a component
- **THEN** the resolver returns that variant's preset

#### Scenario: Unset variant falls back to the default

- **WHEN** a wishlist has `NULL` stored for a component's variant
- **THEN** the resolver returns that component's default preset
- **AND** the default is `outline-pill` for countdown, `postcard` for welcome, and `handwritten` for thank-you

#### Scenario: Unknown variant id falls back to the default

- **WHEN** a wishlist stores a variant id absent from the catalog
- **THEN** the resolver returns the default preset rather than throwing

### Requirement: Variants derive all color from the active theme

Every message variant SHALL draw its colors from the public theme's CSS custom properties and SHALL NOT contain hardcoded color values. Switching the wishlist theme SHALL restyle every variant without any change to the variant's own definition.

The thank-you `spotlight` variant, which renders as an inverted block, SHALL map its background to `--foreground`, its text to `--background`, and its divider rule to `--primary`.

#### Scenario: Theme change restyles a variant

- **WHEN** the owner changes the wishlist theme preset
- **THEN** the rendered message variants adopt the new theme's colors

#### Scenario: Inverted variant stays legible

- **WHEN** the thank-you `spotlight` variant renders under any theme preset
- **THEN** its background uses the theme's `--foreground` token and its text uses `--background`

### Requirement: Owner selection applies across every layout

The owner's variant selection SHALL apply to the public wishlist page regardless of which layout is active. No layout SHALL hardcode a variant that overrides the owner's stored selection.

#### Scenario: Self-contained layout honors the selection

- **WHEN** a wishlist uses a self-contained layout and the owner has selected a countdown variant
- **THEN** the page renders the selected variant, not a layout-specific default

#### Scenario: Selection survives a layout change

- **WHEN** the owner changes the wishlist layout
- **THEN** the previously selected message variants continue to render

### Requirement: One renderer per message component

Each of the three components SHALL have exactly one implementation containing all of its variants. The public wishlist page SHALL NOT render a welcome or thank-you message through any renderer other than that component.

#### Scenario: Welcome message renders through a single component

- **WHEN** any layout renders a welcome message
- **THEN** it renders through the shared welcome message component
- **AND** no layout or page body inlines its own welcome message markup

### Requirement: Variants degrade gracefully when data is absent

Each variant SHALL render meaningfully when the optional data it decorates with is missing, and SHALL NOT render an empty ornament, a placeholder, or a zero-state claim.

#### Scenario: Signature-dependent variant without a signature

- **WHEN** the welcome `handwritten` or `avatars` variant renders and the wishlist has no signature
- **THEN** the message body renders without the initials seal or avatar cluster

#### Scenario: Social proof with no contributors

- **WHEN** the thank-you `social-proof` variant renders and the contributor count is zero
- **THEN** the message body renders without the contributor count or avatar cluster

#### Scenario: Countdown after the event has passed

- **WHEN** any countdown variant renders and the event date is in the past
- **THEN** the existing post-event message renders in a variant-neutral container rather than inside the pill or progress-bar presentation
- **AND** no negative day count is displayed

#### Scenario: Countdown without an event date

- **WHEN** a wishlist has no event date
- **THEN** no countdown variant renders

#### Scenario: Welcome variant without delivery details

- **WHEN** any welcome variant renders and the wishlist has no delivery address
- **THEN** the message body renders without the postscript, its introductory copy, its separator, and its copy action

#### Scenario: Welcome variant with partial delivery details

- **WHEN** any welcome variant renders and the wishlist has a delivery address but no recipient name or no phone
- **THEN** the postscript renders with only the present fields and no orphaned separator or emphasized empty name

### Requirement: Countdown progress bar spans list creation to the event

The countdown `progress-bar` variant SHALL visualize elapsed time between the wishlist's creation date and the event date, clamped to a 0–100% range.

#### Scenario: Progress reflects elapsed time

- **WHEN** the `progress-bar` variant renders for a wishlist created 36 days before an event that is 12 days away
- **THEN** the bar fills to 75%

#### Scenario: Creation date after the event date

- **WHEN** the wishlist's creation date is later than its event date
- **THEN** the bar renders full rather than negative or inverted

### Requirement: Owner selects a variant beside each message

The wishlist settings form SHALL present a variant picker for each of the three components, positioned with the field it styles: the countdown picker with the event date field, the welcome picker with the welcome message field, and the thank-you picker with the thank-you message field.

Each picker SHALL show a visual thumbnail per option and SHALL indicate the current selection.

#### Scenario: Picking a variant persists it

- **WHEN** the owner selects a variant and saves the settings form
- **THEN** the selection persists for that wishlist
- **AND** the public wishlist page renders the selected variant after revalidation

#### Scenario: Default selection is shown for a new wishlist

- **WHEN** the owner opens the settings form for a wishlist with no stored variant selections
- **THEN** each picker indicates that component's default variant as selected

### Requirement: Welcome variants share one optional postscript slot

All three welcome variants SHALL render the delivery postscript through a single shared slot rather than each implementing its own. Adding delivery details SHALL NOT change which welcome variant is selected, SHALL NOT add a variant to the catalog, and SHALL NOT change the appearance of a wishlist that has no delivery address.

#### Scenario: One slot serves every variant

- **WHEN** the welcome message renders under the `postcard`, `handwritten`, or `avatars` variant with a delivery address present
- **THEN** the postscript renders from the shared slot in all three, with no variant inlining its own postscript markup

#### Scenario: Selected variant is unaffected by delivery details

- **WHEN** a host adds or removes delivery details
- **THEN** the wishlist's selected welcome variant is unchanged and the catalog of selectable variants is unchanged

#### Scenario: Wishlist without delivery details is visually unchanged

- **WHEN** a wishlist has no delivery address
- **THEN** its welcome card renders exactly as it did before the postscript slot existed, with no divider, spacer, or empty container left behind

