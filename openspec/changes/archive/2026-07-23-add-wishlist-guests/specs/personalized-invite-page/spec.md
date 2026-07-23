## ADDED Requirements

### Requirement: Personalized invite route

The public route `/w/<slug>/<guestSlug>` SHALL resolve the invite matching `guestSlug` within the published wishlist identified by `slug` and render the same designed wishlist page as `/w/<slug>` augmented with the guest section. When the wishlist is not published, or no invite matches `guestSlug`, the route SHALL render the existing public not-found state.

#### Scenario: Valid personalized link renders the wishlist with guest context
- **WHEN** a guest opens `/w/<slug>/pedro-castillo` for a published wishlist that has an invite with slug `pedro-castillo`
- **THEN** the wishlist renders in its configured layout with the guest section present

#### Scenario: Unknown guest slug renders not-found
- **WHEN** a guest opens `/w/<slug>/<guestSlug>` where no invite matches `guestSlug`
- **THEN** the route renders the public not-found state

#### Scenario: Plain public page is unchanged
- **WHEN** a guest opens `/w/<slug>` with no guest slug
- **THEN** the wishlist renders without any guest section

### Requirement: Open tracking

The first time a personalized invite page is opened, the system SHALL record the current time as the invite's `openedAt`. Subsequent opens SHALL NOT overwrite an existing `openedAt`.

#### Scenario: First open sets openedAt
- **WHEN** a personalized invite page loads and the invite has no `openedAt`
- **THEN** `openedAt` is set to the load time

#### Scenario: Later opens preserve the first openedAt
- **WHEN** a personalized invite page loads and the invite already has an `openedAt`
- **THEN** `openedAt` is left unchanged

### Requirement: Guest section in every layout

The optional `guest` field on `PublicWishlistViewModel` SHALL carry the primary guest name, extra guests, and RSVP status for personalized renders and SHALL be absent for plain renders. Every public layout component SHALL render a guest welcome section when `guest` is present and SHALL omit it when `guest` is absent. The section SHALL greet the primary guest by name, and SHALL list extra guests by name when named or as a "+N" companion count when unnamed, omitting the companions area when there are no extra guests.

#### Scenario: Every layout shows the guest section when personalized
- **WHEN** a wishlist using any configured layout renders with a `guest` present
- **THEN** that layout displays a guest welcome section greeting the primary guest by name

#### Scenario: Named and unnamed extra guests
- **WHEN** the guest section renders an invite with two named extra guests
- **THEN** it lists those names
- **AND WHEN** the invite has extra guests without names
- **THEN** it shows a companion count (e.g. "+2")

#### Scenario: No guest section without personalization
- **WHEN** a layout renders with no `guest` present
- **THEN** no guest welcome section is rendered

### Requirement: Public RSVP response

The `invite` router SHALL expose a public procedure that lets a guest, from their personalized page, set the invite's RSVP status to `confirmed` or `declined`. On a successful response the system SHALL set `respondedAt` to the current time. The procedure SHALL identify the invite by wishlist slug and guest slug and SHALL reject any other status value.

#### Scenario: Guest confirms attendance
- **WHEN** a guest submits a confirm response from `/w/<slug>/<guestSlug>`
- **THEN** the invite status becomes `confirmed` and `respondedAt` is set

#### Scenario: Guest declines attendance
- **WHEN** a guest submits a decline response from `/w/<slug>/<guestSlug>`
- **THEN** the invite status becomes `declined` and `respondedAt` is set

#### Scenario: Invalid status rejected
- **WHEN** a response carries a status other than `confirmed` or `declined`
- **THEN** the procedure rejects it and the invite is unchanged
