## ADDED Requirements

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

## MODIFIED Requirements

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
