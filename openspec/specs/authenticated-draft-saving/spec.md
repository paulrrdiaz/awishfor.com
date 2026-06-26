## ADDED Requirements

### Requirement: Authenticated creator can explicitly save a complete draft

The system SHALL expose a protected wishlist save-draft operation that persists
the authenticated local owner's complete wizard draft, including wishlist
content, categories, and gifts, as a `draft` wishlist. The operation SHALL not
be callable by an unauthenticated user and SHALL never accept an owner identity
from the client.

#### Scenario: First manual save creates an owner draft
- **WHEN** an authenticated creator with no saved wishlist ID activates save for a valid wizard draft
- **THEN** the system creates an owner-scoped `draft` wishlist with its categories and gifts and returns its ID and server revision timestamp

#### Scenario: Signed-out save is rejected
- **WHEN** a signed-out visitor invokes the save-draft operation
- **THEN** the system rejects the request as unauthenticated and creates no wishlist

### Requirement: Subsequent saves replace the same draft content

The system SHALL update the owner-scoped `draft` identified by a saved wishlist
ID when a subsequent valid save is made, preserving the wishlist ID and replacing
the stored categories and gifts with the submitted ordered draft content. It
SHALL retain `draft` status and SHALL not create a second wishlist.

#### Scenario: Saving an existing draft updates it in place
- **WHEN** an authenticated creator saves a valid draft with a matching saved wishlist ID and server revision timestamp
- **THEN** the system updates that same draft's content, categories, and gifts and returns its new server revision timestamp

#### Scenario: A non-owner cannot update a saved draft
- **WHEN** an authenticated creator submits a saved wishlist ID that is missing or belongs to another owner
- **THEN** the system returns a non-disclosing not-found result and does not alter any wishlist

#### Scenario: A non-draft wishlist cannot be replaced by save draft
- **WHEN** an authenticated creator submits the ID of an archived or published wishlist
- **THEN** the system rejects the save and does not alter that wishlist

### Requirement: Saved draft input is complete and internally valid

The system SHALL validate all persisted wishlist, category, and gift fields
before writing. Category names SHALL be unique after trimming and case-folding,
and every non-empty submitted gift category SHALL reference a submitted category.
The system SHALL persist category and gift ordering from the submitted draft.

#### Scenario: Valid categories and gifts are persisted together
- **WHEN** a creator saves a draft containing ordered categories and gifts assigned to those categories
- **THEN** the wishlist, categories, gifts, assignments, visibility, priority, quantity, notes, and ordering are committed atomically

#### Scenario: Invalid gift category prevents any write
- **WHEN** a creator saves a draft with a gift category not present in the submitted categories
- **THEN** the system rejects the payload and leaves the prior draft unchanged

### Requirement: Save draft detects concurrent revisions

The system SHALL compare an existing draft's server revision timestamp with the
timestamp last returned to the creator before replacing it. If they differ and
the creator has not explicitly requested an overwrite, the system SHALL return a
conflict result with the current owner draft and SHALL not write local changes.

#### Scenario: Stale local revision prompts conflict handling
- **WHEN** an authenticated creator saves an existing draft with a revision timestamp that differs from the server revision
- **THEN** the system returns the current server draft without overwriting it

#### Scenario: Creator intentionally overwrites a conflicting server draft
- **WHEN** an authenticated creator retries a detected conflict with explicit overwrite confirmation
- **THEN** the system replaces the owner draft with the submitted local content and returns the new server revision timestamp

#### Scenario: Creator loads the server version after a conflict
- **WHEN** the client receives a conflict result and the creator chooses the server version
- **THEN** the local wizard draft and saved-draft metadata are replaced with the returned server draft and revision timestamp
