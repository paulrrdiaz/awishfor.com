## ADDED Requirements

### Requirement: Overview view model exposes engagement aggregates

The dashboard wishlist overview mapper SHALL include aggregates describing how the wishlist's invitations are performing: confirmed, declined, and pending attendee counts across primary and extra guests, the total invited party size, and the counts of opened and unopened invitations. These aggregates SHALL be present for collaborators as well as owners, because the same information is already visible to both on the guest list.

#### Scenario: Attendee aggregates span primary and extra guests

- **WHEN** a wishlist has one invitation whose primary guest confirmed and whose single companion declined
- **THEN** the overview view model reports one confirmed, one declined, and a total party size of two

#### Scenario: Invitation-open aggregates reflect recorded opens

- **WHEN** one of four invitations has been opened
- **THEN** the overview view model reports one opened and three unopened invitations

#### Scenario: Aggregates are available to collaborators

- **WHEN** a collaborator loads the wishlist overview
- **THEN** the attendee and invitation-open aggregates are present

#### Scenario: Wishlist without invitations reports zeroes

- **WHEN** a wishlist has no invitations
- **THEN** the aggregates report zero for every count rather than being omitted

### Requirement: Overview view model exposes owner-only view analytics

The dashboard wishlist overview mapper SHALL include, for the wishlist owner only, a daily view series over a requested window alongside the existing lifetime view totals, and a purchase-conversion rate derived from distinct purchasers over unique visitors. The series SHALL contain one entry for every day in the window, including days with no recorded views. The conversion rate SHALL be absent rather than zero when there are no unique visitors or when view recording is disabled.

#### Scenario: Series covers every day in the window

- **WHEN** an owner requests a thirty-day window for a wishlist viewed on three days
- **THEN** the view model contains thirty daily entries, twenty-seven of them zero

#### Scenario: Conversion rate is derived from unique visitors

- **WHEN** a wishlist has twenty unique visitors and one distinct purchaser
- **THEN** the view model reports a conversion rate of five percent

#### Scenario: Conversion rate is absent without visitors

- **WHEN** a wishlist has no unique visitors
- **THEN** the conversion rate is absent from the view model rather than reported as zero

#### Scenario: View analytics stay owner-only

- **WHEN** a collaborator loads the wishlist overview
- **THEN** the daily view series and the conversion rate are absent

#### Scenario: Disabled analytics yields no series

- **WHEN** view recording is disabled so no views are ever stored
- **THEN** the view model omits the series rather than reporting a window of zeroes
