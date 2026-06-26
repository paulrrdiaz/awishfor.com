## MODIFIED Requirements

### Requirement: Wishlist publishing

The system SHALL publish a wishlist by setting status to `published` and recording `publishedAt`, only when the wishlist satisfies the publish-readiness requirements; an unready wishlist SHALL be rejected without changing its status.

#### Scenario: Ready draft wishlist is published

- **WHEN** a draft wishlist that satisfies publish readiness is published
- **THEN** the persisted wishlist has status `published`, `publishedAt` is set, and `archivedAt` is null

#### Scenario: Unready wishlist is rejected

- **WHEN** publishing is requested for a wishlist that fails one or more publish-readiness requirements
- **THEN** the system rejects the request, surfaces the failed checklist, and leaves the wishlist status unchanged
