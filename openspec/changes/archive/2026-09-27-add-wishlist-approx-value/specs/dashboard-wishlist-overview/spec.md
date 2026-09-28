## ADDED Requirements

### Requirement: Approximate received value panel

The Resumen section SHALL present a `Valor aproximado recibido` panel, placed with the progress panels directly after purchase progress, showing an approximate received value over an approximate goal in the wishlist's currency, with a progress bar of their ratio. The panel SHALL render for both the owner and collaborators, and the figures SHALL NOT be exposed on the public wishlist page or personalized invite pages.

The figures SHALL be derived from the wishlist's gifts that are neither hidden nor deleted and that carry a price in the wishlist's currency. A gift with a price but no recorded price currency SHALL count as priced in the wishlist's currency. For each such gift, the goal SHALL add the gift's price times its needed quantity, and the received value SHALL add the gift's price times the number of purchased units capped at its needed quantity. Purchases recorded manually by the host SHALL count like guest purchases. Figures SHALL be computed from the gifts' current prices and SHALL be summed without floating-point rounding drift.

#### Scenario: Panel shows received over goal

- **WHEN** a PEN wishlist has a S/ 100 gift needing two units with one purchased, and a S/ 50 gift needing one unit with none purchased
- **THEN** the panel reads S/ 100 received of S/ 250 with a forty percent bar

#### Scenario: Over-purchase is capped

- **WHEN** a S/ 80 gift needing one unit has been marked purchased twice
- **THEN** it contributes S/ 80 to the received value, not S/ 160

#### Scenario: Hidden and deleted gifts are excluded

- **WHEN** a purchased gift is later hidden or deleted
- **THEN** it contributes to neither the received value nor the goal

#### Scenario: Manual purchases count

- **WHEN** the host records a manual purchase of a priced gift
- **THEN** the received value includes that gift's units

#### Scenario: Missing price currency uses the wishlist currency

- **WHEN** a gift on a PEN wishlist has a price of 40 and no price currency
- **THEN** it is counted as S/ 40

#### Scenario: Decimal prices sum exactly

- **WHEN** three purchased gifts are priced 0.10, 0.20, and 0.30
- **THEN** the received value reads exactly 0.60 in the wishlist currency

#### Scenario: Collaborator sees the panel

- **WHEN** a collaborator opens Resumen
- **THEN** the approximate received value panel renders with the same figures the owner sees

#### Scenario: Public pages do not expose the value

- **WHEN** a guest opens the public wishlist or a personalized invite
- **THEN** no received value or goal is present in the page or its data

### Requirement: Approximate value reports pricing coverage

The approximate received value panel SHALL state how many visible gifts are priced in the wishlist's currency out of all visible gifts whenever at least one visible gift lacks a price. When no visible gift has a price in the wishlist's currency, the panel SHALL render an empty state inviting the host to add prices instead of showing a zero value.

#### Scenario: Partial coverage is called out

- **WHEN** nine of twelve visible gifts have a price
- **THEN** the panel shows its figures and states that nine of twelve gifts have a price

#### Scenario: Full coverage hides the note

- **WHEN** every visible gift has a price in the wishlist's currency
- **THEN** no coverage note is shown

#### Scenario: No priced gifts renders an empty state

- **WHEN** no visible gift has a price in the wishlist's currency
- **THEN** the panel renders an empty state asking the host to add prices and shows no zero amount

#### Scenario: Wishlist without gifts renders an empty state

- **WHEN** the wishlist has no visible gifts
- **THEN** the panel renders its empty state rather than a zero amount or a division by zero

### Requirement: Foreign-currency gifts are footnoted, not converted

Gifts priced in a currency other than the wishlist's SHALL be excluded from the received value and goal and SHALL NOT be converted. When any visible gift priced in another currency has purchased units, the panel SHALL show a footnote listing the received value per foreign currency, stated as not included in the total. Foreign-currency gifts SHALL NOT count as priced for the coverage note.

#### Scenario: Foreign-currency purchase is footnoted

- **WHEN** a PEN wishlist has an imported US$ 45 gift with one of one unit purchased
- **THEN** the headline excludes it and a footnote reads US$ 45 in another currency, not included

#### Scenario: Several foreign currencies are listed separately

- **WHEN** purchased gifts exist priced in USD and in EUR on a PEN wishlist
- **THEN** the footnote lists the USD and EUR received values separately

#### Scenario: Unpurchased foreign-currency gifts add no footnote

- **WHEN** a foreign-currency gift has no purchased units
- **THEN** no foreign-currency footnote is shown for it

#### Scenario: Only foreign-currency prices

- **WHEN** every priced visible gift is in a foreign currency and one has been purchased
- **THEN** the panel renders its empty state and still shows the foreign-currency footnote
