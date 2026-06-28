## MODIFIED Requirements

### Requirement: User deletion sync

The system SHALL delete the matching local `User` when it receives a `user.deleted` event. When the event payload does not include a `clerkId`, the system SHALL log a warning and skip the deletion rather than failing silently.

#### Scenario: User deleted in Clerk

- **WHEN** a `user.deleted` event is verified and handled with a valid `clerkId`
- **THEN** the `User` row with the matching `clerkId` no longer exists

#### Scenario: Delete for unknown user

- **WHEN** a `user.deleted` event arrives for a `clerkId` not present locally
- **THEN** the system responds successfully without throwing

#### Scenario: Missing clerkId in deletion event

- **WHEN** a verified `user.deleted` event is received but `evt.data.id` is falsy
- **THEN** the system logs a warning identifying the anomaly and responds successfully without performing any database deletion
