## ADDED Requirements

### Requirement: Publish readiness evaluation

The system SHALL evaluate a wishlist against the minimum publish requirements and return a checklist-friendly result that reports, per requirement, whether it is satisfied, plus an overall ready flag.

#### Scenario: Complete wishlist is ready

- **WHEN** a wishlist has a title, event type, format-valid slug, language, currency, and at least one visible non-deleted gift
- **THEN** the result reports every requirement satisfied and overall ready is true

#### Scenario: Result is checklist-friendly

- **WHEN** readiness is evaluated
- **THEN** the result includes a per-requirement breakdown (title, event type, slug, language, currency, visible gift) that the dashboard can render as a checklist

### Requirement: Required public identity fields

The system SHALL require a present title, present event type, present format-valid slug, present language, and present currency for a wishlist to be publish-ready.

#### Scenario: Missing required field blocks readiness

- **WHEN** any of title, event type, slug, language, or currency is missing or the slug is not format-valid
- **THEN** the corresponding checklist item is unsatisfied and overall ready is false

### Requirement: At least one visible gift

The system SHALL require at least one gift that is visible (visibility status `available`) and not soft-deleted for a wishlist to be publish-ready.

#### Scenario: Visible non-deleted gift satisfies the requirement

- **WHEN** the wishlist has at least one gift with visibility status `available` and no `deletedAt`
- **THEN** the visible-gift checklist item is satisfied

#### Scenario: Hidden gifts do not count

- **WHEN** all of the wishlist's non-deleted gifts have visibility status `hidden`
- **THEN** the visible-gift checklist item is unsatisfied and overall ready is false

#### Scenario: Soft-deleted gifts do not count

- **WHEN** the only `available` gifts have `deletedAt` set
- **THEN** the visible-gift checklist item is unsatisfied and overall ready is false

### Requirement: Design settings do not block publishing

The system SHALL NOT require any design setting (theme, layout, font pairing, button style, or cover image) for a wishlist to be publish-ready.

#### Scenario: Missing design settings still ready

- **WHEN** a wishlist satisfies all required identity fields and has a visible gift but has no theme, layout, fonts, button style, or cover image
- **THEN** overall ready is true
