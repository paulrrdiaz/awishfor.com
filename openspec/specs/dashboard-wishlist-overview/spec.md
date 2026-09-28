# dashboard-wishlist-overview Specification

## Purpose
Defines what the Resumen section of the owner dashboard presents for a wishlist and how each figure is derived: metric cards, the daily view trend, the recent activity feed, and progress panels.
## Requirements
### Requirement: Overview metric cards

The Resumen section SHALL present six metric cards: `Regalos` as the visible gift count, `Comprados` as the number of fully purchased visible gifts, `Confirmados` as confirmed attendees over total invited party size, `Visitas` as the lifetime recorded view count, `Visitantes únicos` as the count of distinct recorded visitors, and `Tasa de compra` as the share of unique visitors who purchased. A card whose figure cannot be derived SHALL render a placeholder rather than a zero.

#### Scenario: Cards render for a wishlist with activity

- **WHEN** the owner opens Resumen for a published wishlist with four gifts, one purchased, and recorded views
- **THEN** all six cards render with their derived figures

#### Scenario: Confirmed count reads as a ratio

- **WHEN** one of four invited people has confirmed
- **THEN** the `Confirmados` card reads one of four

#### Scenario: Conversion rate without visitors renders a placeholder

- **WHEN** the wishlist has no recorded unique visitors
- **THEN** the `Tasa de compra` card renders a placeholder rather than zero percent

#### Scenario: View metrics are owner-only

- **WHEN** a collaborator opens Resumen
- **THEN** the view-derived cards are absent and the gift and RSVP cards still render

### Requirement: Daily view trend

The Resumen section SHALL present the wishlist's recorded views as a daily series over a selectable window of 7, 30, or 90 days, defaulting to 30. Days within the window with no recorded views SHALL appear as zero-value points rather than being omitted. The window SHALL apply to the trend only and SHALL NOT change the lifetime totals shown on the metric cards. The trend SHALL be shown to the wishlist owner only.

#### Scenario: Trend spans the whole window

- **WHEN** a wishlist received views on three days of the last thirty
- **THEN** the trend renders thirty points, twenty-seven of them zero

#### Scenario: Window selection changes the trend only

- **WHEN** the owner switches the window from thirty to seven days
- **THEN** the trend redraws over seven days and the `Visitas` card still shows the lifetime total

#### Scenario: Trend is absent without analytics

- **WHEN** view analytics is disabled so no views are ever recorded
- **THEN** the trend renders its empty state rather than a chart of zeros presented as data

#### Scenario: Collaborator does not see the trend

- **WHEN** a collaborator opens Resumen
- **THEN** the daily view trend is absent

### Requirement: Recent activity feed

The Resumen section SHALL present a single reverse-chronological activity feed merging RSVP responses, gift purchases, and invitation opens, capped at the ten most recent entries. Each entry SHALL identify what happened, when it happened, and which of the three kinds it is. A purchase whose purchaser left no name SHALL be attributed to `Alguien`.

#### Scenario: Feed merges all three kinds

- **WHEN** a wishlist has a recent RSVP, a recent purchase, and a recent invitation open
- **THEN** all three appear in one list ordered by recency, each marked with its kind

#### Scenario: Anonymous purchase is attributed

- **WHEN** a guest purchases a gift without leaving a name
- **THEN** the feed attributes the purchase to `Alguien`

#### Scenario: Feed is capped

- **WHEN** more than ten events have occurred
- **THEN** the feed shows the ten most recent

#### Scenario: Feed has an empty state

- **WHEN** no RSVP, purchase, or invitation open has occurred
- **THEN** the feed renders an empty state rather than an empty container

### Requirement: Progress panels

The Resumen section SHALL present purchase progress as the share of needed gift units already purchased, with the underlying counts, and invitation progress as the number of invitations opened over the number sent, calling out how many remain unopened.

#### Scenario: Purchase progress reflects units

- **WHEN** one of four gift units has been purchased
- **THEN** purchase progress reads twenty-five percent with one of four gifts

#### Scenario: Invitation progress calls out unopened invitations

- **WHEN** one of four invitations has been opened
- **THEN** invitation progress reads one of four opened and states that three remain unopened

#### Scenario: Progress panels handle an empty wishlist

- **WHEN** a wishlist has no gifts and no invitations
- **THEN** both panels render their empty state rather than dividing by zero

### Requirement: Resumen excludes readiness and sharing

The Resumen section SHALL NOT render the publish readiness checklist, the publish control, or the share actions, which belong to the persistent status strip.

#### Scenario: Draft Resumen omits the checklist

- **WHEN** the owner opens Resumen for a draft wishlist
- **THEN** the readiness checklist and publish control appear in the status strip and not in the page body

#### Scenario: Published Resumen omits share actions

- **WHEN** the owner opens Resumen for a published wishlist
- **THEN** the public URL and share actions appear in the status strip and not in the page body

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

