## ADDED Requirements

### Requirement: RSVP section in every layout

The optional `guest` field on `PublicWishlistViewModel` SHALL carry the primary guest name, the invite's extra guests (each with a stable identifier, an optional name, and an RSVP status), and the invite's RSVP status for personalized renders, and SHALL be absent for plain renders. Every public layout SHALL render an RSVP section when `guest` is present and SHALL omit it when `guest` is absent. The section SHALL be positioned immediately before the gift list. No layout SHALL greet the guest anywhere outside this section.

#### Scenario: Every layout shows the RSVP section when personalized

- **WHEN** a wishlist using any configured layout renders with a `guest` present
- **THEN** that layout displays the RSVP section immediately before the gift list

#### Scenario: No RSVP section without personalization

- **WHEN** a layout renders with no `guest` present
- **THEN** no RSVP section is rendered and the guest's name appears nowhere on the page

#### Scenario: Hero carries no guest greeting

- **WHEN** a personalized page renders in any layout
- **THEN** the hero contains no guest greeting, and the guest's name appears only inside the RSVP section

### Requirement: RSVP section pending state

While the invite has not been responded to, the RSVP section SHALL present a required primary choice between attending and not attending, and SHALL keep its submit control disabled until one of the two is chosen. When the invite has one or more extra guests, the section SHALL list each extra guest as its own row with an attending/not-attending toggle, defaulting every extra guest to attending. Choosing "not attending" for the primary guest SHALL hide the extra-guest rows. When the invite has no extra guests, the section SHALL omit the extra-guest area entirely and present the primary choice alone. Submitting SHALL send the primary choice together with every extra guest's choice in a single request.

#### Scenario: Submit is blocked until the primary guest chooses

- **WHEN** the RSVP section renders for an invite with status `pending` and the guest has not chosen
- **THEN** the submit control is disabled

#### Scenario: Extra guests default to attending

- **WHEN** the RSVP section renders for an invite with two named extra guests
- **THEN** each extra guest appears as its own row and both are pre-set to attending

#### Scenario: Unnamed extra guests get an ordinal label

- **WHEN** the RSVP section renders for an invite whose extra guests have no name
- **THEN** each unnamed extra guest still appears as its own toggleable row, labelled by its position in the invite ("Acompañante 1", "Acompañante 2", …)

#### Scenario: Declining collapses the extra-guest rows

- **WHEN** the guest selects the not-attending option for the primary guest
- **THEN** the extra-guest rows are hidden and submitting records every extra guest as declined

#### Scenario: Invite without extra guests shows only the primary choice

- **WHEN** the RSVP section renders for an invite with no extra guests
- **THEN** no extra-guest area is rendered and the primary choice plus submit control are the only controls

#### Scenario: One submit carries the whole party

- **WHEN** the guest chooses attending, toggles one extra guest to not attending, and submits
- **THEN** a single request carries the primary status and both extra-guest statuses

### Requirement: RSVP response deadline

The `PublicWishlistViewModel` SHALL carry the wishlist's optional RSVP deadline. When a deadline is present the RSVP section SHALL display it as part of the section's supporting copy. When no deadline is set the section SHALL omit the deadline copy and remain otherwise unchanged.

#### Scenario: Deadline shown when set

- **WHEN** a wishlist has an RSVP deadline and a guest opens their personalized page
- **THEN** the RSVP section displays the deadline

#### Scenario: Deadline omitted when unset

- **WHEN** a wishlist has no RSVP deadline
- **THEN** the RSVP section renders without deadline copy and all other controls are unaffected

### Requirement: RSVP section responded state

Once an invite has been responded to, the RSVP section SHALL render a confirmation summary in place of the form, stating the outcome and naming the attending party. While the wishlist's event date has not passed, the summary SHALL offer a control that returns the guest to the form with their previous answers pre-selected. Once the event date has passed, or when the wishlist has no event date and the RSVP deadline has passed, the summary SHALL be read-only and SHALL NOT offer that control.

