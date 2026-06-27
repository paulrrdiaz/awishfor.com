## ADDED Requirements

### Requirement: Public guest purchase undo action

The system SHALL provide a public, unauthenticated action that lets a guest undo a just-created purchase by presenting the purchase identifier and the one-time raw undo token. The action SHALL delete only the targeted purchase when the presented token's hash matches the stored hash and the undo window has not expired, and SHALL reject the request without altering any purchase when the token is missing, does not match, or has expired.

#### Scenario: Guest undoes a recent purchase within the window

- **WHEN** a guest submits an undo request for a purchase using the raw token returned at purchase time, before the 60-second window expires
- **THEN** the system deletes that purchase and the gift's remaining quantity increases by the undone quantity

#### Scenario: Undo is rejected after the window expires

- **WHEN** a guest submits an undo request whose undo window has already expired
- **THEN** the system rejects the request and keeps the purchase

#### Scenario: Undo is rejected for an invalid token

- **WHEN** a guest submits an undo request whose token does not match the purchase, or for a purchase that does not exist
- **THEN** the system rejects the request and keeps any matching purchase unchanged
