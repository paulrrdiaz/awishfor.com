## MODIFIED Requirements

### Requirement: Wishlist publishing
The system SHALL publish a wishlist by setting status to `published` and recording `publishedAt`, only when the authenticated owner requests publication for an owned draft wishlist that satisfies the publish-readiness requirements; an unready, missing, non-owned, or non-draft wishlist SHALL be rejected without changing its status.

#### Scenario: Ready owner draft wishlist is published
- **WHEN** an authenticated owner publishes an owned draft wishlist that satisfies publish readiness
- **THEN** the persisted wishlist has status `published`, `publishedAt` is set, and `archivedAt` is null

#### Scenario: Unready wishlist is rejected
- **WHEN** publishing is requested for a wishlist that fails one or more publish-readiness requirements
- **THEN** the system rejects the request, surfaces the failed checklist, and leaves the wishlist status unchanged

#### Scenario: Signed-out publish is rejected
- **WHEN** a signed-out user invokes the publish operation
- **THEN** the system rejects the request as unauthenticated and does not publish any wishlist

#### Scenario: Non-owner publish is rejected
- **WHEN** an authenticated user requests publication for a wishlist owned by another user
- **THEN** the system returns a non-disclosing not-found result and leaves that wishlist unchanged

#### Scenario: Non-draft wishlist publish is rejected
- **WHEN** an authenticated owner requests wizard publication for a wishlist that is already published or archived
- **THEN** the system rejects the request and leaves the wishlist status unchanged

## ADDED Requirements

### Requirement: Wizard publish persists current draft before publishing
The system SHALL provide an authenticated wizard publish operation that accepts the complete local wizard draft, saves it as the authenticated owner's draft using the same validation and replacement rules as manual draft saving, and then publishes that saved draft if it is publish-ready.

#### Scenario: Unsaved local draft is created and published
- **WHEN** an authenticated creator publishes a ready local draft with no saved wishlist ID
- **THEN** the system creates an owner-scoped draft with its categories and gifts, publishes it, and returns published wishlist share metadata

#### Scenario: Existing saved draft is updated and published
- **WHEN** an authenticated creator publishes a ready local draft with a matching saved wishlist ID and current revision timestamp
- **THEN** the system updates that same draft content, publishes it, and returns published wishlist share metadata

#### Scenario: Draft save conflict blocks publish
- **WHEN** the submitted saved draft revision conflicts with the server revision and overwrite is not explicitly confirmed
- **THEN** the system returns the current server draft conflict response and does not publish either version

#### Scenario: Invalid draft content blocks publish
- **WHEN** the submitted wizard draft fails draft validation before the lifecycle transition
- **THEN** the system rejects the request and does not create, update, or publish a wishlist

### Requirement: Publish operation returns share metadata
After a wizard publish succeeds, the system SHALL return the published wishlist ID, slug, public URL path, and dashboard URL path needed by the client publish success/share state.

#### Scenario: Published response includes share targets
- **WHEN** a wishlist is successfully published from the wizard
- **THEN** the response includes the wishlist ID, slug, `/w/[slug]` public URL path, and a dashboard management URL path for the published wishlist