#### Scenario: Responded invite shows the summary

- **WHEN** a guest opens a personalized page for an invite whose status is `confirmed`
- **THEN** the RSVP section shows a confirmation summary naming the attending party instead of the form

#### Scenario: Guest can change their answer before the event

- **WHEN** the event date has not passed and the guest activates the change control
- **THEN** the form reopens with the guest's previous primary and extra-guest choices pre-selected

#### Scenario: Summary is read-only after the event

- **WHEN** the event date has passed
- **THEN** the confirmation summary renders without a change control and the response cannot be edited

### Requirement: RSVP section inherits the public theme

The RSVP section SHALL derive every color from the wishlist's active public theme tokens and SHALL NOT hard-code color values. A wishlist rendered under a different theme SHALL show the same RSVP section repainted in that theme's palette.

#### Scenario: Section repaints with the theme

- **WHEN** the same personalized page is rendered under two different public themes
- **THEN** the RSVP section's surfaces, borders, and controls take their colors from each theme's tokens

## MODIFIED Requirements

### Requirement: Public RSVP response

The `invite` router SHALL expose a public procedure that lets a guest, from their personalized page, submit one response covering the whole party: an RSVP status of `confirmed` or `declined` for the primary guest, and a status of `confirmed` or `declined` for each of the invite's extra guests. On a successful response the system SHALL persist the primary status, persist each extra guest's status, and set `respondedAt` to the current time. The procedure SHALL identify the invite by wishlist slug and guest slug, SHALL reject any status value other than `confirmed` or `declined`, and SHALL reject a response whose extra-guest identifiers do not exactly match the invite's extra guests.

#### Scenario: Guest confirms attendance

- **WHEN** a guest submits a confirm response from `/w/<slug>/<guestSlug>` with both extra guests marked attending
- **THEN** the invite status becomes `confirmed`, both extra guests become `confirmed`, and `respondedAt` is set

#### Scenario: Guest confirms for themselves but not a companion

- **WHEN** a guest submits a confirm response with one extra guest marked not attending
- **THEN** the invite status becomes `confirmed`, that extra guest becomes `declined`, the other stays `confirmed`, and `respondedAt` is set

#### Scenario: Guest declines attendance

- **WHEN** a guest submits a decline response from `/w/<slug>/<guestSlug>`
- **THEN** the invite status becomes `declined`, every extra guest becomes `declined`, and `respondedAt` is set

#### Scenario: Invalid status rejected

- **WHEN** a response carries a status other than `confirmed` or `declined` for the primary guest or for any extra guest
- **THEN** the procedure rejects it and the invite is unchanged

#### Scenario: Mismatched extra guests rejected

- **WHEN** a response carries an extra-guest identifier that does not belong to the invite, or omits one that does
- **THEN** the procedure rejects it and neither the invite nor its extra guests are changed

#### Scenario: Response replaces an earlier response

- **WHEN** a guest who already responded submits a different response before the event date
- **THEN** the new primary and extra-guest statuses replace the previous ones and `respondedAt` is updated

## REMOVED Requirements

### Requirement: Guest section in every layout

**Reason**: Replaced by "RSVP section in every layout" and "RSVP section pending state". The guest welcome section greeted the primary guest and listed companions inside each layout's hero with an inline one-click RSVP control; the design direction (`PublicWishlistPages.dc.html`, section `08 · ArchTrio · con RSVP 3a`) moves guest identity and the whole RSVP interaction into a dedicated section between hero and gift list, and gives each companion their own answer.

**Migration**: Layouts render the RSVP section in place of the guest welcome section. The `guest` field on `PublicWishlistViewModel` is retained and extended — extra guests gain a stable identifier and an RSVP status. The companion "+N" count presentation is dropped: unnamed extra guests are shown as their own rows in the RSVP section rather than aggregated into a count.
