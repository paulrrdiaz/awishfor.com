## MODIFIED Requirements

### Requirement: Public RSVP response

The `invite` router SHALL expose a public procedure that lets a guest, from their personalized page, submit one response covering the whole party: an RSVP status of `confirmed` or `declined` for the primary guest, and a status of `confirmed` or `declined` for each of the invite's extra guests. On a successful response the system SHALL persist the primary status, persist each extra guest's status, set `respondedAt` to the current time, and leave the RSVP response unlocked. The procedure SHALL identify the invite by wishlist slug and guest slug, SHALL reject any status value other than `confirmed` or `declined`, SHALL reject a response whose extra-guest identifiers do not exactly match the invite's extra guests, and SHALL reject a response when the invitation has an owner-created RSVP lock.

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

- **WHEN** a guest who already responded submits a different response before the event date and the invite is not owner-locked
- **THEN** the new primary and extra-guest statuses replace the previous ones and `respondedAt` is updated

#### Scenario: Owner-locked response rejects a guest submission

- **WHEN** a guest attempts to submit or change an RSVP through an owner-locked personalized link
- **THEN** the procedure rejects the submission and preserves the locked response

### Requirement: RSVP section responded state

Once an invite has been responded to, the RSVP section SHALL render a confirmation summary in place of the form, stating the outcome and naming the attending party. When the response is owner-locked, the summary SHALL state that the host registered the response and SHALL be read-only regardless of the event date or RSVP deadline. When the response is not owner-locked and the wishlist's event date has not passed, the summary SHALL offer a control that returns the guest to the form with their previous answers pre-selected. Once the event date has passed, or when the wishlist has no event date and the RSVP deadline has passed, an unlocked response summary SHALL be read-only and SHALL NOT offer that control.

#### Scenario: Responded invite shows the summary

- **WHEN** a guest opens a personalized page for an invite whose status is `confirmed`
- **THEN** the RSVP section shows a confirmation summary naming the attending party instead of the form

#### Scenario: Owner-locked response is read-only before the event

- **WHEN** a guest opens an owner-locked personalized link before the event date
- **THEN** the RSVP section identifies the host-recorded result and does not show an edit control

#### Scenario: Guest can change their answer before the event

- **WHEN** the event date has not passed, the response is not owner-locked, and the guest activates the change control
- **THEN** the form reopens with the guest's previous primary and extra-guest choices pre-selected

#### Scenario: Summary is read-only after the event

- **WHEN** the event date has passed
- **THEN** the confirmation summary renders without a change control and the response cannot be edited
