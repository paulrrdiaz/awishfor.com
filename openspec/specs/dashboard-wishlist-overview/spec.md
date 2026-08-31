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
